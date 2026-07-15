import { Image, Text, View } from '@tarojs/components'

import type { MonsterProfile } from '../data/monsters'
import './components.less'

interface MonsterMiniCardProps {
  monster: MonsterProfile
  metric?: string
  compact?: boolean
}

export function MonsterMiniCard({ monster, metric, compact = false }: MonsterMiniCardProps) {
  return (
    <View className={`monster-mini ${compact ? 'monster-mini--compact' : ''}`}>
      <Image className='monster-mini__image' src={monster.image} mode='aspectFit' />
      <Text className='monster-mini__name'>{monster.shortName}</Text>
      {metric && <Text className='monster-mini__metric'>♥ {metric}</Text>}
    </View>
  )
}
