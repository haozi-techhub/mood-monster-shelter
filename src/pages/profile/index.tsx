import { Button, Image, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useMemo, useState } from 'react'

import shelterGuide from '../../assets/monsters/shelter-guide.png'
import { Decorations } from '../../components/Decorations'
import { PageHeader } from '../../components/PageHeader'
import { TabPageLayout } from '../../components/TabPageLayout'
import {
  clearAgentData,
  getAgentConsent,
  getAgentStats,
  getMemorySummaries,
  setAgentConsent,
} from '../../services/agentStorage'
import { clearAgentEvents, trackAgentEvent } from '../../services/analytics'
import { clearMonsterData } from '../../services/storage'
import './index.less'

export default function ProfilePage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const consent = useMemo(() => getAgentConsent(), [refreshKey])
  const stats = useMemo(() => getAgentStats(), [refreshKey])
  const summaries = useMemo(() => getMemorySummaries(), [refreshKey])
  useDidShow(() => setRefreshKey((key) => key + 1))

  const enableMemory = () => {
    setAgentConsent(true)
    trackAgentEvent('memory_consent', { granted: true, source: 'profile' })
    setRefreshKey((key) => key + 1)
    Taro.showToast({ title: '收容员会按约定记住结构化线索', icon: 'none' })
  }

  const disableMemory = async () => {
    const result = await Taro.showModal({ title: '关闭本地记忆？', content: '完整对话、行动记录、怪兽图鉴、长期摘要和本地指标会一起清除。' })
    if (!result.confirm) return
    setAgentConsent(false)
    clearAgentData(true)
    clearMonsterData()
    clearAgentEvents()
    setRefreshKey((key) => key + 1)
  }

  const clearAll = async () => {
    const result = await Taro.showModal({ title: '清空收容记录？', content: '这会删除本机上的完整对话、结构化摘要、怪兽图鉴和本地指标，无法撤销。' })
    if (!result.confirm) return
    clearAgentData(true)
    clearMonsterData()
    clearAgentEvents()
    setRefreshKey((key) => key + 1)
    Taro.showToast({ title: '本地收容记录已清空', icon: 'none' })
  }

  return (
    <TabPageLayout active='profile' className='profile-page'>
      <Decorations />
      <PageHeader title='我的收容所' showShare={false} />

      <View className='profile-hero glass-card'>
        <Image src={shelterGuide} mode='aspectFit' />
        <View><Text className='profile-hero__tag'>LOCAL SHELTER</Text><Text className='profile-hero__title'>只属于这台设备的小收容所</Text><Text>没有登录，也不会把完整对话存进云端用户画像。</Text></View>
      </View>

      <View className='profile-stats'>
        <View className='glass-card'><Text>{stats.sessions}</Text><Text>记忆摘要</Text></View>
        <View className='glass-card'><Text>{stats.completed}</Text><Text>有效行动</Text></View>
        <View className='glass-card'><Text>{stats.completionRate}%</Text><Text>完成率</Text></View>
      </View>

      <View className='profile-section glass-card'>
        <View className='profile-section__title'><View><Text>本地记忆</Text><Text>{consent?.granted ? '已开启' : '未开启'}</Text></View><View className={`profile-memory-dot ${consent?.granted ? 'is-on' : ''}`} /></View>
        <Text className='profile-section__body'>开启后，完整对话在本机保留 14 天；到期后只留下怪兽、行动类型和完成情况等结构化摘要，不保留你的原话。</Text>
        {consent?.granted
          ? <Button className='secondary-button' onClick={disableMemory}>关闭并清除记忆</Button>
          : <Button className='primary-button' onClick={enableMemory}>开启本地记忆</Button>}
      </View>

      <View className='profile-section glass-card'>
        <View className='profile-section__title'><View><Text>数据保留说明</Text><Text>14 DAYS</Text></View></View>
        <View className='profile-retention'>
          <View><Text>0–14天</Text><Text>完整对话仅保存在本机，用于继续未完成的行动。</Text></View>
          <View><Text>14天后</Text><Text>仅保留不含原话的结构化摘要，用于发现行动规律。</Text></View>
          <View><Text>随时可删</Text><Text>关闭记忆或清空记录后立即从本机删除。</Text></View>
        </View>
      </View>

      <View className='profile-section profile-section--danger glass-card'>
        <View className='profile-section__title'><View><Text>清理收容所</Text><Text>{summaries.length} 条长期摘要</Text></View></View>
        <Text className='profile-section__body'>清除后，发现页会重新从三次有效收容开始学习。</Text>
        <Button className='secondary-button' onClick={clearAll}>清空本地数据</Button>
      </View>

      <View className='profile-boundary'><Text>心情怪兽收容所是轻量自我观察和行动工具，不提供医疗或心理诊断。</Text></View>
    </TabPageLayout>
  )
}
