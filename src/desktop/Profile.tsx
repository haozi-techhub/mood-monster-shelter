import { useState } from 'react'
import guide from '../assets/monsters/shelter-guide.png'
import type { AgentConsent, AgentStats } from '../types/agent'
import { Dialog, Frame, Heading } from './ui'

export function DesktopProfile({ consent, stats, onEnable, onDisable, onClear }: { consent: AgentConsent | null; stats: AgentStats; onEnable: () => void; onDisable: () => void; onClear: () => void }) {
  const [confirm, setConfirm] = useState<'disable' | 'clear' | null>(null)
  return <Frame active='profile'><div className='d-screen'><Heading eyebrow='由你决定，记住多少' title='我的小空间' description='只属于这台设备的收容所。没有账号，也没有跨端同步。' />
    <div className='d-profile-grid'><section className='d-panel d-profile-identity'><img src={guide} alt='紫色收容员' /><h2>记得住小线索，<br />也尊重每一次忘记。</h2><p>你随时可以关闭记忆，<br />或把这里清空重新开始。</p><div className='d-profile-stats'><div><b>{stats.sessions}</b><span>记忆摘要</span></div><div><b>{stats.completed}</b><span>有效行动</span></div><div><b>{stats.completionRate}%</b><span>完成率</span></div></div><p className='d-caption'>这些数字只来自本机真实记录。</p></section>
      <div className='d-profile-settings'><section className='d-panel'><div className='d-setting-heading'><h2>本地记忆</h2><button data-d-button className='d-switch' role='switch' aria-label='本地记忆' aria-checked={Boolean(consent?.granted)} onClick={() => consent?.granted ? setConfirm('disable') : onEnable()}><span /></button></div><p>{consent?.granted ? '已开启。收容员会按下面的约定保留线索。' : '未开启。仍然可以完成单次收容，不形成长期记忆。'}</p><div className='d-retention'><div><b>0–14 天</b><span>完整对话在本机，用于继续未完成的行动。</span></div><div><b>14 天后</b><span>仅保留不含原话的结构化摘要。</span></div><div><b>30 分钟</b><span>分享草稿的保留时限，不含聊天原文。</span></div></div></section>
      <section className='d-panel d-clear-section'><div><h2>清理收容所</h2><p>删除本机对话、行动摘要、怪兽图鉴、分享草稿和本地指标。删除后无法恢复。</p></div><button data-d-button className='d-secondary' onClick={() => setConfirm('clear')}>清空本地数据</button></section><p className='d-caption'>心情怪兽收容所是轻量自我观察和行动工具，不提供医疗或心理诊断。</p></div>
    </div>
    {confirm && <Dialog title={confirm === 'disable' ? '关闭并清除本地记忆？' : '清空本地收容记录？'} onClose={() => setConfirm(null)}><p>完整对话、行动记录、怪兽图鉴、分享草稿和本地指标会一起删除，无法撤销。</p><p className='d-caption'>{confirm === 'clear' ? '清空后保留当前记忆开关设置。' : '关闭后仍可完成一次不留记录的收容。'}</p><div className='d-actions'><button data-d-button className='d-secondary' onClick={() => setConfirm(null)}>取消，保留数据</button><button data-d-button className='d-primary' onClick={() => { if (confirm === 'disable') onDisable(); else onClear(); setConfirm(null) }}>{confirm === 'disable' ? '确认关闭并清除' : '确认清空'}</button></div></Dialog>}
  </div></Frame>
}
