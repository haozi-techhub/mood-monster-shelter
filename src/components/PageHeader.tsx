import { Button, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, type CSSProperties } from 'react'
import { isWebPreview } from '../utils/runtime'

import './components.less'

interface PageHeaderProps {
  title?: string
  showBack?: boolean
  showShare?: boolean
  systemSafe?: boolean
}

const getSystemSafeStyle = (): CSSProperties => {
  if (isWebPreview) return {}
  const fallback = {
    '--page-header-status-bar-height': '20px',
    '--page-header-nav-bar-height': '44px',
    '--page-header-menu-safe-right': '12px',
  } as CSSProperties

  try {
    const windowInfo = Taro.getWindowInfo()
    const menuButton = Taro.getMenuButtonBoundingClientRect?.()
    const statusBarHeight = windowInfo.statusBarHeight || 20
    const navBarHeight = menuButton?.height
      ? Math.max(40, (menuButton.top - statusBarHeight) * 2 + menuButton.height)
      : 44
    const menuSafeRight = menuButton?.left
      ? Math.max(12, windowInfo.windowWidth - menuButton.left + 8)
      : 12

    return {
      '--page-header-status-bar-height': `${statusBarHeight}px`,
      '--page-header-nav-bar-height': `${navBarHeight}px`,
      '--page-header-menu-safe-right': `${menuSafeRight}px`,
    } as CSSProperties
  } catch {
    return fallback
  }
}

export function PageHeader({
  title = '心情怪兽收容所',
  showBack = true,
  showShare = true,
  systemSafe = false,
}: PageHeaderProps) {
  const [systemSafeStyle, setSystemSafeStyle] = useState<CSSProperties>(getSystemSafeStyle)

  useDidShow(() => {
    if (systemSafe) setSystemSafeStyle(getSystemSafeStyle())
  })

  const handleBack = () => {
    if (Taro.getCurrentPages().length > 1) Taro.navigateBack()
    else Taro.reLaunch({ url: '/pages/index/index' })
  }

  return (
    <View
      className={`page-header ${systemSafe ? 'page-header--system-safe' : ''}`}
      style={systemSafe ? systemSafeStyle : undefined}
    >
      <View className='page-header__side'>
        {showBack && (
          <Button className='icon-button page-header__back' aria-label='返回' onClick={handleBack}>
            <Text className='page-header__back-arrow'>‹</Text>
            <Text>返回</Text>
          </Button>
        )}
      </View>
      <Text className='page-header__title'>{title}</Text>
      <View className='page-header__side page-header__side--right'>
        {showShare && !isWebPreview && (
          <Button className='icon-button share-glyph' openType='share' aria-label='分享'>
            ↗
          </Button>
        )}
      </View>
    </View>
  )
}
