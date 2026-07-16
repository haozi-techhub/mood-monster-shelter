import { defaultMonster, monsters, type MonsterProfile } from '../data/monsters'
import { isHighRiskInput, safetyMessage } from '../utils/safety'
import type {
  AgentAction,
  AgentSession,
  AgentSlots,
  AgentTurnRequest,
  AgentTurnResponse,
  AvailableMinutes,
  BlockReason,
  ConversationTurn,
  EnergyLevel,
  MicroTask,
  MonsterReference,
  SlotKey,
  TaskAdjustmentReason,
} from '../types/agent'

const SLOT_ORDER: SlotKey[] = ['currentState', 'targetOutcome', 'primaryBlocker', 'energyLevel', 'availableMinutes']

const SLOT_QUESTIONS: Record<SlotKey, { reply: string; options: string[] }> = {
  currentState: { reply: '先告诉我，刚刚发生了什么，或者你现在最明显的感觉是什么？', options: ['脑子很乱', '提不起劲', '一直在拖', '事情太多'] },
  targetOutcome: { reply: '如果这次收容只帮你推进一小步，你最想让哪件事动起来？', options: ['开始工作/学习', '完成一个小交付', '让自己平静一点', '理清下一步'] },
  primaryBlocker: { reply: '挡在起点前面的东西，更像下面哪一种？', options: ['怕做不好', '不知道从哪开始', '太累没电', '总被别的事打断'] },
  energyLevel: { reply: '收容员检查一下电量：你现在还有多少力气？', options: ['低电量', '一般般', '还有点劲'] },
  availableMinutes: { reply: '这次给小怪兽留多长时间？不需要逞强。', options: ['2分钟', '5分钟', '10分钟'] },
}

const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, '')

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const parseEnergy = (value: string): EnergyLevel => {
  if (/低|没电|累|不想|撑不住|疲惫/.test(value)) return 'low'
  if (/高|有劲|有点劲|还有劲|可以|精神|充足/.test(value)) return 'high'
  return 'medium'
}

const parseMinutes = (value: string): AvailableMinutes => {
  if (/\b2\b|两分钟|2分钟/.test(value)) return 2
  if (/\b10\b|十分钟|10分钟/.test(value)) return 10
  return 5
}

const inferBlocker = (value: string) => {
  if (/完美|准备好|做不好|丢脸|评价|不敢/.test(value)) return '担心做不好或被评价'
  if (/不知道|迷茫|从哪|选择|理不清/.test(value)) return '不知道从哪一步开始'
  if (/累|没电|疲惫|加班|不想动/.test(value)) return '电量太低，很难启动'
  if (/忙|没时间|打断|消息|事情多/.test(value)) return '时间太碎，总被别的事打断'
  if (/焦虑|慌|压力|担心/.test(value)) return '担心太多，大脑同时踩着油门和刹车'
  if (/拖延|明天|以后|改天/.test(value)) return '启动时的不舒服被不断推迟'
  return undefined
}

const inferTarget = (value: string) => {
  const match = value.match(/(?:想|要|需要|准备|希望)(?:先)?(.{2,32}?)(?:，|。|但|可是|却|$)/)
  return match?.[1]?.trim()
}

const assignExpectedSlot = (slot: SlotKey, value: string): Partial<AgentSlots> => {
  const clean = value.trim().slice(0, 80)
  if (!clean) return {}
  if (slot === 'energyLevel') return { energyLevel: parseEnergy(clean) }
  if (slot === 'availableMinutes') return { availableMinutes: parseMinutes(clean) }
  return { [slot]: clean }
}

export const inferSlotPatch = (
  message: string,
  current: Partial<AgentSlots>,
  expectedSlot?: SlotKey,
): Partial<AgentSlots> => {
  const clean = message.trim().slice(0, 200)
  if (!clean) return {}

  const patch: Partial<AgentSlots> = expectedSlot ? assignExpectedSlot(expectedSlot, clean) : {}
  if (!current.currentState && !patch.currentState) patch.currentState = clean
  if (!current.targetOutcome && !patch.targetOutcome) {
    const target = inferTarget(clean)
    if (target) patch.targetOutcome = target
  }
  if (!current.primaryBlocker && !patch.primaryBlocker) {
    const blocker = inferBlocker(clean)
    if (blocker) patch.primaryBlocker = blocker
  }
  if (!current.energyLevel && !patch.energyLevel && /低|没电|累|疲惫|一般|有劲|有点劲|还有劲|精神/.test(clean)) {
    patch.energyLevel = parseEnergy(clean)
  }
  if (!current.availableMinutes && !patch.availableMinutes) patch.availableMinutes = parseMinutes(clean)
  return patch
}

export const getMissingSlots = (slots: Partial<AgentSlots>) => SLOT_ORDER.filter((key) => slots[key] == null || slots[key] === '')

