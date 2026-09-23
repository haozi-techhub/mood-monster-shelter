import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { createElement, type ReactNode } from 'react'

import { PreviewNotice } from './components/PreviewNotice'
import { purgeExpiredAgentData } from './services/agentStorage'
import { sanitizeLatestAnalysisStorage } from './services/storage'
import { isCloudEnabled, isWebPreview } from './utils/runtime'
import './app.less'

if (process.env.TARO_ENV === 'h5') require('./web-preview.less')

const cloud = (Taro as typeof Taro & {
  cloud?: { init: (options: { env?: string; traceUser?: boolean }) => void }
}).cloud

if (isCloudEnabled && cloud) {
  cloud.init({
    env: process.env.TARO_APP_CLOUDBASE_ENV || undefined,
    traceUser: true,
  })
}

purgeExpiredAgentData()
sanitizeLatestAnalysisStorage()

export default function App({ children }: { children: ReactNode }) {
  if (isWebPreview) {
    return createElement(View, { className: 'web-preview-frame' }, createElement(PreviewNotice), children)
  }
  return children
}
