import Taro from '@tarojs/taro'

import { defaultMonster, type MonsterProfile } from '../data/monsters'

export interface AnalysisResult extends MonsterProfile {
  inputText: string
  capturedAt: number
  collectionId: string
  safety?: {
    title: string
    body: string
    action: string
  }
}

export interface GalleryRecord {
  collectionId: string
  monsterSlug: string
  capturedAt: number
  count: number
  completed: boolean
}

const LATEST_KEY = 'mms:latest-analysis'
const GALLERY_KEY = 'mms:gallery'

export const createDefaultAnalysis = (): AnalysisResult => ({
  ...defaultMonster,
  inputText: '我还没准备好，等我再学一阵子。',
  capturedAt: Date.now(),
  collectionId: `MM-${Date.now()}`,
})

const withoutRawInput = (result: AnalysisResult): AnalysisResult => result.safety
  ? { ...createDefaultAnalysis(), inputText: '', capturedAt: result.capturedAt, collectionId: result.collectionId, safety: result.safety }
  : { ...result, inputText: '' }

export const saveLatestAnalysis = (result: AnalysisResult) => Taro.setStorageSync(LATEST_KEY, withoutRawInput(result))

export const sanitizeLatestAnalysisStorage = (): AnalysisResult | null => {
  try {
    const stored = Taro.getStorageSync<AnalysisResult>(LATEST_KEY)
    if (!stored) return null
    const sanitized = withoutRawInput(stored)
    if (stored.inputText || stored.safety) Taro.setStorageSync(LATEST_KEY, sanitized)
    return sanitized
  } catch {
    return null
  }
}

export const getLatestAnalysis = (): AnalysisResult => {
  return sanitizeLatestAnalysisStorage() || createDefaultAnalysis()
}

export const consumeLatestAnalysis = (): AnalysisResult => {
  const result = sanitizeLatestAnalysisStorage() || createDefaultAnalysis()
  if (result.safety) {
    try { Taro.removeStorageSync(LATEST_KEY) } catch { /* the safety response is already held in page state */ }
  }
  return result
}

export const getGalleryRecords = (): GalleryRecord[] => {
  try {
    const records = Taro.getStorageSync<GalleryRecord[]>(GALLERY_KEY)
    if (!Array.isArray(records)) return []
    const realRecords = records.filter((record) => !record.collectionId.startsWith('DEMO-'))
    if (realRecords.length !== records.length) Taro.setStorageSync(GALLERY_KEY, realRecords)
    return realRecords
  } catch {
    return []
  }
}

export const addToGallery = (result: AnalysisResult, completed = false): GalleryRecord[] => {
  const records = getGalleryRecords()
  const existing = records.find((record) => record.monsterSlug === result.slug)
  const next = existing
    ? records.map((record) => record.monsterSlug === result.slug
      ? { ...record, capturedAt: Date.now(), count: record.count + 1, completed: completed || record.completed }
      : record)
    : [{ collectionId: result.collectionId, monsterSlug: result.slug, capturedAt: Date.now(), count: 1, completed }, ...records]
  Taro.setStorageSync(GALLERY_KEY, next)
  return next
}

export const clearMonsterData = () => {
  try {
    Taro.removeStorageSync(LATEST_KEY)
    Taro.setStorageSync(GALLERY_KEY, [])
  } catch {
    // Data-clearing actions stay best-effort when device storage is unavailable.
  }
}
