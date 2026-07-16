import { Button, Image, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useMemo, useState } from 'react'

import shelterGuide from '../../assets/monsters/shelter-guide.png'
import { BottomNav } from '../../components/BottomNav'
import { Decorations } from '../../components/Decorations'
import { PageHeader } from '../../components/PageHeader'
import { findMonsterBySlug } from '../../data/monsters'
import { getMemorySummaries, getWeeklyAgentStats } from '../../services/agentStorage'
import type { MemorySummary, WeeklyAgentStats } from '../../types/agent'
import './index.less'

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}.${date.getDate()}`
}

const actionLabel = (seconds: number) => seconds <= 30 ? '30秒启动' : `${Math.ceil(seconds / 60)}分钟行动`

export default function DiscoverPage() {
  const [summaries, setSummaries] = useState<MemorySummary[]>(() => getMemorySummaries())
  const [weeklyStats, setWeeklyStats] = useState<WeeklyAgentStats>(() => getWeeklyAgentStats())
  useDidShow(() => {
    setSummaries(getMemorySummaries())
    setWeeklyStats(getWeeklyAgentStats())
  })
  const completed = summaries.filter((item) => item.outcome === 'completed' || item.outcome === 'care_only')
  const unlocked = completed.length >= 3
  const dominant = weeklyStats.dominantMonster ? findMonsterBySlug(weeklyStats.dominantMonster) : null
  const weeklyHasRecords = weeklyStats.summaries.length > 0
  const weeklyPreferredLabel = weeklyStats.preferredSeconds ? actionLabel(weeklyStats.preferredSeconds) : '暂无'
  const weekRangeLabel = useMemo(() => {
    const start = new Date(weeklyStats.range.startAt)
    const end = new Date(weeklyStats.range.endAt - 1)
    return `${start.getMonth() + 1}.${start.getDate()}–${end.getMonth() + 1}.${end.getDate()}`
  }, [weeklyStats.range.endAt, weeklyStats.range.startAt])

  const openActionRecord = (sessionId: string) => {
    Taro.navigateTo({ url: `/pages/record-detail/index?sessionId=${encodeURIComponent(sessionId)}` })
  }

  return (
    <View className='page discover-page'>
      <Decorations />
      <PageHeader title='怪兽发现' showShare={false} />
      <View className='discover-heading'>
        <Text>收容所观察报告</Text>
        <Text>不评价你，只帮你找出真正有效的小动作</Text>
      </View>

      {!unlocked ? (
        <View className='discover-locked glass-card'>
          <Image src={shelterGuide} mode='aspectFit' />
          <Text className='discover-locked__tag'>PATTERN LOCKED</Text>
          <Text className='discover-locked__title'>再完成 {Math.max(0, 3 - completed.length)} 次收容，就能看见你的行动规律</Text>
          <Text>收容员至少需要三条结构化记录，才不会拿一次偶然给你贴标签。</Text>
        </View>
      ) : (
        <>
          {!weeklyHasRecords || !dominant ? (
            <View className='discover-week-empty glass-card'>
              <Image className='discover-week-empty__image' src={shelterGuide} mode='aspectFit' />
              <Text className='discover-insight__eyebrow'>THIS WEEK · {weekRangeLabel}</Text>
              <Text className='discover-insight__title'>本周还没有行动记录</Text>
              <Text>历史规律还在，但收容员不会拿过去的数据冒充本周报告。完成一次小行动后再回来看看。</Text>
              <Button className='primary-button' onClick={() => Taro.reLaunch({ url: '/pages/agent/index' })}>开始一次小行动</Button>
            </View>
          ) : (
            <>
              <View className='discover-dominant glass-card'>
                <Image src={dominant.image} mode='aspectFit' />
                <View>
                  <Text className='discover-dominant__tag'>本周常来上班 · {weekRangeLabel}</Text>
                  <Text className='discover-dominant__name'>{dominant.monsterName}</Text>
                  <Text>{dominant.excuseCrush}</Text>
                </View>
              </View>

              <View className='discover-metrics'>
                <View className='glass-card'><Text>{weeklyStats.sessions}</Text><Text>本周会话</Text></View>
                <View className='glass-card'><Text>{weeklyStats.completionRate}%</Text><Text>有效完成</Text></View>
                <View className='glass-card'><Text>{weeklyPreferredLabel}</Text><Text>最合拍节奏</Text></View>
              </View>

              <View className='discover-insight glass-card'>
                <Text className='discover-insight__eyebrow'>收容员的本周发现</Text>
                <Text className='discover-insight__title'>{weeklyStats.lowEnergyWins > 0 ? '低电量时，你也不是完全动不了' : weeklyStats.completed > 0 ? '你更适合从看得见的小结果开始' : '这周的第一步还在等你'}</Text>
                <Text>{weeklyStats.lowEnergyWins > 0
                  ? `本周你已经在低电量状态下完成过 ${weeklyStats.lowEnergyWins} 次小动作。下次不用等满电，先把任务缩小就好。`
                  : weeklyStats.completed > 0
                    ? `本周你在 ${weeklyPreferredLabel} 的任务中更容易留下结果。继续保持小而具体。`
                    : '本周已经留下行动记录，但还没有完成一次。可以从“太难了”开始，让收容员再缩小一步。'}</Text>
              </View>

              <View className='discover-recent glass-card'>
                <Text className='discover-recent__title'>本周的行动痕迹</Text>
                {weeklyStats.summaries.slice(0, 4).map((item) => {
                  const itemMonster = findMonsterBySlug(item.monsterSlug)
                  return (
                    <Button
                      key={item.sessionId}
                      className='discover-recent__item'
                      aria-label={`查看${itemMonster.shortName}的行动档案`}
                      onClick={() => openActionRecord(item.sessionId)}
                    >
                      <Image src={itemMonster.image} mode='aspectFit' />
                      <View><Text>{itemMonster.shortName}</Text><Text>{item.outcome === 'completed' || item.outcome === 'care_only' ? '留下了小痕迹' : '温柔暂停'}</Text></View>
                      <Text>{formatDate(item.completedAt)}</Text>
                    </Button>
                  )
                })}
              </View>
            </>
          )}
        </>
      )}
      <BottomNav active='discover' />
    </View>
  )
}
