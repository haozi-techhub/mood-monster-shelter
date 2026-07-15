import { Button, Image, Text, View } from '@tarojs/components'
import Taro, { useDidShow, useShareAppMessage } from '@tarojs/taro'
import { useMemo, useState } from 'react'

import { BottomNav } from '../../components/BottomNav'
import { Decorations } from '../../components/Decorations'
import { PageHeader } from '../../components/PageHeader'
import { defaultMonster, findMonsterBySlug, monsters } from '../../data/monsters'
import { getGalleryRecords, saveLatestAnalysis, type GalleryRecord } from '../../services/storage'
import './index.less'

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const monsterTypeClass = {
  情绪类: 'emotion',
  借口类: 'excuse',
  混合类: 'mixed',
} as const

export default function GalleryPage() {
  const [records, setRecords] = useState<GalleryRecord[]>(() => getGalleryRecords())
  useDidShow(() => setRecords(getGalleryRecords()))
  useShareAppMessage(() => ({ title: '这是我的心情怪兽图鉴', path: '/pages/index/index' }))

  const recordMap = useMemo(() => new Map(records.map((record) => [record.monsterSlug, record])), [records])
  const dominantRecord = useMemo(() => [...records].sort((a, b) => b.count - a.count)[0], [records])
  const dominant = dominantRecord ? findMonsterBySlug(dominantRecord.monsterSlug) : defaultMonster
  const totalCaptures = records.reduce((sum, record) => sum + record.count, 0)
  const completedCount = records.filter((record) => record.completed).length

  const openRecord = (monsterSlug: string) => {
    const record = recordMap.get(monsterSlug)
    if (!record) {
      Taro.showToast({ title: '它还藏在心情走廊里', icon: 'none' })
      return
    }
    const monster = findMonsterBySlug(monsterSlug)
    saveLatestAnalysis({ ...monster, inputText: monster.catchphrase, capturedAt: record.capturedAt, collectionId: record.collectionId })
    Taro.navigateTo({ url: '/pages/result/index' })
  }

  return (
    <View className='page gallery-page'>
      <Decorations />
      <PageHeader />
      <View className='gallery-heading'>
        <Text>我的怪兽图鉴</Text>
        <Text className='gallery-heading__subtitle'>看看最近是哪只小怪兽经常来上班</Text>
      </View>

      <View className='gallery-summary glass-card'>
        <View><Text>已收容怪兽：</Text><Text className='gallery-summary__number'>{records.length}</Text></View>
        <View><Text>本周主导：</Text><Text className='gallery-summary__strong'>{dominant.monsterName}</Text></View>
        <View><Text>累计出现：</Text><Text className='gallery-summary__number'>{totalCaptures}</Text></View>
        <View><Text>完成任务：</Text><Text className='gallery-summary__strong'>{completedCount} 次</Text></View>
      </View>

      <View className='dominant-card'>
        <View className='dominant-card__tape' />
        <Image src={dominant.image} mode='aspectFit' />
        <View className='dominant-card__copy'>
          <Text className='dominant-card__title'>本周主导 {dominant.shortName}</Text>
          <Text>出现次数：{dominantRecord?.count || 0} 次</Text>
          <Text>常见呢喃：“{dominant.catchphrase}”</Text>
        </View>
        <Text className='dominant-card__sticker'>STICKER</Text>
      </View>

      <View className='gallery-grid'>
        {monsters.map((monster) => {
          const record = recordMap.get(monster.slug)
          return (
            <Button key={monster.id} className={`gallery-item ${record ? '' : 'gallery-item--locked'}`} onClick={() => openRecord(monster.slug)}>
              <Image src={monster.image} mode='aspectFit' />
              {record ? (
                <View className='gallery-item__copy'>
                  <Text className='gallery-item__name'>{monster.monsterName}</Text>
                  <Text className={`gallery-item__tag gallery-item__tag--${monsterTypeClass[monster.monsterType]}`}>{monster.monsterType}</Text>
                  <Text>出现次数：{record.count} 次</Text>
                  <Text>上次见：{formatDate(record.capturedAt)}</Text>
                </View>
              ) : (
                <View className='gallery-item__locked-copy'><Text>▣</Text><Text>等待收容</Text></View>
              )}
            </Button>
          )
        })}
      </View>

      <BottomNav active='records' />
    </View>
  )
}
