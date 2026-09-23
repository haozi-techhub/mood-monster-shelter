import { useRef, useState } from 'react'
import wordmark from '../assets/brand/home-wordmark.png'
import { featuredMonsters, type MonsterProfile } from '../data/monsters'
import type { AgentSession } from '../types/agent'
import { safetyMessage } from '../utils/safety'
import { Frame, MonsterDialog, Scene, Safety, navigate, routes } from './ui'

interface HomeProps {
  value: string; onChange: (value: string) => void; onStart: () => void
  activeSession: AgentSession | null; safety: boolean; onDismissSafety: () => void
}

export function DesktopHome({ value, onChange, onStart, activeSession, safety, onDismissSafety }: HomeProps) {
  const [error, setError] = useState(false)
  const [selected, setSelected] = useState<MonsterProfile | null>(null)
  const input = useRef<HTMLTextAreaElement>(null)
  return <Frame active='home'>
    {safety ? <Safety response={safetyMessage} onBack={onDismissSafety} /> : <div className={`d-home ${activeSession ? 'd-home--ongoing' : ''}`}>
      <section className='d-welcome'><div><img className='d-wordmark' src={wordmark} alt='心情怪兽收容所' /><p className='d-tagline'>接纳每一种心情 · 陪伴每一个你</p></div><h1>今天也不用<br />一下子变好。</h1><p>把心情放在这里。<br />我们从你做得到的<br />那一小步开始。</p><ol className='d-journey'><li>说出状态</li><li>一小步行动</li><li>留下反馈</li></ol><button data-d-button className='d-text-link' onClick={() => navigate(routes.records + '?view=catalog')}>认识这里的 16 位小住客 ↗</button></section>
      <Scene />
      <section className='d-composer'><span className='d-eyebrow'>此刻，只需要一小步</span><h2>今天是哪只心情怪兽跑出来了？</h2><p className='d-composer-intro'>说说现在的你，收容员陪你理出一点头绪。</p>
        {activeSession && <button data-d-button className='d-ongoing' onClick={() => navigate(routes.agent)}><span><strong>{activeSession.phase === 'running' ? '计时还在继续' : '刚才的行动还在'}</strong><span>{activeSession.task?.title || '继续收容对话'}</span></span><span aria-hidden='true'>继续 →</span></button>}
        <form onSubmit={(e) => { e.preventDefault(); if (!value.trim()) { setError(true); input.current?.focus() } else onStart() }}>
          <label data-d-label htmlFor='mood-input'>此刻的心情</label><div className='d-input-wrap'><textarea data-d-textarea ref={input} id='mood-input' maxLength={200} value={value} placeholder='比如：想开始写作品集，却总觉得还没准备好……' aria-invalid={error || undefined} aria-describedby={error ? 'mood-error' : 'mood-privacy'} onChange={(e) => { onChange(e.target.value); setError(false) }} /><span aria-hidden='true'>{value.length} / 200</span></div>
          {error && <p id='mood-error' className='d-error' role='alert'>先写下一点此刻的状态，几个字也可以。</p>}
          <div className='d-chips'>{['我没时间', '我好焦虑', '我又拖延了', '我不想干活'].map(text => <button data-d-button key={text} type='button' onClick={() => { onChange(text); setError(false); input.current?.focus() }}>{text}</button>)}</div>
          <button data-d-button className='d-primary d-start' type='submit'>开始收容 <span aria-hidden='true'>→</span></button><p className='d-caption d-privacy' id='mood-privacy'>先征求你的记忆授权 · 原话不发送到云端</p>
        </form>
        <aside className='d-featured'><div><span>认识心情小住客</span><button data-d-button className='d-text-link' onClick={() => navigate(routes.records + '?view=catalog')}>查看全部 16 只 ↗</button></div><div className='d-residents'>{featuredMonsters.slice(0, 3).map(m => <button data-d-button key={m.id} onClick={() => setSelected(m)}><img src={m.image} alt='' /><span>{m.shortName}</span></button>)}</div></aside>
      </section>
    </div>}
    {selected && <MonsterDialog monster={selected} onClose={() => setSelected(null)} />}
  </Frame>
}
