import Taro, { useResize } from '@tarojs/taro'
import { useState } from 'react'

const readDesktop = () => process.env.TARO_ENV === 'h5' && Taro.getWindowInfo().windowWidth >= 1024

/** Presentation only: both layouts keep the same page state and business callbacks. */
export function useDesktop() {
  const [desktop, setDesktop] = useState(readDesktop)
  useResize(() => setDesktop(readDesktop()))
  return desktop
}
