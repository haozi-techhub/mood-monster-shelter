import { useState } from 'react'
import type { AnalysisResult } from '../services/storage'
import { Frame, Heading, Pager, Safety, Scene, TextPages, navigate, routes } from './ui'

// Compatibility routes retain the fixed archive while directing new work into V0.4.
export function DesktopArchive({ result }: { result: AnalysisResult }) {
  const [page, setPage] = useState(0)
  const fields = [['真实身份', result.trueIdentity], ['为什么出现', result.whyItAppears], ['它在保护什么', result.whatItProtects], ['识别提醒', result.excuseCrush], ['不要投喂', result.doNotFeed], ['可以试试', result.microAction]]
  return <Frame active='records'>{result.safety ? <Safety response={result.safety} onBack={() => navigate(routes.home)} /> : <div className='d-screen'>
    <Heading eyebrow='MONSTER ARCHIVE' title='收容档案' description='认识心情，不给自己贴诊断标签。' actions={<button data-d-button className='d-secondary' onClick={() => navigate(routes.records)}>返回记录</button>} />
    <div className='d-detail-layout'><section className='d-panel d-detail-identity'><img src={result.image} alt={result.monsterName} /><span className='d-badge'>{result.monsterType}</span><h2>{result.monsterName}</h2><p>“{result.catchphrase}”</p></section><section className='d-panel d-detail-content'><h2>{fields[page][0]}</h2><TextPages text={fields[page][1]} /><Pager page={page} count={fields.length} onChange={setPage} label='项' /><p className='d-caption'>这是固定图鉴介绍。开始一次行动后，才能留下真实完成记录。</p><button data-d-button className='d-primary' onClick={() => navigate(routes.agent)}>开始一小步行动 →</button><button data-d-button className='d-secondary' onClick={() => navigate('/pages/share/index?template=daily')}>生成今日怪兽卡</button></section></div>
  </div>}</Frame>
}

export function DesktopLoading({ status, description }: { status: string; description: string }) {
  return <Frame active='agent'><div className='d-consent-layout'><Scene /><section className='d-panel d-consent' role='status'><span className='d-eyebrow'>本地规则正在匹配</span><h1>{status}</h1><p>{description}</p><p className='d-caption'>使用固定的 16 只心情怪兽，不会向云端发送输入。</p><span className='d-loading-dot' /></section></div></Frame>
}
