import Taro from '@tarojs/taro'
import type { ReactNode } from 'react'

import { purgeExpiredAgentData } from './services/agentStorage'
import { sanitizeLatestAnalysisStorage } from './services/storage'
import './app.less'

const cloud = (Taro as typeof Taro & {
  cloud?: { init: (options: { env?: string; traceUser?: boolean }) => void }
}).cloud

if (process.env.TARO_APP_USE_CLOUD === 'true' && cloud) {
  cloud.init({
    env: process.env.TARO_APP_CLOUDBASE_ENV || undefined,
    traceUser: true,
  })
}

purgeExpiredAgentData()
sanitizeLatestAnalysisStorage()

export default function App({ children }: { children: ReactNode }) {
  return children
}
