import { Button, Canvas, Image, Text, View } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage } from '@tarojs/taro'
import { useMemo, useState } from 'react'

import { Decorations } from '../../components/Decorations'
import { PageHeader } from '../../components/PageHeader'
import { getLatestAnalysis } from '../../services/storage'
import './index.less'

type ShareTemplate = 'daily' | 'death' | 'discharge'

const templateMeta: Record<ShareTemplate, { title: string; subtitle: string; stamp: string }> = {
  daily: { title: '今日心情怪兽卡', subtitle: '把今天的小怪兽带走来晒', stamp: 'CAPTURED' },
  death: { title: '借口死亡证明分享卡', subtitle: '把今天的借口带走吧', stamp: 'CASE CLOSED' },
  discharge: { title: '怪兽出院证明分享卡', subtitle: '它完成了今天的小小行动', stamp: 'APPROVED' },
}

export default function SharePage() {
  const router = useRouter()
  const initialTemplate = (['daily', 'death', 'discharge'].includes(router.params.template || '') ? router.params.template : 'daily') as ShareTemplate
  const [template, setTemplate] = useState<ShareTemplate>(initialTemplate)
  const result = useMemo(() => getLatestAnalysis(), [])
  const meta = templateMeta[template]

  useShareAppMessage(() => ({
    title: `${result.monsterName}：${result.cardText.line}`,
    path: '/pages/index/index',
  }))

  const renderCanvas = async () => {
    const ctx = Taro.createCanvasContext('sharePoster')
    const bg = template === 'death' ? '#fff7e8' : template === 'discharge' ? '#f3fff6' : '#fffaf2'
    const accent = template === 'death' ? '#9c665e' : template === 'discharge' ? '#54a783' : '#7650bd'
    const imageInfo = await Taro.getImageInfo({ src: result.image })

    ctx.setFillStyle(bg)
    ctx.fillRect(0, 0, 650, 900)
    ctx.setStrokeStyle('#cbb9dc')
    ctx.setLineWidth(3)
    ctx.strokeRect(28, 28, 594, 844)
    ctx.setFillStyle('#2b1648')
    ctx.setTextAlign('center')
    ctx.setFontSize(34)
    ctx.fillText(meta.title, 325, 92)
    ctx.drawImage(imageInfo.path, 175, 120, 300, 300)
    ctx.setFillStyle(accent)
    ctx.setFontSize(42)
    ctx.fillText(result.monsterName, 325, 470)
    ctx.setFillStyle('#2b1648')
    ctx.setTextAlign('left')
    ctx.setFontSize(24)

    const lines = template === 'death'
      ? [`借口名称：“${result.catchphrase}”`, `死因：${result.excuseCrush}`, `遗言：再等等，我马上就完美了`, `处理建议：${result.microAction}`]
      : template === 'discharge'
        ? [`出院原因：完成了 5 分钟启动任务`, `当前状态：停止空转，开始交付 v0`, `复发提醒：${result.doNotFeed}`, `今日成就：${result.microAction}`]
        : [`常见呢喃：${result.catchphrase}`, `真实身份：${result.trueIdentity}`, `今日粉碎：${result.excuseCrush}`, `任务：${result.microAction}`]

    lines.forEach((line, index) => ctx.fillText(line.slice(0, 25), 62, 545 + index * 58))
    ctx.setFillStyle(accent)
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
        <Text>{meta.title}</Text>
        <Text className='share-heading__subtitle'>{meta.subtitle}</Text>
      </View>

      <View className={`poster-shell poster-shell--${template}`}>
        <View className='poster-card'>
          <View className='poster-card__tape poster-card__tape--left' />
          <View className='poster-card__tape poster-card__tape--right' />
          <Text className='poster-card__title'>{template === 'death' ? '借口死亡证明' : template === 'discharge' ? '怪兽出院证明' : '今日心情怪兽卡'}</Text>
          <View className='poster-card__stamp'>{meta.stamp}</View>
          <Image className='poster-card__monster' src={result.image} mode='aspectFit' />

          {template === 'death' ? (
            <View className='poster-card__copy'>
              <Text>借口名称：『{result.catchphrase}』</Text>
              <Text>死因：被「先做 v0」当场击毙</Text>
              <Text>遗言：“再等等，我马上就完美了”</Text>
              <Text>处理建议：{result.microAction}</Text>
            </View>
          ) : template === 'discharge' ? (
            <View className='poster-card__copy'>
              <Text>怪兽名称：『{result.monsterName}』</Text>
              <Text>出院原因：用户完成了 5 分钟启动任务</Text>
              <Text>当前状态：已停止打磨，开始交付 v0</Text>
              <Text>复发提醒：{result.doNotFeed}</Text>
              <Text>今日成就：{result.microAction}</Text>
            </View>
          ) : (
            <View className='poster-card__copy'>
              <Text className='poster-card__monster-name'>{result.monsterName}</Text>
              <Text>📣 常见呢喃：{result.catchphrase}</Text>
              <Text>♙ 真实身份：{result.trueIdentity}</Text>
              <Text>▤ 今日粉碎：{result.excuseCrush}</Text>
              <Text>▣ 任务：{result.microAction}</Text>
            </View>
          )}

          <View className='poster-card__brand'><Text>♙ 心情怪兽收容所</Text><Text>治愈每一个小情绪</Text></View>
        </View>
      </View>

      <View className='template-picker'>
        {(['daily', 'death', 'discharge'] as ShareTemplate[]).map((item) => (
          <Button key={item} className={`template-option ${template === item ? 'is-active' : ''}`} onClick={() => setTemplate(item)}>
            <View className={`template-option__preview template-option__preview--${item}`}>
              <Image src={result.image} mode='aspectFit' />
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
