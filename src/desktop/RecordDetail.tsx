import { useState } from 'react'
import { findMonsterBySlug } from '../data/monsters'
import type { AgentRecordDetail } from '../types/agent'
import { Empty, Frame, Heading, Pager, TextPages, dateLabel, duration, navigate, routes, outcomeLabel } from './ui'

const reasons: Record<string,string> = { too_hard:'刚才那一步还是太难', distracted:'行动中被打断', low_energy:'当时电量不够', unclear:'第一步不够清楚', mismatch:'任务不合适', requested_alternative:'主动换了一个入口' }
const goals: Record<string,string> = { work:'工作推进', learning:'学习成长', self_care:'自我照顾', relationship:'沟通关系', other:'其他目标' }
const blockers: Record<string,string> = { fear_of_judgement:'担心评价', unclear_start:'起点不清楚', low_energy:'电量不足', fragmented_time:'时间太碎', anxiety_freeze:'压力冻结', other:'其他阻碍' }

export function DesktopRecordDetail({ detail }: { detail: AgentRecordDetail | null }) {
  const [tab, setTab] = useState('summary')
  const [page, setPage] = useState(0)
  if (!detail) return <Frame active='records'><div className='d-screen'><Empty title='这份行动档案没有找到' action='返回记录页' onAction={() => navigate(routes.records)}><p>它可能已被清除，或来自一条没有开启本地记忆的会话。</p></Empty></div></Frame>
  const monster = findMonsterBySlug(detail.monsterSlug)
  const available = detail.availability === 'available'
  const adjustment = detail.adjustments[Math.min(page, detail.adjustments.length - 1)]
  return <Frame active='records'><div className='d-screen'><Heading eyebrow='每一步，都有来处' title='这一次的行动档案' actions={<button data-d-button className='d-secondary' onClick={() => navigate(routes.records)}>← 全部记录</button>} />
    <div className='d-detail-layout'><aside className='d-panel d-detail-identity'><span className='d-badge'>{outcomeLabel[detail.outcome]}</span><img src={monster.image} alt='' /><h2>{monster.monsterName}</h2><p>{dateLabel(detail.completedAt)}</p><p className='d-caption'>{available ? `完整任务仅在本机保留${detail.detailExpiresAt ? `至 ${dateLabel(detail.detailExpiresAt)}` : ' 14 天'}。` : '完整行动详情已到期清理；只留下不含原话的摘要。'}</p></aside>
    <section className='d-panel d-detail-content'><div className='d-segments' aria-label='档案内容'>{[['summary','行动摘要'],['task','最终任务'],['adjustments','调整过程']].map(([key,label]) => <button data-d-button key={key} aria-pressed={tab===key} onClick={() => setTab(key)}>{label}</button>)}</div>
      {tab==='summary' && <><h2>这次收容留下了什么</h2><dl className='d-summary-grid'>{[['目标类型',goals[detail.goalCategory]||detail.goalCategory],['主要阻碍',blockers[detail.blockerCategory]||detail.blockerCategory],['当时电量',{low:'低电量',medium:'中电量',high:'高电量'}[detail.energyLevel]],['行动路径',detail.actionType==='care'?'照顾动作':'微行动'],['计划时长',duration(detail.plannedSeconds)],['有效程度',['未记录','不太合拍','有一点帮助','很有帮助'][detail.helpfulness]]].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><div className='d-callout'><strong>任务调整 · 降阶 {detail.rescopeCount} 次</strong><p>{detail.rescopeReasons.length ? detail.rescopeReasons.map(reason=>reasons[reason]).join('；') : '没有记录降阶原因。'}</p></div></>}
      {tab==='task' && (available && detail.task ? <><div className='d-task-top'><span className='d-badge'>{detail.task.kind==='care'?'照顾动作':'微行动'}</span><span>{duration(detail.task.durationSeconds)}</span></div><h2>{detail.task.title}</h2><TextPages text={detail.task.rationale} size={100} /><div className='d-task-field'><strong>第一步</strong><TextPages text={detail.task.firstStep} size={100} /></div><div className='d-task-field d-task-field--mint'><strong>完成标准</strong><TextPages text={detail.task.completionCriterion} size={100} /></div></> : <div className='d-detail-unavailable'><h2>只留下小线索，不保留原话。</h2><p>完整任务已到期或未保留，不会根据摘要补写任务内容。</p></div>)}
      {tab==='adjustments' && (available && adjustment ? <><span className='d-eyebrow'>{adjustment.type==='rescope'?'任务降阶':'换一个入口'} · {dateLabel(adjustment.createdAt)}</span><h2>{reasons[adjustment.reason]}</h2><div className='d-adjustment-duration'>{adjustment.fromTask ? duration(adjustment.fromTask.durationSeconds) : '原任务'} <span>→</span> {duration(adjustment.toTask.durationSeconds)}</div><h3>{adjustment.toTask.title}</h3><div className='d-task-field'><strong>调整后的第一步</strong><TextPages text={adjustment.toTask.firstStep} size={100} /></div><Pager page={page} count={detail.adjustments.length} onChange={setPage} label='次' /></> : <div className='d-detail-unavailable'><h2>{available?'这次没有详细调整记录。':'调整详情已到期清理。'}</h2><p>{available && detail.rescopeCount===0 ? '这一步刚刚好，没有发生降阶。' : '结构化降阶结果仍可在行动摘要里查看。'}</p></div>)}
    </section></div>
  </div></Frame>
}
