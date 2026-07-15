const REQUIRED_FIELDS = [
  'catchphrase', 'trueIdentity', 'whyItAppears', 'whatItProtects',
  'excuseCrush', 'doNotFeed', 'microAction', 'cardText',
]

const MONSTERS = [
  { id: 'M-001', monsterName: '下雨小狗怪', monsterType: '情绪类', dangerLevel: '中', keywords: ['好废', '不行', '难过', '委屈', '低落', '自责'], catchphrase: '我是不是很差劲？', trueIdentity: '它不是废物感，而是需要被安慰的疲惫感。', whyItAppears: '你已经撑了很久，只是暂时看不见自己的努力。', whatItProtects: '它想让你先停一下，不再苛责自己。', excuseCrush: '今天不用证明自己，只要照顾一下被雨淋湿的电量。', doNotFeed: '别继续刷让你觉得别人都更好的内容。', microAction: '喝几口水，写下今天已经完成的一件小事。' },
  { id: 'M-002', monsterName: '嘴硬猫猫怪', monsterType: '情绪类', dangerLevel: '中', keywords: ['没事', '无所谓', '随便', '不在乎'], catchphrase: '没事，我真的没事。', trueIdentity: '它不是冷漠，而是害怕暴露自己的在意。', whyItAppears: '你担心真实感受被轻轻放下。', whatItProtects: '它在保护那个很想被认真听见的部分。', excuseCrush: '承认有点难受不会输。', doNotFeed: '别再用无所谓替感受打掩护。', microAction: '在备忘录写一句：我其实有点在意的是……' },
  { id: 'M-003', monsterName: '加班水母怪', monsterType: '情绪类', dangerLevel: '中高', keywords: ['加班', '累', '硬撑', '坚持', '过载'], catchphrase: '我还能再坚持一下。', trueIdentity: '它一直在发光，但电量已经很低。', whyItAppears: '任务和消息叠在一起，你只好靠硬撑。', whatItProtects: '它想守住你的责任感。', excuseCrush: '低电量时完成收尾比继续硬撑更可靠。', doNotFeed: '别再新增一个顺手任务。', microAction: '关掉一个输入源，只收尾最小的一件事。' },
  { id: 'M-004', monsterName: '暴躁浣熊怪', monsterType: '情绪类', dangerLevel: '中高', keywords: ['烦', '暴躁', '生气', '别烦', '吵'], catchphrase: '别烦我。', trueIdentity: '它不是讨厌所有人，是你的大脑今天太吵了。', whyItAppears: '过量输入挤走了耐心。', whatItProtects: '它试图替你挡住更多噪音。', excuseCrush: '先降噪，再沟通。', doNotFeed: '暂停无意义的消息刷新。', microAction: '静音一个群聊，离开屏幕三分钟。' },
  { id: 'M-005', monsterName: '原地企鹅怪', monsterType: '情绪类', dangerLevel: '中', keywords: ['迷茫', '不知道', '动不了', '从哪开始'], catchphrase: '我想改变，但不知道从哪开始。', trueIdentity: '它不是不想走，是选择太多导致冻结。', whyItAppears: '每条路都像重大决定。', whatItProtects: '它想避免选错。', excuseCrush: '这一步不用通往完美终点。', doNotFeed: '先别做三年路线图。', microAction: '圈出一个今天能做五分钟的动作。' },
  { id: 'M-006', monsterName: '刺猬防御怪', monsterType: '情绪类', dangerLevel: '中', keywords: ['不会懂', '防御', '否定', '受伤'], catchphrase: '反正别人也不会懂。', trueIdentity: '它不是攻击性强，是太怕受伤。', whyItAppears: '你预感否定可能靠近。', whatItProtects: '它守着那个很想被理解的部分。', excuseCrush: '不是每次表达都要变成辩论。', doNotFeed: '不要预演所有最坏回答。', microAction: '写下真正困扰你的一句话。' },
  { id: 'M-007', monsterName: '伪忙碌仓鼠怪', monsterType: '借口类', dangerLevel: '中高', keywords: ['没时间', '很忙', '没进展', '事情好多'], catchphrase: '我没时间。', trueIdentity: '用忙碌感替代进展感。', whyItAppears: '小事滚进跑轮，关键任务被留在外面。', whatItProtects: '它让你保有我很努力的安全感。', excuseCrush: '不是完全没时间，是完整时间块迟迟没有出现。', doNotFeed: '别先整理工具和待办系统。', microAction: '给关键任务一个八分钟倒计时。' },
  { id: 'M-008', monsterName: '完美主义打磨怪', monsterType: '借口类', dangerLevel: '中高', keywords: ['没准备好', '准备好了', '再学', '再优化', '完美', '作品集'], catchphrase: '等我准备好了再开始。', trueIdentity: '用准备感逃避被评价。', whyItAppears: '你担心第一版不够好。', whatItProtects: '它想保护你不被否定。', excuseCrush: '作品不是憋出来的，是迭代出来的。', doNotFeed: '不要再搜第 29 个优秀案例了。', microAction: '打开文档，只写标题和第一句话。' },
  { id: 'M-009', monsterName: '明日鸽子怪', monsterType: '借口类', dangerLevel: '中', keywords: ['明天', '下次', '改天', '以后'], catchphrase: '明天一定开始。', trueIdentity: '把责任外包给明天的自己。', whyItAppears: '今天的阻力被想象得很大。', whatItProtects: '它让你暂时不用面对启动的不适。', excuseCrush: '明天的你没有多一双手。', doNotFeed: '不要再写明早开始的豪华计划。', microAction: '现在做一分钟启动动作。' },
  { id: 'M-010', monsterName: '收藏松鼠怪', monsterType: '借口类', dangerLevel: '中', keywords: ['收藏', '存一下', '资料', '教程', '链接'], catchphrase: '我先存一下。', trueIdentity: '用囤积信息制造掌控感。', whyItAppears: '每个链接都像未来会用到的坚果。', whatItProtects: '它让你感觉没有错过机会。', excuseCrush: '收藏不是吸收。', doNotFeed: '今天暂停新增收藏。', microAction: '打开一个旧收藏，只摘三个观点。' },
  { id: 'M-011', monsterName: '怕丢脸鸵鸟怪', monsterType: '借口类', dangerLevel: '中高', keywords: ['丢脸', '别人怎么看', '时机', '被评价', '不敢发'], catchphrase: '现在还不是好时机。', trueIdentity: '它不是没兴趣，是怕别人说你不行。', whyItAppears: '你提前搬来了所有可能的评价。', whatItProtects: '它在保护自尊。', excuseCrush: '先让一个安全的人看见。', doNotFeed: '不要把小尝试想成公开审判。', microAction: '把草稿发给一个可信任的人。' },
  { id: 'M-012', monsterName: '三分钟热度狐狸怪', monsterType: '借口类', dangerLevel: '中', keywords: ['没兴趣', '三分钟热度', '坚持不了', '放弃'], catchphrase: '我好像又没兴趣了。', trueIdentity: '喜欢新鲜感，不喜欢重复劳动。', whyItAppears: '启动烟花散去后，重复显得无聊。', whatItProtects: '它想把你留在轻松的新鲜阶段。', excuseCrush: '兴趣负责点火，流程负责持续。', doNotFeed: '别急着换一套新工具。', microAction: '缩成一个不用热情也能完成的动作。' },
  { id: 'M-013', monsterName: '焦虑转圈怪', monsterType: '混合类', dangerLevel: '高', keywords: ['焦虑', '好慌', '慌', '动不了', '担心'], catchphrase: '我好慌，但我动不了。', trueIdentity: '大脑同时踩着油门和刹车。', whyItAppears: '问题在脑内同时举手。', whatItProtects: '它想提前排除所有风险。', excuseCrush: '今天不解决全部焦虑。', doNotFeed: '别把所有可能性一次列满。', microAction: '写下最担心的一件事和一个小动作。' },
  { id: 'M-014', monsterName: '复盘锤子怪', monsterType: '混合类', dangerLevel: '中高', keywords: ['复盘', '想清楚', '分析', '再想想', '纠结'], catchphrase: '我要不要再想清楚一点？', trueIdentity: '用分析代替行动。', whyItAppears: '每个念头都被敲成十个新问题。', whatItProtects: '它想避开失误。', excuseCrush: '下一条证据需要从行动里拿。', doNotFeed: '暂停新增框架和表格。', microAction: '做一个能产生真实反馈的动作。' },
  { id: 'M-015', monsterName: '比较章鱼怪', monsterType: '混合类', dangerLevel: '中高', keywords: ['别人', '比较', '比我快', '不如', '进度'], catchphrase: '为什么别人都比我快？', trueIdentity: '它有八只手，每只都在刷新别人的进度。', whyItAppears: '别人的高光从多个方向涌来。', whatItProtects: '它想替你校准方向。', excuseCrush: '别人的进度条不能替你完成这一格。', doNotFeed: '暂停横向比较的动态。', microAction: '记录自己今天向前的一厘米。' },
  { id: 'M-016', monsterName: '重启人生巨兽', monsterType: '混合类', dangerLevel: '高', keywords: ['重启人生', '换工作', '换城市', '辞职', '推翻'], catchphrase: '我要不要换城市、换工作、换人生？', trueIdentity: '它不是人生规划，是深夜低电量误判。', whyItAppears: '疲惫把眼前困难放得很大。', whatItProtects: '它想替你迅速逃离消耗感。', excuseCrush: '重大决定可以等电量回来。', doNotFeed: '深夜不做不可逆决定。', microAction: '记下念头，睡醒后找一个可微调的点。' },
]

