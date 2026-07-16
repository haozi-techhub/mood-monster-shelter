import Taro from '@tarojs/taro'

import { defaultMonster, findMonsterBySlug } from '../data/monsters'
import type {
  AgentConsent,
  AgentRecordDetail,
  AgentSession,
  MemorySummary,
  SessionOutcome,
  ShareDraft,
  WeeklyAgentStats,
} from '../types/agent'
import {
  AGENT_RETENTION_MS,
  buildAgentRecordDetail,
  buildShareDraft,
  buildWeeklyAgentStats,
  calculateAgentStats,
  categorizeBlocker,
  categorizeGoal,
  getLocalWeekRange,
  getRescopeReasons,
  getSummariesInRange,
  isShareDraftExpired,
  normalizeAgentSession,
  normalizeMemorySummary,
  normalizeShareDraft,
  shouldPersistAgentSession,
  shouldPersistMemorySummary,
} from './agentData'

const CONSENT_KEY = 'mms:agent-consent:v1'
const SESSIONS_KEY = 'mms:agent-sessions:v1'
const SUMMARIES_KEY = 'mms:agent-memory:v1'
const ACTIVE_KEY = 'mms:agent-active:v1'
const SHARE_DRAFTS_KEY = 'mms:agent-share-drafts:v1'

const read = <T>(key: string, fallback: T): T => {
  try { return Taro.getStorageSync<T>(key) || fallback } catch { return fallback }
}

const write = <T>(key: string, value: T) => {
  try { Taro.setStorageSync(key, value) } catch { /* storage quota fallback: current UI remains usable */ }
}

const readSessions = () => {
  const value = read<unknown>(SESSIONS_KEY, [])
  return Array.isArray(value) ? value.map(normalizeAgentSession).filter((session) => session.id) : []
}

const readSummaries = () => {
  const value = read<unknown>(SUMMARIES_KEY, [])
  return Array.isArray(value)
    ? value.map(normalizeMemorySummary).filter((summary) => summary.sessionId).sort((a, b) => b.completedAt - a.completedAt)
    : []
}

const readShareDraftMap = () => {
  const value = read<unknown>(SHARE_DRAFTS_KEY, {})
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {} as Record<string, ShareDraft>
  return Object.entries(value).reduce<Record<string, ShareDraft>>((drafts, [key, item]) => {
    const draft = normalizeShareDraft(item)
    if (draft && draft.sessionId === key) drafts[key] = draft
    return drafts
  }, {})
}

export const getAgentConsent = (): AgentConsent | null => read<AgentConsent | null>(CONSENT_KEY, null)

export const setAgentConsent = (granted: boolean): AgentConsent => {
  const consent: AgentConsent = { version: 1, granted, decidedAt: Date.now() }
  write(CONSENT_KEY, consent)
  if (!granted) {
    write(SESSIONS_KEY, [])
    write(SUMMARIES_KEY, [])
    write(ACTIVE_KEY, '')
    write(SHARE_DRAFTS_KEY, {})
  }
  return consent
}

export const createMemorySummary = (sessionValue: AgentSession, helpfulness: 0 | 1 | 2 | 3 = 2): MemorySummary => {
  const session = normalizeAgentSession(sessionValue)
  const monster = findMonsterBySlug(session.monsterSlug)
  return {
    sessionId: session.id,
    completedAt: session.completedAt || Date.now(),
    monsterSlug: monster.slug,
    monsterType: monster.monsterType,
    goalCategory: categorizeGoal(session.slots.targetOutcome),
    blockerCategory: categorizeBlocker(session.slots.primaryBlocker),
    energyLevel: session.slots.energyLevel || 'low',
    actionType: session.task?.kind || 'action',
    plannedSeconds: session.task?.durationSeconds || 300,
    outcome: session.outcome || 'abandoned',
    rescopeCount: session.rescopeCount,
    rescopeReasons: getRescopeReasons(session),
    helpfulness,
  }
}

export const clearExpiredShareDrafts = (now = Date.now()): ShareDraft[] => {
  const drafts = readShareDraftMap()
  const valid = Object.values(drafts).filter((draft) => !isShareDraftExpired(draft, now))
  write(SHARE_DRAFTS_KEY, Object.fromEntries(valid.map((draft) => [draft.sessionId, draft])))
  return valid.sort((a, b) => b.createdAt - a.createdAt)
}

export const createShareDraft = (session: AgentSession, now = Date.now()): ShareDraft | null => {
  const draft = buildShareDraft(session, now)
  if (!draft) return null
  const drafts = Object.fromEntries(clearExpiredShareDrafts(now).map((item) => [item.sessionId, item]))
  drafts[draft.sessionId] = draft
  write(SHARE_DRAFTS_KEY, drafts)
  return draft
}

export const getShareDraft = (sessionId?: string, now = Date.now()): ShareDraft | null => {
  const valid = clearExpiredShareDrafts(now)
  if (sessionId) return valid.find((draft) => draft.sessionId === sessionId) || null
  return valid[0] || null
}

export const clearShareDraft = (sessionId: string) => {
  const drafts = readShareDraftMap()
  delete drafts[sessionId]
  write(SHARE_DRAFTS_KEY, drafts)
}

