# 心情怪兽收容所

一款面向年轻人的轻量情绪与行动陪伴小程序：输入一句当前状态，捕获对应的心情怪兽，拆穿它的伪装，再获得一个可以立刻执行的 5 分钟动作。

## 当前完成内容

- 首页输入、快捷情绪、热门怪兽与自定义底部导航
- 捕获动画与分阶段加载文案
- 16 只固定怪兽的本地规则匹配
- 收容档案、伪装鉴定和 5 分钟驯化任务
- 今日怪兽卡、借口死亡证明、怪兽出院证明
- Canvas 分享图生成与保存图片流程
- 本地图鉴、出现次数和任务完成记录
- 高风险输入安全回应，不生成娱乐化怪兽结果
- CloudBase `analyzeMood` 云函数骨架：服务端调用模型、结构校验、失败重试一次、兜底文案
- 微信小程序与 H5 双端构建

## 技术栈

- Taro 4.2 + React 18 + TypeScript
- Less 自定义视觉系统
- 微信小程序优先，保留 H5 构建
- CloudBase Cloud Functions
- Taro Storage / 微信 Storage
- 小程序 Canvas 分享卡

模型 API Key 只能配置在 CloudBase 云函数环境变量中，前端不会直接调用大模型。

## 本地运行

```bash
npm install
npm run dev:weapp
```

将项目根目录导入微信开发者工具，`miniprogramRoot` 已配置为 `dist/weapp/`。

H5 预览：

```bash
npm run dev:h5
```

## 构建

```bash
npm run typecheck
npm run build:weapp
npm run build:h5
```

## CloudBase 接入

1. 在腾讯云 CloudBase 创建环境并部署 `cloudfunctions/analyzeMood`。
2. 在云函数环境变量中配置：
   - `MODEL_API_URL`：OpenAI-compatible Chat Completions 地址
   - `MODEL_API_KEY`：模型密钥
   - `MODEL_NAME`：模型名称
3. 本地构建时配置：

```bash
TARO_APP_USE_CLOUD=true TARO_APP_CLOUDBASE_ENV=你的环境ID npm run build:weapp
```

没有模型环境变量时，云函数会返回固定规则表的安全兜底结果。

## 角色素材

- 小程序运行时素材：`src/assets/monsters/`，已缩放以控制主包体积。
- 高清透明 PNG 原稿：`artwork/monsters/`。
- 统一生成规范与角色提示词：[PROMPTS.md](artwork/monsters/PROMPTS.md)。

当前微信小程序构建产物约 1.7 MB。若后续增加更多动作、皮肤或海报大图，建议把高清素材迁移到 CloudBase Storage，仅在主包保留低分辨率占位图。

## 目录

```text
src/
  pages/          首页 / 加载 / 结果 / 分享 / 图鉴
  components/     页面头部、底部导航、品牌与角色卡片
  data/           固定 16 只怪兽规则表
  services/       分析服务与本地存储
  utils/          安全输入识别
  assets/         运行时角色素材
cloudfunctions/
  analyzeMood/    CloudBase 云函数
artwork/
  monsters/       高清透明角色原稿与提示词
```
