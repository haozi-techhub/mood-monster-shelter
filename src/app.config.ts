export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/loading/index',
    'pages/result/index',
    'pages/share/index',
    'pages/gallery/index',
  ],
  window: {
    navigationStyle: 'custom',
    backgroundTextStyle: 'light',
    backgroundColor: '#fdf7ff',
  },
  lazyCodeLoading: 'requiredComponents',
})
