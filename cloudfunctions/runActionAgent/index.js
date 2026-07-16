const HIGH_RISK = /自杀|轻生|结束生命|不想活|活不下去|去死|割腕|跳楼|上吊|服药自尽|伤害自己|没有活着的意义|活着没意思|彻底消失/

const MONSTERS = [
  { id: 'M-001', slug: 'rainy-dog', monsterName: '下雨小狗怪', monsterType: '情绪类', dangerLevel: '中', keywords: ['好废', '不行', '难过', '委屈', '低落', '自责'], microAction: '喝几口水，写下今天已经完成的一件小事。', excuseCrush: '今天不用证明自己，先照顾一下被雨淋湿的电量。' },
  { id: 'M-002', slug: 'tough-cat', monsterName: '嘴硬猫猫怪', monsterType: '情绪类', dangerLevel: '中', keywords: ['没事', '无所谓', '随便', '不在乎'], microAction: '写一句：我其实有点在意的是……', excuseCrush: '承认有点难受不会输。' },
  { id: 'M-003', slug: 'overtime-jellyfish', monsterName: '加班水母怪', monsterType: '情绪类', dangerLevel: '中高', keywords: ['加班', '累', '硬撑', '过载', '疲惫'], microAction: '关掉一个输入源，只收尾最小的一件事。', excuseCrush: '低电量时完成收尾比继续硬撑更可靠。' },
  { id: 'M-004', slug: 'irritable-raccoon', monsterName: '暴躁浣熊怪', monsterType: '情绪类', dangerLevel: '中高', keywords: ['烦', '暴躁', '生气', '别烦', '吵'], microAction: '静音一个群聊，离开屏幕三分钟。', excuseCrush: '先降噪，再沟通。' },
  { id: 'M-005', slug: 'stuck-penguin', monsterName: '原地企鹅怪', monsterType: '情绪类', dangerLevel: '中', keywords: ['迷茫', '不知道', '动不了', '从哪开始'], microAction: '圈出一个今天能做五分钟的动作。', excuseCrush: '这一步不用通往完美终点。' },
  { id: 'M-006', slug: 'defense-hedgehog', monsterName: '刺猬防御怪', monsterType: '情绪类', dangerLevel: '中', keywords: ['不会懂', '防御', '否定', '受伤'], microAction: '写下真正困扰你的一句话。', excuseCrush: '不是每次表达都要变成辩论。' },
  { id: 'M-007', slug: 'busy-hamster', monsterName: '伪忙碌仓鼠怪', monsterType: '借口类', dangerLevel: '中高', keywords: ['没时间', '很忙', '没进展', '事情好多'], microAction: '给关键任务一个五分钟倒计时，只推进一步。', excuseCrush: '不是完全没时间，是完整时间块迟迟没有出现。' },
  { id: 'M-008', slug: 'perfection-polisher', monsterName: '完美主义打磨怪', monsterType: '借口类', dangerLevel: '中高', keywords: ['没准备好', '准备好了', '再学', '再优化', '完美', '作品集'], microAction: '打开文档，只写标题和第一句话。', excuseCrush: '作品不是憋出来的，是迭代出来的。' },
  { id: 'M-009', slug: 'tomorrow-pigeon', monsterName: '明日鸽子怪', monsterType: '借口类', dangerLevel: '中', keywords: ['明天', '下次', '改天', '以后'], microAction: '现在做一分钟启动动作。', excuseCrush: '明天的你没有多一双手。' },
  { id: 'M-010', slug: 'collector-squirrel', monsterName: '收藏松鼠怪', monsterType: '借口类', dangerLevel: '中', keywords: ['收藏', '存一下', '资料', '教程', '链接'], microAction: '打开一个旧收藏，只摘三个观点。', excuseCrush: '收藏不是吸收。' },
  { id: 'M-011', slug: 'shame-ostrich', monsterName: '怕丢脸鸵鸟怪', monsterType: '借口类', dangerLevel: '中高', keywords: ['丢脸', '别人怎么看', '时机', '被评价', '不敢发'], microAction: '把草稿发给一个可信任的人。', excuseCrush: '先让一个安全的人看见。' },
  { id: 'M-012', slug: 'three-minute-fox', monsterName: '三分钟热度狐狸怪', monsterType: '借口类', dangerLevel: '中', keywords: ['没兴趣', '三分钟热度', '坚持不了', '放弃'], microAction: '缩成一个不用热情也能完成的动作。', excuseCrush: '兴趣负责点火，流程负责持续。' },
  { id: 'M-013', slug: 'anxiety-spinner', monsterName: '焦虑转圈怪', monsterType: '混合类', dangerLevel: '高', keywords: ['焦虑', '好慌', '慌', '动不了', '担心'], microAction: '写下最担心的一件事和一个小动作。', excuseCrush: '今天不解决全部焦虑。' },
  { id: 'M-014', slug: 'review-hammer', monsterName: '复盘锤子怪', monsterType: '混合类', dangerLevel: '中高', keywords: ['复盘', '想清楚', '分析', '再想想', '纠结'], microAction: '做一个能产生真实反馈的动作。', excuseCrush: '下一条证据需要从行动里拿。' },
  { id: 'M-015', slug: 'comparison-octopus', monsterName: '比较章鱼怪', monsterType: '混合类', dangerLevel: '中高', keywords: ['别人', '比较', '比我快', '不如', '进度'], microAction: '记录自己今天向前的一厘米。', excuseCrush: '别人的进度条不能替你完成这一格。' },
  { id: 'M-016', slug: 'life-reboot-giant', monsterName: '重启人生巨兽', monsterType: '混合类', dangerLevel: '高', keywords: ['重启人生', '换工作', '换城市', '辞职', '推翻'], microAction: '记下念头，睡醒后只找一个可微调的点。', excuseCrush: '重大决定可以等电量回来。' },
]