const HIGH_RISK = /自杀|轻生|结束生命|不想活|活不下去|割腕|跳楼|伤害自己|没有活着的意义/

const pickMonster = (inputText) => {
  const normalized = inputText.replace(/\s+/g, '')
  return MONSTERS
    .map((monster) => ({ monster, score: monster.keywords.reduce((score, keyword) => score + (normalized.includes(keyword) ? keyword.length + 2 : 0), 0) }))
    .sort((a, b) => b.score - a.score)[0]?.monster || MONSTERS[7]
}

const fallbackResult = (monster, inputText) => ({
  ...monster,
  slug: monster.id.toLowerCase(),
  shortName: monster.monsterName.replace(/怪$/, ''),
  accent: '#b197fc',
  image: '',
  inputText,
  capturedAt: Date.now(),
  collectionId: `MM-${Date.now()}`,
  cardText: { title: '今日心情怪兽', subtitle: monster.monsterName, line: monster.excuseCrush },
})

const isValid = (value) => value && REQUIRED_FIELDS.every((field) => value[field]) && value.cardText?.title && value.cardText?.subtitle && value.cardText?.line

const requestModel = async (monster, inputText) => {
  const apiKey = process.env.MODEL_API_KEY
  const apiUrl = process.env.MODEL_API_URL
  if (!apiKey || !apiUrl) return null

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.MODEL_NAME || 'default',
      response_format: { type: 'json_object' },
      temperature: 0.75,
      max_tokens: 700,
      messages: [
        { role: 'system', content: '你是心情怪兽收容所文案 Agent。语气温柔60%、毒舌25%、可爱15%。禁止医疗或心理诊断。只输出 JSON，不改变给定怪兽名称。' },
        { role: 'user', content: JSON.stringify({ inputText, fixedMonster: monster.monsterName, requiredFields: REQUIRED_FIELDS }) },
      ],
    }),
  })
  if (!response.ok) throw new Error(`model request failed: ${response.status}`)
  const payload = await response.json()
  const content = payload.choices?.[0]?.message?.content
  return typeof content === 'string' ? JSON.parse(content) : content
}

exports.main = async (event = {}) => {
  const inputText = String(event.inputText || '').trim().slice(0, 200)
  if (!inputText) throw new Error('inputText is required')

  if (HIGH_RISK.test(inputText)) {
    return {
      ...fallbackResult(MONSTERS[0], inputText),
      safety: {
        title: '我很在意你现在的安全',
        body: '请尽快联系一位可信任的人陪在你身边。如果你可能马上伤害自己，请立即联系当地紧急服务或前往最近的急诊。',
        action: '先发一句：我现在不太安全，能陪陪我吗？',
      },
    }
  }

  const monster = pickMonster(inputText)
  const fallback = fallbackResult(monster, inputText)

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const generated = await requestModel(monster, inputText)
      if (!generated) return fallback
      const candidate = { ...fallback, ...generated, monsterName: monster.monsterName, monsterType: monster.monsterType, dangerLevel: monster.dangerLevel }
      if (isValid(candidate)) return candidate
    } catch (error) {
      if (attempt === 1) console.error('analyzeMood fallback:', error)
    }
  }

  return fallback
}
