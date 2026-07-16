import type {
  AgentAction,
  AgentPhase,
  AgentRecordDetail,
  AgentSession,
  AgentSlots,
  AgentStats,
  AvailableMinutes,
  BlockReason,
  ConversationTurn,
  EnergyLevel,
  LocalWeekRange,
  MemorySummary,
  MicroTask,
  SafetyResponse,
  SessionOutcome,
  ShareDraft,
  SlotKey,
  TaskAdjustment,
  TaskAdjustmentReason,
  TaskAdjustmentType,
  TaskKind,
  WeeklyAgentStats,
} from '../types/agent'
import type { MonsterCategory } from '../data/monsters'

export const AGENT_RETENTION_MS = 14 * 24 * 60 * 60 * 1000
export const SHARE_DRAFT_TTL_MS = 30 * 60 * 1000

const phases: AgentPhase[] = [
  'intake',
  'clarifying',
  'care',
  'proposal',
  'ready',
  'running',
  'checkin',
  'completed',
  'safety_handoff',
  'abandoned',
  'model_fallback',
]
const slotKeys: SlotKey[] = ['currentState', 'targetOutcome', 'primaryBlocker', 'energyLevel', 'availableMinutes']
const energyLevels: EnergyLevel[] = ['low', 'medium', 'high']
const availableMinutes: AvailableMinutes[] = [2, 5, 10]
const taskKinds: TaskKind[] = ['care', 'action']
const outcomes: SessionOutcome[] = ['completed', 'care_only', 'abandoned', 'safety']
const blockReasons: BlockReason[] = ['too_hard', 'distracted', 'low_energy', 'unclear', 'mismatch']
const adjustmentTypes: TaskAdjustmentType[] = ['rescope', 'alternative']
const adjustmentReasons: TaskAdjustmentReason[] = [...blockReasons, 'requested_alternative']
const monsterTypes: MonsterCategory[] = ['情绪类', '借口类', '混合类']
const taskDurations: MicroTask['durationSeconds'][] = [30, 120, 300, 600]
const goalCategories = ['work', 'learning', 'self_care', 'relationship', 'other'] as const
const blockerCategories = ['fear_of_judgement', 'unclear_start', 'low_energy', 'fragmented_time', 'anxiety_freeze', 'other'] as const

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object'
const numberOr = (value: unknown, fallback: number) => typeof value === 'number' && Number.isFinite(value) ? value : fallback
const optionalNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : undefined
const stringOr = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback
const isOneOf = <T extends string | number>(value: unknown, values: readonly T[]): value is T => values.includes(value as T)

export const sanitizeMicroTask = (value: unknown): MicroTask | undefined => {
  if (!isRecord(value)) return undefined
  if (!isOneOf(value.kind, taskKinds) || !isOneOf(value.durationSeconds, taskDurations)) return undefined
  const title = stringOr(value.title)
  const rationale = stringOr(value.rationale)
  const firstStep = stringOr(value.firstStep)
  const completionCriterion = stringOr(value.completionCriterion)
  if (!title || !firstStep || !completionCriterion) return undefined
  return {
    id: stringOr(value.id, `TASK-${numberOr(value.createdAt, 0)}`),
    kind: value.kind,
    title,
    rationale,
    firstStep,
    durationSeconds: value.durationSeconds,
    completionCriterion,
  }
}

export const normalizeTaskAdjustments = (value: unknown): TaskAdjustment[] => {
  if (!Array.isArray(value)) return []
  return value.flatMap((item, index) => {
    if (!isRecord(item)) return []
    if (!isOneOf(item.type, adjustmentTypes) || !isOneOf(item.reason, adjustmentReasons)) return []
    const toTask = sanitizeMicroTask(item.toTask)
    if (!toTask) return []
    const fromTask = sanitizeMicroTask(item.fromTask)
    const createdAt = numberOr(item.createdAt, 0)
    return [{
      id: stringOr(item.id, `ADJUSTMENT-${createdAt}-${index}`),
      type: item.type,
      reason: item.reason,
      ...(fromTask ? { fromTask } : {}),
      toTask,
      createdAt,
    }]
  }).sort((a, b) => a.createdAt - b.createdAt)
}

