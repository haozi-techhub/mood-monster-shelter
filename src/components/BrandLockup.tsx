import { Image, Text, View } from '@tarojs/components'

import homeWordmark from '../assets/brand/home-wordmark.png'

import './components.less'

export function BrandLockup() {
  return (
    <View className='brand-lockup'>
      <Image className='brand-lockup__art' src={homeWordmark} mode='widthFix' ariaLabel='心情怪兽收容所' />
      <View className='brand-lockup__tagline'>
        <Text>•</Text><Text>接纳每一种心情 · 陪伴每一个你</Text><Text>•</Text>
      </View>
    </View>
  )
}
