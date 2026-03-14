# Finn Days 设计系统改造 — 端到端视觉测试报告

> 2026-03-14 | 基于 finn7x.com 生产环境 + 设计文档 v2 对照审查
> 测试设备：Desktop 1440x900 / Mobile 375x812 | Light + Dark mode

---

## 总览

整体改造方向正确，衬线 Logo、暖白底色、砖红点缀、索引式博客列表等核心设计语言已落地。但存在 **大量数值偏差、层级不一致、以及部分规格未按 spec 实现** 的问题。以下按页面逐一列出。

---

## 一、全局问题（跨页面）

### 1.1 字号体系偏差

| 元素 | Spec 规定 | 实际值 | 严重度 |
|------|----------|--------|--------|
| 正文字号 | 17px | 16px | **高** — 影响全站阅读体验和每行字数 |
| 文章 H2 | 28px | 24px | **高** — 章节层级感不够 |
| 文章 H3 | 22px | 20px | 中 |
| 元信息（日期/阅读时间）| 13px | 14px | 低 |
| 标签文字 | 13px | 14px | 低 |
| H1 行高 | 1.25 (=45px for 36px) | 1.11 (40px) | **中** — 多行中文标题会显得挤 |

### 1.2 Geist Sans 字体未加载

body 的 `font-family` 回退到了 `ui-sans-serif, system-ui, sans-serif`，没有看到 Geist Sans。需检查 `next/font` 配置中 Geist Sans 的 CSS 变量 `--font-geist-sans` 是否正确注入到 `--font-sans`。

### 1.3 副标题/次要文字颜色层级错乱

Hero 副标题颜色为 `rgb(144, 139, 137)` ≈ `--foreground-muted`（55% 亮度），但 spec 要求用 `--foreground-secondary`（35% 亮度，≈ `rgb(89, 85, 80)`）。副标题太淡，信息层级不够分明。

### 1.4 博客列表日期颜色

日期使用 `--foreground-muted`（rgb(144,139,137)），spec 要求 `--foreground-faint`（72% 亮度 ≈ rgb(184,181,178)）。目前比 spec 要求的更深。

### 1.5 Footer 样式不符

| 问题 | Spec | 实际 |
|------|------|------|
| Footer padding-top | 96px (space-9) | 24px |
| Footer padding-bottom | 64px (space-8) | 24px |
| Footer Logo 字体 | Newsreader 斜体（Logo 同款）| system sans-serif, 非斜体 |

Footer 的留白严重不足，底部显得拥挤。Logo 应与导航栏的 "Finn Days" 使用相同的衬线斜体。

---

## 二、首页 (/)

### 2.1 Hero 区域

| 问题 | 详情 | 严重度 |
|------|------|--------|
| **Newsletter 嵌在 Hero 中** | Spec 的 Hero 只有：标题 + 副标题 + 单个 CTA 按钮。Newsletter 应在文章详情页底部，不应出现在首页 Hero 区域。当前居中的 Newsletter 打断了 Hero 的左对齐节奏 | **高** |
| **Newsletter 居中对齐** | Hero 是左对齐的，但 Newsletter 标题 + 描述 + 表单是居中的，视觉上产生断裂 | **高** |
| **GitHub CTA 按钮样式** | Spec 说 CTA 应为 Primary 风格（`bg=foreground, color=background, 药丸形`），但实际是 Outline 样式（透明底 + 1px border）。当前样式太弱，不像主 CTA | **中** |
| H1 行高 | 1.0，Spec 要求 1.1，多行时中文标题会黏在一起 | 中 |

### 2.2 最新文章卡片

| 问题 | 详情 | 严重度 |
|------|------|--------|
| **仍使用卡片布局** | 首页最新文章区域使用三列卡片 grid（带边框 1px、圆角 12px、背景色 `rgb(244,243,240)`），卡片感较重 | 中 |
| **卡片 grid 宽度过窄** | 三列各仅 204px，在 1440px 视口中三张卡片合计 ~660px，右侧大面积空白。卡片内标题被截断（"构建 AI Agent 记忆系统：从短..."） | **中** |
| 日期/阅读时间带 icon | Spec 对文章详情页说"不加图标，纯文字"，首页卡片中仍有日历和时钟图标 | 低 |

---

## 三、博客列表页 (/blog)

整体较符合 spec 的索引式设计，但有以下偏差：

| 问题 | 详情 | 严重度 |
|------|------|--------|
| **标签筛选仍有边框** | tag filter 链接 `hasBorder: true`。Spec 要求"标签筛选改为顶部轻量文字链接，不用胶囊按钮" | 中 |
| 日期字号 | 14px，Spec 要求 13px | 低 |
| 年份分组标题颜色 | 使用 `--foreground-muted` (rgb(144,139,137))，Spec 要求 `--foreground-faint`（更淡）| 低 |

---

## 四、文章详情页 (/blog/agent-memory)

### 4.1 排版数值偏差