export const normalizeAgentSession = (value: unknown): AgentSession => {
  const item = isRecord(value) ? value : {}
  const createdAt = numberOr(item.createdAt, 0)
  const updatedAt = numberOr(item.updatedAt, createdAt)
  const slotsValue = isRecord(item.slots) ? item.slots : {}
  const slots: Partial<AgentSlots> = {
    ...(typeof slotsValue.currentState === 'string' ? { currentState: slotsValue.currentState } : {}),
    ...(typeof slotsValue.targetOutcome === 'string' ? { targetOutcome: slotsValue.targetOutcome } : {}),
    ...(typeof slotsValue.primaryBlocker === 'string' ? { primaryBlocker: slotsValue.primaryBlocker } : {}),
    ...(isOneOf(slotsValue.energyLevel, energyLevels) ? { energyLevel: slotsValue.energyLevel } : {}),
    ...(isOneOf(slotsValue.availableMinutes, availableMinutes) ? { availableMinutes: slotsValue.availableMinutes } : {}),
  }
  const turns = Array.isArray(item.turns) ? item.turns.filter(isRecord).map((turn) => ({
    id: stringOr(turn.id),
    role: turn.role === 'assistant' ? 'assistant' as const : 'user' as const,
    content: stringOr(turn.content),
    createdAt: numberOr(turn.createdAt, createdAt),
    ...(turn.kind === 'question' || turn.kind === 'status' || turn.kind === 'message' ? { kind: turn.kind } : {}),
  })) : []
  const task = sanitizeMicroTask(item.task)
  const blockReason = isOneOf(item.blockReason, blockReasons) ? item.blockReason : undefined
  const outcome = isOneOf(item.outcome, outcomes) ? item.outcome : undefined
  const expectedSlot = isOneOf(item.expectedSlot, slotKeys) ? item.expectedSlot : undefined
  const phase = isOneOf(item.phase, phases) ? item.phase : 'intake'
  const rescopeCount = Math.max(0, Math.min(2, Math.floor(numberOr(item.rescopeCount, 0))))

  return {
    id: stringOr(item.id),
    phase,
    slots,
    turns: turns as ConversationTurn[],
    ...(expectedSlot ? { expectedSlot } : {}),
    ...(typeof item.monsterSlug === 'string' ? { monsterSlug: item.monsterSlug } : {}),
    ...(task ? { task } : {}),
    ...(isRecord(item.action) ? { action: item.action as AgentAction } : {}),
    clarificationCount: Math.max(0, Math.floor(numberOr(item.clarificationCount, 0))),
    rescopeCount,
    feedbackCount: Math.max(0, Math.min(2, Math.floor(numberOr(item.feedbackCount, rescopeCount)))),
    taskAdjustments: normalizeTaskAdjustments(item.taskAdjustments),
    ...(optionalNumber(item.timerStartedAt) != null ? { timerStartedAt: optionalNumber(item.timerStartedAt) } : {}),
    ...(optionalNumber(item.timerEndsAt) != null ? { timerEndsAt: optionalNumber(item.timerEndsAt) } : {}),
    ...(outcome ? { outcome } : {}),
    ...(blockReason ? { blockReason } : {}),
    memoryEnabled: item.memoryEnabled === true,
    createdAt,
    updatedAt,
    ...(optionalNumber(item.completedAt) != null ? { completedAt: optionalNumber(item.completedAt) } : {}),
    ...(isRecord(item.safety) ? { safety: item.safety as unknown as SafetyResponse } : {}),
  }
}

