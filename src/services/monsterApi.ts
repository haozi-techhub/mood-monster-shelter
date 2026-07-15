import Taro from '@tarojs/taro'

import { defaultMonster, monsters } from '../data/monsters'
import { isHighRiskInput, safetyMessage } from '../utils/safety'
import type { AnalysisResult } from './storage'

const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, '')

const pickMonster = (inputText: string) => {
  const normalized = normalize(inputText)
  const scored = monsters
    .map((monster) => ({
      monster,
      score: monster.keywords.reduce((sum, keyword) => sum + (normalized.includes(normalize(keyword)) ? keyword.length + 2 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score)

  return scored[0]?.score > 0 ? scored[0].monster : defaultMonster
}

const wait = (duration: number) => new Promise((resolve) => setTimeout(resolve, duration))

export const analyzeMood = async (inputText: string): Promise<AnalysisResult> => {
  if (process.env.TARO_APP_USE_CLOUD === 'true') {
    const cloud = (Taro as typeof Taro & {
      cloud?: { callFunction: (options: { name: string; data: unknown }) => Promise<{ result: unknown }> }
    }).cloud
    if (!cloud) throw new Error('CloudBase is unavailable in this runtime')
    const response = await cloud.callFunction({ name: 'analyzeMood', data: { inputText } })
    const remote = response.result as Partial<AnalysisResult>
    const local = monsters.find((monster) => monster.monsterName === remote.monsterName) ?? defaultMonster
    return {
      ...local,
      ...remote,
      id: local.id,
      slug: local.slug,
      image: local.image,
      accent: local.accent,
      keywords: local.keywords,
      inputText,
      capturedAt: remote.capturedAt ?? Date.now(),
      collectionId: remote.collectionId ?? `MM-${Date.now()}`,
    }
  }

  await wait(1900)

  if (isHighRiskInput(inputText)) {
    return {
      ...defaultMonster,
      inputText,
      capturedAt: Date.now(),
      collectionId: `SAFE-${Date.now()}`,
      safety: safetyMessage,
    }
  }

  const monster = pickMonster(inputText)
  return {
    ...monster,
    inputText,
    capturedAt: Date.now(),
    collectionId: `MM-${Date.now()}`,
  }
}
