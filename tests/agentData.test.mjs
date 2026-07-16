import assert from 'node:assert/strict'
import test from 'node:test'

import {
  AGENT_RETENTION_MS,
  SHARE_DRAFT_TTL_MS,
  buildAgentRecordDetail,
  buildShareDraft,
  buildWeeklyAgentStats,
  getLocalWeekRange,
  getRescopeReasons,
  getSummariesInRange,
  isShareDraftExpired,
  normalizeAgentSession,
  normalizeMemorySummary,
  normalizeShareDraft,
  normalizeTaskAdjustments,
  shouldPersistCrossSessionArtifacts,
  shouldPersistAgentSession,
  shouldPersistMemorySummary,
} from '../src/services/agentData.ts'

const task = (id, kind = 'action', durationSeconds = 300) => ({
  id,
  kind,
  title: `任务 ${id}`,
  rationale: '先留下一个看得见的小结果。',
  firstStep: '打开材料并写下第一行。',
  durationSeconds,
  completionCriterion: '已经留下一个可以继续的入口。',
})

const session = (overrides = {}) => ({
  id: 'session-1',
  phase: 'completed',
  slots: {
    currentState: '这是完整对话中的原始状态',
    targetOutcome: '推进项目',
    primaryBlocker: '担心做不好',
    energyLevel: 'low',
    availableMinutes: 5,
  },
  turns: [
    { id: 'u-1', role: 'user', content: '不应出现在详情或分享草稿里的原话', createdAt: 100 },
  ],
  monsterSlug: 'perfection-polisher',
  task: task('final'),
  clarificationCount: 1,
  rescopeCount: 0,
  taskAdjustments: [],
  memoryEnabled: true,
  outcome: 'completed',
  createdAt: 100,
  updatedAt: 200,
  completedAt: 200,
  ...overrides,
})

const summary = (overrides = {}) => ({
  sessionId: 'session-1',
  completedAt: 200,
  monsterSlug: 'perfection-polisher',
  monsterType: '借口类',
  goalCategory: 'work',
  blockerCategory: 'fear_of_judgement',
  energyLevel: 'low',
  actionType: 'action',
  plannedSeconds: 300,
  outcome: 'completed',
  rescopeCount: 0,
  rescopeReasons: [],
  helpfulness: 2,
  ...overrides,
})

test('local week starts Monday 00:00 and excludes the next Monday', () => {
  const sundayNight = new Date(2026, 6, 19, 23, 59, 59, 999).getTime()
  const range = getLocalWeekRange(sundayNight)
  const start = new Date(range.startAt)
  const end = new Date(range.endAt)

  assert.equal(start.getDay(), 1)
  assert.equal(start.getHours(), 0)
  assert.equal(start.getMinutes(), 0)
  assert.equal(start.getDate(), 13)
  assert.equal(end.getDay(), 1)
  assert.equal(end.getDate(), 20)

  const filtered = getSummariesInRange([
    summary({ sessionId: 'before', completedAt: range.startAt - 1 }),
    summary({ sessionId: 'start', completedAt: range.startAt }),
    summary({ sessionId: 'end-minus-one', completedAt: range.endAt - 1 }),
    summary({ sessionId: 'end', completedAt: range.endAt }),
  ], range)
  assert.deepEqual(filtered.map((item) => item.sessionId), ['end-minus-one', 'start'])
})

test('weekly stats use only current-week records and successful durations', () => {
  const now = new Date(2026, 6, 16, 12).getTime()
  const range = getLocalWeekRange(now)
  const stats = buildWeeklyAgentStats([
    summary({ sessionId: 'done-low', completedAt: range.startAt + 1, plannedSeconds: 120 }),
    summary({ sessionId: 'care-low', completedAt: range.startAt + 2, outcome: 'care_only', actionType: 'care', plannedSeconds: 120 }),
    summary({ sessionId: 'paused', completedAt: range.startAt + 3, outcome: 'abandoned', plannedSeconds: 600 }),
    summary({ sessionId: 'old', completedAt: range.startAt - 1 }),
  ], now)

  assert.equal(stats.sessions, 3)
  assert.equal(stats.completed, 2)
  assert.equal(stats.completionRate, 67)
  assert.equal(stats.preferredSeconds, 120)
  assert.equal(stats.lowEnergyWins, 2)
  assert.equal(stats.summaries.some((item) => item.sessionId === 'old'), false)
})

test('legacy sessions and summaries normalize without task adjustment fields', () => {
  const legacy = normalizeAgentSession({
    ...session(),
    taskAdjustments: undefined,
    rescopeCount: 1,
    blockReason: 'too_hard',
  })
  assert.deepEqual(legacy.taskAdjustments, [])
  assert.equal(legacy.feedbackCount, 1)
  assert.deepEqual(getRescopeReasons(legacy), ['too_hard'])

  const fullyRescopedLegacy = normalizeAgentSession({ ...session(), feedbackCount: undefined, rescopeCount: 2 })
  assert.equal(fullyRescopedLegacy.feedbackCount, 2)

  const legacySummary = normalizeMemorySummary({
    ...summary(),
    rescopeReasons: undefined,
    goalCategory: '推进项目的用户原话',
    blockerCategory: '担心做不好的用户原话',
    rawText: 'must be discarded',
  })
  assert.deepEqual(legacySummary.rescopeReasons, [])
  assert.equal(legacySummary.goalCategory, 'other')
  assert.equal(legacySummary.blockerCategory, 'other')
  assert.equal('rawText' in legacySummary, false)
})

