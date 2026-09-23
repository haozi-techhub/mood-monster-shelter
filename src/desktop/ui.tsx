import Taro from '@tarojs/taro'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import guide from '../assets/monsters/shelter-guide.png'
import room from '../assets/scenes/shelter-room-v1.webp'
import homeIcon from '../assets/icons/nav/home-active-v2.png'
import recordsIcon from '../assets/icons/nav/records-active-v2.png'
import discoverIcon from '../assets/icons/nav/discover-active-v2.png'
import profileIcon from '../assets/icons/nav/profile-active-v2.png'
import type { MonsterProfile } from '../data/monsters'
import type { SafetyResponse } from '../types/agent'
import './desktop.less'

export const routes = {
  home: '/pages/index/index', records: '/pages/gallery/index',
  discover: '/pages/discover/index', profile: '/pages/profile/index',
  agent: '/pages/agent/index',
} as const
export const navigate = (url: string) => { void Taro.reLaunch({ url }) }
export const duration = (seconds: number) => seconds < 60 ? `${seconds} 秒` : `${Math.ceil(seconds / 60)} 分钟`
export const dateLabel = (time: number) => new Date(time).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
export const outcomeLabel: Record<string, string> = { completed: '行动完成', care_only: '完成照顾', abandoned: '温柔暂停', safety: '安全回应' }

export function Dialog({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useRef(`dialog-${Math.random().toString(36).slice(2)}`).current
  useEffect(() => {
    const el = ref.current!
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    el.showModal()
    return () => {
      if (el.open) el.close()
      requestAnimationFrame(() => { if (previous?.isConnected) previous.focus({ preventScroll: true }) })
    }
  }, [])
  return <dialog className={`d-dialog ${wide ? 'd-dialog--wide' : ''}`} ref={ref} aria-labelledby={titleId} onCancel={(e) => { e.preventDefault(); onClose() }}>
    <div className='d-dialog-heading'><h2 id={titleId}>{title}</h2><button data-d-button className='d-close' onClick={onClose} aria-label='关闭弹窗'>×</button></div>
    <div className='d-dialog-body'>{children}</div>
  </dialog>
}

export function Frame({ active, children, ephemeral = false }: { active: keyof typeof routes; children: ReactNode; ephemeral?: boolean }) {
  const [about, setAbout] = useState(false)
  const [leaving, setLeaving] = useState('')
  const tabs = [
    ['home', '收容室', homeIcon], ['records', '记录', recordsIcon],
    ['discover', '发现', discoverIcon], ['profile', '我的', profileIcon],
  ] as const
  const go = (url: string) => ephemeral ? setLeaving(url) : navigate(url)
  return <div className='desk-app'>
    <header className='d-header'>
      <button data-d-button className='d-brand' onClick={() => go(routes.home)} aria-label='回到心情怪兽收容室'><img src={guide} alt='' /><span>MOOD MONSTER<br />SHELTER</span></button>
      <nav className='d-nav' aria-label='主要导航'>
        <div className='d-nav-tabs'>
          {tabs.map(([key, label, icon], index) => <button data-d-button key={key} aria-current={active === key ? 'page' : undefined} onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(routes[key]); return }
            const next = e.key === 'ArrowRight' ? (index + 1) % 4 : e.key === 'ArrowLeft' ? (index + 3) % 4 : e.key === 'Home' ? 0 : e.key === 'End' ? 3 : -1
            if (next >= 0) { e.preventDefault(); (e.currentTarget.parentElement?.children[next] as HTMLButtonElement)?.focus() }
          }} onClick={() => go(routes[key])}><img src={icon} alt='' />{label}</button>)}
        </div>
        <button data-d-button className='d-nav-new' onClick={() => go(routes.agent)}><span aria-hidden='true'>＋</span> 说说心情</button>
      </nav>
      <button data-d-button className='d-text-link d-about' onClick={() => setAbout(true)}>关于收容所 ↗</button>
    </header>
    <main className='d-main' id='desktop-main'>{children}</main>
    {about && <Dialog title='一处可以慢一点的地方' onClose={() => setAbout(false)}><p>表达此刻的状态，让收容员陪你把行动缩成做得到的一小步。</p><div className='d-callout'>当前为本地规则体验，未接入真实 AI，也未部署到公网。不会向模型发送你的输入。</div><p>这是一款轻量自我观察与行动工具，不提供医疗或心理诊断。</p></Dialog>}
    {leaving && <Dialog title='离开这次收容？' onClose={() => setLeaving('')}><p>你选择了仅完成这一次。离开后，这段对话和未完成的计时不会保留。</p><div className='d-actions'><button data-d-button className='d-secondary' onClick={() => setLeaving('')}>继续当前收容</button><button data-d-button className='d-primary' onClick={() => navigate(leaving)}>确认离开</button></div></Dialog>}
  </div>
}

