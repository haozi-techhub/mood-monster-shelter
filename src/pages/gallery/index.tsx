import { Button, Image, Text, View } from '@tarojs/components'
import Taro, { useDidShow, useShareAppMessage } from '@tarojs/taro'
import { useMemo, useState } from 'react'

import shelterGuide from '../../assets/monsters/shelter-guide.png'
import { BottomNav } from '../../components/BottomNav'
import { Decorations } from '../../components/Decorations'
import { PageHeader } from '../../components/PageHeader'
import { findMonsterBySlug, monsters } from '../../data/monsters'
import { getMemorySummaries, getWeeklyAgentStats } from '../../services/agentStorage'
import { getGalleryRecords, saveLatestAnalysis, type GalleryRecord } from '../../services/storage'
import type { MemorySummary, WeeklyAgentStats } from '../../types/agent'
import './index.less'

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const formatDuration = (seconds: number) => seconds < 60 ? `${seconds} 秒` : `${Math.ceil(seconds / 60)} 分钟`

export default function GalleryPage() {
  const [records, setRecords] = useState<GalleryRecord[]>(() => getGalleryRecords())
  const [actions, setActions] = useState<MemorySummary[]>(() => getMemorySummaries())
  const [weeklyStats, setWeeklyStats] = useState<WeeklyAgentStats>(() => getWeeklyAgentStats())
  useDidShow(() => {
    setRecords(getGalleryRecords())
    setActions(getMemorySummaries())
    setWeeklyStats(getWeeklyAgentStats())
  })
  useShareAppMessage(() => ({ title: '这是我的心情怪兽图鉴', path: '/pages/index/index' }))

  const recordMap = useMemo(() => new Map(records.map((record) => [record.monsterSlug, record])), [records])
  const weeklyDominant = weeklyStats.dominantMonster ? findMonsterBySlug(weeklyStats.dominantMonster) : null
  const weeklyDominantCount = weeklyDominant
    ? weeklyStats.summaries.filter((summary) => summary.monsterSlug === weeklyDominant.slug).length
    : 0
  const totalCaptures = records.reduce((sum, record) => sum + record.count, 0)
  const completedCount = actions.filter((action) => action.outcome === 'completed' || action.outcome === 'care_only').length

  const openRecord = (monsterSlug: string) => {
    const record = recordMap.get(monsterSlug)
    if (!record) {
      Taro.showToast({ title: '它还藏在心情走廊里', icon: 'none' })
      return
    }
    const monster = findMonsterBySlug(monsterSlug)
    saveLatestAnalysis({ ...monster, inputText: monster.catchphrase, capturedAt: record.capturedAt, collectionId: record.collectionId })
    Taro.navigateTo({ url: '/pages/result/index?source=gallery' })
  }

  const openActionRecord = (sessionId: string) => {
    Taro.navigateTo({ url: `/pages/record-detail/index?sessionId=${encodeURIComponent(sessionId)}` })
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
        <View><Text>本周主导：</Text><Text className='gallery-summary__strong'>{weeklyDominant?.monsterName || '暂无记录'}</Text></View>
        <View><Text>累计出现：</Text><Text className='gallery-summary__number'>{totalCaptures}</Text></View>
        <View><Text>完成任务：</Text><Text className='gallery-summary__strong'>{completedCount} 次</Text></View>
      </View>

      {actions.length > 0 && (
        <View className='gallery-actions glass-card'>
          <View className='gallery-actions__heading'><Text>最近行动档案</Text><Text>{actions.length} 次 Agent 会话</Text></View>
          {actions.slice(0, 3).map((action) => {
            const actionMonster = findMonsterBySlug(action.monsterSlug)
            return (
              <Button
                key={action.sessionId}
                className='gallery-action-row'
                aria-label={`查看${actionMonster.shortName}的行动档案`}
                onClick={() => openActionRecord(action.sessionId)}
              >
                <Image src={actionMonster.image} mode='aspectFit' />
                <View><Text>{actionMonster.shortName}</Text><Text>{formatDuration(action.plannedSeconds)} · 降阶 {action.rescopeCount} 次</Text></View>
                <Text className={`gallery-action-row__status gallery-action-row__status--${action.outcome}`}>{action.outcome === 'completed' || action.outcome === 'care_only' ? '已完成' : '已暂停'}</Text>
              </Button>
            )
          })}
        </View>
      )}

      {weeklyDominant ? (
        <View className='dominant-card'>
          <View className='dominant-card__tape' />
          <Image src={weeklyDominant.image} mode='aspectFit' />
          <View className='dominant-card__copy'>
            <Text className='dominant-card__title'>本周主导 {weeklyDominant.shortName}</Text>
            <Text>出现次数：{weeklyDominantCount} 次</Text>
            <Text>常见呢喃：“{weeklyDominant.catchphrase}”</Text>
          </View>
          <Text className='dominant-card__sticker'>STICKER</Text>
        </View>
      ) : (
        <View className='dominant-card dominant-card--empty'>
          <View className='dominant-card__tape' />
          <Image src={shelterGuide} mode='aspectFit' />
          <View className='dominant-card__copy'>
            <Text className='dominant-card__title'>本周还没有怪兽来上班</Text>
            <Text>完成一次行动后，收容员会从本周记录里找出最常出现的怪兽。</Text>
          </View>
        </View>
      )}

      <View className='gallery-grid'>
        {monsters.map((monster) => {
          const record = recordMap.get(monster.slug)
          return (
            <Button key={monster.id} className={`gallery-item ${record ? '' : 'gallery-item--locked'}`} onClick={() => openRecord(monster.slug)}>
              <Image src={monster.image} mode='aspectFit' />
              {record ? (
                <View className='gallery-item__copy'>
                  <Text className='gallery-item__name'>{monster.monsterName}</Text>
                  <Text className={`gallery-item__tag gallery-item__tag--${monster.monsterType}`}>{monster.monsterType}</Text>
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
