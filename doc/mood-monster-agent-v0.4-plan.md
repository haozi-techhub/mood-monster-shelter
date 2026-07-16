---
status: Active
version: V0.4
updated: 2026-07-16
current_milestone: 9. 行动闭环完善完成，进入云环境与真机持续验证
owner: Mood Monster Shelter
---

# 心情怪兽收容所 Agent V0.4 落盘与开发计划

> 本文档是 Agent V0.4 的执行基线。涉及 Agent 产品、交互、数据、记忆、云函数和验收标准的变更必须同步更新本文档。若与 `AGENTS.md` 冲突，以 `AGENTS.md` 的技术栈、安全边界和固定 16 只怪兽约束为准。

## 执行状态

- [x] 计划落盘并在 `AGENTS.md` 建立强制引用
- [x] 定义 Agent 状态机、接口和本地存储
- [x] 开发卡片式对话与槽位收集
- [x] 接入双路径怪兽识别和行动任务
- [x] 开发可靠计时、复盘和任务降阶
- [x] 实现 14 天短期记忆、长期摘要和隐私设置
- [x] 完成记录、发现洞察和图鉴联动
- [x] 完成安全评测、异常降级、埋点和双端回归
- [x] 完成动态分享、行动记录详情和真实自然周洞察

### 已完成

- 新增 `runActionAgent` 云函数、本地确定性状态机和 `analyzeMood` 兼容降级路径。
- 新增 Agent 会话页、首次记忆授权、卡片式槽位追问、情绪照顾/直接行动双路径、时间戳计时、回访和两次任务降阶。
- 新增 14 天完整会话清理、无原话结构化摘要、发现洞察、我的隐私设置，并将行动摘要联动到记录页。
- 新增本地安全埋点队列；属性名过滤原始输入、消息和对话字段。
- 首页品牌标题使用内置的 ZCOOL KuaiLe 精简字体子集，并按 UI 参考统一深紫描边、浅紫立体投影与两行标题比例。
- 底部菜单采用项目原创导航图标资产，统一圆角线宽、视觉重心、激活态紫色渐变和文字基线。
- 新增 `TaskAdjustment` 调整记录、`AgentRecordDetail` 详情查询和兼容旧缓存的结构化迁移；14 天内展示任务与调整时间线，到期后只保留无原话摘要。
- 新增 30 分钟 `ShareDraft`，出院证明使用真实任务、时长、第一步和完成标准；页面预览与 Canvas 使用同一内容模型，过期后不虚构任务信息。
- 记录页与发现页使用设备本地时间的自然周（周一 00:00 至下周一 00:00），本周无数据时不使用历史数据冒充。
- 未授权记忆时不写入图鉴、最近怪兽或长期摘要；高风险输入在写入会话前本地阻断；清除数据覆盖会话、摘要、分享草稿、图鉴、最近怪兽与本地指标。
- Agent 云函数 9 项测试、客户端数据与分享 8 项测试、TypeScript、H5 与微信小程序生产构建通过。

### 待完成（不阻塞 V0.4 本地实现）

- 在目标 CloudBase 环境部署 `runActionAgent`，配置实际模型环境变量并完成云端联调。
- 在微信开发者工具和真机上补充网络弱化、退后台超时及分享图片权限的设备级冒烟测试。
- 上线取得真实匿名事件数据后校准槽位识别规则和初期指标目标。

## 1. 产品目标

将产品从“一次性生成怪兽档案”升级为由紫色收容员驱动的行动陪伴 Agent：

> 表达状态 → 对话补齐槽位 → 捕获怪兽 → 先照顾或直接行动 → 确认任务 → 计时执行 → 完成/卡住反馈 → 自动降阶 → 形成记忆

- 北极星指标：有效微行动完成率。
- 保留固定 16 只怪兽和现有视觉体系。
- 不做心理诊断、开放式长期陪聊、登录、复杂待办和外部日历。
- 结合 Finch 的轻量陪伴、Goblin Tools 的任务降阶与计时、Rosebud 的记忆反思，但聚焦“怪兽识别 + 当场行动”。

## 2. 核心体验

### 2.1 卡片式对话

- 紫色主怪兽是固定“收容员 Agent”。
- 使用短气泡、快捷选项、怪兽档案卡和行动卡，不改成普通聊天界面。
- 档案页是会话中间节点，任务完成才是终点。
- 底栏保持“首页 / 记录 / 收容 / 发现 / 我的”：记录承载怪兽与行动历史；发现承载完成 3 次会话后解锁的本周洞察；我的承载记忆授权、保留规则和数据清理。

### 2.2 槽位收集

必需槽位：

- `currentState`：当前状态。
- `targetOutcome`：本次希望推进什么。
- `primaryBlocker`：启动阻碍。
- `energyLevel`：低 / 中 / 高。
- `availableMinutes`：2 / 5 / 10 分钟，默认 5 分钟。

规则：自动提取首轮信息，只问缺失或低置信度槽位；每轮只问一个问题，最多 4 轮；提供快捷选项和自由输入；支持“直接给我方案”；不得重复询问已明确的信息。

