import Taro from '@tarojs/taro'

import { buildFallbackAgentResponse, isValidAgentResponse } from './agentEngine'
import { isHighRiskInput } from '../utils/safety'
import { isCloudEnabled } from '../utils/runtime'
import type { AgentTurnRequest, AgentTurnResponse } from '../types/agent'

export const runAgentTurn = async (request: AgentTurnRequest): Promise<AgentTurnResponse> => {
  if (isHighRiskInput(request.userMessage)) return buildFallbackAgentResponse(request)

  if (isCloudEnabled) {
    const cloud = (Taro as typeof Taro & {
      cloud?: { callFunction: (options: { name: string; data: unknown }) => Promise<{ result: unknown }> }
    }).cloud
    if (cloud) {
      try {
        const response = await cloud.callFunction({ name: 'runActionAgent', data: request })
        if (isValidAgentResponse(response.result)) return response.result
      } catch {
        // A deterministic local response keeps the action loop usable when the model is unavailable.
      }
    }
  }

  return buildFallbackAgentResponse(request)
}
