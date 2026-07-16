export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/agent/index',
    'pages/loading/index',
    'pages/result/index',
    'pages/share/index',
    'pages/gallery/index',
    'pages/record-detail/index',
    'pages/discover/index',
    'pages/profile/index',
  ],
  window: {
    navigationStyle: 'custom',
    backgroundTextStyle: 'light',
    backgroundColor: '#fdf7ff',
  },
  lazyCodeLoading: 'requiredComponents',
})
