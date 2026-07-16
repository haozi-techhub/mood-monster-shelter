import { Button, Image, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'

import discoverActiveIcon from '../assets/icons/nav/discover-active-v2.png'
import discoverIcon from '../assets/icons/nav/discover-v2.png'
import homeActiveIcon from '../assets/icons/nav/home-active-v2.png'
import homeIcon from '../assets/icons/nav/home-v2.png'
import profileActiveIcon from '../assets/icons/nav/profile-active-v2.png'
import profileIcon from '../assets/icons/nav/profile-v2.png'
import recordsActiveIcon from '../assets/icons/nav/records-active-v2.png'
import recordsIcon from '../assets/icons/nav/records-v2.png'

import './components.less'

export type ActiveTab = 'home' | 'records' | 'discover' | 'profile'

interface BottomNavProps {
  active?: ActiveTab
}

const tapFeedback = () => {
  if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
    Taro.vibrateShort({ type: 'light' }).catch(() => undefined)
  }
}

export function BottomNav({ active = 'home' }: BottomNavProps) {
  const go = (url: string) => {
    tapFeedback()
    Taro.reLaunch({ url })
  }

  return (
    <View className='bottom-nav' role='navigation' aria-label='主要导航'>
      <Button
        className={`bottom-nav__item ${active === 'home' ? 'is-active' : ''}`}
        aria-label='首页'
        onClick={() => go('/pages/index/index')}
      >
        <View className='bottom-nav__icon-wrap'>
          <Image className='bottom-nav__asset' src={active === 'home' ? homeActiveIcon : homeIcon} mode='scaleToFill' />
        </View>
        <Text className='bottom-nav__label'>首页</Text>
      </Button>

      <Button
        className={`bottom-nav__item ${active === 'records' ? 'is-active' : ''}`}
        aria-label='怪兽记录'
        onClick={() => go('/pages/gallery/index')}
      >
        <View className='bottom-nav__icon-wrap'>
          <Image className='bottom-nav__asset' src={active === 'records' ? recordsActiveIcon : recordsIcon} mode='scaleToFill' />
        </View>
        <Text className='bottom-nav__label'>记录</Text>
      </Button>

      <Button className='bottom-nav__capture' aria-label='收容新的心情怪兽' onClick={() => go('/pages/agent/index')}>
        <View className='bottom-nav__capture-orb'>
          <View className='bottom-nav__capture-shine' />
          <View className='bottom-nav__plus' />
        </View>
      </Button>

      <Button
        className={`bottom-nav__item ${active === 'discover' ? 'is-active' : ''}`}
        aria-label='发现'
        onClick={() => go('/pages/discover/index')}
      >
        <View className='bottom-nav__icon-wrap'>
          <Image className='bottom-nav__asset' src={active === 'discover' ? discoverActiveIcon : discoverIcon} mode='scaleToFill' />
        </View>
        <Text className='bottom-nav__label'>发现</Text>
      </Button>

      <Button
        className={`bottom-nav__item ${active === 'profile' ? 'is-active' : ''}`}
        aria-label='我的'
        onClick={() => go('/pages/profile/index')}
      >
        <View className='bottom-nav__icon-wrap'>
          <Image className='bottom-nav__asset' src={active === 'profile' ? profileActiveIcon : profileIcon} mode='scaleToFill' />
        </View>
        <Text className='bottom-nav__label'>我的</Text>
      </Button>
    </View>
  )
}
