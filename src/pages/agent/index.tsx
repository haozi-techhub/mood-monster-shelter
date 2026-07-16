import { Button, Image, Text, Textarea, View } from '@tarojs/components'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import { useEffect, useMemo, useRef, useState } from 'react'

import shelterGuide from '../../assets/monsters/shelter-guide.png'
import { Decorations } from '../../components/Decorations'
import { PageHeader } from '../../components/PageHeader'
import { findMonsterBySlug } from '../../data/monsters'
import { runAgentTurn } from '../../services/agentApi'
import { shouldPersistCrossSessionArtifacts } from '../../services/agentData'
import {
  createAgentSession,
  createAlternativeAgentTask,
  createConversationTurn,
  promoteCareToAction,
  rescopeAgentTask,
} from '../../services/agentEngine'
import {
  createShareDraft,
  finishAgentSession,
  getActiveAgentSession,
  getAgentConsent,
  getRelevantMemory,
  saveAgentSession,
  setAgentConsent,
} from '../../services/agentStorage'
import { trackAgentEvent } from '../../services/analytics'
import { addToGallery, saveLatestAnalysis } from '../../services/storage'
import { isHighRiskInput, safetyMessage } from '../../utils/safety'
import type {
  AgentConsent,
  AgentSession,
  AgentTurnResponse,
  BlockReason,
  SessionOutcome,
  TaskAdjustmentReason,
} from '../../types/agent'
import './index.less'

const phaseLabels: Partial<Record<AgentSession['phase'], string>> = {
  intake: '正在听你说',
  clarifying: '补齐行动线索',
  care: '先照顾小怪兽',
  proposal: '生成微行动',
  ready: '等待你开始',
  running: '行动进行中',
  checkin: '收容员回访',
  completed: '本次收容完成',
  abandoned: '今天先到这里',
  safety_handoff: '安全回应',
}

const decodeParam = (value = '') => {
  try { return decodeURIComponent(value) } catch { return value }
}

const formatTime = (seconds: number) => {
  const safe = Math.max(0, seconds)
  const minutes = Math.floor(safe / 60).toString().padStart(2, '0')
  const rest = (safe % 60).toString().padStart(2, '0')
  return `${minutes}:${rest}`
}

const formatDurationLabel = (seconds: number) => seconds < 60 ? `${seconds} 秒` : `${Math.ceil(seconds / 60)} 分钟`

