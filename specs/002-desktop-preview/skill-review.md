# Design Skills 来源与安装审阅

日期：2026-08-26。先用 ego-browser 审阅公开来源，再用 skill-installer 安装固定提交。本文件不是完整安全审计。

## 最新安装记录

用户在风险说明后明确回复：「允许安装」。此前审批阻碍已解除；以下安装已成功，目录和完整主文档均已实际读取。

| Skill | 固定提交 | 安装目录 | 实际核验 |
|---|---|---|---|
| Huashu Design | `a790f704d85f277cc93d2081b0840d00036969bb` | `/Users/haozi/.codex/skills/huashu-design` | 主文档与 assets / references / scripts / demos 全部存在 |
| UI/UX Pro Max | `e4f45473691e4b389519ee4bc359a3d6df666c26` | `/Users/haozi/.codex/skills/ui-ux-pro-max` | data / scripts / references 是完整目录；本地检索实际执行成功 |
| Frontend Design | `3b3fad96af16a10759d930941b4520ba0c40edae` | `/Users/haozi/.codex/skills/frontend-design` | SKILL.md 与 LICENSE.txt 存在，主文档已读 |

SKILL.md SHA-256：Huashu `6cdcaef51dda726ad2eaeea66248c373ecbda7f64c067fcae667444a5a9c1089`；UI/UX `ea087c341bfb5b23195c7302027268ede86da802554c18a5c4896a6017b439f9`；Frontend `1608ea77fbb6fc30d13a97d12cfa8ebf31358d40f0dd97beed24829d6b3f45dd`。

使用证据：`design-demos/design-brief.md`、`brand-spec.md`、三份 HTML 设计初稿及生成器。UI/UX 的本地 search.py、core.py、design_system.py 入口/import/I/O 已检查，执行时使用 `-B` 且不使用 `--persist`；未运行云端脚本、未安装 Hook/额外 CLI/其他 Skills、未读取或上传密钥。新 Skill 会在下一轮可用列表中出现，本轮直接读取安装文件应用。以下保留安装前的审阅历史，不代表当前仍待授权。

## 请求范围与当前状态

用户要求先安装 Huashu Design、UI/UX Pro Max、Frontend Design，再用于电脑端单屏产品设计。此前 Huashu 的持久安装请求被安全审批拒绝；已向用户说明第三方 Skill 会影响后续 Agent 指令与脚本执行，等待明确确认。没有重试被拒绝的安装，没有通过其他目录或工具绕过审批。

| 项目 | 已核验来源 | 只读发现 | 安装状态 |
|---|---|---|---|
| Huashu Design | [alchaincyf/huashu-design](https://github.com/alchaincyf/huashu-design)；`master` 根目录 `SKILL.md` | 完整包依赖 references、assets、scripts、demos；主文档限定视觉产出/原型，明确不适用于生产级 Web 系统 | 未安装；请求被拦截 |
| UI/UX Pro Max | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)；`main` | Skill 入口位于 `.claude/skills/ui-ux-pro-max`；源数据、脚本及模板位于 `src/ui-ux-pro-max`；不能假定复制入口文档即可工作 | 未执行安装；完整依赖关系待确认 |
| Frontend Design | [anthropics/skills 的 frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design)；`main` | 目标目录显示 `SKILL.md` 和 `LICENSE.txt`，主文档强调先设计计划、再实现与截图复核 | 未执行安装 |

当前核验的是上述分支网页，不是固定提交的可复现安装。安装获准后需记录实际提交/版本、文件完整性与最终安装路径。

## 风险与适用边界

- 外部文档只作为本轮审阅材料，尚未执行其中的安装、自动更新、Hook 或云能力指令。
- Huashu 的 [SECURITY.md](https://github.com/alchaincyf/huashu-design/blob/master/SECURITY.md) 声明云能力隔离在 `scripts/cloud/`，涉及视频审阅或语音合成，需要额外同意与密钥；这是仓库自述，尚未逐个脚本核实，不能宣称零风险。
- 本次设计不需要云端视频审阅、配音、额外动画后端或其他捆绑 Skills；不会为安装三个指定 Skills 而自动启用这些功能。
- 不读取或上传用户 API Key，不把 Key 放入浏览器。项目中的 Taro、CloudBase、固定 16 只怪兽、安全回应和品牌 PNG 约束优先于第三方建议。
- Huashu 的主文档要求新设计先提供三种可见方向，再由用户选择；实际采用时需要遵守该流程或记录用户明确豁免，不能直接把助手选择记录为用户批准。
- 建议分工待安装后复核：Huashu 用于视觉探索和原型；UI/UX Pro Max 用于交互、可访问性及系统一致性；Frontend Design 用于视觉实现和自查。它们均不能代替真实功能测试。

## 下一步门槛

1. 用户在风险说明后明确允许安装这三个来源到 Codex skills 目录。
2. 在批准范围内固定版本、安装完整内容，检查相对依赖和适用指令，不额外安装全局 CLI 或无关 Skills。
3. 记录实际使用成果，再按 DP-07～DP-09 完成单屏实现与 ego-browser 验收。

本轮仅更新来源记录及 SDD 要求，没有新增设计实现，也没有把现有长页面标记为单屏验收通过。