### 2.3 双路径行动

- 情绪类先提供 30–120 秒照顾动作，再决定是否进入任务。
- 借口类、混合类直接进入任务拆解。
- 任务卡包含行动、原因、第一步、预计时间和可观察完成标准。
- 用户可以选择“开始 / 太难 / 换一个”。
- 计时结束后选择“完成 / 卡住 / 不适合”。
- 卡住后自动降为 30 秒或 2 分钟任务，单次会话最多降阶两次。
- 完成后更新图鉴、保存总结并允许生成出院证明。

## 3. Agent 架构

采用“单 Agent 编排器 + 确定性状态机 + 本地工具”。

正常状态流：

`intake → clarifying → care/proposal → ready → running → checkin → completed`

异常状态：

`safety_handoff / abandoned / model_fallback`

新增 `runActionAgent` 云函数，保留 `analyzeMood` 作为兼容和降级接口。

```ts
type AgentPhase =
  | 'intake' | 'clarifying' | 'care' | 'proposal'
  | 'ready' | 'running' | 'checkin' | 'completed'
  | 'safety_handoff' | 'abandoned' | 'model_fallback'

interface AgentTurnRequest {
  sessionId: string
  userMessage: string
  phase: AgentPhase
  slots: Partial<AgentSlots>
  recentTurns: ConversationTurn[]
  memoryContext: MemorySummary[]
}

interface AgentTurnResponse {
  phase: AgentPhase
  reply: string
  slotPatch: Partial<AgentSlots>
  missingSlots: SlotKey[]
  confidence: number
  monster?: MonsterReference
  action: AgentAction
}

interface MicroTask {
  title: string
  rationale: string
  firstStep: string
  durationSeconds: 30 | 120 | 300 | 600
  completionCriterion: string
}
```

行动闭环新增本地接口：

- `TaskAdjustment`：记录降阶或更换入口的结构化原因、前后任务和发生时间，仅随 14 天完整会话保留。
- `MemorySummary.rescopeReasons`：长期只保留最多两条降阶原因，不包含任务原文或聊天内容。
- `getAgentRecordDetail(sessionId)`：14 天内合并会话与摘要；会话到期后返回 `expired` 摘要视图，永不返回 `turns`。
- `createShareDraft(session)` / `getShareDraft(sessionId)`：保存不含聊天原文的分享草稿，30 分钟后自动清除。
- `getWeeklyAgentStats(now?)`：以设备本地时间计算周一至下周一的自然周统计。

约束：模型不得创建固定体系外的怪兽；模型只返回结构化决策；状态转换、计时和持久化由代码执行；Schema 校验失败重试一次后使用固定兜底；单次会话最多 4 次澄清和 2 次执行反馈。

## 4. 记忆、隐私与安全

- 首次使用时申请本地记忆授权，拒绝后仍可完成单次会话。
- 完整对话只保存在设备上，按最后更新时间保留 14 天。
- 应用启动和每次写入时自动删除超过 14 天的完整对话。
- 14 天后仅保留怪兽、目标类别、阻碍类别、能量等级、行动类型、时长、完成状态、降阶原因和有效程度等结构化摘要。
- 用于生成分享图的结构化草稿最多保留 30 分钟，不包含原始输入、槽位原文或完整对话。
- 长期摘要不得包含原始文本、姓名或其他可识别信息。
- 模型最多读取当前会话、3 条相关近期会话和 5 条摘要。
- 用户可以关闭记忆或清除全部数据。
- 每轮输入先经过本地高风险规则检测；命中后停止怪兽化、任务和计时，不写入长期摘要。
- 低能量用户可以选择“今天只照顾自己”，不强迫行动。

## 5. 测试与指标

必须覆盖：完整输入不产生多余追问；模糊输入最多 4 轮；情绪类和借口类进入正确路径；小程序退后台后计时准确；完成、卡住、不适合正确转换状态；两次降阶后允许结束；未授权时不形成跨会话记忆；第 15 天删除完整对话但保留摘要；任意轮次高风险输入都能阻断；模型超时和非法结构可降级；TypeScript、H5、微信小程序构建和移动端视觉回归通过。

初期目标：槽位收集完成率 ≥ 60%；任务接受率 ≥ 55%；开始计时率 ≥ 70%；有效微行动完成率 ≥ 40%；首次输入到任务确认中位时间 ≤ 120 秒。埋点不得包含原始对话。

核心事件：`agent_session_start`、`slot_answered`、`task_proposed`、`task_started`、`checkin_result`、`task_rescoped`、`session_completed`、`memory_consent`、`safety_handoff`。

## 6. 默认约束

- 继续使用 Taro、React、TypeScript 和 CloudBase。
- 保留现有底栏优化与视觉资产。
- V0.4 无登录、无微信订阅提醒、无云端用户画像。
- 任务完成采用用户确认完成标准的自报告方式。
- 分享率是次级指标，优先级低于行动完成率。