const SLOT_ORDER = ['currentState', 'targetOutcome', 'primaryBlocker', 'energyLevel', 'availableMinutes']
const QUESTIONS = {
  currentState: ['先告诉我，刚刚发生了什么，或者你现在最明显的感觉是什么？', ['脑子很乱', '提不起劲', '一直在拖', '事情太多']],
  targetOutcome: ['如果这次收容只帮你推进一小步，你最想让哪件事动起来？', ['开始工作/学习', '完成一个小交付', '让自己平静一点', '理清下一步']],
  primaryBlocker: ['挡在起点前面的东西，更像下面哪一种？', ['怕做不好', '不知道从哪开始', '太累没电', '总被别的事打断']],
  energyLevel: ['收容员检查一下电量：你现在还有多少力气？', ['低电量', '一般般', '还有点劲']],
  availableMinutes: ['这次给小怪兽留多长时间？不需要逞强。', ['2分钟', '5分钟', '10分钟']],
}

const parseEnergy = (value) => /低|没电|累|疲惫/.test(value) ? 'low' : /高|有劲|有点劲|还有劲|精神/.test(value) ? 'high' : 'medium'
const parseMinutes = (value) => /2|两分钟/.test(value) ? 2 : /10|十分钟/.test(value) ? 10 : 5

const inferBlocker = (value) => {
  if (/完美|准备好|做不好|丢脸|评价|不敢/.test(value)) return '担心做不好或被评价'
  if (/不知道|迷茫|从哪|选择/.test(value)) return '不知道从哪一步开始'
  if (/累|没电|疲惫|加班|不想动/.test(value)) return '电量太低，很难启动'
  if (/忙|没时间|打断|消息|事情多/.test(value)) return '时间太碎，总被别的事打断'
  if (/焦虑|慌|压力|担心/.test(value)) return '担心太多，很难启动'
  if (/拖延|明天|以后|改天/.test(value)) return '启动时的不舒服被不断推迟'
  return undefined
}

const inferTarget = (value) => value.match(/(?:想|要|需要|准备|希望)(?:先)?(.{2,32}?)(?:，|。|但|可是|却|$)/)?.[1]?.trim()

const inferSlots = (message, slots, expectedSlot) => {
  const clean = String(message || '').trim().slice(0, 200)
  const patch = {}
  if (expectedSlot && clean) {
    patch[expectedSlot] = expectedSlot === 'energyLevel' ? parseEnergy(clean) : expectedSlot === 'availableMinutes' ? parseMinutes(clean) : clean.slice(0, 80)
  }
  if (!slots.currentState && !patch.currentState) patch.currentState = clean
  if (!slots.targetOutcome && !patch.targetOutcome) patch.targetOutcome = inferTarget(clean)
  if (!slots.primaryBlocker && !patch.primaryBlocker) patch.primaryBlocker = inferBlocker(clean)
  if (!slots.energyLevel && !patch.energyLevel && /低|没电|累|疲惫|一般|有劲|有点劲|还有劲|精神/.test(clean)) patch.energyLevel = parseEnergy(clean)
  if (!slots.availableMinutes && !patch.availableMinutes) patch.availableMinutes = parseMinutes(clean)
  return Object.fromEntries(Object.entries(patch).filter(([, value]) => value != null && value !== ''))
}

const fillDefaults = (slots) => ({
  currentState: slots.currentState || '我现在有点乱，也说不太清楚。',
  targetOutcome: slots.targetOutcome || '让眼前最重要的一件事向前一点',
  primaryBlocker: slots.primaryBlocker || '说不清，但启动起来有点难',
  energyLevel: slots.energyLevel || 'low',
  availableMinutes: slots.availableMinutes || 5,
})

const pickMonster = (slots) => {
  const text = Object.values(slots).join('').replace(/\s+/g, '')
  const scored = MONSTERS.map((monster) => ({ monster, score: monster.keywords.reduce((sum, word) => sum + (text.includes(word) ? word.length + 2 : 0), 0) })).sort((a, b) => b.score - a.score)
  return scored[0]?.score > 0 ? scored[0].monster : MONSTERS[7]
}