export function Scene({ compact = false, message = '不急，我们把下一步\n变小一点就好。' }: { compact?: boolean; message?: string }) {
  return <div className={`d-scene ${compact ? 'd-scene--compact' : ''}`}><img className='d-room' src={room} alt='' /><img className='d-guide' src={guide} alt='紫色收容员' /><div className='d-speech'><strong>紫色收容员 · 在这里</strong><p>{message}</p></div></div>
}

export function Heading({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description?: string; actions?: ReactNode }) {
  return <header className='d-heading'><div><span className='d-eyebrow'>{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>{actions}</header>
}

export function Pager({ page, count, onChange, label = '页' }: { page: number; count: number; onChange: (value: number) => void; label?: string }) {
  const pages = Math.max(1, count)
  return <div className='d-pager' aria-label='分页'><button data-d-button className='d-secondary' disabled={page <= 0} onClick={() => onChange(page - 1)}>上一{label}</button><span aria-live='polite'>{page + 1} / {pages}</span><button data-d-button className='d-secondary' disabled={page >= pages - 1} onClick={() => onChange(page + 1)}>下一{label}</button></div>
}

export function TextPages({ text, size = 160 }: { text: string; size?: number }) {
  const [page, setPage] = useState(0)
  useEffect(() => setPage(0), [text])
  const chars = Array.from(text)
  const count = Math.max(1, Math.ceil(chars.length / size))
  const current = Math.min(page, count - 1)
  return <div className='d-text-pages'><p>{chars.slice(current * size, (current + 1) * size).join('')}</p>{count > 1 && <Pager page={current} count={count} onChange={setPage} label='段' />}</div>
}

export function Empty({ title, children, action = '说说此刻的心情', onAction = () => navigate(routes.agent) }: { title: string; children: ReactNode; action?: string; onAction?: () => void }) {
  return <div className='d-empty'><img src={guide} alt='' /><h2>{title}</h2><div>{children}</div><button data-d-button className='d-primary' onClick={onAction}>{action} <span aria-hidden='true'>→</span></button></div>
}

export function Safety({ response, onBack }: { response: SafetyResponse; onBack: () => void }) {
  return <section className='d-safety' role='alert'><span className='d-eyebrow'>先照顾好此刻的安全</span><h1>{response.title}</h1><p>{response.body}</p><div className='d-callout'>{response.action}</div><button data-d-button className='d-secondary' onClick={onBack}>我知道了，回到收容室</button></section>
}

export function MonsterDialog({ monster, onClose }: { monster: MonsterProfile; onClose: () => void }) {
  const [page, setPage] = useState(0)
  const fields = [
    ['真实身份', monster.trueIdentity], ['为什么出现', monster.whyItAppears], ['它在保护什么', monster.whatItProtects],
    ['识别提醒', monster.excuseCrush], ['不要投喂', monster.doNotFeed], ['可以试试', monster.microAction],
  ]
  return <Dialog title={monster.monsterName} onClose={onClose}><div className='d-monster-dialog-hero'><img src={monster.image} alt='' /><div><span className='d-badge'>{monster.monsterType} · 固定图鉴</span><p>“{monster.catchphrase}”</p></div></div><div className='d-callout'><strong>{fields[page][0]}</strong><TextPages text={fields[page][1]} /></div><Pager page={page} count={fields.length} onChange={setPage} label='项' /><p className='d-caption'>图鉴介绍不是对你的个人判断。</p></Dialog>
}
