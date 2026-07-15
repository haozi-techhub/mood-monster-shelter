import { Image, Text, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useMemo, useState } from 'react'

import shelterGuide from '../../assets/monsters/shelter-guide.png'
import { Decorations } from '../../components/Decorations'
import { analyzeMood } from '../../services/monsterApi'
import { saveLatestAnalysis } from '../../services/storage'
import './index.less'

const stages = [
  ['发现一只可疑小怪兽…', '它正在伪装成一句很合理的话…'],
  ['正在打开伪装鉴定镜…', '温柔地检查它藏起来的真实身份…'],
  ['正在投喂镇定饼干…', '把大问题掰成一小口、一小口…'],
]

export default function LoadingPage() {
  const router = useRouter()
  const [stageIndex, setStageIndex] = useState(0)
  const inputText = useMemo(() => {
    const raw = router.params.text || '我还没准备好'
    try { return decodeURIComponent(raw) } catch { return raw }
  }, [router.params.text])

  useEffect(() => {
    let active = true
    const ticker = setInterval(() => setStageIndex((index) => Math.min(index + 1, stages.length - 1)), 760)

    analyzeMood(inputText)
      .then((result) => {
        if (!active) return
        saveLatestAnalysis(result)
        setStageIndex(stages.length - 1)
        setTimeout(() => active && Taro.redirectTo({ url: '/pages/result/index' }), 460)
      })
      .catch(() => {
        if (!active) return
        Taro.showToast({ title: '小怪兽躲了一下，正在使用备用档案', icon: 'none' })
        setTimeout(() => active && Taro.redirectTo({ url: '/pages/result/index' }), 500)
      })

    return () => {
      active = false
      clearInterval(ticker)
    }
  }, [inputText])

  return (
    <View className='page loading-page'>
      <Decorations />
      <View className='loading-copy'>
        <Text className='loading-title'>正在巡逻心情走廊…</Text>
        <Text className='loading-subtitle'>别急，我们正在寻找今天跑出来的小怪兽</Text>
      </View>

      <View className='scanner'>
        <View className='scanner__rune scanner__rune--1'>?</View>
        <View className='scanner__rune scanner__rune--2'>⌁</View>
        <View className='scanner__rune scanner__rune--3'>✦</View>
        <View className='scanner__ring scanner__ring--outer' />
        <View className='scanner__ring scanner__ring--inner' />
        <View className='scanner__orbit'><View className='scanner__planet' /></View>
        <View className='scanner__beam' />
        <Image className='scanner__monster' src={shelterGuide} mode='aspectFit' />
      </View>

      <View className='loading-status'>
        <Text>{stages[stageIndex][0]}</Text>
        <Text className='loading-status__strong'>{stages[stageIndex][1]}</Text>
        <Text className='loading-status__input'>“{inputText.slice(0, 28)}{inputText.length > 28 ? '…' : ''}”</Text>
      </View>

      <View className='progress-shell'>
        <View className={`progress-bar progress-bar--${stageIndex + 1}`} />
      </View>
    </View>
  )
}
