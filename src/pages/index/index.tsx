import { Button, Image, Text, Textarea, View } from '@tarojs/components'
import Taro, { useShareAppMessage } from '@tarojs/taro'
import { useState } from 'react'

import shelterGuide from '../../assets/monsters/shelter-guide.png'
import { BottomNav } from '../../components/BottomNav'
import { BrandLockup } from '../../components/BrandLockup'
import { Decorations } from '../../components/Decorations'
import { MonsterMiniCard } from '../../components/MonsterMiniCard'
import { featuredMonsters } from '../../data/monsters'
import { isHighRiskInput, safetyMessage } from '../../utils/safety'
import './index.less'

const quickInputs = [
  { label: '我没时间', icon: '◌' },
  { label: '我好焦虑', icon: '●' },
  { label: '我又拖延了', icon: '◕' },
  { label: '我不想干活', icon: '◔' },
]

export default function IndexPage() {
  const [inputText, setInputText] = useState('')
  const [showSafety, setShowSafety] = useState(false)

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
    Taro.navigateTo({ url: `/pages/loading/index?text=${encodeURIComponent(value)}` })
  }

  return (
    <View className='page home-page'>
      <Decorations />
      <View className='home-top'>
        <Text className='home-time'>9:16</Text>
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
            <Text>来吧，我帮你{`\n`}收容今天的小怪兽～</Text>
            <Text className='guide-speech__heart'>♥</Text>
          </View>
          <View className='guide-glow' />
          <Image className='home-guide' src={shelterGuide} mode='aspectFit' />
        </View>
      </View>

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
            <Text>开始收容</Text><Text className='capture-button__arrow'>›</Text>
          </Button>
          <View className='privacy-note'><Text>♢</Text><Text>你的心情，我们会好好保管</Text><Text>♙</Text></View>
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

      <BottomNav active='home' />
    </View>
  )
}
