import { Button, Canvas, Image, Text, View } from '@tarojs/components'
import Taro, { useDidShow, useRouter, useShareAppMessage } from '@tarojs/taro'
import { useEffect, useMemo, useState } from 'react'

import { Decorations } from '../../components/Decorations'
import { PageHeader } from '../../components/PageHeader'
import { findMonsterBySlug } from '../../data/monsters'
import { getShareDraft } from '../../services/agentStorage'
import { buildSharePosterContent, type ShareTemplate } from '../../services/sharePoster'
import { getLatestAnalysis } from '../../services/storage'
import './index.less'

type PosterCanvasContext = ReturnType<typeof Taro.createCanvasContext>

const ellipsizeCanvasText = (ctx: PosterCanvasContext, text: string, maxWidth: number) => {
  const chars = Array.from(text)
  let fitted = ''
  for (const char of chars) {
    if (ctx.measureText(`${fitted}${char}…`).width > maxWidth) break
    fitted += char
  }
  return `${fitted}…`
}

const wrapCanvasText = (ctx: PosterCanvasContext, text: string, maxWidth: number, maxLines = 2) => {
  const chars = Array.from(text)
  const lines: string[] = []
  let current = ''

  for (let index = 0; index < chars.length; index += 1) {
    const candidate = `${current}${chars[index]}`
    if (current && ctx.measureText(candidate).width > maxWidth) {
      lines.push(current)
      current = chars[index]
      if (lines.length === maxLines) {
        const remainder = chars.slice(index).join('')
        lines[maxLines - 1] = ellipsizeCanvasText(ctx, `${lines[maxLines - 1]}${remainder}`, maxWidth)
        return lines
      }
    } else {
      current = candidate
    }
  }

  if (current && lines.length < maxLines) lines.push(current)
  return lines
}

