import { Text, View } from '@tarojs/components'

import './components.less'

export function BrandLockup() {
  return (
    <View className='brand-lockup'>
      <View className='brand-lockup__arch'><Text>♥</Text></View>
      <Text className='brand-lockup__title'>心情怪兽{`\n`}收容所</Text>
      <View className='brand-lockup__tagline'>
        <Text>•</Text><Text>接纳每一种心情 · 陪伴每一个你</Text><Text>•</Text>
      </View>
    </View>
  )
}
