import { Button, Image, Text, Textarea, View } from '@tarojs/components'
import Taro, { useDidShow, useShareAppMessage } from '@tarojs/taro'
import { useState, type CSSProperties } from 'react'

import shelterGuide from '../../assets/monsters/shelter-guide.png'
import { BrandLockup } from '../../components/BrandLockup'
import { Decorations } from '../../components/Decorations'
import { MonsterMiniCard } from '../../components/MonsterMiniCard'
import { TabPageLayout } from '../../components/TabPageLayout'
import { featuredMonsters } from '../../data/monsters'
import { getActiveAgentSession } from '../../services/agentStorage'
import type { AgentSession } from '../../types/agent'
import { isHighRiskInput, safetyMessage } from '../../utils/safety'
import './index.less'

const quickInputs = [
  { label: '我没时间', icon: '◌' },
  { label: '我好焦虑', icon: '●' },
  { label: '我又拖延了', icon: '◕' },
  { label: '我不想干活', icon: '◔' },
]

interface HomeViewport {
  className: string
  style: CSSProperties
}

const getHomeViewport = (): HomeViewport => {
  const fallback: HomeViewport = {
    className: '',
    style: {
      '--home-status-bar-height': '20px',
      '--home-nav-bar-height': '44px',
      '--home-menu-safe-right': '12px',
    } as CSSProperties,
  }

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
    const viewportRatio = windowInfo.windowHeight / windowInfo.windowWidth
    const classNames = [
      windowInfo.windowWidth <= 360 ? 'home-page--narrow' : '',
      windowInfo.windowHeight <= 760 || viewportRatio <= 1.9 ? 'home-page--compact' : '',
    ].filter(Boolean)

    return {
      className: classNames.join(' '),
      style: {
        '--home-status-bar-height': `${statusBarHeight}px`,
        '--home-nav-bar-height': `${navBarHeight}px`,
        '--home-menu-safe-right': `${menuSafeRight}px`,
      } as CSSProperties,
    }
  } catch {
    return fallback
  }
}

export default function IndexPage() {
  const [inputText, setInputText] = useState('')
  const [showSafety, setShowSafety] = useState(false)
  const [activeSession, setActiveSession] = useState<AgentSession | null>(() => getActiveAgentSession())
  const [viewport, setViewport] = useState<HomeViewport>(getHomeViewport)

  useDidShow(() => {
    setActiveSession(getActiveAgentSession())
    setViewport(getHomeViewport())
  })

  useShareAppMessage(() => ({
    title: '今天是哪只心情怪兽跑出来了？',
    path: '/pages/index/index',
  }))

  const startCapture = () => {
    const value = inputText.trim()
    if (!value) {
      Taro.showToast({ title: '先告诉我一点点此刻的状态吧', icon: 'none' })
      return
    }
    if (isHighRiskInput(value)) {
      setShowSafety(true)
      return
    }
    Taro.navigateTo({ url: `/pages/agent/index?text=${encodeURIComponent(value)}` })
  }

  return (
    <TabPageLayout active='home' className={`home-page ${viewport.className}`} style={viewport.style}>
      <Decorations />
      <View className='home-top'>
        <Button className='my-monsters' onClick={() => Taro.navigateTo({ url: '/pages/gallery/index' })}>
          <Image src={shelterGuide} mode='aspectFit' />
          <Text>我的怪兽</Text>
          <Text>›</Text>
        </Button>
      </View>

      <View className='home-hero'>
        <BrandLockup />
        <View className='home-guide-wrap'>
          <View className='guide-speech'>
            <View className='guide-speech__copy'>
              <Text>我是紫色收容员</Text>
              <Text>陪你把下一步做小～</Text>
            </View>
            <Text className='guide-speech__heart'>♥</Text>
          </View>
          <View className='guide-glow' />
          <Image className='home-guide' src={shelterGuide} mode='aspectFit' />
        </View>
      </View>

      {activeSession && (
        <Button className='active-agent-card glass-card' onClick={() => Taro.navigateTo({ url: '/pages/agent/index' })}>
          <View><Text className='active-agent-card__tag'>ONGOING · 行动还在</Text><Text className='active-agent-card__title'>{activeSession.task?.title || '继续刚才的收容对话'}</Text></View>
          <Text className='active-agent-card__arrow'>›</Text>
        </Button>
      )}

      {showSafety ? (
        <View className='safety-card glass-card'>
          <Text className='safety-card__icon'>♡</Text>
          <Text className='safety-card__title'>{safetyMessage.title}</Text>
          <Text className='safety-card__body'>{safetyMessage.body}</Text>
          <View className='safety-card__action'>{safetyMessage.action}</View>
          <Button className='secondary-button' onClick={() => setShowSafety(false)}>我知道了</Button>
        </View>
      ) : (
        <View className='capture-card glass-card'>
          <View className='capture-card__title'>
            <Text>今天是哪只心情怪兽跑出来了？</Text><Text className='capture-card__pencil'>✎</Text>
          </View>
          <View className='capture-input'>
            <Textarea
              maxlength={200}
              value={inputText}
              placeholder='写下此刻的心情，越具体越能被理解哦…'
              onInput={(event) => setInputText(event.detail.value)}
            />
            <Text className='capture-input__count'>{inputText.length}/200</Text>
          </View>
          <View className='quick-inputs'>
            {quickInputs.map((item, index) => (
              <Button key={item.label} className={`quick-chip quick-chip--${index + 1}`} onClick={() => setInputText(item.label)}>
                <Text>{item.icon}</Text><Text>{item.label}</Text>
              </Button>
            ))}
          </View>
          <Button className='primary-button capture-button' onClick={startCapture}>
            <View className='capture-button__sparkles' aria-hidden>
              <Text className='capture-button__sparkle capture-button__sparkle--1'>✦</Text>
              <Text className='capture-button__sparkle capture-button__sparkle--2'>✧</Text>
              <Text className='capture-button__sparkle capture-button__sparkle--3'>✦</Text>
              <Text className='capture-button__sparkle capture-button__sparkle--4'>✧</Text>
              <Text className='capture-button__sparkle capture-button__sparkle--5'>✦</Text>
              <Text className='capture-button__sparkle capture-button__sparkle--6'>✧</Text>
            </View>
            <Text className='capture-button__label'>开始收容</Text>
            <Text className='capture-button__arrow'>›</Text>
          </Button>
          <View className='privacy-note'><Text>♢</Text><Text>对话只按你的授权保存在本机</Text><Text>♙</Text></View>
        </View>
      )}

      <View className='hot-section glass-card'>
        <View className='section-title'>
          <Text>🔥 今日热门怪兽</Text><Text className='hot-section__refresh'>换一批 ⟳</Text>
        </View>
        <View className='hot-grid'>
          {featuredMonsters.map((monster, index) => (
            <MonsterMiniCard key={monster.id} monster={monster} metric={['12.3k', '9.8k', '8.6k', '7.2k'][index]} />
          ))}
        </View>
      </View>

    </TabPageLayout>
  )
}
