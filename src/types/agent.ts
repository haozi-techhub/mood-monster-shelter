import type { MonsterCategory } from '../data/monsters'

export type AgentPhase =
  | 'intake'
  | 'clarifying'
  | 'care'
  | 'proposal'
  | 'ready'
  | 'running'
  | 'checkin'
  | 'completed'
  | 'safety_handoff'
  | 'abandoned'
  | 'model_fallback'

export type EnergyLevel = 'low' | 'medium' | 'high'
export type AvailableMinutes = 2 | 5 | 10
export type SlotKey = 'currentState' | 'targetOutcome' | 'primaryBlocker' | 'energyLevel' | 'availableMinutes'
export type TaskKind = 'care' | 'action'
export type SessionOutcome = 'completed' | 'care_only' | 'abandoned' | 'safety'
export type BlockReason = 'too_hard' | 'distracted' | 'low_energy' | 'unclear' | 'mismatch'
export type TaskAdjustmentType = 'rescope' | 'alternative'
export type TaskAdjustmentReason = BlockReason | 'requested_alternative'

export interface AgentSlots {
  currentState: string
  targetOutcome: string
  primaryBlocker: string
  energyLevel: EnergyLevel
  availableMinutes: AvailableMinutes
}

export interface ConversationTurn {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
  kind?: 'message' | 'question' | 'status'
}

export interface MonsterReference {
  id: string
  slug: string
  monsterName: string
  monsterType: MonsterCategory
  dangerLevel: string
}

export interface MicroTask {
  id: string
  kind: TaskKind
  title: string
  rationale: string
  firstStep: string
  durationSeconds: 30 | 120 | 300 | 600
  completionCriterion: string
}

export interface TaskAdjustment {
  id: string
  type: TaskAdjustmentType
  reason: TaskAdjustmentReason
  fromTask?: MicroTask
  toTask: MicroTask
  createdAt: number
}

export interface SafetyResponse {
  title: string
  body: string
  action: string
}

export type AgentAction =
  | { type: 'ask_slot'; slot: SlotKey; options: string[] }
  | { type: 'offer_care'; task: MicroTask }
  | { type: 'propose_task'; task: MicroTask }
  | { type: 'rescope_task'; task: MicroTask; reason: BlockReason }
  | { type: 'complete_session'; summary?: MemorySummary }
  | { type: 'safety_handoff'; safety: SafetyResponse }

export interface AgentTurnRequest {
  sessionId: string
  userMessage: string
  phase: AgentPhase
  slots: Partial<AgentSlots>
  recentTurns: ConversationTurn[]
  memoryContext: MemorySummary[]
  expectedSlot?: SlotKey
  clarificationCount: number
  forcePlan?: boolean
}

export interface AgentTurnResponse {
  phase: AgentPhase
  reply: string
  slotPatch: Partial<AgentSlots>
  missingSlots: SlotKey[]
  confidence: number
  monster?: MonsterReference
  action: AgentAction
}

export interface AgentSession {
  id: string
  phase: AgentPhase
  slots: Partial<AgentSlots>
  turns: ConversationTurn[]
  expectedSlot?: SlotKey
  monsterSlug?: string
  task?: MicroTask
  action?: AgentAction
  clarificationCount: number
  rescopeCount: number
  feedbackCount: number
  taskAdjustments: TaskAdjustment[]
  timerStartedAt?: number
  timerEndsAt?: number
  outcome?: SessionOutcome
  blockReason?: BlockReason
  memoryEnabled: boolean
  createdAt: number
  updatedAt: number
  completedAt?: number
  safety?: SafetyResponse
}

export interface MemorySummary {
  sessionId: string
  completedAt: number
  monsterSlug: string
  monsterType: MonsterCategory
  goalCategory: string
  blockerCategory: string
  energyLevel: EnergyLevel
  actionType: TaskKind
  plannedSeconds: number
  outcome: SessionOutcome
  rescopeCount: number
  rescopeReasons: BlockReason[]
  helpfulness: 0 | 1 | 2 | 3
}

export interface ShareDraft {
  sessionId: string
  createdAt: number
  expiresAt: number
  monsterSlug: string
  outcome: SessionOutcome
  completedAt: number
  task: MicroTask
}

export type AgentRecordDetailAvailability = 'available' | 'expired'

export interface AgentRecordDetail {
  sessionId: string
  availability: AgentRecordDetailAvailability
  createdAt?: number
  completedAt: number
  monsterSlug: string
  monsterType: MonsterCategory
  goalCategory: string
  blockerCategory: string
  energyLevel: EnergyLevel
  actionType: TaskKind
  plannedSeconds: number
  outcome: SessionOutcome
  rescopeCount: number
  rescopeReasons: BlockReason[]
  helpfulness: 0 | 1 | 2 | 3
  task?: MicroTask
  adjustments: TaskAdjustment[]
  detailExpiresAt?: number
}

export interface AgentStats {
  sessions: number
  completed: number
  completionRate: number
  dominantMonster?: string
}

export interface LocalWeekRange {
  startAt: number
  endAt: number
}

export interface WeeklyAgentStats extends AgentStats {
  range: LocalWeekRange
  summaries: MemorySummary[]
  preferredSeconds?: number
  lowEnergyWins: number
}

export interface AgentConsent {
  version: 1
  granted: boolean
  decidedAt: number
}

export type AgentEventName =
  | 'agent_session_start'
  | 'slot_answered'
  | 'task_proposed'
  | 'task_started'
  | 'checkin_result'
  | 'task_rescoped'
  | 'session_completed'
  | 'memory_consent'
  | 'safety_handoff'
