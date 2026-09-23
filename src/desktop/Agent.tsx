import { useEffect, useRef, useState } from 'react'
import type { AgentConsent, AgentSession, BlockReason, SessionOutcome, TaskAdjustmentReason } from '../types/agent'
import { findMonsterBySlug } from '../data/monsters'
import { Dialog, Frame, MonsterDialog, Pager, Safety, Scene, TextPages, duration, navigate, routes } from './ui'

interface AgentProps {
  consent: AgentConsent | null; session: AgentSession | null; busy: boolean; draft: string; remainingSeconds: number
  onDraft: (value: string) => void; onConsent: (value: boolean) => void; onSubmit: (value: string, forcePlan?: boolean) => void
  onStart: () => void; onCheckin: () => void; onRescope: (reason: BlockReason) => void
  onAlternative: (fromFeedback?: boolean, reason?: TaskAdjustmentReason) => void
  onFinish: (outcome: SessionOutcome, helpfulness: 0 | 1 | 2 | 3) => void; onContinueCare: () => void
}
const phases: Record<string, string> = { intake: '说说现在的你', clarifying: '再给下一步一点线索', care: '先照顾一下自己', proposal: '这一步，刚刚好', ready: '这一步，刚刚好', running: '现在，只做这一小步', checkin: '看看刚才留下了什么', completed: '你真的往前走了一小步', abandoned: '今天停下来，也不算失败' }

