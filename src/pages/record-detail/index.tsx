import { Button, Image, Text, View } from '@tarojs/components'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import { useState } from 'react'

import { BottomNav } from '../../components/BottomNav'
import { Decorations } from '../../components/Decorations'
import { PageHeader } from '../../components/PageHeader'
import { findMonsterBySlug } from '../../data/monsters'
import { getAgentRecordDetail } from '../../services/agentStorage'
import type { AgentRecordDetail, BlockReason, TaskAdjustment } from '../../types/agent'
import './index.less'

const goalLabels: Record<string, string> = {
  work: '工作推进',
  learning: '学习成长',
  self_care: '自我照顾',
  relationship: '沟通关系',
  other: '其他目标',
}

const blockerLabels: Record<string, string> = {
  fear_of_judgement: '担心评价',
  unclear_start: '起点不清楚',
  low_energy: '电量不足',
  fragmented_time: '时间太碎',
  anxiety_freeze: '压力冻结',
  other: '其他阻碍',
}

const energyLabels = {
  low: '低电量',
  medium: '中电量',
  high: '高电量',
} as const

const outcomeLabels = {
  completed: '行动完成',
  care_only: '完成照顾',
  abandoned: '温柔暂停',
  safety: '安全转介',
} as const

const reasonLabels: Record<BlockReason | 'requested_alternative', string> = {
  too_hard: '刚才那一步还是太难',
  distracted: '行动中被打断',
  low_energy: '当时电量不够',
  unclear: '第一步还不够清楚',
  mismatch: '任务并不合适',
  requested_alternative: '主动换了一个入口',
}

const helpfulnessLabels = ['未记录', '不太合拍', '有一点帮助', '很有帮助'] as const

const formatDateTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const pad = (value: number) => `${value}`.padStart(2, '0')
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

const formatDuration = (seconds: number) => seconds < 60 ? `${seconds} 秒` : `${Math.ceil(seconds / 60)} 分钟`

const adjustmentTitle = (adjustment: TaskAdjustment) => adjustment.type === 'rescope' ? '任务自动降阶' : '换一个行动入口'