export const normalizeMemorySummary = (value: unknown): MemorySummary => {
  const item = isRecord(value) ? value : {}
  return {
    sessionId: stringOr(item.sessionId),
    completedAt: numberOr(item.completedAt, 0),
    monsterSlug: stringOr(item.monsterSlug),
    monsterType: isOneOf(item.monsterType, monsterTypes) ? item.monsterType : '混合类',
    goalCategory: isOneOf(item.goalCategory, goalCategories) ? item.goalCategory : 'other',
    blockerCategory: isOneOf(item.blockerCategory, blockerCategories) ? item.blockerCategory : 'other',
    energyLevel: isOneOf(item.energyLevel, energyLevels) ? item.energyLevel : 'low',
    actionType: isOneOf(item.actionType, taskKinds) ? item.actionType : 'action',
    plannedSeconds: Math.max(0, numberOr(item.plannedSeconds, 300)),
    outcome: isOneOf(item.outcome, outcomes) ? item.outcome : 'abandoned',
    rescopeCount: Math.max(0, Math.min(2, Math.floor(numberOr(item.rescopeCount, 0)))),
    rescopeReasons: Array.isArray(item.rescopeReasons)
      ? item.rescopeReasons.filter((reason): reason is BlockReason => isOneOf(reason, blockReasons)).slice(0, 2)
      : [],
    helpfulness: isOneOf(item.helpfulness, [0, 1, 2, 3] as const) ? item.helpfulness : 2,
  }
}

export const categorizeGoal = (value = '') => {
  if (/工作|项目|交付|作品|文档/.test(value)) return 'work'
  if (/学习|课程|考试|阅读/.test(value)) return 'learning'
  if (/休息|平静|情绪|舒服/.test(value)) return 'self_care'
  if (/沟通|关系|表达|回复/.test(value)) return 'relationship'
  return 'other'
}

export const categorizeBlocker = (value = '') => {
  if (/评价|做不好|完美/.test(value)) return 'fear_of_judgement'
  if (/不知道|开始|选择/.test(value)) return 'unclear_start'
  if (/低|累|电量/.test(value)) return 'low_energy'
  if (/时间|打断|事情/.test(value)) return 'fragmented_time'
  if (/焦虑|担心|压力/.test(value)) return 'anxiety_freeze'
  return 'other'
}

export const getRescopeReasons = (session: AgentSession): BlockReason[] => {
  const history = normalizeTaskAdjustments(session.taskAdjustments)
    .filter((adjustment) => adjustment.type === 'rescope' && isOneOf(adjustment.reason, blockReasons))
    .map((adjustment) => adjustment.reason as BlockReason)
    .slice(0, 2)
  if (history.length > 0) return history
  return session.rescopeCount > 0 && isOneOf(session.blockReason, blockReasons) ? [session.blockReason] : []
}

export const shouldPersistMemorySummary = (session: AgentSession) => (
  session.memoryEnabled
  && Boolean(session.outcome)
  && session.outcome !== 'safety'
)

export const shouldPersistCrossSessionArtifacts = (session: AgentSession) => (
  session.memoryEnabled
  && session.phase !== 'safety_handoff'
  && session.outcome !== 'safety'
)

export const shouldPersistAgentSession = (session: AgentSession) => (
  session.memoryEnabled
  && session.phase !== 'safety_handoff'
  && session.outcome !== 'safety'
)

export const getLocalWeekRange = (now = Date.now()): LocalWeekRange => {
  const current = new Date(now)
  const daysSinceMonday = (current.getDay() + 6) % 7
  const start = new Date(current.getFullYear(), current.getMonth(), current.getDate() - daysSinceMonday, 0, 0, 0, 0)
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7, 0, 0, 0, 0)
  return { startAt: start.getTime(), endAt: end.getTime() }
}

export const getSummariesInRange = (
  summaries: MemorySummary[],
  range: LocalWeekRange,
): MemorySummary[] => summaries
  .map(normalizeMemorySummary)
  .filter((summary) => summary.completedAt >= range.startAt && summary.completedAt < range.endAt)
  .sort((a, b) => b.completedAt - a.completedAt)

