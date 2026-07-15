import { Button, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'

import './components.less'

type ActiveTab = 'home' | 'records' | 'discover' | 'profile'

interface BottomNavProps {
  active?: ActiveTab
}

const showComingSoon = () => Taro.showToast({ title: '这间小屋还在布置中', icon: 'none' })

export function BottomNav({ active = 'home' }: BottomNavProps) {
  const go = (url: string) => Taro.reLaunch({ url })

  return (
    <View className='bottom-nav'>
      <Button className={`bottom-nav__item ${active === 'home' ? 'is-active' : ''}`} onClick={() => go('/pages/index/index')}>
        <Text className='bottom-nav__icon'>⌂</Text><Text>首页</Text>
      </Button>
      <Button className={`bottom-nav__item ${active === 'records' ? 'is-active' : ''}`} onClick={() => go('/pages/gallery/index')}>
        <Text className='bottom-nav__icon'>▣</Text><Text>记录</Text>
      </Button>
      <Button className='bottom-nav__capture' aria-label='再收容一只' onClick={() => go('/pages/index/index')}>
        <Text>＋</Text>
      </Button>
      <Button className={`bottom-nav__item ${active === 'discover' ? 'is-active' : ''}`} onClick={showComingSoon}>
        <Text className='bottom-nav__icon'>◉</Text><Text>发现</Text>
      </Button>
      <Button className={`bottom-nav__item ${active === 'profile' ? 'is-active' : ''}`} onClick={showComingSoon}>
        <Text className='bottom-nav__icon'>♙</Text><Text>我的</Text>
      </Button>
    </View>
  )
}
