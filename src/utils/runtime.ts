// Stage 002 deliberately keeps the browser preview on local rules.
// Enable a Web cloud transport only after the separate online-beta specification is implemented.
export const isWebPreview = process.env.TARO_ENV === 'h5'
export const isCloudEnabled = !isWebPreview && process.env.TARO_APP_USE_CLOUD === 'true'
