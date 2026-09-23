import { ScrollView, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import type { CSSProperties, ReactNode } from 'react'
import { useState } from 'react'
import { isWebPreview } from '../utils/runtime'

import { BottomNav, type ActiveTab } from './BottomNav'
import './components.less'

interface TabPageLayoutProps {
  active: ActiveTab
  children: ReactNode
  className?: string
  style?: CSSProperties
}

const getTabViewportStyle = (): CSSProperties => {
  if (isWebPreview) return {}
  const fallback = {
    '--tab-status-bar-height': '20px',
    '--tab-nav-bar-height': '44px',
    '--tab-menu-safe-right': '12px',
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
      '--tab-status-bar-height': `${statusBarHeight}px`,
      '--tab-nav-bar-height': `${navBarHeight}px`,
      '--tab-menu-safe-right': `${menuSafeRight}px`,
    } as CSSProperties
  } catch {
    return fallback
  }
}

export function TabPageLayout({ active, children, className = '', style }: TabPageLayoutProps) {
  const [viewportStyle, setViewportStyle] = useState<CSSProperties>(getTabViewportStyle)

  useDidShow(() => {
    setViewportStyle(getTabViewportStyle())
  })

  return (
    <View className='tab-page-shell'>
      <ScrollView
        className={`page tab-page-scroll ${className}`}
        style={{ ...viewportStyle, ...style }}
        scrollY
        enhanced
        bounces={false}
        showScrollbar={false}
      >
        {children}
        <View className='tab-page-scroll__spacer' aria-hidden />
      </ScrollView>
      <BottomNav active={active} />
    </View>
  )
}
