import anxietySpinner from '../assets/monsters/anxiety-spinner.png'
import busyHamster from '../assets/monsters/busy-hamster.png'
import collectorSquirrel from '../assets/monsters/collector-squirrel.png'
import comparisonOctopus from '../assets/monsters/comparison-octopus.png'
import defenseHedgehog from '../assets/monsters/defense-hedgehog.png'
import irritableRaccoon from '../assets/monsters/irritable-raccoon.png'
import lifeRebootGiant from '../assets/monsters/life-reboot-giant.png'
import tomorrowPigeon from '../assets/monsters/tomorrow-pigeon.png'
import overtimeJellyfish from '../assets/monsters/overtime-jellyfish.png'
import perfectionPolisher from '../assets/monsters/perfection-polisher.png'
import rainyDog from '../assets/monsters/rainy-dog.png'
import reviewHammer from '../assets/monsters/review-hammer.png'
import shameOstrich from '../assets/monsters/shame-ostrich.png'
import stuckPenguin from '../assets/monsters/stuck-penguin.png'
import threeMinuteFox from '../assets/monsters/three-minute-fox.png'
import toughCat from '../assets/monsters/tough-cat.png'

export type MonsterCategory = '情绪类' | '借口类' | '混合类'
export type DangerLevel = '低' | '中' | '中高' | '高'

export interface MonsterProfile {
  id: string
  slug: string
  monsterName: string
  shortName: string
  monsterType: MonsterCategory
  dangerLevel: DangerLevel
  catchphrase: string
  trueIdentity: string
  whyItAppears: string
  whatItProtects: string
  excuseCrush: string
  doNotFeed: string
  microAction: string
  image: string
  accent: string
  keywords: string[]
  cardText: {
    title: string
    subtitle: string
    line: string
  }
}

