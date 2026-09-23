import { useState } from 'react'
import type { SharePosterContent, ShareTemplate } from '../services/sharePoster'
import { Dialog, Frame, TextPages, navigate, routes } from './ui'

function linesFor(ctx: CanvasRenderingContext2D, text: string, width: number) {
  const lines: string[] = []; let line = ''
  for (const char of Array.from(text)) {
    if (line && ctx.measureText(line + char).width > width) { lines.push(line); line = char } else line += char
  }
  if (line) lines.push(line)
  return lines
}

export async function makePosterBlob(content: SharePosterContent): Promise<Blob> {
  const image = new Image(); image.src = content.monsterImage
  await image.decode()
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas unavailable')
  context.font = '22px "PingFang SC", sans-serif'
  const blocks = content.lines.map(line => linesFor(context, `${line.label}：${line.value}`, 526))
  const height = Math.max(900, 490 + blocks.reduce((sum, lines) => sum + lines.length * 32 + 14, 0) + 90)
  canvas.width = 1300; canvas.height = height * 2
  context.scale(2, 2)
  context.fillStyle = content.background; context.fillRect(0, 0, 650, height)
  context.strokeStyle = '#d4c5e5'; context.lineWidth = 2; context.strokeRect(28, 28, 594, height - 56)
  context.textAlign = 'center'; context.fillStyle = '#2b1648'; context.font = '600 32px "PingFang SC", sans-serif'
  context.fillText(content.cardTitle, 325, 84)
  context.font = '14px sans-serif'; context.fillStyle = content.accent; context.fillText(content.stamp, 325, 116)
  context.drawImage(image, 190, 135, 270, 270)
  context.font = '600 34px "PingFang SC", sans-serif'; context.fillText(content.monsterName, 325, 438)
  context.textAlign = 'left'; context.font = '22px "PingFang SC", sans-serif'; context.fillStyle = '#2b1648'
  let y = 488
  blocks.forEach(lines => { lines.forEach(line => { context.fillText(line, 62, y); y += 32 }); y += 14 })
  context.textAlign = 'center'; context.fillStyle = '#665873'; context.font = '18px "PingFang SC", sans-serif'; context.fillText('心情怪兽收容所 · 每一小步，都算数', 325, height - 62)
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Export failed')), 'image/png'))
}

export function DesktopShare({ content, template, onTemplate, currentContent }: { content: SharePosterContent; template: ShareTemplate; onTemplate: (value: ShareTemplate) => void; currentContent: () => SharePosterContent }) {
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [info, setInfo] = useState(false)
  const [fullText, setFullText] = useState(false)
  const download = async () => {
    setBusy(true); setStatus('')
    try {
      const poster = currentContent()
      const blob = await makePosterBlob(poster)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a'); link.href = url; link.download = `心情怪兽-${poster.cardTitle}.png`; document.body.appendChild(link); link.click(); link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setStatus('已发起 PNG 下载，请查看浏览器下载列表。')
    } catch { setStatus('图片暂时没有导出成功，请重试。也可以截图留念。') }
    finally { setBusy(false) }
  }
  return <Frame active='records'><div className='d-share-layout'><section className='d-share-controls'><span className='d-eyebrow'>把这一小步，装进一张卡片</span><h1>值得留下的，<br />是你真的开始了。</h1><p>挑一张喜欢的卡片，把心情带走。<br />分享前可以检查下面的内容。</p><div className='d-template-picker' aria-label='分享卡模板'>{([['daily','今日怪兽卡'],['death','借口死亡证明'],['discharge','怪兽出院证明']] as const).map(([key,label]) => <button data-d-button key={key} className={`d-template d-template--${key}`} aria-pressed={template===key} onClick={() => { onTemplate(key); setStatus('') }}><span /><strong>{label}</strong>{template===key&&<span aria-hidden='true'>✓</span>}</button>)}</div><p className='d-caption'>{content.hasTaskDetail ? '使用这次真实任务信息，不包含完整对话原文。' : '任务详情未保留，当前只展示通用怪兽提醒。'}</p><button data-d-button className='d-primary' onClick={download} disabled={busy}>{busy?'正在装裱卡片…':'下载 PNG 图片 ↓'}</button><div className='d-actions'><button data-d-button className='d-secondary' onClick={() => setInfo(true)}>如何分享</button><button data-d-button className='d-secondary' onClick={() => navigate(routes.records)}>查看记录</button></div><p className='d-caption d-download-status' role='status'>{status}</p></section>
    <section className={`d-poster-preview d-poster-preview--${template}`} aria-label='分享卡预览' style={{background:content.background}}><span className='d-poster-stamp' style={{color:content.accent}}>{content.stamp}</span><h2>{content.cardTitle}</h2><img src={content.monsterImage} alt='' /><h3 style={{color:content.accent}}>{content.monsterName}</h3><div className='d-poster-lines'>{content.lines.map(line => <p key={line.label}><strong>{line.label}</strong><span>{Array.from(line.value).slice(0, 44).join('')}{Array.from(line.value).length>44?'…':''}</span></p>)}</div><button data-d-button className='d-text-link' onClick={() => setFullText(true)}>检查完整卡片文字 ↗</button><footer>心情怪兽收容所 · 每一小步，都算数</footer></section>
    {info && <Dialog title='把小怪兽带给朋友' onClose={() => setInfo(false)}><p>先下载 PNG，再通过你常用的聊天工具把图片发给朋友。</p><div className='d-callout'>当前网页是本机规则预览，localhost 链接不能直接供其他设备使用。图片不含完整对话，但可能包含你这次行动的具体内容，发送前请检查。</div></Dialog>}
    {fullText && <Dialog title='完整卡片文字' onClose={() => setFullText(false)}><TextPages text={content.lines.map(line=>`${line.label}：${line.value}`).join('\n\n')} size={190} /><p className='d-caption'>下载图片会包含完整文字，不使用预览的省略版本。</p></Dialog>}
  </div></Frame>
}
