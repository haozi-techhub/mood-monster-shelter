# 心情怪兽收容所 · 桌面设计资产基线

日期：2026-08-26。资产来源是用户当前项目，不从公开网络寻找同名产品。正文规范仍以 `doc/mood-monster-visual-design-guidelines-v0.1.md` 为准；本文件只记录三方向探索的共同输入。

## 已有事实与资产

- 品牌标题：`src/assets/brand/home-wordmark.png`，760×565 透明 PNG。必须使用原图、保持比例，不重画、不改色。首页保留字标、副标题、紫色收容员与气泡的关联。
- 固定收容员：`src/assets/monsters/shelter-guide.png`。角色是产品识别点，不能改成通用图标或 CSS 画脸。
- 16 只怪兽：`src/data/monsters.ts` 和 `src/assets/monsters/`。名称、类别、台词从规则表读取，不增加新怪兽。
- 原创导航：`src/assets/icons/nav/`。沿用同一资产族，不引入 emoji 导航。
- 视觉参考：`stitch_ui/_9/screen.png` 已查看，它是风格参考，不是已完成界面的验收证据；其中人气数字不迁移。
- 当前运行代码：`src/pages/index/`、`src/pages/agent/` 与 `src/components/`。Taro + React + TypeScript + Less 不变。
- 新增场景：`src/assets/scenes/shelter-room-v1.png`（1024×1536），2026-08-26 使用内置 imagegen 生成，只是环境背景，不含新增角色；B 设计初稿叠加原紫色收容员。完整提示词见 `design-demos/generated-assets.md`。

## 颜色与字型

从 `src/app.less` 和现有规范确认六个主要色：奶油白 `#fffaf2`、深紫墨 `#2b1648`、次文字 `#665873`、薰衣草 `#b197fc`、交互紫 `#7049cf`、薄荷绿 `#a5efd2`。白色作为卡片底色；淡紫表面由品牌紫与白混合，不临时换品牌色。按钮保留有层次的紫色玻璃感，按钮文字使用深紫以保证浅色高光上的可读性。

品牌 display 是 PNG，不依赖字体。正文沿用 PingFang SC / Microsoft YaHei / 系统无衬线；C 方向只在非品牌的情绪标题使用本地 Songti SC / STSong 衬线，正文不变。计时使用等宽系统字体。无第三方字体请求，避免字体加载造成布局跳动。

## 三方向共同禁区

不重绘品牌、不新造怪兽、不使用虚构用户统计、不增加诊断词、不用普通表格后台代替陪伴空间、不把前端原型接入模型、不读取密钥、不以隐藏溢出掩盖内容不可访问。低对比装饰不能承载信息。

图片直接内嵌到设计 HTML，文件移动后仍可打开；原始素材不修改。正式 Taro 实现将在方向确认后继续复用原路径。
