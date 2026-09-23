import { useState } from 'react'
import { findMonsterBySlug, monsters, type MonsterProfile } from '../data/monsters'
import type { GalleryRecord } from '../services/storage'
import type { MemorySummary, WeeklyAgentStats } from '../types/agent'
import { Empty, Frame, Heading, MonsterDialog, Pager, dateLabel, duration, outcomeLabel } from './ui'

export function DesktopRecords({ records, actions, weekly, initialCatalog, onOpenAction }: { records: GalleryRecord[]; actions: MemorySummary[]; weekly: WeeklyAgentStats; initialCatalog: boolean; onOpenAction: (id: string) => void }) {
  const [catalog, setCatalog] = useState(initialCatalog)
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<MonsterProfile | null>(null)
  const list = catalog ? monsters : actions
  const pages = Math.max(1, Math.ceil(list.length / 4))
  const current = Math.min(page, pages - 1)
  const recordMap = new Map(records.map(record => [record.monsterSlug, record]))
  return <Frame active='records'><div className='d-screen'>
    <Heading eyebrow='每一步，都算数' title='我的收容记录' description='不是成绩单，是你已经走过的小小痕迹。' actions={<div className='d-segments' aria-label='记录视图'>{[['行动记录',false],['怪兽图鉴',true]].map(([label,value]) => <button data-d-button key={String(label)} aria-pressed={catalog === value} onClick={() => { setCatalog(Boolean(value)); setPage(0) }}>{label}</button>)}</div>} />
    <div className='d-record-overview'><span>已相遇 <b>{records.length}</b> / 16 只怪兽</span><span>本周完成 <b>{weekly.completed}</b> 次行动</span><span>本周常来 <b>{weekly.dominantMonster ? findMonsterBySlug(weekly.dominantMonster).shortName : '暂无记录'}</b></span></div>
    {!catalog && actions.length === 0 ? <Empty title='第一步，留给今天的你。'><p>这里还没有行动记录。<br />开启本地记忆并完成一次收容后，就能留下这一步。</p></Empty> : <>
      {catalog ? <div className='d-catalog-grid'>{monsters.slice(current * 4, current * 4 + 4).map(monster => { const record = recordMap.get(monster.slug); return <button data-d-button className='d-catalog-card' key={monster.id} onClick={() => setSelected(monster)}><span className='d-catalog-id'>{monster.id} <span>{record ? '已相遇' : '待相遇'}</span></span><img src={monster.image} alt='' /><strong>{monster.monsterName}</strong><span className='d-badge'>{monster.monsterType}</span><p>{record ? `出现 ${record.count} 次 · ${dateLabel(record.capturedAt)}` : '认识它，未必代表你遇见过它'}</p><span className='d-text-link'>查看怪兽档案 ↗</span></button> })}</div> : <div className='d-record-grid'>{actions.slice(current * 4, current * 4 + 4).map(action => { const monster = findMonsterBySlug(action.monsterSlug); return <button data-d-button className='d-record-card' key={action.sessionId} onClick={() => onOpenAction(action.sessionId)} aria-label={`查看${monster.shortName}的行动档案`}><img src={monster.image} alt='' /><div><span className='d-caption'>{dateLabel(action.completedAt)} · {duration(action.plannedSeconds)}</span><h2>{monster.shortName}</h2><p>{outcomeLabel[action.outcome]} · 降阶 {action.rescopeCount} 次</p></div><span className='d-record-arrow' aria-hidden='true'>↗</span></button> })}</div>}
      <Pager page={current} count={pages} onChange={setPage} />
    </>}
    {selected && <MonsterDialog monster={selected} onClose={() => setSelected(null)} />}
  </div></Frame>
}
