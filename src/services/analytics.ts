import Taro from '@tarojs/taro'

import type { AgentEventName } from '../types/agent'

const EVENT_KEY = 'mms:agent-events:v1'
const BLOCKED_KEYS = /text|message|input|content|conversation|raw/i

interface AgentEvent {
  name: AgentEventName
  at: number
  properties: Record<string, string | number | boolean>
}

export const trackAgentEvent = (
  name: AgentEventName,
  properties: Record<string, string | number | boolean> = {},
) => {
  const safeProperties = Object.fromEntries(Object.entries(properties).filter(([key]) => !BLOCKED_KEYS.test(key)))
  try {
    const events = Taro.getStorageSync<AgentEvent[]>(EVENT_KEY) || []
    Taro.setStorageSync(EVENT_KEY, [...events, { name, at: Date.now(), properties: safeProperties }].slice(-200))
  } catch {
    // Analytics must never interrupt the Agent experience.
  }
}

export const getAgentEvents = (): AgentEvent[] => {
  try { return Taro.getStorageSync<AgentEvent[]>(EVENT_KEY) || [] } catch { return [] }
}

export const clearAgentEvents = () => {
  try { Taro.removeStorageSync(EVENT_KEY) } catch { /* clearing metrics must not interrupt the UI */ }
}
