import { Button, Image, Text, View } from '@tarojs/components'
import Taro, { useDidShow, useShareAppMessage } from '@tarojs/taro'
import { useState } from 'react'

import { Decorations } from '../../components/Decorations'
import { PageHeader } from '../../components/PageHeader'
import { addToGallery, getLatestAnalysis, type AnalysisResult } from '../../services/storage'
import './index.less'

export default function ResultPage() {
  const [result, setResult] = useState<AnalysisResult>(() => getLatestAnalysis())
  const [added, setAdded] = useState(false)

  useDidShow(() => setResult(getLatestAnalysis()))
  useShareAppMessage(() => ({
    title: `我捕获了「${result.monsterName}」`,
    path: '/pages/index/index',
  }))

  const addMonster = (completed = false) => {
    addToGallery(result, completed)
    setAdded(true)
    Taro.showToast({ title: completed ? '驯化任务完成，怪兽稳定了' : '已存入怪兽图鉴', icon: 'none' })
  }

  if (result.safety) {
    return (
      <View className='page result-page result-page--safety'>
        <PageHeader title='安全回应' showShare={false} />
        <View className='safe-response glass-card'>
          <Text className='safe-response__mark'>♡</Text>
          <Text className='safe-response__title'>{result.safety.title}</Text>
          <Text className='safe-response__body'>{result.safety.body}</Text>
          <View className='safe-response__action'>{result.safety.action}</View>
          <Button className='primary-button' onClick={() => Taro.reLaunch({ url: '/pages/index/index' })}>回到收容所</Button>
        </View>
      </View>
    )
  }

  return (
    <View className='page result-page'>
      <Decorations />
      <PageHeader title='收容档案' />
      <Text className='result-title'>收容档案</Text>

      <View className='archive-stack'>
        <View className='archive-stack__sheet archive-stack__sheet--back' />
        <View className='archive-card'>
          <View className='archive-card__meta'>
            <Text>ID: {result.id}</Text><Text>Status: 已收容</Text>
          </View>
          <View className='captured-stamp'>CAPTURED</View>

          <View className='archive-profile'>
            <View className='archive-photo'>
              <View className='paper-tape' />
              <Image src={result.image} mode='aspectFit' />
              <Text className='archive-photo__heart'>♥</Text>
            </View>
            <View className='archive-identity'>
              <Text className='archive-identity__name'>{result.monsterName}</Text>
              <Text>类型：{result.monsterType}怪兽</Text>
              <Text>危险等级：{result.dangerLevel}</Text>
              <Text>常见呢喃：</Text>
              <Text className='archive-identity__quote'>“{result.catchphrase}”</Text>
            </View>
          </View>

          <View className='archive-panel archive-panel--identity'>
            <Text className='archive-panel__title'>♙ 真实身份</Text>
            <Text className='archive-panel__body'>{result.trueIdentity}</Text>
          </View>

          <View className='archive-panel archive-panel--disguise'>
            <Text className='archive-panel__title'>▤ 伪装鉴定室</Text>
            <Text className='archive-panel__body'>出现原因：{result.whyItAppears}</Text>
            <Text className='archive-panel__body'>拆穿证据：{result.excuseCrush}</Text>
          </View>

          <View className='archive-panel archive-panel--task'>
            <Text className='archive-panel__title'><Text className='highlight'>5 分钟驯化任务</Text></Text>
            <Text className='archive-panel__body'>{result.microAction}</Text>
            <Text className='archive-panel__note'>今日禁止投喂：{result.doNotFeed}</Text>
          </View>

          <View className='fold-corner' />
        </View>
      </View>

      <View className='result-actions'>
        <Button className='secondary-button' onClick={() => Taro.navigateTo({ url: '/pages/share/index?template=daily' })}>生成分享卡</Button>
        <Button className='primary-button' onClick={() => { addMonster(true); Taro.navigateTo({ url: '/pages/share/index?template=discharge' }) }}>我完成了</Button>
        <Button className={`secondary-button ${added ? 'is-added' : ''}`} onClick={() => addMonster(false)}>{added ? '已加入' : '加入图鉴'}</Button>
      </View>
    </View>
  )
}