export function DesktopAgent(props: AgentProps) {
  const { consent, session, busy, draft, remainingSeconds, onDraft, onConsent, onSubmit, onStart, onCheckin, onRescope, onAlternative, onFinish, onContinueCare } = props
  const [turnPage, setTurnPage] = useState(0)
  const [details, setDetails] = useState(false)
  const [monsterOpen, setMonsterOpen] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const phase = session?.phase || 'intake'
  const task = session?.task
  const monster = session?.monsterSlug ? findMonsterBySlug(session.monsterSlug) : null
  const terminal = ['completed', 'abandoned', 'safety_handoff'].includes(phase)
  useEffect(() => setTurnPage(Math.max(0, (session?.turns.length || 1) - 1)), [session?.turns.length])
  useEffect(() => { heading.current?.focus({ preventScroll: true }) }, [phase])
  const currentTurn = session?.turns[Math.min(turnPage, session.turns.length - 1)]
  const clock = `${Math.floor(remainingSeconds / 60).toString().padStart(2, '0')}:${(remainingSeconds % 60).toString().padStart(2, '0')}`

  return <Frame active='agent' ephemeral={Boolean(session && !session.memoryEnabled && !terminal)}>
    {phase === 'safety_handoff' && session?.safety ? <Safety response={session.safety} onBack={() => navigate(routes.home)} /> : !consent ? <div className='d-consent-layout'><Scene /><section className='d-panel d-consent'><span className='d-eyebrow'>第一次见面，先约定记忆方式</span><h1>要让收容员<br />记住哪些小线索？</h1><p>你来决定，收容所记住多少。即使不留下记录，也可以完成这一次行动。</p><div className='d-retention'><div><b>14 天</b><span>完整对话仅保存在这台设备</span></div><div><b>之后</b><span>只留不含原话的结构化摘要</span></div><div><b>随时</b><span>可以在“我的”关闭并清除</span></div></div><button data-d-button className='d-primary' onClick={() => onConsent(true)}>允许本地记忆</button><button data-d-button className='d-secondary' onClick={() => onConsent(false)}>仅完成这一次</button></section></div> : <div className='d-agent-layout'>
      <aside className='d-companion'><div><span className='d-eyebrow'>行动收容室</span><h1>不用一下子做到最好。</h1><p className='d-caption'>{session?.memoryEnabled ? '本地记忆已开启 · 完整对话保留 14 天' : '仅本次陪伴 · 离开页面后不保留对话'}</p></div><Scene compact message={'你可以慢慢来。\n我在这里，陪你开始。'} />
        <section className='d-conversation' aria-label='收容对话'><div className='d-conversation-heading'><strong>{currentTurn?.role === 'user' ? '你刚才说' : '收容员说'}</strong><span>{session?.turns.length || 0} 条对话</span></div><div aria-live='polite'>{busy ? <p role='status'>正在整理你的行动线索…</p> : currentTurn ? <TextPages key={currentTurn.id} text={currentTurn.content} size={90} /> : <p>正在打开行动档案…</p>}</div>{(session?.turns.length || 0) > 1 && <Pager page={Math.min(turnPage, (session?.turns.length || 1) - 1)} count={session?.turns.length || 1} onChange={setTurnPage} label='条' />}</section>
      </aside>
      <section className='d-agent-action d-panel' aria-busy={busy}>
        <div className='d-flow' aria-label='陪伴进度'>{['表达状态', '一小步行动', '留下反馈'].map((name, i) => <span key={name} className={(i === (['intake', 'clarifying'].includes(phase) ? 0 : ['care', 'proposal', 'ready', 'running'].includes(phase) ? 1 : 2)) ? 'is-current' : ''}>{i + 1} · {name}</span>)}</div>
        <h2 ref={heading} tabIndex={-1}>{phases[phase] || '收容员正在陪着你'}</h2>
        {busy && <div className='d-action-busy' role='status'><span className='d-loading-dot' />正在把下一步变得具体…</div>}
        {!busy && session?.action?.type === 'ask_slot' && phase === 'clarifying' && <form className='d-agent-form' onSubmit={(e) => { e.preventDefault(); onSubmit(draft) }}><p className='d-caption'>选一个贴近你的答案，也可以用自己的话说。</p><div className='d-answer-options'>{session.action.options.map(option => <button data-d-button key={option} className='d-secondary' type='button' onClick={() => onSubmit(option)}>{option}</button>)}</div><label data-d-label htmlFor='agent-answer'>回复收容员</label><textarea data-d-textarea id='agent-answer' maxLength={200} value={draft} onChange={e => onDraft(e.target.value)} placeholder='几个字也可以，不用组织得很完美…' /><div className='d-actions'><button data-d-button className='d-secondary' type='button' onClick={() => onSubmit('', true)}>直接给我方案</button><button data-d-button className='d-primary' disabled={!draft.trim()} type='submit'>继续 →</button></div></form>}
        {task && ['care', 'proposal', 'ready'].includes(phase) && <>
          {monster && <button data-d-button className='d-captured' onClick={() => setMonsterOpen(true)}><img src={monster.image} alt='' /><div><span className='d-caption'>这次遇见 · {monster.monsterType}</span><strong>{monster.monsterName}</strong></div><span aria-hidden='true'>查看图鉴 ↗</span></button>}
          <div className='d-task-top'><span className='d-badge'>{task.kind === 'care' ? '照顾动作' : '微行动'}</span><span>{duration(task.durationSeconds)}</span></div><h3 className='d-task-title'>{task.title}</h3>
          <div className='d-task-field'><strong>第一步</strong><TextPages text={task.firstStep} size={100} /></div><div className='d-task-field d-task-field--mint'><strong>完成标准</strong><TextPages text={task.completionCriterion} size={100} /></div>
          <div className='d-task-footer'><button data-d-button className='d-primary' onClick={onStart}>{task.kind === 'care' ? '先照顾一下' : '开始计时'} →</button><div className='d-task-links'><button data-d-button onClick={() => setDetails(true)}>为什么是这一步</button>{task.kind === 'care' ? <button data-d-button onClick={() => onFinish('care_only', 2)}>今天只照顾自己</button> : <><button data-d-button onClick={() => onRescope('too_hard')}>太难了</button><button data-d-button onClick={() => onAlternative()}>换一个</button></>}</div></div>
        </>}
        {phase === 'running' && task && <div className='d-timer-view'><div className='d-timer-ring'><span className='d-timer-clock' role='timer' aria-label={`剩余 ${clock}`}>{clock}</span><span>{task.kind === 'care' ? '先把电量接回来一点' : '这一刻，只做一件小事'}</span></div><TextPages text={task.firstStep} size={100} /><p className='d-caption'>计时以时间戳为准，切换浏览器标签不会暂停。</p><div className='d-actions'><button data-d-button className='d-primary' onClick={onCheckin}>我做完了</button>{task.kind === 'action' && <button data-d-button className='d-secondary' onClick={() => onRescope('distracted')}>我卡住了</button>}</div></div>}
        {phase === 'checkin' && task && <div className='d-checkin'><p>{task.kind === 'care' ? '不需要突然充满电，一点点就够。现在比刚才舒服一点了吗？' : '完成不是满分，是你留下了一个能看见的小痕迹。'}</p><div className='d-callout'><strong>这次的完成标准</strong><TextPages text={task.completionCriterion} /></div>{task.kind === 'care' ? <><button data-d-button className='d-primary' onClick={onContinueCare}>舒服一点，继续一小步 →</button><button data-d-button className='d-secondary' onClick={() => onFinish('care_only', 3)}>今天照顾到这里</button></> : <><button data-d-button className='d-primary' onClick={() => onFinish('completed', 3)}>达到完成标准了</button><div className='d-answer-options'>{([['too_hard','太难了'],['distracted','被打断了'],['low_energy','没电了'],['unclear','还是不清楚']] as const).map(([reason,label]) => <button data-d-button className='d-secondary' key={reason} onClick={() => onRescope(reason)}>{label}</button>)}</div><button data-d-button className='d-text-link' onClick={() => onAlternative(true, 'mismatch')}>这个任务不适合我，换个入口</button></>}</div>}
        {session && ['completed', 'abandoned'].includes(phase) && <div className='d-completed'>{monster && <img src={monster.image} alt={monster.monsterName} />}<span className='d-badge'>{session.outcome === 'care_only' ? '照顾好自己，也是一小步' : phase === 'completed' ? '行动已完成' : '今天温柔暂停'}</span><TextPages text={phase === 'completed' ? task?.completionCriterion || '今天的小行动已完成。' : '刚才那一步还不够合拍。休息一下，下次可以从更小的入口开始。'} /><p className='d-caption'>{session.memoryEnabled ? '已按你的授权留下本地行动记录。' : '未保存对话或长期记录；分享草稿仅暂存 30 分钟。'}</p>{phase === 'completed' && <button data-d-button className='d-primary' onClick={() => navigate(`/pages/share/index?template=discharge&sessionId=${encodeURIComponent(session.id)}`)}>生成出院证明 ↗</button>}<div className='d-actions'><button data-d-button className='d-secondary' onClick={() => navigate(routes.agent)}>再收容一只</button><button data-d-button className='d-secondary' onClick={() => navigate(routes.home)}>回到收容室</button></div></div>}
      </section>
    </div>}
    {details && task && <Dialog title='为什么是这一步' onClose={() => setDetails(false)}><TextPages text={task.rationale} /><p className='d-caption'>这是基于你当前状态的本地规则建议，可以调整，也可以暂时不做。</p></Dialog>}
    {monsterOpen && monster && <MonsterDialog monster={monster} onClose={() => setMonsterOpen(false)} />}
  </Frame>
}
