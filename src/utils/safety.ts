const highRiskPatterns = [
  /自杀|轻生|结束生命|不想活|活不下去|去死|割腕|跳楼|上吊|服药自尽|伤害自己/,
  /没有活着的意义|活着没意思|彻底消失|永远醒不过来/,
]

export const isHighRiskInput = (value: string) => highRiskPatterns.some((pattern) => pattern.test(value.trim()))

export const safetyMessage = {
  title: '我很在意你现在的安全',
  body: '听起来你正在承受很难熬的东西。现在先不要独自扛着，也不用继续做怪兽分析。请尽快联系一位你信任的人，让对方陪在你身边；如果你可能马上伤害自己，请立即联系当地紧急服务或前往最近的急诊。',
  action: '先给可信任的人发一句：我现在不太安全，能陪陪我吗？',
}