export const calculateAgentStats = (summaries: MemorySummary[]): AgentStats => {
  const normalized = summaries.map(normalizeMemorySummary)
  const completed = normalized.filter((item) => item.outcome === 'completed' || item.outcome === 'care_only').length
  const monsterCounts = normalized.reduce<Map<string, number>>((counts, item) => {
    if (item.monsterSlug) counts.set(item.monsterSlug, (counts.get(item.monsterSlug) || 0) + 1)
    return counts
  }, new Map())
  const dominantMonster = [...monsterCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
  return {
    sessions: normalized.length,
    completed,
    completionRate: normalized.length ? Math.round((completed / normalized.length) * 100) : 0,
    ...(dominantMonster ? { dominantMonster } : {}),
  }
}

export const buildWeeklyAgentStats = (
  summaries: MemorySummary[],
  now = Date.now(),
): WeeklyAgentStats => {
  const range = getLocalWeekRange(now)
  const weekly = getSummariesInRange(summaries, range)
  const stats = calculateAgentStats(weekly)
  const successful = weekly.filter((item) => item.outcome === 'completed' || item.outcome === 'care_only')
  const durationCounts = successful.reduce<Map<number, number>>((counts, item) => {
    counts.set(item.plannedSeconds, (counts.get(item.plannedSeconds) || 0) + 1)
    return counts
  }, new Map())
  const preferredSeconds = [...durationCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]?.[0]
  return {
    ...stats,
    range,
    summaries: weekly,
    ...(preferredSeconds ? { preferredSeconds } : {}),
    lowEnergyWins: successful.filter((item) => item.energyLevel === 'low').length,
  }
}

export const buildAgentRecordDetail = (
  sessionValue: AgentSession | undefined,
  summaryValue: MemorySummary | undefined,
  now = Date.now(),
  retentionMs = AGENT_RETENTION_MS,
): AgentRecordDetail | null => {
  const session = sessionValue ? normalizeAgentSession(sessionValue) : undefined
  const summary = summaryValue ? normalizeMemorySummary(summaryValue) : undefined
  if (!summary) return null
  const hasAvailableSession = Boolean(session && now - session.updatedAt <= retentionMs)
  const availableSession = hasAvailableSession ? session : undefined
  const adjustments = availableSession ? normalizeTaskAdjustments(availableSession.taskAdjustments) : []
  const task = availableSession?.task ? sanitizeMicroTask(availableSession.task) : undefined
  const rescopeReasons = availableSession ? getRescopeReasons(availableSession) : summary.rescopeReasons || []

  return {
    sessionId: summary.sessionId,
    availability: availableSession ? 'available' : 'expired',
    ...(availableSession ? { createdAt: availableSession.createdAt } : {}),
    completedAt: summary.completedAt,
    monsterSlug: summary.monsterSlug,
    monsterType: summary.monsterType,
    goalCategory: summary.goalCategory,
    blockerCategory: summary.blockerCategory,
    energyLevel: summary.energyLevel,
    actionType: summary.actionType,
    plannedSeconds: summary.plannedSeconds,
    outcome: summary.outcome,
    rescopeCount: summary.rescopeCount,
    rescopeReasons,
    helpfulness: summary.helpfulness,
    ...(task ? { task } : {}),
    adjustments,
    ...(availableSession ? { detailExpiresAt: availableSession.updatedAt + retentionMs } : {}),
  }
}

export const buildShareDraft = (
  sessionValue: AgentSession,
  now = Date.now(),
  ttlMs = SHARE_DRAFT_TTL_MS,
): ShareDraft | null => {
  const session = normalizeAgentSession(sessionValue)
  const task = sanitizeMicroTask(session.task)
  if (!session.monsterSlug || !session.completedAt || !session.outcome || !task) return null
  if (session.outcome !== 'completed' && session.outcome !== 'care_only') return null
  return {
    sessionId: session.id,
    createdAt: now,
    expiresAt: now + ttlMs,
    monsterSlug: session.monsterSlug,
    outcome: session.outcome,
    completedAt: session.completedAt,
    task,
  }
}

export const normalizeShareDraft = (value: unknown): ShareDraft | null => {
  if (!isRecord(value)) return null
  const task = sanitizeMicroTask(value.task)
  if (
    !task
    || typeof value.sessionId !== 'string'
    || typeof value.monsterSlug !== 'string'
    || (value.outcome !== 'completed' && value.outcome !== 'care_only')
  ) return null
  return {
    sessionId: value.sessionId,
    createdAt: numberOr(value.createdAt, 0),
    expiresAt: numberOr(value.expiresAt, 0),
    monsterSlug: value.monsterSlug,
    outcome: value.outcome,
    completedAt: numberOr(value.completedAt, 0),
    task,
  }
}

export const isShareDraftExpired = (draft: ShareDraft, now = Date.now()) => draft.expiresAt <= now