| 元素 | Spec | 实际 | 严重度 |
|------|------|------|--------|
| 正文字号 | 17px | 16px | **高** |
| 正文行高 | 1.8 (=30.6px@17px) | 1.8 (=28.8px@16px) | 中（比例对但基数错）|
| H2 字号 | 28px | 24px | **高** |
| H3 字号 | 22px | 20px | 中 |
| 段落间距 (margin-bottom) | 24px (space-5) | 4px | **高** — 段落间几乎无间距 |
| meta info 字号 | 13px | 14px | 低 |

### 4.2 代码块

| 问题 | 详情 | 严重度 |
|------|------|--------|
| **代码块边框颜色太深 (Light)** | 实际 `1px solid rgb(144,139,137)` ≈ `--foreground-muted`。Spec 要求 `--code-border: 30 8% 90%` ≈ rgb(231,229,226)，应非常浅 | **高** |
| **代码块边框颜色太深 (Dark)** | 实际 `1px solid rgb(109,113,120)`。Spec `--code-border: 220 8% 16%` ≈ rgb(38,40,44)，应很淡 | **高** |
| **代码块背景色缺失** | Light 和 Dark 模式下 pre/wrapper 背景均为 transparent。Spec 要求 Light 用 `--code-bg: 40 10% 96%`，Dark 用 `--code-bg: 220 12% 10%`（比页面背景更暗，形成"凹陷"效果）| **高** |
| 代码外扩 | Desktop 时 margin-left/right: -40px | 通过 |
| 代码字体 | JetBrains Mono 14px | 通过 |

### 4.3 Callout 组件

| 问题 | 详情 | 严重度 |
|------|------|--------|
| 有 borderRadius: 8px | Spec 未提及 callout 应有圆角 | 低 |
| 需验证 warning/danger 语义差异 | 当前只看到 note 类型的 callout，需确认 warning/danger 是否有不同的背景色和左边框色 | 需验证 |

### 4.4 TOC（目录）

| 问题 | 详情 | 严重度 |
|------|------|--------|
| TOC 字号 | 16px，Spec 要求 13px | 中 |

### 4.5 文章底部模块

| 问题 | 详情 | 严重度 |
|------|------|--------|
| Author Card 仍然复杂 | 有头像 + 社交图标链接。Spec 要求"简化为一行'关于作者'文字 + 简短 bio" | 中 |
| Newsletter 重复出现 | 首页 Hero + 文章底部都有 Newsletter。首页 Hero 里的应移除 | 中 |

---

## 五、About 页面 (/about)

| 问题 | 详情 | 严重度 |
|------|------|--------|
| 整体简化程度不够 | Spec 要求"书信风格"，当前仍有头像、结构化的经历和技术栈区域。比之前简化了，但不够"书信化" | 中 |
| 社交链接 | 底部是文字链接 ✓ | 通过 |
| 技术栈 | 已改为纯文字列表 ✓ | 通过 |
| Timeline | 已简化为纯文字 ✓ | 通过 |

---

## 六、Notes 页面 (/notes)

| 问题 | 详情 | 严重度 |
|------|------|--------|
| 笔记条目无边框 ✓ | 符合 spec | 通过 |
| 代码块边框问题 | 同文章页代码块边框过深的问题 | **高** |
| 日期分组标题格式不一致 | "4 天前"、"6 天前"、"2026年3月5日"三种格式混用 | 中 |

---

## 七、Projects 页面 (/projects)

| 问题 | 详情 | 严重度 |
|------|------|--------|
| 项目标题字体 | 应使用 `--font-heading 22px`（衬线体），实际看起来是 sans-serif 加粗 | 中 |
| 标签和链接在同一行 | 标签（纯文字 ✓）和 GitHub/Demo 链接在同一行，但 spec 要求标签用 `·` 分隔 | 低 |

---

## 八、暗色模式专项

### 8.1 背景层级

| 层级 | Spec | 实际 | 状态 |
|------|------|------|------|
| 页面背景 | hsl(220,12%,7%) ≈ rgb(16,18,23) | rgb(16,17,20) | 接近 ✓ |
| 卡片背景 | hsl(220,10%,11%) ≈ rgb(25,28,33) | rgb(25,27,31) | 接近 ✓ |

### 8.2 暗色模式具体问题

| 问题 | 详情 | 严重度 |
|------|------|--------|
| **代码块无背景色** | pre 和 wrapper 背景均为 transparent。Spec 要求"代码背景比页面背景更暗 1-2 阶，形成凹陷效果" | **高** |
| **代码块边框过于突兀** | rgb(109,113,120) 太亮。Spec `--code-border: 220 8% 16%` 应接近 rgb(38,40,44) | **高** |
| 订阅按钮反色问题 | 暗色下"订阅"按钮变成了 outline 样式（白字+白边框），spec 说 primary 应为 `bg=foreground(暖白), color=background(深色)` | 中 |
| 暗色字重微增范围 | CSS 中 `.dark .prose-custom { font-weight: 430 }` 只作用于文章正文，其他页面未覆盖 | 低 |

---

## 九、移动端 (375px)

### 9.1 首页

