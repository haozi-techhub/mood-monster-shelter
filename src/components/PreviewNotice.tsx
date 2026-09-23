import { Text, View } from '@tarojs/components'

export function PreviewNotice() {
  return (
    <View className='preview-notice' role='note' aria-label='当前为本地规则预览，未接入 AI'>
      <View className='preview-notice__identity'><View className='preview-notice__dot' /><Text>心情怪兽收容所 · 体验预览</Text></View>
      <Text className='preview-notice__mode'>本地规则 · 未接入 AI</Text>
    </View>
  )
}