const makeTask = (monster, slots, kind) => {
  const seconds = kind === 'care' ? 120 : slots.availableMinutes === 2 ? 120 : slots.availableMinutes === 10 ? 600 : 300
  const target = String(slots.targetOutcome).replace(/[。！!？?]/g, '').slice(0, 18)
  return {
    id: `TASK-${Date.now()}`,
    kind,
    title: kind === 'care' ? '先把电量接回来一点' : `先推进：${target}`,
    rationale: kind === 'care' ? '现在不需要逼自己高效，先让注意力有一个落脚点。' : monster.excuseCrush,
    firstStep: monster.microAction,
    durationSeconds: seconds,
    completionCriterion: kind === 'care' ? '完成一个照顾动作，并感觉比刚才多一点选择。' : `留下一个与“${target}”有关、能够看见的结果。`,
  }
}

const safetyResult = () => ({
  phase: 'safety_handoff',
  reply: '听起来你正在承受很难熬的东西。现在先不要独自扛着，也不用继续做怪兽分析。',
  slotPatch: {},
  missingSlots: [],
  confidence: 1,
  action: {
    type: 'safety_handoff',
    safety: {
      title: '我很在意你现在的安全',
      body: '请尽快联系一位可信任的人陪在你身边。如果你可能马上伤害自己，请立即联系当地紧急服务或前往最近的急诊。',
      action: '先发一句：我现在不太安全，能陪陪我吗？',
    },
  },
})

const fallbackResponse = (event) => {
  const message = String(event.userMessage || '').trim().slice(0, 200)
  if (HIGH_RISK.test(message)) return safetyResult()
  const slotPatch = inferSlots(message, event.slots || {}, event.expectedSlot)
  let slots = { ...(event.slots || {}), ...slotPatch }
  let missingSlots = SLOT_ORDER.filter((slot) => slots[slot] == null || slots[slot] === '')
  if (event.forcePlan || Number(event.clarificationCount || 0) >= 4) {
    slots = fillDefaults(slots)
    Object.assign(slotPatch, slots)
    missingSlots = []
  }
  if (missingSlots.length) {
    const slot = missingSlots[0]
    return { phase: 'clarifying', reply: QUESTIONS[slot][0], slotPatch, missingSlots, confidence: 0.74, action: { type: 'ask_slot', slot, options: QUESTIONS[slot][1] } }
  }
  slots = fillDefaults(slots)
  Object.assign(slotPatch, slots)
  const monster = pickMonster(slots)
  const kind = monster.monsterType === '情绪类' ? 'care' : 'action'
  const task = makeTask(monster, slots, kind)
  return {
    phase: kind === 'care' ? 'care' : 'proposal',
    reply: kind === 'care' ? `我捕获到的是「${monster.monsterName}」。它现在更需要先被照顾。` : `抓到了，是「${monster.monsterName}」。我们先拿回一个小动作。`,
    slotPatch,
    missingSlots: [],
    confidence: 0.88,
    monster: { id: monster.id, slug: monster.slug, monsterName: monster.monsterName, monsterType: monster.monsterType, dangerLevel: monster.dangerLevel },
    action: { type: kind === 'care' ? 'offer_care' : 'propose_task', task },
  }
}

const isValid = (value) => value && typeof value.reply === 'string' && value.action && typeof value.action.type === 'string'

const requestModel = async (event, fallback) => {
  const apiKey = process.env.MODEL_API_KEY
  const apiUrl = process.env.MODEL_API_URL
  if (!apiKey || !apiUrl) return null
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.MODEL_NAME || 'default',
      response_format: { type: 'json_object' },
      temperature: 0.55,
      max_tokens: 240,
      messages: [
        { role: 'system', content: '你是心情怪兽收容所的紫色收容员。温柔60%、毒舌25%、可爱15%。只润色给定reply，不能改变phase、slotPatch、monster和action，不能做医疗诊断。只输出JSON：{"reply":"不超过60字"}。' },
        { role: 'user', content: JSON.stringify({ userMessage: event.userMessage, fallbackReply: fallback.reply, phase: fallback.phase }) },
      ],
    }),
  })
  if (!response.ok) throw new Error(`model request failed: ${response.status}`)
  const payload = await response.json()
  const content = payload.choices?.[0]?.message?.content
  const generated = typeof content === 'string' ? JSON.parse(content) : content
  if (typeof generated?.reply !== 'string') throw new Error('model reply schema invalid')
  return generated.reply.slice(0, 120)
}

exports.main = async (event = {}) => {
  const fallback = fallbackResponse(event)
  if (fallback.phase === 'safety_handoff') return fallback
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const reply = await requestModel(event, fallback)
      const candidate = reply ? { ...fallback, reply } : fallback
      if (isValid(candidate)) return candidate
    } catch (error) {
      if (attempt === 1) console.error('runActionAgent fallback:', error)
    }
  }
  return fallback
}

exports._test = { fallbackResponse, inferSlots, pickMonster }