| 问题 | 详情 | 严重度 |
|------|------|--------|
| Hero H1 字号 | 合理缩小 | 通过 |
| **Newsletter 仍在 Hero 中** | 同桌面端问题 | **高** |
| 最新文章变为单列 | 纵向堆叠，合理 | 通过 |
| 移动端 padding | ~16-20px 左右 ✓ | 通过 |

### 9.2 文章详情页

| 问题 | 详情 | 严重度 |
|------|------|--------|
| 代码块与正文同宽 ✓ | 移动端没有外扩 | 通过 |
| TOC 不显示 ✓ | 正确隐藏 | 通过 |

### 9.3 移动菜单

| 问题 | 详情 | 严重度 |
|------|------|--------|
| 菜单右侧滑入 ✓ | `fixed right-0 top-0 w-72`（288px ≈ spec 280px）| 通过 |
| **Close 按钮点击被拦截** | 测试中 close menu 按钮被面板 div 拦截无法点击（pointer events interception），可能存在 z-index 问题 | **中** — 可能影响真实用户 |
| 无遮罩层 | Spec 允许无遮罩或极淡遮罩（opacity 0.3），当前无遮罩 | 通过 |

---

## 十、交互与动效（需手动验证）

以下项目在自动化测试中无法完全验证，建议手动确认：

- [ ] 导航项 hover 是否有背景淡入 + 文字变深（150ms ease-in-out）
- [ ] 文章列表行 hover 是否有 translateX(4px) + 文字变品牌色（200ms ease-out）
- [ ] CTA 按钮 hover 是否有 scale(0.98) + opacity 0.9
- [ ] 代码复制按钮 hover 时 opacity 从 0 到 1
- [ ] 主题切换是否有 300ms 平滑过渡
- [ ] 签名缓动曲线（`--ease-out`, `--ease-spring`）是否在实际组件中被使用

---

## 优先修复建议（按严重度排序）

### P0 — 必须修复（影响核心体验）

1. **正文字号 16px → 17px** — 影响全站阅读体验和每行字数设计
2. **文章 H2 字号 24px → 28px** — 章节层级感不够
3. **段落间距 4px → 24px (space-5)** — 段落间几乎无间距，严重影响可读性
4. **代码块边框颜色** — Light/Dark 模式下都太深，应使用 `--code-border` token
5. **代码块背景色** — 应使用 `--code-bg` token，暗色模式下形成"凹陷"效果

### P1 — 应该修复

6. **首页 Hero 移除 Newsletter** — 破坏了 Hero 的简洁感和左对齐节奏
7. **Hero 副标题颜色** — 从 `--foreground-muted` 改为 `--foreground-secondary`
8. **Footer padding** — 24px → top 96px / bottom 64px
9. **Footer Logo 字体** — 改为 Newsreader 斜体
10. **GitHub CTA 按钮** — 从 Outline 改为 Primary 风格（实心药丸形）
11. **首页卡片宽度** — 三列总宽偏窄，标题被截断

### P2 — 建议修复

12. H3 字号 20px → 22px
13. 标签筛选去掉 border
14. 博客日期颜色改用 `--foreground-faint`
15. Geist Sans 字体加载检查
16. TOC 字号 16px → 13px
17. H1 行高 1.0 → 1.1
18. 移动菜单 close 按钮 z-index 修复
19. Notes 日期分组格式统一
20. Projects 标题用衬线字体

---

## 通过项（已正确实现）

- ✅ Logo: Newsreader 斜体 20px
- ✅ 导航栏: 纯色背景、无毛玻璃、~48px 高度、底部 border 40% 透明度
- ✅ 导航激活指示: 品牌色下划线
- ✅ 博客列表: 索引式布局（日期 + 标题行、按年分组、tabular-nums 对齐）
- ✅ 年份分组标题: Newsreader 斜体 14px
- ✅ 内容宽度: max-width 660px
- ✅ 代码外扩: Desktop 时 margin -40px
- ✅ 代码字体: JetBrains Mono 14px
- ✅ 品牌色: 赤陶色 (~rgb(232,97,48)) 用于标签、链接
- ✅ 全站无紫蓝渐变
- ✅ 阅读进度条: 2px 高度、单色
- ✅ 分享按钮: 纯文字链接（无图标）
- ✅ Footer: 极简一行（Logo + 导航链接用 · 分隔）
- ✅ 暗色背景: 带蓝调深色 rgb(16,17,20)，非纯黑
- ✅ 暗色层级: body → card 三阶递进
- ✅ 移动菜单: 右侧滑入、全高、~280px 宽
- ✅ Callout: 左边框 3px、surface 背景
- ✅ Blockquote: 左边框 2px、斜体、padding-left 24px
- ✅ 文章 H1: Newsreader 36px weight 500、左对齐
- ✅ 文章 H2: Newsreader 衬线、无 border-bottom
- ✅ 文章 H3: sans-serif weight 600
- ✅ 文章标签: 品牌色文字、无背景

---

*报告生成于 2026-03-14，基于 finn7x.com 生产环境。部分交互效果（hover 动效、缓动曲线）需手动验证。*
