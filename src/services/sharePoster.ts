import type { MonsterProfile } from '../data/monsters'
import type { ShareDraft } from '../types/agent'

export type ShareTemplate = 'daily' | 'death' | 'discharge'

export interface SharePosterLine {
  label: string
  value: string
}

export interface SharePosterContent {
  title: string
  subtitle: string
  cardTitle: string
  stamp: string
  background: string
  accent: string
  monsterName: string
  monsterImage: string
  lines: SharePosterLine[]
  shareTitle: string
  hasTaskDetail: boolean
}

const templateMeta: Record<ShareTemplate, Pick<SharePosterContent, 'title' | 'subtitle' | 'cardTitle' | 'stamp' | 'background' | 'accent'>> = {
  daily: {
    title: '今日心情怪兽卡',
    subtitle: '把今天的小怪兽带走来晒',
    cardTitle: '今日心情怪兽卡',
    stamp: 'CAPTURED',
    background: '#fffaf2',
    accent: '#7650bd',
  },
  death: {
    title: '借口死亡证明分享卡',
    subtitle: '把今天的借口带走吧',
    cardTitle: '借口死亡证明',
    stamp: 'CASE CLOSED',
    background: '#fff7e8',
    accent: '#9c665e',
  },
  discharge: {
    title: '怪兽出院证明分享卡',
    subtitle: '它完成了今天的小小行动',
    cardTitle: '怪兽出院证明',
    stamp: 'APPROVED',
    background: '#f3fff6',
    accent: '#54a783',
  },
}

export const formatTaskDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds} 秒`
  if (seconds % 60 === 0) return `${seconds / 60} 分钟`
  return `${Math.floor(seconds / 60)} 分 ${seconds % 60} 秒`
}

export const compactPosterValue = (value: string, maxLength = 34) => {
  const chars = Array.from(value.trim())
  return chars.length > maxLength ? `${chars.slice(0, maxLength).join('')}…` : chars.join('')
}

const genericLines = (template: ShareTemplate, monster: MonsterProfile): SharePosterLine[] => {
  if (template === 'death') {
    return [
      { label: '档案说明', value: '具体行动详情已到期或未保留，本卡不会补写任务' },
      { label: '怪兽呢喃', value: `“${monster.catchphrase}”` },
      { label: '识别提醒', value: monster.excuseCrush },
      { label: '轻量建议', value: monster.microAction },
    ]
  }

  if (template === 'discharge') {
    return [
      { label: '档案说明', value: '具体行动详情已到期或未保留，本卡不会补写任务' },
      { label: '怪兽提醒', value: monster.cardText.line },
      { label: '不要投喂', value: monster.doNotFeed },
      { label: '轻量建议', value: monster.microAction },
    ]
  }

  return [
    { label: '常见呢喃', value: `“${monster.catchphrase}”` },
    { label: '真实身份', value: monster.trueIdentity },
    { label: '今日粉碎', value: monster.excuseCrush },
    { label: '今日建议', value: monster.microAction },
  ]
}

const taskLines = (template: ShareTemplate, monster: MonsterProfile, draft: ShareDraft): SharePosterLine[] => {
  const duration = formatTaskDuration(draft.task.durationSeconds)

  if (template === 'death') {
    return [
      { label: '借口呢喃', value: `“${monster.catchphrase}”` },
      { label: '今日行动', value: draft.task.title },
      { label: '第一击', value: `${duration} · ${draft.task.firstStep}` },
      { label: '判定标准', value: draft.task.completionCriterion },
    ]
  }

  if (template === 'discharge') {
    const reason = draft.outcome === 'care_only'
      ? `完成照顾动作「${draft.task.title}」`
      : `完成微行动「${draft.task.title}」`
    return [
      { label: '出院原因', value: reason },
      { label: '行动时长', value: duration },
      { label: '第一小步', value: draft.task.firstStep },
      { label: '完成标准', value: draft.task.completionCriterion },
    ]
  }

  return [
    { label: draft.task.kind === 'care' ? '今日照顾' : '今日行动', value: draft.task.title },
    { label: '为什么做', value: draft.task.rationale },
    { label: '第一小步', value: `${duration} · ${draft.task.firstStep}` },
    { label: '完成标准', value: draft.task.completionCriterion },
  ]
}

export const buildSharePosterContent = (
  template: ShareTemplate,
  monster: MonsterProfile,
  draft?: ShareDraft | null,
  now = Date.now(),
): SharePosterContent => {
  const validDraft = draft && draft.expiresAt > now ? draft : null
  const meta = templateMeta[template]
  const actionTitle = validDraft?.task.title
  const compactActionTitle = actionTitle ? compactPosterValue(actionTitle, 16) : ''
  const presentation = validDraft || template === 'daily'
    ? meta
    : {
        ...meta,
        title: '怪兽提醒分享卡',
        subtitle: '行动详情未保留，仅展示通用怪兽提醒',
        cardTitle: '怪兽提醒卡',
        stamp: 'REMINDER',
      }

  return {
    ...presentation,
    monsterName: monster.monsterName,
    monsterImage: monster.image,
    lines: validDraft ? taskLines(template, monster, validDraft) : genericLines(template, monster),
    shareTitle: compactActionTitle
      ? `${monster.monsterName}：${validDraft?.outcome === 'care_only' ? '照顾了今天的自己' : `完成了「${compactActionTitle}」`}`
      : template === 'daily'
        ? `${monster.monsterName}：${monster.cardText.line}`
        : `${monster.monsterName}：一张不补写任务的怪兽提醒卡`,
    hasTaskDetail: Boolean(validDraft),
  }
}