export default function AgentPage() {
  const router = useRouter()
  const initialText = useMemo(() => decodeParam(router.params.text || '').trim().slice(0, 200), [router.params.text])
  const [consent, setConsentState] = useState<AgentConsent | null>(() => getAgentConsent())
  const [session, setSession] = useState<AgentSession | null>(null)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const initialized = useRef(false)

  const persist = (next: AgentSession) => {
    saveAgentSession(next)
    setSession(next)
    return next
  }

  const saveMonsterResult = (next: AgentSession) => {
    if (!next.monsterSlug || !shouldPersistCrossSessionArtifacts(next)) return
    const monster = findMonsterBySlug(next.monsterSlug)
    saveLatestAnalysis({
      ...monster,
      inputText: next.slots.currentState || '',
      capturedAt: next.createdAt,
      collectionId: next.id,
    })
  }

  const enterSafety = (base: AgentSession, detectedPhase = base.phase) => {
    const safeSession: AgentSession = {
      ...base,
      phase: 'safety_handoff',
      action: { type: 'safety_handoff', safety: safetyMessage },
      safety: safetyMessage,
      updatedAt: Date.now(),
    }
    trackAgentEvent('safety_handoff', { phase: detectedPhase })
    const finished = finishAgentSession(safeSession, 'safety', 0)
    setDraft('')
    setSession(finished)
    return finished
  }

  const applyResponse = (base: AgentSession, response: AgentTurnResponse) => {
    const task = response.action.type === 'offer_care' || response.action.type === 'propose_task' || response.action.type === 'rescope_task'
      ? response.action.task
      : base.task
    const next: AgentSession = {
      ...base,
      phase: response.phase,
      slots: { ...base.slots, ...response.slotPatch },
      expectedSlot: response.action.type === 'ask_slot' ? response.action.slot : undefined,
      clarificationCount: response.action.type === 'ask_slot' ? base.clarificationCount + 1 : base.clarificationCount,
      monsterSlug: response.monster?.slug || base.monsterSlug,
      task,
      action: response.action,
      turns: [...base.turns, createConversationTurn('assistant', response.reply, response.action.type === 'ask_slot' ? 'question' : 'message')],
      updatedAt: Date.now(),
      safety: response.action.type === 'safety_handoff' ? response.action.safety : undefined,
    }

    if (response.action.type === 'safety_handoff') {
      enterSafety(next, base.phase)
      return
    }

    if (response.action.type === 'propose_task' || response.action.type === 'offer_care') {
      trackAgentEvent('task_proposed', { kind: response.action.task.kind, seconds: response.action.task.durationSeconds })
    }
    saveMonsterResult(next)
    persist(next)
  }

  const requestTurn = async (base: AgentSession, message: string, forcePlan = false) => {
    setBusy(true)
    try {
      const response = await runAgentTurn({
        sessionId: base.id,
        userMessage: message,
        phase: base.phase,
        slots: base.slots,
        recentTurns: base.turns.slice(-8),
        memoryContext: base.memoryEnabled ? getRelevantMemory(base.monsterSlug).slice(0, 5) : [],
        expectedSlot: base.expectedSlot,
        clarificationCount: base.clarificationCount,
        forcePlan,
      })
      applyResponse(base, response)
    } finally {
      setBusy(false)
    }
  }

  const initialize = (memoryEnabled: boolean) => {
    if (initialized.current) return
    initialized.current = true

    if (!initialText) {
      const active = getActiveAgentSession()
      if (active) {
        setSession(active)
        if (active.phase === 'running' && active.timerEndsAt) {
          setRemainingSeconds(Math.max(0, Math.ceil((active.timerEndsAt - Date.now()) / 1000)))
        }
        return
      }
    }

    if (initialText && isHighRiskInput(initialText)) {
      const safeSession = createAgentSession('', memoryEnabled)
      trackAgentEvent('agent_session_start', { hasInitialState: true, memoryEnabled })
      enterSafety(safeSession, 'intake')
      return
    }

    const next = createAgentSession(initialText, memoryEnabled)
    saveAgentSession(next)
    setSession(next)
    trackAgentEvent('agent_session_start', { hasInitialState: Boolean(initialText), memoryEnabled })
    requestTurn(next, initialText)
  }

  useEffect(() => {
    if (consent) initialize(consent.granted)
  // initialize once for the route payload
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consent])

  useEffect(() => {
    if (session?.phase !== 'running' || !session.timerEndsAt) return undefined
    const tick = () => {
      const left = Math.max(0, Math.ceil(((session.timerEndsAt || 0) - Date.now()) / 1000))
      setRemainingSeconds(left)
      if (left === 0) {
        const next = { ...session, phase: 'checkin' as const, timerEndsAt: undefined, updatedAt: Date.now() }
        persist(next)
      }
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  // timer is intentionally rebuilt only when its identity changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.phase, session?.timerEndsAt])

  useDidShow(() => {
    setSession((current) => {
      if (!current || current.phase !== 'running' || !current.timerEndsAt) return current
      const left = Math.max(0, Math.ceil((current.timerEndsAt - Date.now()) / 1000))
      setRemainingSeconds(left)
      if (left > 0) return current
      const next = { ...current, phase: 'checkin' as const, timerEndsAt: undefined, updatedAt: Date.now() }
      saveAgentSession(next)
      return next
    })
  })

  const decideConsent = (granted: boolean) => {
    const next = setAgentConsent(granted)
    trackAgentEvent('memory_consent', { granted })
    setConsentState(next)
  }

  const submit = (value: string, forcePlan = false) => {
    if (!session || busy) return
    const clean = (forcePlan ? '直接给我方案' : value).trim().slice(0, 200)
    if (!clean) {
      Taro.showToast({ title: '再给收容员一点点线索吧', icon: 'none' })
      return
    }
    if (isHighRiskInput(clean)) {
      enterSafety(session)
      return
    }
    const next = {
      ...session,
      turns: [...session.turns, createConversationTurn('user', clean)],
      updatedAt: Date.now(),
    }
    if (session.expectedSlot) trackAgentEvent('slot_answered', { slot: session.expectedSlot })
    persist(next)
    setDraft('')
    requestTurn(next, clean, forcePlan)
  }

  const startTask = () => {
    if (!session?.task) return
    const now = Date.now()
    const next: AgentSession = {
      ...session,
      phase: 'running',
      timerStartedAt: now,
      timerEndsAt: now + session.task.durationSeconds * 1000,
      updatedAt: now,
    }
    setRemainingSeconds(session.task.durationSeconds)
    trackAgentEvent('task_started', { kind: session.task.kind, seconds: session.task.durationSeconds })
    persist(next)
  }

  const finish = (outcome: SessionOutcome, helpfulness: 0 | 1 | 2 | 3) => {
    if (!session) return
    const next = finishAgentSession(session, outcome, helpfulness)
    if (outcome !== 'safety' && next.monsterSlug && shouldPersistCrossSessionArtifacts(next)) {
      const monster = findMonsterBySlug(next.monsterSlug)
      const result = {
        ...monster,
        inputText: next.slots.currentState || '',
        capturedAt: next.createdAt,
        collectionId: next.id,
      }
      saveLatestAnalysis(result)
      addToGallery(result, outcome === 'completed' || outcome === 'care_only')
    }
    if (outcome === 'completed' || outcome === 'care_only') createShareDraft(next)
    trackAgentEvent('session_completed', { outcome, rescopeCount: next.rescopeCount })
    setSession(next)
  }

  const rescope = (reason: BlockReason) => {
    if (!session) return
    trackAgentEvent('checkin_result', { result: 'blocked', reason })
    if (session.rescopeCount >= 2 || session.feedbackCount >= 2) {
      finish('abandoned', 1)
      return
    }
    const next = rescopeAgentTask(session, reason)
    next.turns = [...next.turns, createConversationTurn('assistant', '不是你不行，是刚才那一步还不够小。我们把它缩到几乎不会失败。')]
    trackAgentEvent('task_rescoped', { reason, level: next.rescopeCount, seconds: next.task?.durationSeconds || 0 })
    persist(next)
  }

  const chooseAlternative = (fromFeedback = false, reason: TaskAdjustmentReason = 'requested_alternative') => {
    if (!session) return
    if (fromFeedback && session.feedbackCount >= 2) {
      finish('abandoned', 1)
      return
    }
    const next = createAlternativeAgentTask(session, reason, fromFeedback)
    next.turns = [...next.turns, createConversationTurn('assistant', '好，我们不硬推原来的办法，换一个更轻的入口。')]
    persist(next)
  }

  const continueAfterCare = () => {
    if (!session) return
    const next = promoteCareToAction(session)
    next.turns = [...next.turns, createConversationTurn('assistant', '电量回来一点就够了。现在只推进一个能看见的小动作。')]
    persist(next)
  }

  const action = session?.action
  const monster = session?.monsterSlug ? findMonsterBySlug(session.monsterSlug) : null

  return (
    <View className='page agent-page'>
      <Decorations />
      <PageHeader title='行动收容室' showShare={false} />

      {!consent ? (
        <View className='agent-consent glass-card'>
          <Image src={shelterGuide} mode='aspectFit' />
          <Text className='agent-consent__eyebrow'>第一次见面，先约定记忆方式</Text>
          <Text className='agent-consent__title'>要让收容员记住哪些小线索？</Text>
          <Text className='agent-consent__body'>完整对话只保存在这台设备 14 天；之后仅保留不含原话的怪兽、行动和完成情况摘要。你随时可以在“我的”里清除。</Text>
          <Button className='primary-button' onClick={() => decideConsent(true)}>允许本地记忆</Button>
          <Button className='secondary-button' onClick={() => decideConsent(false)}>仅完成这一次</Button>
        </View>
      ) : (
        <>
          <View className='agent-guide glass-card'>
            <View className='agent-guide__glow' />
            <Image src={shelterGuide} mode='aspectFit' />
            <View className='agent-guide__copy'>
              <Text className='agent-guide__role'>紫色收容员 · 在岗</Text>
              <Text className='agent-guide__title'>{session ? phaseLabels[session.phase] || '正在陪你行动' : '正在打开行动档案'}</Text>
              <Text className='agent-guide__meta'>一次只处理一只怪兽，一次只往前一点点。</Text>
            </View>
          </View>

          <View className='agent-thread'>
            {session?.turns.map((turn) => (
              <View key={turn.id} className={`agent-bubble agent-bubble--${turn.role}`}>
                {turn.role === 'assistant' && <Text className='agent-bubble__name'>收容员</Text>}
                <Text>{turn.content}</Text>
              </View>
            ))}
            {busy && <View className='agent-bubble agent-bubble--assistant agent-bubble--typing'><Text>正在翻找行动钥匙</Text><Text>•••</Text></View>}
          </View>

          {session?.phase === 'safety_handoff' && session.safety && (
            <View className='agent-safety glass-card'>
              <Text className='agent-safety__mark'>♡</Text>
              <Text className='agent-safety__title'>{session.safety.title}</Text>
              <Text>{session.safety.body}</Text>
              <View className='agent-safety__action'>{session.safety.action}</View>
              <Button className='primary-button' onClick={() => Taro.reLaunch({ url: '/pages/index/index' })}>回到安全的地方</Button>
            </View>
          )}

          {session?.phase === 'clarifying' && action?.type === 'ask_slot' && !busy && (
            <View className='agent-input-card glass-card'>
              <View className='agent-options'>
                {action.options.map((option) => <Button key={option} onClick={() => submit(option)}>{option}</Button>)}
              </View>
              <Textarea
                maxlength={200}
                value={draft}
                placeholder='也可以用自己的话告诉收容员…'
                onInput={(event) => setDraft(event.detail.value)}
              />
              <View className='agent-input-card__actions'>
                <Button className='secondary-button' onClick={() => submit('', true)}>直接给我方案</Button>
                <Button className='primary-button' disabled={!draft.trim()} onClick={() => submit(draft)}>继续</Button>
              </View>
            </View>
          )}

          {monster && session?.task && ['care', 'proposal', 'ready'].includes(session.phase) && (
            <>
              <View className='agent-monster-card glass-card'>
                <View className='agent-monster-card__photo'><Image src={monster.image} mode='aspectFit' /></View>
                <View className='agent-monster-card__copy'>
                  <Text className='agent-monster-card__eyebrow'>CAPTURED · {monster.monsterType}</Text>
                  <Text className='agent-monster-card__name'>{monster.monsterName}</Text>
                  <Text>“{monster.catchphrase}”</Text>
                </View>
              </View>
              <View className={`agent-task-card glass-card agent-task-card--${session.task.kind}`}>
                <View className='agent-task-card__top'>
                  <Text>{session.task.kind === 'care' ? '照顾动作' : '微行动任务'}</Text>
                  <Text>{formatDurationLabel(session.task.durationSeconds)}</Text>
                </View>
                <Text className='agent-task-card__title'>{session.task.title}</Text>
                <Text className='agent-task-card__reason'>{session.task.rationale}</Text>
                <View className='agent-task-card__step'><Text>第一步</Text><Text>{session.task.firstStep}</Text></View>
                <View className='agent-task-card__done'><Text>完成标准</Text><Text>{session.task.completionCriterion}</Text></View>
                <Button className='primary-button' onClick={startTask}>{session.task.kind === 'care' ? '先照顾一下' : '开始计时'}</Button>
                <View className='agent-task-card__links'>
                  {session.task.kind === 'care' ? (
                    <Button onClick={() => finish('care_only', 2)}>今天只照顾自己</Button>
                  ) : (
                    <><Button onClick={() => rescope('too_hard')}>太难了</Button><Button onClick={() => chooseAlternative()}>换一个</Button></>
                  )}
                </View>
              </View>
            </>
          )}

          {session?.phase === 'running' && session.task && (
            <View className='agent-timer glass-card'>
              <Text className='agent-timer__eyebrow'>{session.task.kind === 'care' ? '正在照顾小怪兽' : '只做这一小步'}</Text>
              <Text className='agent-timer__clock'>{formatTime(remainingSeconds)}</Text>
              <Text className='agent-timer__task'>{session.task.firstStep}</Text>
              <View className='agent-timer__pulse'><View /></View>
              <View className='agent-timer__actions'>
                <Button className='primary-button' onClick={() => persist({ ...session, phase: 'checkin', timerEndsAt: undefined, updatedAt: Date.now() })}>我做完了</Button>
                {session.task.kind === 'action' && <Button className='secondary-button' onClick={() => rescope('distracted')}>我卡住了</Button>}
              </View>
            </View>
          )}

          {session?.phase === 'checkin' && session.task?.kind === 'care' && (
            <View className='agent-checkin glass-card'>
              <Text className='agent-checkin__title'>现在比刚才多一点选择了吗？</Text>
              <Text className='agent-checkin__body'>不需要突然充满电，一点点就够。</Text>
              <Button className='primary-button' onClick={continueAfterCare}>舒服一点，继续一小步</Button>
              <Button className='secondary-button' onClick={() => finish('care_only', 3)}>今天照顾到这里</Button>
            </View>
          )}

          {session?.phase === 'checkin' && session.task?.kind === 'action' && (
            <View className='agent-checkin glass-card'>
              <Text className='agent-checkin__title'>收容员回来啦，刚才发生了什么？</Text>
              <Text className='agent-checkin__body'>完成不是满分，是你留下了一个能看见的小痕迹。</Text>
              <Button className='primary-button' onClick={() => { trackAgentEvent('checkin_result', { result: 'completed' }); finish('completed', 3) }}>达到完成标准了</Button>
              <View className='agent-options agent-options--checkin'>
                <Button onClick={() => rescope('too_hard')}>太难了</Button>
                <Button onClick={() => rescope('distracted')}>被打断了</Button>
                <Button onClick={() => rescope('low_energy')}>没电了</Button>
                <Button onClick={() => rescope('unclear')}>还是不清楚</Button>
              </View>
              <Button className='agent-checkin__mismatch' onClick={() => chooseAlternative(true, 'mismatch')}>这个任务不适合我</Button>
            </View>
          )}

          {session && ['completed', 'abandoned'].includes(session.phase) && (
            <View className='agent-complete glass-card'>
              <Text className='agent-complete__stamp'>{session.phase === 'completed' ? 'ACTION CAPTURED' : 'GENTLE PAUSE'}</Text>
              <Image src={monster?.image || shelterGuide} mode='aspectFit' />
              <Text className='agent-complete__title'>{session.phase === 'completed' ? '你真的往前走了一小步' : '今天停下来，也不算失败'}</Text>
              <Text className='agent-complete__body'>{session.phase === 'completed' ? session.task?.completionCriterion : '收容员已经记下卡住的位置，下次不用再从零解释。'}</Text>
              {session.phase === 'completed' && <Button className='primary-button' onClick={() => Taro.navigateTo({ url: `/pages/share/index?template=discharge&sessionId=${encodeURIComponent(session.id)}` })}>生成出院证明</Button>}
              <Button className='secondary-button' onClick={() => Taro.reLaunch({ url: '/pages/agent/index' })}>再收容一只</Button>
              <Button className='agent-complete__home' onClick={() => Taro.reLaunch({ url: '/pages/index/index' })}>回到首页</Button>
            </View>
          )}
        </>
      )}
    </View>
  )
}