export const purgeExpiredAgentData = (now = Date.now()) => {
  clearExpiredShareDrafts(now)
  const sessions = readSessions()
  const summaries = readSummaries()
  const summaryIds = new Set(summaries.map((item) => item.sessionId))
  const keep: AgentSession[] = []

  sessions.forEach((session) => {
    if (!shouldPersistAgentSession(session)) return
    const expired = now - session.updatedAt > AGENT_RETENTION_MS
    if (!expired) {
      keep.push(session)
      return
    }
    if (shouldPersistMemorySummary(session) && !summaryIds.has(session.id)) {
      summaries.push(createMemorySummary(session))
      summaryIds.add(session.id)
    }
  })

  const keptSummaries = summaries
    .map(normalizeMemorySummary)
    .sort((a, b) => b.completedAt - a.completedAt)
    .filter((summary, index, all) => all.findIndex((item) => item.sessionId === summary.sessionId) === index)
  write(SESSIONS_KEY, keep)
  write(SUMMARIES_KEY, keptSummaries)
  const activeId = read<string>(ACTIVE_KEY, '')
  if (activeId && !keep.some((session) => session.id === activeId)) write(ACTIVE_KEY, '')
  return { sessions: keep, summaries: keptSummaries }
}

export const saveAgentSession = (sessionValue: AgentSession) => {
  const session = normalizeAgentSession(sessionValue)
  const sessions = purgeExpiredAgentData().sessions
  if (!shouldPersistAgentSession(session)) {
    write(SESSIONS_KEY, sessions.filter((item) => item.id !== session.id))
    if (read<string>(ACTIVE_KEY, '') === session.id) write(ACTIVE_KEY, '')
    return session
  }
  const next = [session, ...sessions.filter((item) => item.id !== session.id)]
  write(SESSIONS_KEY, next)
  if (!['completed', 'abandoned', 'safety_handoff'].includes(session.phase)) write(ACTIVE_KEY, session.id)
  return session
}

export const getAgentSessions = () => purgeExpiredAgentData().sessions

export const getActiveAgentSession = (): AgentSession | null => {
  const activeId = read<string>(ACTIVE_KEY, '')
  if (!activeId) return null
  const session = getAgentSessions().find((item) => item.id === activeId)
  if (!session || ['completed', 'abandoned', 'safety_handoff'].includes(session.phase)) return null
  return session
}

export const getMemorySummaries = (): MemorySummary[] => purgeExpiredAgentData().summaries

export const getRelevantMemory = (monsterSlug?: string): MemorySummary[] => {
  const summaries = getMemorySummaries()
  const relevant = monsterSlug ? summaries.filter((item) => item.monsterSlug === monsterSlug) : []
  return [...relevant, ...summaries.filter((item) => !relevant.includes(item))].slice(0, 5)
}

export const finishAgentSession = (
  sessionValue: AgentSession,
  outcome: SessionOutcome,
  helpfulness: 0 | 1 | 2 | 3 = 2,
) => {
  const session = normalizeAgentSession(sessionValue)
  const completed: AgentSession = {
    ...session,
    phase: outcome === 'safety' ? 'safety_handoff' : outcome === 'abandoned' ? 'abandoned' : 'completed',
    outcome,
    completedAt: Date.now(),
    updatedAt: Date.now(),
    timerEndsAt: undefined,
  }

  const sessions = purgeExpiredAgentData().sessions
  if (shouldPersistMemorySummary(completed)) {
    write(SESSIONS_KEY, [completed, ...sessions.filter((item) => item.id !== completed.id)])
    const summaries = readSummaries()
    const summary = createMemorySummary(completed, helpfulness)
    write(SUMMARIES_KEY, [summary, ...summaries.filter((item) => item.sessionId !== completed.id)])
  } else {
    write(SESSIONS_KEY, sessions.filter((item) => item.id !== completed.id))
  }
  write(ACTIVE_KEY, '')
  return completed
}

export const getAgentRecordDetail = (sessionId: string, now = Date.now()): AgentRecordDetail | null => {
  const { sessions, summaries } = purgeExpiredAgentData(now)
  const session = sessions.find((item) => item.id === sessionId)
  const storedSummary = summaries.find((item) => item.sessionId === sessionId)
  const summary = storedSummary || (session?.completedAt ? createMemorySummary(session) : undefined)
  return buildAgentRecordDetail(session, summary, now)
}

export const getCurrentWeekSummaries = (now = Date.now()): MemorySummary[] => {
  const range = getLocalWeekRange(now)
  return getSummariesInRange(getMemorySummaries(), range)
}

export const getWeeklyAgentStats = (now = Date.now()): WeeklyAgentStats => buildWeeklyAgentStats(getMemorySummaries(), now)

export const clearAgentData = (preserveConsent = true) => {
  write(SESSIONS_KEY, [])
  write(SUMMARIES_KEY, [])
  write(ACTIVE_KEY, '')
  write(SHARE_DRAFTS_KEY, {})
  if (!preserveConsent) Taro.removeStorageSync(CONSENT_KEY)
}

export const getAgentStats = () => {
  const stats = calculateAgentStats(getMemorySummaries())
  return { ...stats, dominantMonster: stats.dominantMonster || defaultMonster.slug }
}
