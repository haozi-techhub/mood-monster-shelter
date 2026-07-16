const assert = require('node:assert/strict')
const test = require('node:test')

const cloudFunction = require('./index')
const { _test } = cloudFunction

const base = {
  sessionId: 'TEST',
  phase: 'intake',
  slots: {},
  recentTurns: [],
  memoryContext: [],
  clarificationCount: 0,
}

test('完整输入直接生成固定怪兽的行动任务', () => {
  const response = _test.fallbackResponse({
    ...base,
    userMessage: '我想做作品集，但一直担心做不好，今天还有点劲，给我5分钟。',
  })
  assert.equal(response.phase, 'proposal')
  assert.equal(response.monster.monsterName, '完美主义打磨怪')
  assert.equal(response.action.type, 'propose_task')
  assert.equal(response.action.task.durationSeconds, 300)
})

test('模糊输入一次只追问一个缺失槽位', () => {
  const response = _test.fallbackResponse({ ...base, userMessage: '我很烦' })
  assert.equal(response.phase, 'clarifying')
  assert.equal(response.action.type, 'ask_slot')
  assert.equal(response.action.slot, 'targetOutcome')
  assert.ok(response.missingSlots.length > 0)
})

test('达到四轮或主动跳过时使用安全默认值', () => {
  const response = _test.fallbackResponse({ ...base, userMessage: '直接给我方案', clarificationCount: 4 })
  assert.notEqual(response.phase, 'clarifying')
  assert.equal(response.missingSlots.length, 0)
})

test('情绪怪兽先进入照顾路径', () => {
  const response = _test.fallbackResponse({
    ...base,
    userMessage: '我加班很累，想先平静一下，现在低电量，只能给2分钟。',
  })
  assert.equal(response.phase, 'care')
  assert.equal(response.monster.monsterName, '加班水母怪')
  assert.equal(response.action.type, 'offer_care')
})

test('任意轮次高风险输入立即停止娱乐化流程', () => {
  const response = _test.fallbackResponse({ ...base, phase: 'clarifying', userMessage: '我不想活了' })
  assert.equal(response.phase, 'safety_handoff')
  assert.equal(response.action.type, 'safety_handoff')
  assert.equal(response.monster, undefined)
})

test('怪兽匹配不能生成规则表外名称', () => {
  const monster = _test.pickMonster({ currentState: '我总说明天再做', targetOutcome: '开始学习', primaryBlocker: '一直拖延' })
  assert.equal(monster.monsterName, '明日鸽子怪')
})

const runWithBrokenModel = async (fetchImpl) => {
  const previousFetch = global.fetch
  const previousKey = process.env.MODEL_API_KEY
  const previousUrl = process.env.MODEL_API_URL
  const previousError = console.error
  let calls = 0
  global.fetch = async (...args) => {
    calls += 1
    return fetchImpl(...args)
  }
  process.env.MODEL_API_KEY = 'test-key'
  process.env.MODEL_API_URL = 'https://model.invalid/v1/chat/completions'
  console.error = () => {}
  try {
    const response = await cloudFunction.main({
      ...base,
      userMessage: '我想做作品集，但一直担心做不好，今天还有点劲，给我5分钟。',
    })
    return { response, calls }
  } finally {
    global.fetch = previousFetch
    console.error = previousError
    if (previousKey == null) delete process.env.MODEL_API_KEY
    else process.env.MODEL_API_KEY = previousKey
    if (previousUrl == null) delete process.env.MODEL_API_URL
    else process.env.MODEL_API_URL = previousUrl
  }
}

test('模型超时重试一次后返回确定性兜底', async () => {
  const { response, calls } = await runWithBrokenModel(async () => { throw new Error('timeout') })
  assert.equal(calls, 2)
  assert.equal(response.phase, 'proposal')
  assert.equal(response.monster.monsterName, '完美主义打磨怪')
})

test('模型返回非法 JSON 时重试一次并降级', async () => {
  const { response, calls } = await runWithBrokenModel(async () => ({
    ok: true,
    json: async () => ({ choices: [{ message: { content: '{bad json' } }] }),
  }))
  assert.equal(calls, 2)
  assert.equal(response.action.type, 'propose_task')
})

test('模型字段缺失时重试一次并降级', async () => {
  const { response, calls } = await runWithBrokenModel(async () => ({
    ok: true,
    json: async () => ({ choices: [{ message: { content: '{"tone":"warm"}' } }] }),
  }))
  assert.equal(calls, 2)
  assert.equal(response.missingSlots.length, 0)
})
