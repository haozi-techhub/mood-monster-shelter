# 心情怪兽收容所

一款面向年轻人的轻量情绪与行动陪伴 Agent：输入一句当前状态，由紫色收容员补齐必要信息、捕获固定体系内的心情怪兽，并陪用户完成一个能立刻开始的小动作。

当前产品与技术基线见 [`doc/mood-monster-agent-v0.4-plan.md`](doc/mood-monster-agent-v0.4-plan.md)。

## 当前完成内容

- 首页输入、快捷情绪、热门怪兽与自定义底部导航
- 紫色收容员驱动的卡片式 Agent 会话与单问题槽位收集
- 捕获动画与分阶段加载文案
- 16 只固定怪兽的本地规则匹配
- 情绪类先照顾、借口/混合类直接行动的双路径编排
- 30 秒 / 2 分钟 / 5 分钟 / 10 分钟微行动、可靠计时、完成反馈与最多两次自动降阶
- 今日怪兽卡、借口死亡证明、怪兽出院证明
- 使用真实任务数据的动态 Canvas 分享图与 30 分钟短期分享草稿
- 本地图鉴、行动记录详情、14 天任务调整时间线与过期摘要视图
- 完成 3 次后解锁的真实自然周行动洞察
- 14 天本地完整会话、长期结构化摘要、记忆授权与一键清理
- 高风险输入安全回应，不生成娱乐化怪兽结果
- CloudBase `analyzeMood` 云函数骨架：服务端调用模型、结构校验、失败重试一次、兜底文案
- CloudBase `runActionAgent` 云函数：结构化 Agent 决策、固定怪兽约束、模型文案改写与确定性降级
- 不包含原始对话的本地指标事件队列
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
npm run test:agent
npm run test:client
npm run build:weapp
npm run build:h5
```

## CloudBase 接入

1. 在腾讯云 CloudBase 创建环境并部署 `cloudfunctions/analyzeMood` 和 `cloudfunctions/runActionAgent`。
2. 在云函数环境变量中配置：
   - `MODEL_API_URL`：OpenAI-compatible Chat Completions 地址
   - `MODEL_API_KEY`：模型密钥
   - `MODEL_NAME`：模型名称
3. 本地构建时配置：

```bash
TARO_APP_USE_CLOUD=true TARO_APP_CLOUDBASE_ENV=你的环境ID npm run build:weapp
```

没有模型环境变量时，两个云函数都会返回固定规则表的安全兜底结果。前端只接收结构化响应，模型不能直接启动计时或修改本地存储。

## 角色素材

- 小程序运行时素材：`src/assets/monsters/`，已缩放以控制主包体积。
- 高清透明 PNG 原稿：`artwork/monsters/`。
- 统一生成规范与角色提示词：[PROMPTS.md](artwork/monsters/PROMPTS.md)。
- 首页品牌标题使用 ZCOOL KuaiLe 的精简字体子集，按 SIL Open Font License 1.1 随项目分发；授权文件位于 `src/assets/fonts/ZCOOL-KuaiLe-OFL.txt`。

当前微信小程序构建产物约 1.8 MB。若后续增加更多动作、皮肤或海报大图，建议把高清素材迁移到 CloudBase Storage，仅在主包保留低分辨率占位图。

## 目录

```text
src/
  pages/          首页 / Agent / 加载 / 结果 / 分享 / 图鉴 / 行动详情 / 发现 / 我的
  components/     页面头部、底部导航、品牌与角色卡片
  data/           固定 16 只怪兽规则表
  services/       Agent 编排、云函数接口、本地记忆、指标与兼容分析服务
  types/          Agent 状态、槽位、动作、会话和记忆类型
  utils/          安全输入识别
  assets/         运行时角色素材
cloudfunctions/
  analyzeMood/    CloudBase 云函数
  runActionAgent/ Agent 编排云函数
artwork/
  monsters/       高清透明角色原稿与提示词
doc/
  mood-monster-agent-v0.4-plan.md  当前迭代执行基线
```