export const pickAgentMonster = (slots: Partial<AgentSlots>) => {
  const text = normalize([slots.currentState, slots.targetOutcome, slots.primaryBlocker].filter(Boolean).join(' '))
  const scored = monsters
    .map((monster) => ({
      monster,
      score: monster.keywords.reduce((sum, keyword) => sum + (text.includes(normalize(keyword)) ? keyword.length + 2 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score)
  return scored[0]?.score > 0 ? scored[0].monster : defaultMonster
}

const toMonsterReference = (monster: MonsterProfile): MonsterReference => ({
  id: monster.id,
  slug: monster.slug,
  monsterName: monster.monsterName,
  monsterType: monster.monsterType,
  dangerLevel: monster.dangerLevel,
})

const durationFromSlots = (slots: Partial<AgentSlots>): 120 | 300 | 600 => {
  if (slots.availableMinutes === 2) return 120
  if (slots.availableMinutes === 10) return 600
  return 300
}

const careCopy: Partial<Record<string, string>> = {
  'rainy-dog': '喝三口水，把肩膀放松下来，再写下一件你今天已经做过的小事。',
  'tough-cat': '先在心里补完一句：我其实有点在意的是……不用发给任何人。',
  'overtime-jellyfish': '关掉一个输入源，双脚踩地，慢慢呼吸四次。',
  'irritable-raccoon': '把一个群聊静音，离开屏幕，看远处三十秒。',
  'stuck-penguin': '先不选方向，只圈出眼前最轻的一件事。',
  'defense-hedgehog': '把真正困扰你的那句话写下来，暂时不用解释。',
}

export const createMicroTask = (
  monster: MonsterProfile,
  slots: Partial<AgentSlots>,
  kind: 'care' | 'action' = 'action',
  rescopeLevel = 0,
  alternative = false,
): MicroTask => {
  if (kind === 'care') {
    const firstStep = careCopy[monster.slug] ?? monster.microAction
    return {
      id: makeId('CARE'),
      kind,
      title: '先把电量接回来一点',
      rationale: '现在不需要逼自己高效，先让身体和注意力有一个落脚点。',
      firstStep,
      durationSeconds: 120,
      completionCriterion: '做完这一个照顾动作，并感觉自己比刚才多了一点选择。',
    }
  }

  const target = slots.targetOutcome?.replace(/[。！!？?]/g, '').slice(0, 18) || '眼前最小的一步'
  const durationSeconds = rescopeLevel >= 2 ? 30 : rescopeLevel === 1 ? 120 : durationFromSlots(slots)
  const firstStep = alternative
    ? `换个入口：只列出“${target}”接下来能做的三个动词，再选最轻的一个。`
    : rescopeLevel >= 2
      ? `只打开与“${target}”有关的页面或材料，停在可以继续的位置。`
      : rescopeLevel === 1
        ? `先为“${target}”留下一个最小痕迹：写一个标题、一个词或摆好材料。`
        : monster.microAction

  return {
    id: makeId('TASK'),
    kind,
    title: alternative ? `换个入口：${target}` : rescopeLevel > 0 ? '缩小到几乎不会失败' : `先推进：${target}`,
    rationale: alternative ? '原来的入口不合适，换一种更轻的启动方式。' : rescopeLevel > 0 ? '刚才不是你不行，是任务还不够小。' : monster.excuseCrush,
    firstStep,
    durationSeconds,
    completionCriterion: alternative
      ? `已经为“${target}”列出三个动作，并选出最轻的一个。`
      : rescopeLevel >= 2
        ? '页面或材料已经打开，下一步入口清楚可见。'
        : `留下一个与“${target}”有关、能够看见的结果。`,
  }
}

const fillSafeDefaults = (slots: Partial<AgentSlots>): AgentSlots => ({
  currentState: slots.currentState || '我现在有点乱，也说不太清楚。',
  targetOutcome: slots.targetOutcome || '让眼前最重要的一件事向前一点',
  primaryBlocker: slots.primaryBlocker || '说不清，但启动起来有点难',
  energyLevel: slots.energyLevel || 'low',
  availableMinutes: slots.availableMinutes || 5,
})

export const buildFallbackAgentResponse = (request: AgentTurnRequest): AgentTurnResponse => {
  if (isHighRiskInput(request.userMessage)) {
    return {
      phase: 'safety_handoff',
      reply: safetyMessage.body,
      slotPatch: {},
      missingSlots: [],
      confidence: 1,
      action: { type: 'safety_handoff', safety: safetyMessage },
    }
  }

  const slotPatch = inferSlotPatch(request.userMessage, request.slots, request.expectedSlot)
  let merged: Partial<AgentSlots> = { ...request.slots, ...slotPatch }
  let missingSlots = getMissingSlots(merged)

  if (request.forcePlan || request.clarificationCount >= 4) {
    merged = fillSafeDefaults(merged)
    Object.assign(slotPatch, merged)
    missingSlots = []
  }

  if (missingSlots.length > 0) {
    const slot = missingSlots[0]
    const question = SLOT_QUESTIONS[slot]
    return {
      phase: 'clarifying',
      reply: question.reply,
      slotPatch,
      missingSlots,
      confidence: 0.74,
      action: { type: 'ask_slot', slot, options: question.options },
    }
  }

  const completeSlots = fillSafeDefaults(merged)
  Object.assign(slotPatch, completeSlots)
  const monster = pickAgentMonster(completeSlots)
  const isEmotion = monster.monsterType === '情绪类'
  const task = createMicroTask(monster, completeSlots, isEmotion ? 'care' : 'action')
  const action: AgentAction = isEmotion ? { type: 'offer_care', task } : { type: 'propose_task', task }

  return {
    phase: isEmotion ? 'care' : 'proposal',
    reply: isEmotion
      ? `我捕获到的是「${monster.monsterName}」。它现在更需要先被照顾，不急着逼你冲刺。`
      : `抓到了，是「${monster.monsterName}」。它很会把起点藏起来，我们先拿回一个小小的动作。`,
    slotPatch,
    missingSlots: [],
    confidence: 0.88,
    monster: toMonsterReference(monster),
    action,
  }
}

export const createConversationTurn = (
  role: ConversationTurn['role'],
  content: string,
  kind: ConversationTurn['kind'] = 'message',
): ConversationTurn => ({ id: makeId(role === 'user' ? 'U' : 'A'), role, content, kind, createdAt: Date.now() })

export const createAgentSession = (initialText = '', memoryEnabled = false): AgentSession => {
  const now = Date.now()
  return {
    id: makeId('SESSION'),
    phase: 'intake',
    slots: {},
    turns: initialText ? [createConversationTurn('user', initialText)] : [],
    clarificationCount: 0,
    rescopeCount: 0,
    feedbackCount: 0,
    taskAdjustments: [],
    memoryEnabled,
    createdAt: now,
    updatedAt: now,
  }
}

export const rescopeAgentTask = (session: AgentSession, reason: BlockReason): AgentSession => {
  const monster = monsters.find((item) => item.slug === session.monsterSlug) ?? defaultMonster
  const nextLevel = Math.min(session.rescopeCount + 1, 2)
  const task = createMicroTask(monster, session.slots, 'action', nextLevel)
  const now = Date.now()
  return {
    ...session,
    phase: 'ready',
    task,
    action: { type: 'rescope_task', task, reason },
    rescopeCount: nextLevel,
    feedbackCount: Math.min(session.feedbackCount + 1, 2),
    taskAdjustments: [
      ...(session.taskAdjustments || []),
      {
        id: makeId('ADJUSTMENT'),
        type: 'rescope',
        reason,
        ...(session.task ? { fromTask: session.task } : {}),
        toTask: task,
        createdAt: now,
      },
    ],
    blockReason: reason,
    timerStartedAt: undefined,
    timerEndsAt: undefined,
    updatedAt: now,
  }
}

export const createAlternativeAgentTask = (
  session: AgentSession,
  reason: TaskAdjustmentReason = 'requested_alternative',
  fromFeedback = false,
): AgentSession => {
  const monster = monsters.find((item) => item.slug === session.monsterSlug) ?? defaultMonster
  const task = createMicroTask(monster, session.slots, 'action', session.rescopeCount, true)
  const now = Date.now()
  return {
    ...session,
    phase: 'ready',
    task,
    action: { type: 'propose_task', task },
    taskAdjustments: [
      ...(session.taskAdjustments || []),
      {
        id: makeId('ADJUSTMENT'),
        type: 'alternative',
        reason,
        ...(session.task ? { fromTask: session.task } : {}),
        toTask: task,
        createdAt: now,
      },
    ],
    feedbackCount: fromFeedback ? Math.min(session.feedbackCount + 1, 2) : session.feedbackCount,
    updatedAt: now,
  }
}

export const promoteCareToAction = (session: AgentSession): AgentSession => {
  const monster = monsters.find((item) => item.slug === session.monsterSlug) ?? defaultMonster
  const task = createMicroTask(monster, session.slots, 'action')
  return {
    ...session,
    phase: 'ready',
    task,
    action: { type: 'propose_task', task },
    timerStartedAt: undefined,
    timerEndsAt: undefined,
    updatedAt: Date.now(),
  }
}

export const isValidAgentResponse = (value: unknown): value is AgentTurnResponse => {
  if (!value || typeof value !== 'object') return false
  const response = value as Partial<AgentTurnResponse>
  if (typeof response.phase !== 'string' || typeof response.reply !== 'string') return false
  if (!response.slotPatch || !Array.isArray(response.missingSlots) || !response.action) return false
  const validActions = ['ask_slot', 'offer_care', 'propose_task', 'rescope_task', 'complete_session', 'safety_handoff']
  return validActions.includes(response.action.type)
}
