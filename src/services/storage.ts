import Taro from '@tarojs/taro'

import { defaultMonster, monsters, type MonsterProfile } from '../data/monsters'

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

export const saveLatestAnalysis = (result: AnalysisResult) => Taro.setStorageSync(LATEST_KEY, result)

export const getLatestAnalysis = (): AnalysisResult => {
  try {
    return Taro.getStorageSync<AnalysisResult>(LATEST_KEY) || createDefaultAnalysis()
  } catch {
    return createDefaultAnalysis()
  }
}

const makeDemoRecords = (): GalleryRecord[] => monsters.slice(0, 7).map((monster, index) => ({
  collectionId: `DEMO-${monster.id}`,
  monsterSlug: monster.slug,
  capturedAt: Date.now() - index * 86_400_000,
  count: index === 6 ? 4 : index % 3 + 1,
  completed: index % 2 === 0,
}))

export const getGalleryRecords = (): GalleryRecord[] => {
  try {
    const records = Taro.getStorageSync<GalleryRecord[]>(GALLERY_KEY)
    if (records?.length) return records
    const seeded = makeDemoRecords()
    Taro.setStorageSync(GALLERY_KEY, seeded)
    return seeded
  } catch {
    return makeDemoRecords()
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
