import assert from 'node:assert/strict'
import test from 'node:test'

import { buildSharePosterContent } from '../src/services/sharePoster.ts'

const monster = {
  id: 'M-008',
  slug: 'perfection-polisher',
  monsterName: '完美主义打磨怪',
  shortName: '打磨怪',
  monsterType: '借口类',
  dangerLevel: '中高',
  catchphrase: '等我准备好了再开始。',
  trueIdentity: '用准备感逃避被评价。',
  whyItAppears: '担心第一版不够好。',
  whatItProtects: '保护自己不被否定。',
  excuseCrush: '先留下一个可以被看见的小版本。',
  doNotFeed: '不要继续寻找更多案例。',
  microAction: '打开文档，写下标题和第一句话。',
  image: 'perfection-polisher.png',
  accent: '#b9a4ff',
  keywords: [],
  cardText: {
    title: '今日借口怪兽',
    subtitle: '完美主义打磨怪',
    line: '先做一个能被看见的小版本',
  },
}

const draft = {
  sessionId: 'session-share',
  createdAt: 1_000,
  expiresAt: 1_000 + 30 * 60 * 1000,
  monsterSlug: monster.slug,
  outcome: 'completed',
  completedAt: 1_000,
  task: {
    id: 'task-share',
    kind: 'action',
    title: '写出首页标题',
    rationale: '让项目先留下一个看得见的入口。',
    firstStep: '打开首页文件并输入标题。',
    durationSeconds: 120,
    completionCriterion: '预览里已经出现一行真实标题。',
  },
}

test('share poster uses the real task and expired drafts fall back without fabricated details', () => {
  const live = buildSharePosterContent('discharge', monster, draft, draft.createdAt)
  const liveCopy = live.lines.map(({ label, value }) => `${label}：${value}`).join('\n')

  assert.equal(live.hasTaskDetail, true)
  assert.match(liveCopy, /写出首页标题/)
  assert.match(liveCopy, /2 分钟/)
  assert.match(liveCopy, /打开首页文件并输入标题/)
  assert.match(liveCopy, /预览里已经出现一行真实标题/)
  assert.doesNotMatch(liveCopy, /5\s*分钟/)
  assert.doesNotMatch(liveCopy, /交付\s*v0/i)

  const expired = buildSharePosterContent('discharge', monster, draft, draft.expiresAt)
  const expiredCopy = expired.lines.map(({ label, value }) => `${label}：${value}`).join('\n')

  assert.equal(expired.hasTaskDetail, false)
  assert.equal(expired.title, '怪兽提醒分享卡')
  assert.equal(expired.cardTitle, '怪兽提醒卡')
  assert.match(expired.subtitle, /行动详情未保留/)
  assert.match(expiredCopy, /具体行动详情已到期或未保留/)
  assert.match(expired.shareTitle, /不补写任务/)
  assert.doesNotMatch(`${expired.title}\n${expired.subtitle}\n${expired.cardTitle}`, /完成|出院|死亡证明/)
  assert.doesNotMatch(expiredCopy, /写出首页标题|2 分钟|打开首页文件|真实标题/)
  assert.doesNotMatch(expiredCopy, /5\s*分钟|交付\s*v0/i)
})