export const monsters: MonsterProfile[] = [
  {
    id: 'M-001', slug: 'rainy-dog', monsterName: '下雨小狗怪', shortName: '下雨小狗', monsterType: '情绪类', dangerLevel: '中',
    catchphrase: '我是不是很差劲？',
    trueIdentity: '它不是废物感，而是需要被安慰的疲惫感。',
    whyItAppears: '你已经撑了很久，脑内的小雨却把所有努力都淋得看不清。',
    whatItProtects: '它想让你先停一下，别再用苛刻的话催赶自己。',
    excuseCrush: '今天不用证明自己，只要照顾一下被雨淋湿的电量。',
    doNotFeed: '别继续刷那些让你觉得“别人都比我好”的内容。',
    microAction: '喝几口水，写下今天已经完成的一件小事。',
    image: rainyDog, accent: '#a9b9ff', keywords: ['好废', '不行', '难过', '委屈', '低落', '自责', '差劲'],
    cardText: { title: '今日心情怪兽', subtitle: '下雨小狗怪', line: '先把自己从小雨里抱回来' },
  },
  {
    id: 'M-002', slug: 'tough-cat', monsterName: '嘴硬猫猫怪', shortName: '嘴硬猫猫', monsterType: '情绪类', dangerLevel: '中',
    catchphrase: '没事，我真的没事。',
    trueIdentity: '它不是冷漠，而是害怕暴露自己的在意。',
    whyItAppears: '你担心说出真实感受会显得脆弱，所以先把尾巴竖成感叹号。',
    whatItProtects: '它在保护你不被忽视，也不被一句轻飘飘的话再次伤到。',
    excuseCrush: '承认“有点难受”不会输，只是把情绪从后台切回前台。',
    doNotFeed: '别再用“随便”“无所谓”替真正的感受打掩护。',
    microAction: '在备忘录写一句：我其实有点在意的是……',
    image: toughCat, accent: '#c3a7ff', keywords: ['没事', '无所谓', '随便', '不在乎', '嘴硬'],
    cardText: { title: '今日心情怪兽', subtitle: '嘴硬猫猫怪', line: '承认在意，也是一种勇敢' },
  },
  {
    id: 'M-003', slug: 'overtime-jellyfish', monsterName: '加班水母怪', shortName: '加班水母', monsterType: '情绪类', dangerLevel: '中高',
    catchphrase: '我还能再坚持一下。',
    trueIdentity: '它一直在发光，但电量已经很低。',
    whyItAppears: '任务和消息一层层叠上来，你只好靠硬撑维持“还能动”的样子。',
    whatItProtects: '它想守住你的责任感，不想让任何人失望。',
    excuseCrush: '发光不等于永动，低电量时完成收尾比继续硬撑更可靠。',
    doNotFeed: '别再新增一个“顺手做掉”的任务。',
    microAction: '关掉一个输入源，只收尾眼前最小的一件事。',
    image: overtimeJellyfish, accent: '#81d7ef', keywords: ['加班', '累', '硬撑', '坚持', '过载', '疲惫', '没电'],
    cardText: { title: '今日心情怪兽', subtitle: '加班水母怪', line: '低电量也值得被温柔关机' },
  },
  {
    id: 'M-004', slug: 'irritable-raccoon', monsterName: '暴躁浣熊怪', shortName: '暴躁浣熊', monsterType: '情绪类', dangerLevel: '中高',
    catchphrase: '别烦我。',
    trueIdentity: '它不是讨厌所有人，是你的大脑今天太吵了。',
    whyItAppears: '通知、声音和待办挤在同一条通道里，耐心已经排队下班。',
    whatItProtects: '它试图替你把过量输入挡在门外。',
    excuseCrush: '先降噪，不必在大脑最拥挤的时候解决所有关系。',
    doNotFeed: '暂停无意义的消息刷新和情绪对线。',
    microAction: '静音一个群聊，离开屏幕站三分钟。',
    image: irritableRaccoon, accent: '#ffb8a6', keywords: ['烦', '暴躁', '生气', '别烦', '吵', '易怒'],
    cardText: { title: '今日心情怪兽', subtitle: '暴躁浣熊怪', line: '先给世界按三分钟静音' },
  },
  {
    id: 'M-005', slug: 'stuck-penguin', monsterName: '原地企鹅怪', shortName: '原地企鹅', monsterType: '情绪类', dangerLevel: '中',
    catchphrase: '我想改变，但不知道从哪开始。',
    trueIdentity: '它不是不想走，是选择太多导致冻结。',
    whyItAppears: '每条路都像重要决定，于是两只小脚一起粘在了起点。',
    whatItProtects: '它想避免选错，可也暂时挡住了任何微小进展。',
    excuseCrush: '这一步不用通往完美终点，只需要离开原地一厘米。',
    doNotFeed: '先别制作一张覆盖未来三年的路线图。',
    microAction: '从所有选项里圈出一个今天能做五分钟的动作。',
    image: stuckPenguin, accent: '#9ac9ff', keywords: ['迷茫', '不知道', '动不了', '从哪开始', '选择', '方向'],
    cardText: { title: '今日心情怪兽', subtitle: '原地企鹅怪', line: '不选终点，只选下一步' },
  },
  {
    id: 'M-006', slug: 'defense-hedgehog', monsterName: '刺猬防御怪', shortName: '防御刺猬', monsterType: '情绪类', dangerLevel: '中',
    catchphrase: '反正别人也不会懂。',
    trueIdentity: '它不是攻击性强，是太怕受伤。',
    whyItAppears: '你预感到否定可能靠近，便提前竖起了所有小刺。',
    whatItProtects: '它守着那个很想被理解、又怕希望落空的部分。',
    excuseCrush: '不是每次表达都要变成辩论，先把问题放到纸上。',
    doNotFeed: '不要在脑内替所有人预演最坏的回答。',
    microAction: '写下真正困扰你的一句话，暂时不用发出。',
    image: defenseHedgehog, accent: '#dec39f', keywords: ['不会懂', '防御', '否定', '受伤', '攻击', '反正'],
    cardText: { title: '今日心情怪兽', subtitle: '刺猬防御怪', line: '刺可以休息，你仍然安全' },
  },
  {
    id: 'M-007', slug: 'busy-hamster', monsterName: '伪忙碌仓鼠怪', shortName: '伪忙碌仓鼠', monsterType: '借口类', dangerLevel: '中高',
    catchphrase: '我没时间。',
    trueIdentity: '用忙碌感替代进展感。',
    whyItAppears: '小事不断滚进跑轮，关键任务就一直在笼子外等。',
    whatItProtects: '它让你保持“我很努力”的安全感，避开真正重要的难题。',
    excuseCrush: '不是完全没时间，是完整时间块迟迟没有出现。',
    doNotFeed: '别先整理工具、清空邮箱、重做待办系统。',
    microAction: '给关键任务一个八分钟倒计时，只推进一步。',
    image: busyHamster, accent: '#f4c18c', keywords: ['没时间', '很忙', '忙了一天', '没进展', '事情好多', '排不开'],
    cardText: { title: '今日借口怪兽', subtitle: '伪忙碌仓鼠怪', line: '抓住八分钟，不等完整下午' },
  },
  {
    id: 'M-008', slug: 'perfection-polisher', monsterName: '完美主义打磨怪', shortName: '打磨怪', monsterType: '借口类', dangerLevel: '中高',
    catchphrase: '等我准备好了再开始。',
    trueIdentity: '用准备感逃避被评价。',
    whyItAppears: '你担心第一版不够好，所以把发布键擦得越来越亮。',
    whatItProtects: '它想保护你不被否定，只是顺手把交付也藏了起来。',
    excuseCrush: '作品不是憋出来的，是从一个丑丑的 v0 迭代出来的。',
    doNotFeed: '不要再搜第 29 个优秀案例了。',
    microAction: '打开文档，只写标题和第一句话。',
    image: perfectionPolisher, accent: '#b9a4ff', keywords: ['没准备好', '准备好了', '再学', '再优化', '完美', '作品集', '第一版'],
    cardText: { title: '今日借口怪兽', subtitle: '完美主义打磨怪', line: '先做一个丑丑的 v0' },
  },
  {
    id: 'M-009', slug: 'tomorrow-pigeon', monsterName: '明日鸽子怪', shortName: '明日鸽子', monsterType: '借口类', dangerLevel: '中',
    catchphrase: '明天一定开始。',
    trueIdentity: '把责任外包给明天的自己。',
    whyItAppears: '今天的阻力被想象得很大，明天却总像一张干净的新纸。',
    whatItProtects: '它让你暂时不用面对启动时那一点不舒服。',
    excuseCrush: '明天的你没有多一双手，只会多收到一份延期包裹。',
    doNotFeed: '不要再写“明早开始”的豪华计划。',
    microAction: '现在做一分钟：打开文件、摆好材料或写下第一词。',
    image: tomorrowPigeon, accent: '#a8c9e9', keywords: ['明天', '下次', '改天', '以后', '再说', '拖到'],
    cardText: { title: '今日借口怪兽', subtitle: '明日鸽子怪', line: '别寄给明天，今天拆一角' },
  },
  {
    id: 'M-010', slug: 'collector-squirrel', monsterName: '收藏松鼠怪', shortName: '收藏松鼠', monsterType: '借口类', dangerLevel: '中',
    catchphrase: '我先存一下。',
    trueIdentity: '用囤积信息制造掌控感。',
    whyItAppears: '每个链接都像一颗未来会用到的坚果，仓库却已经打不开门。',
    whatItProtects: '它让你感觉自己没有错过任何机会和知识。',
    excuseCrush: '收藏不是吸收，仓库变大也不会自动长出能力。',
    doNotFeed: '今天暂停新增收藏。',
    microAction: '打开一个旧收藏，只摘出三个能复述的观点。',
    image: collectorSquirrel, accent: '#efb685', keywords: ['收藏', '存一下', '资料', '教程', '链接', '稍后看'],
    cardText: { title: '今日借口怪兽', subtitle: '收藏松鼠怪', line: '少存一颗，多吃一口' },
  },
  {
    id: 'M-011', slug: 'shame-ostrich', monsterName: '怕丢脸鸵鸟怪', shortName: '怕丢脸鸵鸟', monsterType: '借口类', dangerLevel: '中高',
    catchphrase: '现在还不是好时机。',
    trueIdentity: '它不是没兴趣，是怕别人说你不行。',
    whyItAppears: '你把所有可能的评价都提前搬到了现场，只好先把头藏起来。',
    whatItProtects: '它在保护自尊，不想让尚未成熟的尝试被围观。',
    excuseCrush: '不必一上来就面对全世界，先让一个安全的人看见。',
    doNotFeed: '不要把一次小尝试想象成公开审判。',
    microAction: '把草稿发给一个可信任的人，只问一个具体问题。',
    image: shameOstrich, accent: '#f2c4bb', keywords: ['丢脸', '别人怎么看', '时机', '被评价', '不敢发', '害怕'],
    cardText: { title: '今日借口怪兽', subtitle: '怕丢脸鸵鸟怪', line: '先给一个安全的人看' },
  },
  {
    id: 'M-012', slug: 'three-minute-fox', monsterName: '三分钟热度狐狸怪', shortName: '热度狐狸', monsterType: '借口类', dangerLevel: '中',
    catchphrase: '我好像又没兴趣了。',
    trueIdentity: '喜欢新鲜感，不喜欢重复劳动。',
    whyItAppears: '启动时的烟花散去后，普通的重复让尾巴也跟着没精打采。',
    whatItProtects: '它想把你留在轻松、有趣、不会失败的新鲜阶段。',
    excuseCrush: '兴趣负责点火，流程才负责把小锅烧开。',
    doNotFeed: '别急着换一套新工具或新目标。',
    microAction: '把任务缩成一个无需热情也能完成的五分钟动作。',
    image: threeMinuteFox, accent: '#ffb27f', keywords: ['没兴趣', '三分钟热度', '坚持不了', '放弃', '新鲜感', '又换'],
    cardText: { title: '今日借口怪兽', subtitle: '三分钟热度狐狸怪', line: '热情下班，流程接班' },
  },
  {
    id: 'M-013', slug: 'anxiety-spinner', monsterName: '焦虑转圈怪', shortName: '焦虑转圈', monsterType: '混合类', dangerLevel: '高',
    catchphrase: '我好慌，但我动不了。',
    trueIdentity: '大脑同时踩着油门和刹车。',
    whyItAppears: '问题在脑内同时举手，注意力只好绕着它们不停转圈。',
    whatItProtects: '它想提前排除所有风险，免得你走错任何一步。',
    excuseCrush: '今天不解决全部焦虑，只给最小问题一个出口。',
    doNotFeed: '别继续把所有可能性一次性列满。',
    microAction: '写下最担心的一件事，再写一个五分钟内能做的动作。',
    image: anxietySpinner, accent: '#bf9df4', keywords: ['焦虑', '好慌', '慌', '动不了', '担心', '压力', '转圈'],
    cardText: { title: '今日混合怪兽', subtitle: '焦虑转圈怪', line: '只处理眼前最小的问题' },
  },
  {
    id: 'M-014', slug: 'review-hammer', monsterName: '复盘锤子怪', shortName: '复盘锤子', monsterType: '混合类', dangerLevel: '中高',
    catchphrase: '我要不要再想清楚一点？',
    trueIdentity: '用分析代替行动。',
    whyItAppears: '每个念头刚冒出来，就被一把小锤子敲成十个新问题。',
    whatItProtects: '它想让你通过想清楚来避开失误和失控。',
    excuseCrush: '分析已经够用了，下一条证据需要从行动里拿。',
    doNotFeed: '暂停新增框架、表格和复盘维度。',
    microAction: '设五分钟计时器，做一个能产生真实反馈的动作。',
    image: reviewHammer, accent: '#ffd27f', keywords: ['复盘', '想清楚', '分析', '再想想', '纠结', '框架'],
    cardText: { title: '今日混合怪兽', subtitle: '复盘锤子怪', line: '暂停分析，先行动五分钟' },
  },
  {
    id: 'M-015', slug: 'comparison-octopus', monsterName: '比较章鱼怪', shortName: '比较章鱼', monsterType: '混合类', dangerLevel: '中高',
    catchphrase: '为什么别人都比我快？',
    trueIdentity: '它有八只手，每只都在刷新别人的进度。',
    whyItAppears: '别人的高光从八个方向同时涌来，你自己的进度就显得很安静。',
    whatItProtects: '它想用比较替你校准方向，却忘了每个人的地图并不相同。',
    excuseCrush: '别人的进度条不能替你完成今天这一格。',
    doNotFeed: '暂停刷让你不断横向比较的动态。',
    microAction: '只记录自己今天向前的一厘米，并把它打勾。',
    image: comparisonOctopus, accent: '#c8a3ff', keywords: ['别人', '比较', '比我快', '不如', '进度', '羡慕'],
    cardText: { title: '今日混合怪兽', subtitle: '比较章鱼怪', line: '只记录自己的这一厘米' },
  },
  {
    id: 'M-016', slug: 'life-reboot-giant', monsterName: '重启人生巨兽', shortName: '重启人生', monsterType: '混合类', dangerLevel: '高',
    catchphrase: '我要不要换城市、换工作、换人生？',
    trueIdentity: '它不是人生规划，是深夜低电量误判。',
    whyItAppears: '疲惫把眼前的困难放得像山一样大，于是彻底重启看起来反而更轻松。',
    whatItProtects: '它想替你迅速逃离消耗感，重新获得掌控。',
    excuseCrush: '重大决定可以等电量回来，今晚只关掉一个耗电程序。',
    doNotFeed: '深夜不写辞职信，也不做不可逆决定。',
    microAction: '把想重启的念头记下来，睡醒后只找一个可微调的点。',
    image: lifeRebootGiant, accent: '#8fa6df', keywords: ['重启人生', '换工作', '换城市', '辞职', '推翻', '不想活成这样'],
    cardText: { title: '今日混合怪兽', subtitle: '重启人生巨兽', line: '今晚不重启，先给电量充电' },
  },
]

export const defaultMonster = monsters.find((monster) => monster.slug === 'perfection-polisher')!

export const featuredMonsters = [
  monsters.find((monster) => monster.slug === 'anxiety-spinner')!,
  monsters.find((monster) => monster.slug === 'overtime-jellyfish')!,
  monsters.find((monster) => monster.slug === 'perfection-polisher')!,
  monsters.find((monster) => monster.slug === 'irritable-raccoon')!,
]

export const findMonsterBySlug = (slug?: string) => monsters.find((monster) => monster.slug === slug) ?? defaultMonster