test('two rescopes and an alternative keep full short-term history but only structured rescope reasons', () => {
  const adjustments = normalizeTaskAdjustments([
    { id: 'a1', type: 'rescope', reason: 'too_hard', fromTask: task('v0', 'action', 600), toTask: task('v1', 'action', 120), createdAt: 100 },
    { id: 'a2', type: 'alternative', reason: 'requested_alternative', fromTask: task('v1', 'action', 120), toTask: task('alt', 'action', 120), createdAt: 110 },
    { id: 'a3', type: 'rescope', reason: 'low_energy', fromTask: task('alt', 'action', 120), toTask: task('v2', 'action', 30), createdAt: 120 },
  ])
  const normalized = normalizeAgentSession(session({
    task: task('v2', 'action', 30),
    rescopeCount: 2,
    taskAdjustments: adjustments,
  }))

  assert.deepEqual(normalized.taskAdjustments?.map((item) => item.type), ['rescope', 'alternative', 'rescope'])
  assert.deepEqual(getRescopeReasons(normalized), ['too_hard', 'low_energy'])
})

test('record details expose task history for 14 days then degrade to summary only', () => {
  const now = 2_000_000_000
  const lastUpdated = now - AGENT_RETENTION_MS
  const recentSession = session({ updatedAt: lastUpdated, completedAt: lastUpdated })
  const recentSummary = summary({ completedAt: lastUpdated })
  const available = buildAgentRecordDetail(recentSession, recentSummary, now)

  assert.equal(available?.availability, 'available')
  assert.equal(available?.task?.id, 'final')
  assert.equal(available?.detailExpiresAt, now)
  assert.equal('turns' in (available || {}), false)

  const expired = buildAgentRecordDetail(recentSession, recentSummary, now + 1)
  assert.equal(expired?.availability, 'expired')
  assert.equal(expired?.task, undefined)
  assert.deepEqual(expired?.adjustments, [])
  assert.equal(expired?.createdAt, undefined)
  assert.equal('turns' in (expired || {}), false)
})

test('share drafts support completed and care-only outcomes, expire at 30 minutes, and strip private fields', () => {
  const now = 50_000
  const completedDraft = buildShareDraft(session(), now)
  const careDraft = buildShareDraft(session({
    id: 'care-session',
    outcome: 'care_only',
    task: task('care', 'care', 120),
  }), now)

  assert.equal(completedDraft?.expiresAt, now + SHARE_DRAFT_TTL_MS)
  assert.equal(careDraft?.outcome, 'care_only')
  assert.equal(isShareDraftExpired(completedDraft, now + SHARE_DRAFT_TTL_MS - 1), false)
  assert.equal(isShareDraftExpired(completedDraft, now + SHARE_DRAFT_TTL_MS), true)
  assert.equal(buildShareDraft(session({ outcome: 'abandoned' }), now), null)

  const sanitized = normalizeShareDraft({
    ...completedDraft,
    turns: session().turns,
    slots: session().slots,
    rawConversation: 'secret',
    task: { ...completedDraft.task, rawInput: 'secret' },
  })
  const serialized = JSON.stringify(sanitized)
  assert.equal(serialized.includes('rawConversation'), false)
  assert.equal(serialized.includes('rawInput'), false)
  assert.equal(serialized.includes('不应出现在'), false)
  assert.equal('turns' in sanitized, false)
  assert.equal('slots' in sanitized, false)
  assert.equal('inputText' in sanitized, false)
  assert.equal('currentState' in sanitized, false)
  assert.equal('currentState' in sanitized.task, false)
  assert.deepEqual(Object.keys(sanitized).sort(), ['completedAt', 'createdAt', 'expiresAt', 'monsterSlug', 'outcome', 'sessionId', 'task'])
})

test('unconsented and safety sessions never qualify for long-term memory', () => {
  assert.equal(shouldPersistMemorySummary(session({ memoryEnabled: false })), false)
  assert.equal(shouldPersistMemorySummary(session({ memoryEnabled: true, outcome: 'completed' })), true)
  assert.equal(shouldPersistMemorySummary(session({ memoryEnabled: true, outcome: 'care_only' })), true)
  assert.equal(shouldPersistMemorySummary(session({ memoryEnabled: true, outcome: 'safety' })), false)
  assert.equal(shouldPersistCrossSessionArtifacts(session({ memoryEnabled: false })), false)
  assert.equal(shouldPersistCrossSessionArtifacts(session({ memoryEnabled: true, outcome: 'completed' })), true)
  assert.equal(shouldPersistCrossSessionArtifacts(session({ memoryEnabled: true, phase: 'safety_handoff', outcome: 'safety' })), false)
  assert.equal(shouldPersistAgentSession(session({ memoryEnabled: false, outcome: undefined, phase: 'clarifying' })), false)
  assert.equal(shouldPersistAgentSession(session({ memoryEnabled: true, outcome: undefined, phase: 'clarifying' })), true)
})
