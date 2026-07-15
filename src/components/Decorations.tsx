import { Text, View } from '@tarojs/components'

import './components.less'

export function Decorations() {
  return (
    <View className='decorations' aria-hidden>
      <Text className='deco deco--1'>★</Text>
      <Text className='deco deco--2'>♥</Text>
      <Text className='deco deco--3'>✦</Text>
      <Text className='deco deco--4'>●</Text>
      <Text className='deco deco--5'>★</Text>
      <Text className='deco deco--6'>♥</Text>
    </View>
  )
}
