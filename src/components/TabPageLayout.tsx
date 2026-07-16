import { ScrollView, View } from '@tarojs/components'
import type { CSSProperties, ReactNode } from 'react'

import { BottomNav, type ActiveTab } from './BottomNav'
import './components.less'

interface TabPageLayoutProps {
  active: ActiveTab
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export function TabPageLayout({ active, children, className = '', style }: TabPageLayoutProps) {
  return (
    <View className='tab-page-shell'>
      <ScrollView
        className={`page tab-page-scroll ${className}`}
        style={style}
        scrollY
        enhanced
        bounces={false}
        showScrollbar={false}
      >
        {children}
      </ScrollView>
      <BottomNav active={active} />
    </View>
  )
}