export default function SharePage() {
  const router = useRouter()
  const sessionId = router.params.sessionId
  const initialTemplate = (['daily', 'death', 'discharge'].includes(router.params.template || '') ? router.params.template : 'daily') as ShareTemplate
  const [template, setTemplate] = useState<ShareTemplate>(initialTemplate)
  const readRouteDraft = () => sessionId ? getShareDraft(sessionId) : null
  const [draft, setDraft] = useState(readRouteDraft)
  const fallbackResult = useMemo(() => getLatestAnalysis(), [])
  const monster = useMemo(
    () => draft ? findMonsterBySlug(draft.monsterSlug) : fallbackResult,
    [draft, fallbackResult],
  )
  const content = useMemo(
    () => buildSharePosterContent(template, monster, draft),
    [draft, monster, template],
  )

  useDidShow(() => setDraft(readRouteDraft()))

  useEffect(() => {
    if (!draft) return undefined
    const remaining = draft.expiresAt - Date.now()
    if (remaining <= 0) {
      setDraft(null)
      return undefined
    }
    const expiryTimer = setTimeout(() => {
      setDraft(sessionId ? getShareDraft(sessionId) : null)
    }, remaining + 50)
    return () => clearTimeout(expiryTimer)
  }, [draft, sessionId])

  const getCurrentContent = (selectedTemplate = template) => {
    const currentDraft = readRouteDraft()
    const currentMonster = currentDraft ? findMonsterBySlug(currentDraft.monsterSlug) : fallbackResult
    return buildSharePosterContent(selectedTemplate, currentMonster, currentDraft)
  }

  useShareAppMessage(() => ({
    title: getCurrentContent().shareTitle,
    path: '/pages/index/index',
  }))

  const renderCanvas = async () => {
    const poster = getCurrentContent()
    const ctx = Taro.createCanvasContext('sharePoster')
    const imageInfo = await Taro.getImageInfo({ src: poster.monsterImage })

    ctx.setFillStyle(poster.background)
    ctx.fillRect(0, 0, 650, 900)
    ctx.setStrokeStyle('#cbb9dc')
    ctx.setLineWidth(3)
    ctx.strokeRect(28, 28, 594, 844)
    ctx.setFillStyle('#2b1648')
    ctx.setTextAlign('center')
    ctx.setFontSize(34)
    ctx.fillText(poster.cardTitle, 325, 84)
    ctx.save()
    ctx.setStrokeStyle(poster.accent)
    ctx.setLineWidth(2)
    ctx.strokeRect(474, 46, 128, 42)
    ctx.setFillStyle(poster.accent)
    ctx.setFontSize(18)
    ctx.fillText(poster.stamp, 538, 74)
    ctx.restore()
    ctx.drawImage(imageInfo.path, 190, 108, 270, 270)
    ctx.setFillStyle(poster.accent)
    ctx.setFontSize(42)
    ctx.fillText(poster.monsterName, 325, 426)
    ctx.setFillStyle('#2b1648')
    ctx.setTextAlign('left')
    ctx.setFontSize(23)

    let textY = 486
    poster.lines.forEach(({ label, value }) => {
      const wrappedLines = wrapCanvasText(ctx, `${label}：${value}`, 526, 2)
      wrappedLines.forEach((line) => {
        ctx.fillText(line, 62, textY)
        textY += 31
      })
      textY += 9
    })

    ctx.setFillStyle(poster.accent)
    ctx.setTextAlign('center')
    ctx.setFontSize(23)
    ctx.fillText('心情怪兽收容所  ·  治愈每一个小情绪', 325, 825)

    await new Promise<void>((resolve) => ctx.draw(false, () => setTimeout(resolve, 240)))
    return Taro.canvasToTempFilePath({ canvasId: 'sharePoster', width: 650, height: 900, destWidth: 1300, destHeight: 1800 })
  }

  const savePoster = async () => {
    Taro.showLoading({ title: '正在装裱卡片' })
    try {
      const file = await renderCanvas()
      await Taro.saveImageToPhotosAlbum({ filePath: file.tempFilePath })
      Taro.showToast({ title: '图片已保存', icon: 'success' })
    } catch {
      try {
        const file = await renderCanvas()
        await Taro.previewImage({ urls: [file.tempFilePath] })
      } catch {
        Taro.showToast({ title: '暂时无法保存，请截图留念', icon: 'none' })
      }
    } finally {
      Taro.hideLoading()
    }
  }

  return (
    <View className='page share-page'>
      <Decorations />
      <PageHeader />
      <View className='share-heading'>
        <Text>{content.title}</Text>
        <Text className='share-heading__subtitle'>{content.subtitle}</Text>
      </View>

      <View className={`poster-shell poster-shell--${template}`}>
        <View className='poster-card'>
          <View className='poster-card__tape poster-card__tape--left' />
          <View className='poster-card__tape poster-card__tape--right' />
          <Text className='poster-card__title'>{content.cardTitle}</Text>
          <View className='poster-card__stamp'>{content.stamp}</View>
          <Image className='poster-card__monster' src={content.monsterImage} mode='aspectFit' />

          <View className='poster-card__copy'>
            <Text className='poster-card__monster-name'>{content.monsterName}</Text>
            {content.lines.map((line) => (
              <Text key={line.label}><Text className='poster-card__label'>{line.label}：</Text>{line.value}</Text>
            ))}
          </View>

          <View className='poster-card__brand'><Text>♙ 心情怪兽收容所</Text><Text>治愈每一个小情绪</Text></View>
        </View>
      </View>

      <View className='template-picker'>
        {(['daily', 'death', 'discharge'] as ShareTemplate[]).map((item) => (
          <Button key={item} className={`template-option ${template === item ? 'is-active' : ''}`} onClick={() => setTemplate(item)}>
            <View className={`template-option__preview template-option__preview--${item}`}>
              <Image src={monster.image} mode='aspectFit' />
            </View>
            <Text>{item === 'daily' ? '今日怪兽卡' : item === 'death' ? '借口死亡证明' : '怪兽出院证明'}</Text>
          </Button>
        ))}
      </View>

      <View className='share-actions'>
        <Button className='primary-button' onClick={savePoster}>保存图片</Button>
        <Button className='secondary-button' openType='share'>分享给朋友</Button>
      </View>

      <Canvas className='poster-canvas' canvasId='sharePoster' />
    </View>
  )
}
