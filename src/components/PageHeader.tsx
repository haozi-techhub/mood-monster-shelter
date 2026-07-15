import { Button, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'

import './components.less'

interface PageHeaderProps {
  title?: string
  showBack?: boolean
  showShare?: boolean
}

export function PageHeader({ title = '心情怪兽收容所', showBack = true, showShare = true }: PageHeaderProps) {
  const handleBack = () => {
    if (Taro.getCurrentPages().length > 1) Taro.navigateBack()
    else Taro.reLaunch({ url: '/pages/index/index' })
  }

  return (
    <View className='page-header'>
      <View className='page-header__side'>
        {showBack && (
          <Button className='icon-button page-header__back' aria-label='返回' onClick={handleBack}>
            <Text className='page-header__back-arrow'>‹</Text>
            <Text>返回</Text>
          </Button>
        )}
      </View>
      <Text className='page-header__title'>{title}</Text>
      <View className='page-header__side page-header__side--right'>
        {showShare && (
          <Button className='icon-button share-glyph' openType='share' aria-label='分享'>
            ↗
          </Button>
        )}
      </View>
    </View>
  )
}
