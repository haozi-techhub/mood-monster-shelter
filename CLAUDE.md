# CLAUDE.md — Mood Monster Shelter(心情怪兽收容所)

本文件是项目的常驻指令,每次会话 Claude Code 会自动读取。请严格遵守下列技术栈、架构原则与产品约束。

---

## 1. 项目概述

**Mood Monster Shelter(心情怪兽收容所)** 是一个面向年轻人的轻量情绪 + 行动陪伴 Agent。

用户输入一句当前状态 → 系统识别背后的情绪/拖延/借口,把它变成一只「心情怪兽」→ 通过收容档案、伪装鉴定、借口粉碎、5 分钟驯化任务、分享卡片,帮助用户把模糊内耗转化成一个可执行的小行动。

**核心链路:**
输入一句状态 → 捕获怪兽 → 生成档案 → 鉴定伪装 → 粉碎借口 → 5 分钟驯化任务 → 分享卡 → 存入图鉴

**怪兽体系:** MVP 共 **16 只怪兽**,分为情绪类 / 借口类 / 混合类(详见 `prd/` 下产品方案文档第 8 节)。

> 项目成败的关键不是模型多强,而是结果是否「准、有梗、有温度、愿意分享」。

---

## 2. 技术栈(已锁定)

> ⚠️ 以《技术栈与开发路线 v0.1》为准。**不采用** PRD 第 12 节里的 Next.js + Tailwind + Framer Motion 网页方案(已被新技术文档覆盖)。

**推荐结论:第一版优先做微信小程序,推荐 Taro + React + TypeScript + CloudBase 云开发。**

| 层级 | 选型 |
|---|---|
| 端形态 | **微信小程序优先**(后续可扩展 H5,不直接做原生 App) |
| 前端框架 | **Taro + React + TypeScript** |
| UI 样式 | CSS Modules / Less / NutUI React |
| 动画 | CSS Animation + Taro 动画 API |
| 后端 | **腾讯云 CloudBase 云开发** |
| 数据库 | CloudBase Database + 本地 Storage |
| 云函数 | CloudBase Cloud Functions(调用大模型、保护 API Key) |
| 图片存储 | CloudBase Storage |
| AI 接口 | DeepSeek / Qwen / Kimi / 智谱 GLM / OpenAI-compatible(优先中文好、成本低、结构化输出稳定) |
| 分享卡 | 小程序 Canvas 生成图片 |
| 本地缓存 | Taro Storage / 微信小程序 Storage |

**选型理由:** 产品强依赖朋友圈、微信群、二维码的分享传播,小程序打开成本最低;Taro + React 能体现现代前端工程能力,并保留多端扩展能力。

---

## 3. 核心架构原则(强约束,务必遵守)

1. **绝不在前端直接调用大模型。** API Key 必须放在云函数(CloudBase Cloud Functions),前端只调用自有云函数接口 `analyzeMood`。
2. **怪兽匹配 = 规则表(固定 16 只)+ LLM 文案生成。** 不要把怪兽名字完全交给模型自由生成,以保证体系稳定、产品风格可控。
3. **云函数返回前端可直接渲染的结构化 JSON**,前端不做复杂文本解析。`analyzeMood` 返回字段:
   - `monsterName` / `monsterType` / `dangerLevel` / `catchphrase`
   - `trueIdentity` / `whyItAppears` / `whatItProtects`
   - `excuseCrush` / `doNotFeed` / `microAction`
   - `cardText: { title, subtitle, line }`
4. **多阶段 Agent + 结构化输出:** 对模型输出做 JSON Schema 校验,失败时用兜底文案或重试一次,不要把不稳定结构直接暴露给用户。

---

## 4. 推荐目录结构

```
mood-monster-shelter/
  src/
    pages/        # 首页输入 / 收容动画 / 怪兽档案 / 分享卡 / 怪兽图鉴
      index/
      loading/
      result/
      share/
      gallery/
    components/   # MonsterCard / CaptureLoading / ExcusePanel / MicroTask / SharePoster / MonsterBadge
    services/     # monsterApi / storage / poster
    data/         # monsters / examples(怪兽规则表、示例输入)
    utils/        # format / id / safety
  cloudfunctions/
    analyzeMood/
      index.js
```

---

## 5. 开发顺序(6 步)

1. **纯前端假数据版** — 先不接大模型,用 mock 数据跑通首页 / 加载页 / 结果页 / 分享页 / 图鉴页,验证体验。
2. **接 CloudBase 云函数** — 前端调用 `analyzeMood(inputText)`,云函数先返回固定 JSON,确认链路。
3. **接入大模型** — 云函数中调用大模型,要求结构化 JSON 返回 + 基础格式校验。
4. **分享卡生成** — 用 Canvas 生成今日怪兽卡 / 借口死亡证明 / 怪兽出院证明(传播核心)。
5. **图鉴保存** — 先用本地 Storage 保存历史怪兽,不做登录。
6. **动画与视觉打磨** — 收容动画、卡片动效、怪兽头像、危险等级标签。

---

## 6. 产品语气与安全边界(必须遵守)

### 语气
- 比例:**温柔 60% + 毒舌 25% + 可爱 15%**,不严肃说教。
- **不要说:**「你就是懒」「你心理有问题」「你必须积极起来」「你需要自律」「你这是焦虑症」等。
- **应该说:** 解释背后的怪兽、给一个不痛苦的小行动。

### 安全边界
- **禁止输出任何医疗 / 心理诊断**(抑郁症、焦虑症、需要吃药等);产品定位是轻量自我观察工具,不是心理诊断工具。
- **高风险输入**(自伤、自杀、强烈绝望):立即停止娱乐化表达,进入安全回应 →
  1. 表达关心;2. 鼓励联系身边可信任的人;3. 建议寻求专业帮助;4. 提供紧急求助建议;5. 不再生成搞笑怪兽卡。
- **小程序审核风险:** 不要包装成心理诊断或医疗工具。

---

## 7. MVP 边界(第一版不做)

不做:登录系统、复杂社区、排行榜、付费功能、心理量表、复杂用户画像、多端同步、真正的医疗 / 心理诊断、长期心理陪伴对话、复杂后台管理系统。

---

## 8. 风险与注意事项

- **API Key 安全:** 任何大模型 Key 不得出现在小程序前端,一律走云函数。
- **模型输出不稳定:** JSON Schema 校验 + 兜底文案 + 重试一次。
- **成本控制:** 限制单次输入长度、控制输出长度、优先低成本模型。
- **体验节奏:** 不要让用户等太久,加载过程用「捕获动画」承接等待。

---

## 9. 参考链接与文档

- 详细产品逻辑、怪兽体系、页面结构、语气规范 → `prd/Mood Monster Shelter MVP 产品方案.md`
- 技术选型依据、云函数返回结构、目录结构 → `心情怪兽收容所_技术栈与开发路线_v0.1.docx`
- Taro 官方文档:https://docs.taro.zone/
- CloudBase 云开发文档:https://docs.cloudbase.net/
