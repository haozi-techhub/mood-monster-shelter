import { useState } from 'react'
import { findMonsterBySlug } from '../data/monsters'
import type { MemorySummary, WeeklyAgentStats } from '../types/agent'
import { Frame, Heading, Pager, Scene, dateLabel, duration, navigate, routes, outcomeLabel } from './ui'

export function DesktopDiscover({ summaries, weekly, onOpenAction }: { summaries: MemorySummary[]; weekly: WeeklyAgentStats; onOpenAction: (id: string) => void }) {
  const [page, setPage] = useState(0)
  const completed = summaries.filter(item => ['completed', 'care_only'].includes(item.outcome)).length
  const unlocked = completed >= 3
  const dominant = weekly.dominantMonster ? findMonsterBySlug(weekly.dominantMonster) : null
  const count = Math.max(1, Math.ceil(weekly.summaries.length / 2))
  const current = Math.min(page, count - 1)
  const range = `${dateLabel(weekly.range.startAt)} — ${dateLabel(weekly.range.endAt - 1)}`
  return <Frame active='discover'><div className='d-screen'>
    <Heading eyebrow='从小小的行动里，认识自己' title='慢慢发现你的节奏' description='不评价你，只看看什么真的对你有帮助。' />
    {!unlocked || !dominant ? <div className='d-discover-empty'><Scene /><section className='d-panel d-discover-intro'><span className='d-eyebrow'>{unlocked ? range : '先经历，再发现'}</span><h2>{unlocked ? '本周的小痕迹，还在等你。' : `再完成 ${Math.max(0, 3 - completed)} 次，就能看见行动规律。`}</h2><p>{unlocked ? '历史记录还在，但我们不会拿过去的数据冒充本周报告。' : '至少留下三次真实的行动记录，再一起观察。一次偶然，不足以给你贴标签。'}</p>{!unlocked && <div className='d-discover-progress' aria-label={`已完成 ${Math.min(completed, 3)} / 3 次`}>{[0,1,2].map(i => <span className={completed > i ? 'is-done' : ''} key={i}>{completed > i ? '✓' : i + 1}</span>)}</div>}<p className='d-caption'>洞察只基于你授权保留在本机的结构化摘要。</p><button data-d-button className='d-primary' onClick={() => navigate(routes.agent)}>从此刻的一小步开始 →</button></section></div> : <div className='d-insight-layout'>
      <section className='d-panel d-insight-hero'><span className='d-eyebrow'>本周常来上班 · {range}</span><img src={dominant.image} alt='' /><h2>{dominant.monsterName}</h2><p>{dominant.excuseCrush}</p><div className='d-insight-metrics'><div><b>{weekly.sessions}</b><span>本周会话</span></div><div><b>{weekly.completionRate}%</b><span>有效完成</span></div><div><b>{weekly.preferredSeconds ? duration(weekly.preferredSeconds) : '暂无'}</b><span>合拍节奏</span></div></div></section>
      <div className='d-insight-right'><section className='d-panel d-insight-copy'><span className='d-eyebrow'>收容员的本周发现</span><h2>{weekly.lowEnergyWins > 0 ? '低电量，也可以迈出一小步。' : weekly.completed > 0 ? '小而具体，更容易留下结果。' : '不妨试试，把任务再缩小。'}</h2><p>{weekly.lowEnergyWins > 0 ? `这周你在低电量时完成过 ${weekly.lowEnergyWins} 次小动作。下次不必等到满电再开始。` : weekly.completed > 0 ? `本周的成功行动中，${weekly.preferredSeconds ? duration(weekly.preferredSeconds) : '小步行动'}是最常出现的节奏。这只是记录里的线索，不是对你的定论。` : '本周已有尝试，还没有完成记录。你可以选择“太难了”，让下一步变得更小。'}</p></section>
      <section className='d-panel d-insight-recent'><h3>本周的行动痕迹</h3>{weekly.summaries.slice(current * 2, current * 2 + 2).map(item => { const monster = findMonsterBySlug(item.monsterSlug); return <button data-d-button className='d-recent-row' key={item.sessionId} onClick={() => onOpenAction(item.sessionId)}><img src={monster.image} alt='' /><span><strong>{monster.shortName}</strong><span>{outcomeLabel[item.outcome]}</span></span><span>{dateLabel(item.completedAt)} ↗</span></button> })}<Pager page={current} count={count} onChange={setPage} /></section></div>
    </div>}
  </div></Frame>
}