export default function RecordDetailPage() {
  const router = useRouter()
  const sessionId = router.params.sessionId || ''
  const [detail, setDetail] = useState<AgentRecordDetail | null>(() => sessionId ? getAgentRecordDetail(sessionId) : null)

  useDidShow(() => {
    setDetail(sessionId ? getAgentRecordDetail(sessionId) : null)
  })

  const backToRecords = () => Taro.reLaunch({ url: '/pages/gallery/index' })

  if (!detail) {
    return (
      <View className='page record-detail-page'>
        <Decorations />
        <PageHeader title='行动档案' showShare={false} />
        <View className='record-detail-empty glass-card'>
          <Text className='record-detail-empty__mark'>⌕</Text>
          <Text className='record-detail-empty__title'>这份行动档案没有找到</Text>
          <Text>它可能已被清除，或来自一条未开启本地记忆的会话。</Text>
          <Button className='primary-button' onClick={backToRecords}>返回记录页</Button>
        </View>
        <BottomNav active='records' />
      </View>
    )
  }

  const monster = findMonsterBySlug(detail.monsterSlug)
  const detailAvailable = detail.availability === 'available'

  return (
    <View className='page record-detail-page'>
      <Decorations />
      <PageHeader title='行动档案' showShare={false} />

      <View className='record-detail-hero glass-card'>
        <View className='record-detail-hero__photo'>
          <Image src={monster.image} mode='aspectFit' />
        </View>
        <View className='record-detail-hero__copy'>
          <Text className='record-detail-hero__eyebrow'>ACTION RECORD · {monster.monsterType}</Text>
          <Text className='record-detail-hero__name'>{monster.monsterName}</Text>
          <Text>{formatDateTime(detail.completedAt)}</Text>
          <Text className={`record-detail-status record-detail-status--${detail.outcome}`}>{outcomeLabels[detail.outcome]}</Text>
        </View>
      </View>

      {detailAvailable ? (
        detail.detailExpiresAt && (
          <View className='record-detail-retention'>
            <Text>完整任务详情仅保存在本机，将于 {formatDate(detail.detailExpiresAt)} 后按 14 天规则清理。</Text>
          </View>
        )
      ) : (
        <View className='record-detail-expired glass-card'>
          <Text className='record-detail-expired__tag'>14 DAYS PASSED</Text>
          <Text className='record-detail-expired__title'>完整行动详情已到期清理</Text>
          <Text>下面只保留不含对话原文、姓名或可识别信息的结构化摘要。</Text>
        </View>
      )}

      <View className='record-detail-summary glass-card'>
        <Text className='record-detail-section-title'>这次收容留下了什么</Text>
        <View className='record-detail-summary__grid'>
          <View><Text>目标类型</Text><Text>{goalLabels[detail.goalCategory] || detail.goalCategory}</Text></View>
          <View><Text>主要阻碍</Text><Text>{blockerLabels[detail.blockerCategory] || detail.blockerCategory}</Text></View>
          <View><Text>当时电量</Text><Text>{energyLabels[detail.energyLevel]}</Text></View>
          <View><Text>行动路径</Text><Text>{detail.actionType === 'care' ? '照顾动作' : '微行动'}</Text></View>
          <View><Text>计划时长</Text><Text>{formatDuration(detail.plannedSeconds)}</Text></View>
          <View><Text>有效程度</Text><Text>{helpfulnessLabels[detail.helpfulness]}</Text></View>
        </View>
        <View className='record-detail-rescope-summary'>
          <Text>任务调整</Text>
          <Text>{detail.rescopeCount > 0 ? `共降阶 ${detail.rescopeCount} 次` : '没有降阶'}</Text>
        </View>
        {detail.rescopeReasons.length > 0 && (
          <View className='record-detail-reasons'>
            {detail.rescopeReasons.map((reason, index) => (
              <Text key={`${reason}-${index}`}>{reasonLabels[reason]}</Text>
            ))}
          </View>
        )}
      </View>

      {detailAvailable && detail.task && (
        <View className='record-detail-task glass-card'>
          <View className='record-detail-task__top'>
            <Text>{detail.task.kind === 'care' ? '照顾动作' : '最终微行动'}</Text>
            <Text>{formatDuration(detail.task.durationSeconds)}</Text>
          </View>
          <Text className='record-detail-task__title'>{detail.task.title}</Text>
          <Text className='record-detail-task__rationale'>{detail.task.rationale}</Text>
          <View className='record-detail-task__field'><Text>第一步</Text><Text>{detail.task.firstStep}</Text></View>
          <View className='record-detail-task__field'><Text>完成标准</Text><Text>{detail.task.completionCriterion}</Text></View>
        </View>
      )}

      {detailAvailable && (
        <View className='record-detail-timeline glass-card'>
          <Text className='record-detail-section-title'>任务调整时间线</Text>
          {detail.adjustments.length > 0 ? (
            detail.adjustments.map((adjustment, index) => (
              <View key={adjustment.id} className='record-detail-adjustment'>
                <View className='record-detail-adjustment__rail'>
                  <Text>{index + 1}</Text>
                  {index < detail.adjustments.length - 1 && <View />}
                </View>
                <View className='record-detail-adjustment__body'>
                  <View className='record-detail-adjustment__heading'>
                    <Text>{adjustmentTitle(adjustment)}</Text>
                    <Text>{formatDateTime(adjustment.createdAt)}</Text>
                  </View>
                  <Text className='record-detail-adjustment__reason'>{reasonLabels[adjustment.reason]}</Text>
                  <View className='record-detail-adjustment__change'>
                    <Text>{adjustment.fromTask ? formatDuration(adjustment.fromTask.durationSeconds) : '原任务'}</Text>
                    <Text>→</Text>
                    <Text>{formatDuration(adjustment.toTask.durationSeconds)}</Text>
                  </View>
                  <Text className='record-detail-adjustment__task'>{adjustment.toTask.title}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text className='record-detail-timeline__empty'>
              {detail.rescopeCount > 0 ? `旧版记录只保留了 ${detail.rescopeCount} 次降阶结果，没有保存详细时间线。` : '这次任务一步就合适，没有发生调整。'}
            </Text>
          )}
        </View>
      )}

      <Button className='secondary-button record-detail-back' onClick={backToRecords}>返回全部记录</Button>
      <BottomNav active='records' />
    </View>
  )
}
