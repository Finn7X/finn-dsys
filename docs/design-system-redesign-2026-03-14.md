# Finn Days 设计语言与 UI 改造方案（v2）

> 2026-03-14 | 基于 YouMind 设计语言调研 + 行业顶级博客研究 + 当前系统审计
> v2: 整合 Codex 评审意见，补齐中文字体策略、内容分层、响应式边界、验收标准

---

## 一、当前问题诊断

### 当前博客的 "AI 生成感" 来源

| 问题 | 具体表现 | 出现位置 |
|------|---------|---------|
| **紫蓝渐变滥用** | `from-purple-600 to-blue-600` 出现在 Logo、Hero 标题、阅读进度条、Newsletter 按钮 | navbar.tsx, page.tsx, reading-progress.tsx, newsletter.tsx |
| **零品牌色** | 整站只有灰度 + 那一个渐变，没有任何识别性色彩 | globals.css 全部 HSL 都是 0 饱和度 |
| **shadcn/ui 原样搬运** | Button 6 种变体、Card、Input 全部是默认值，无任何定制 | ui/button.tsx, ui/card.tsx |
| **字体无个性** | 只有 Geist Sans + Geist Mono，没有衬线体、没有展示字体 | layout.tsx |
| **卡片千篇一律** | Blog 卡片 = Project 卡片 = 同一个模板 | post-card.tsx, project-card.tsx |
| **交互平淡** | 唯一的 hover 效果是 `-translate-y-0.5` + `shadow-lg` | 所有卡片组件 |
| **间距无体系** | padding/margin 随意使用 py-12/py-16/pb-20，无节奏感 | 全站 |
| **暗色模式粗糙** | 背景 `#0a0a0a` 几乎纯黑，卡片和背景同色无层次 | globals.css dark mode |
| **无视觉记忆点** | 关掉后脑海中无法浮现任何独特画面 | 整体 |

---

## 二、设计改造理念

### 核心定位

**第一阶段明确以 YouMind 为主要视觉 benchmark**，在色彩克制、排版节奏、交互质感上高度对齐。后续再逐步沉淀 Finn Days 自己的品牌符号。

不是冰冷的技术文档，也不是花哨的营销站。是一个**有阅读质感、有人味、有克制美感**的个人知识空间。

### 设计原则

1. **克制** — 删掉比加上更重要。去掉所有"因为可以所以加上"的装饰
2. **层次** — 用字体混排 + 透明度梯度建立清晰的信息层次，而不是靠颜色和尺寸
3. **温度** — 衬线体标题、微妙的暖色调打破冰冷的技术感
4. **节奏** — 建立严格的 8px 间距体系和段落韵律，让页面有呼吸感
5. **一处亮色** — 整站单色调，只在关键位置使用品牌色
6. **信息效率** — 所有视觉决策以"是否帮助阅读和发现"为标准，不做表演性装饰

---

## 三、色彩系统重构

### 从 YouMind 汲取的核心理念

YouMind 的色彩哲学：**纯黑在不同透明度下产生层次**，而非使用不同灰度值。整站只有一个彩色元素（CTA 的彩虹渐变）。

### 新色彩方案

#### Light Mode — "纸上墨痕"

```css
:root {
  /* 背景层级 */
  --background: 40 20% 98%;          /* #faf9f7 — 微暖白，像高质量纸张 */
  --surface: 40 15% 95%;             /* #f3f1ed — 卡片/浮层背景 */
  --surface-elevated: 0 0% 100%;     /* #ffffff — 最高层级（弹窗、工具栏）*/

  /* 文字层级 — 单色透明度体系（向 YouMind 致敬）*/
  --foreground: 20 10% 8%;           /* #161412 — 主文字，温暖的近黑 */
  --foreground-secondary: 20 5% 35%; /* #595550 — 次要文字 */
  --foreground-muted: 20 3% 55%;     /* #8d8a86 — 辅助信息 */
  --foreground-faint: 20 3% 72%;     /* #b8b5b2 — 最淡文字 */

  /* 品牌色 — 只用在关键位置 */
  --accent: 16 80% 55%;              /* #e06030 — 温暖的赤陶色/砖红 */
  --accent-muted: 16 40% 92%;        /* 极淡底色版本 */

  /* 语义色 — 克制但保留可感知差异 */
  --semantic-warning: 35 80% 50%;    /* 暖橙 */
  --semantic-danger: 0 70% 55%;      /* 柔红 */
  --semantic-warning-bg: 35 40% 95%; /* 极淡暖橙底 */
  --semantic-danger-bg: 0 40% 96%;   /* 极淡柔红底 */

  /* 功能色 */
  --border: 30 10% 88%;              /* 温暖的浅灰边框 */
  --ring: 16 80% 55%;                /* 聚焦环用品牌色 */

  /* 代码块 */
  --code-bg: 40 10% 96%;
  --code-border: 30 8% 90%;
}
```

#### Dark Mode — "深夜书房"

```css
.dark {
  /* 背景层级 — 带蓝调的深色（不是纯黑）*/
  --background: 220 12% 7%;           /* #0f1218 — 深蓝黑 */
  --surface: 220 10% 11%;             /* #171c25 — 卡片背景 */
  --surface-elevated: 220 10% 14%;    /* #1e2430 — 浮层/弹窗 */

  /* 文字层级 */
  --foreground: 40 10% 90%;           /* #e8e5e0 — 暖白，不刺眼 */
  --foreground-secondary: 40 5% 65%;  /* #a8a5a0 */
  --foreground-muted: 220 5% 45%;     /* #6b7280 */
  --foreground-faint: 220 5% 30%;     /* #474e5a */

  /* 品牌色（暗色下降饱和、提亮度）*/
  --accent: 16 70% 62%;               /* 柔和版赤陶色 */
  --accent-muted: 16 30% 15%;         /* 深色底版本 */

  /* 语义色（暗色下进一步降饱和）*/
  --semantic-warning: 35 60% 60%;
  --semantic-danger: 0 55% 60%;
  --semantic-warning-bg: 35 20% 12%;
  --semantic-danger-bg: 0 20% 12%;

  /* 边框 — 暗色下更明显 */
  --border: 220 8% 18%;               /* 可感知但不突兀 */

  /* 代码块 */
  --code-bg: 220 12% 10%;
  --code-border: 220 8% 16%;
}
```

### 品牌色使用原则

赤陶色（`--accent`）**只**出现在：
- 文章内的链接文字
- 当前激活的导航项标记（小圆点或下划线）
- CTA 按钮（全站只有 1-2 个）
- 代码行高亮的左边框
- Callout warning 的左边框

**绝对不出现在**：Logo、标题、渐变、大面积背景。

### 实现约束

所有色彩 token 通过 `globals.css` 的 `@theme inline` 暴露给 Tailwind v4，不另起平行样式入口。

---

## 四、字体系统重构

### 双轨策略：拉丁 + CJK 分别处理

评审指出 Newsreader 不覆盖 CJK，直接用于中文标题会回退到系统字体，造成中英标题风格断裂。因此采用**双轨方案**：

#### 字体角色定义

```
拉丁标题字体：Newsreader（可变衬线体，Google Fonts）
  → Logo "Finn Days" 斜体
  → 英文页面的 H1、H2
  → 中英混排时负责拉丁部分

CJK 标题字体：Noto Serif SC（思源宋体）
  → 中文标题的主字体
  → 作为 Newsreader 的 CJK 回退
  → 只加载 400/500/700 三档字重，控制体积

正文 + UI 字体：Geist Sans（保留）
  → 中英正文、导航、按钮、标签、元信息
  → 暗色模式下 weight 从 400 微调到 430

代码字体：JetBrains Mono（替换 Geist Mono）
  → 默认不启用连字（ligatures: off），避免技术阅读干扰
  → 用户可通过 CSS 自行开启
```

#### 字体加载策略

```
通过 next/font 统一管理（不新增 fonts.css 文件）：
  → Newsreader: subsets=['latin'], display='swap'
  → Noto Serif SC: subsets=['latin'], weight=['400','500','700'], display='swap'
  → JetBrains Mono: subsets=['latin'], display='swap'
  → Geist Sans: 保持现有配置

font-family 声明：
  --font-heading: 'Newsreader', 'Noto Serif SC', Georgia, serif;
  --font-body: 'Geist Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Geist Mono', monospace;

CLS 防护：
  → 全部使用 display='swap'
  → Noto Serif SC 体积较大，只加载必要字重
  → 标题 font-size-adjust 保持回退时尺寸一致
```

#### 字号体系（基于 4px 倍数）

| 层级 | 字号 | 行高 | 字重 | 字体 | 用途 |
|------|------|------|------|------|------|
| Display | 48px | 1.1 | 500 | --font-heading | 首页 Hero |
| H1 | 36px | 1.25 | 500 | --font-heading | 文章标题 |
| H2 | 28px | 1.3 | 500 | --font-heading | 章节标题 |
| H3 | 22px | 1.4 | 600 | --font-body | 小节标题 |
| H4 | 18px | 1.4 | 600 | --font-body | 子标题 |
| Body | 17px | 1.8 | 400 | --font-body | 正文 |
| Small | 14px | 1.5 | 400 | --font-body | 元信息、日期 |
| Caption | 13px | 1.4 | 400 | --font-body | 辅助标注 |
| Code | 14px | 1.6 | 400 | --font-mono | 代码块 |

#### 中英文排版差异规则

| 项目 | 中文 | 英文 |
|------|------|------|
| 正文行高 | 1.8（汉字方块结构需更大垂直间距）| 1.7 |
| 段落间距 | 24px | 20px |
| 标题字体 | Noto Serif SC + Newsreader 混排 | Newsreader |
| 标题行高 | 1.3（中文标题字间距更密）| 1.2 |
| 每行字数 | 35-40 字 | 65-75 字符 |
| 正文字号 | 17px | 17px（保持一致）|

---

## 五、间距体系

### 8px 基准网格

```
--space-1:   4px    细微间隙
--space-2:   8px    紧凑元素间距
--space-3:  12px    相关元素间距
--space-4:  16px    组内间距
--space-5:  24px    组间间距
--space-6:  32px    小节间距
--space-7:  48px    节间距
--space-8:  64px    大节间距
--space-9:  96px    页面级分隔
--space-10: 128px   首页段落间（YouMind 风格大留白）
```

### 内容宽度体系

```
阅读区域：max-width: 660px（比当前 max-w-4xl=896px 窄很多）
  → 每行 65-75 字符 / 中文 35-40 字
  → 使用 max-width 而非硬宽度

代码块：max-width: 740px（比正文宽 80px，左右各延伸 40px）
  → 桌面端用负外边距实现
  → 移动端回退为正文同宽（响应式，见下方）

文章页外围：max-width: 660px
  → Share、Author Card、Newsletter、Comments 统一跟随正文宽度
  → TOC 固定在右侧，只在 xl(1280px+) 显示

导航/页脚区域：max-width: 1080px
```

### 响应式宽度断点

```
mobile (<768px):
  → 正文 padding: 0 20px
  → 代码块与正文同宽（不外扩）
  → TOC 不显示（已有实现，保持）
  → 导航折叠为移动菜单

tablet (768-1279px):
  → 正文 max-width: 660px，居中
  → 代码块仍与正文同宽（不外扩）
  → TOC 不显示

desktop (1280px+):
  → 正文 max-width: 660px
  → 代码块外扩到 740px（负外边距）
  → TOC 显示在右侧
```

---

## 六、组件改造清单

### 6.1 导航栏

**当前问题：** 毛玻璃效果 + 渐变 Logo = 典型 AI 生成模板。

**改造方案：**

```
结构：左 Logo + 中导航 + 右工具按钮
高度：48px（从 56px 缩减，更紧凑）
背景：纯色 var(--background)，不用毛玻璃
边框：底部 1px solid var(--border)，透明度 40%
Logo：纯文字 "Finn Days"，Newsreader 斜体 20px，不加渐变
导航项：Geist Sans 14px weight 400
  → 默认态：var(--foreground-secondary)
  → hover：var(--foreground)，背景 var(--surface)，圆角 6px
  → 激活态：var(--foreground)，下方 2px 品牌色标记线
过渡：0.15s cubic-bezier(0.4, 0, 0.2, 1)
```

#### 工具按钮统一规则

Command Palette / Theme Toggle / Language Switcher / Mobile Menu 按钮使用统一视觉规范：

```
统一 token：
  尺寸：32x32px（从 36px 缩小）
  圆角：6px
  默认态：无背景、无边框，图标 var(--foreground-muted)
  hover：背景 var(--surface)，图标 var(--foreground)
  激活态（如主题切换展开）：背景 var(--surface)，品牌色图标
  过渡：150ms ease-in-out

移动菜单：
  去掉模糊遮罩 + 下滑面板模板写法
  改为从右侧滑入的简洁面板：
    → 背景 var(--surface-elevated)
    → 全屏高度，宽度 280px
    → 无遮罩层（或极淡遮罩 opacity 0.3）
    → 导航项纵向排列，间距 space-3
```

### 6.2 首页 Hero

**当前问题：** 渐变大标题 + "我在做什么"三栏 = 教科书式 AI 模板。

**改造方案：**

```
布局：左对齐（不再居中），max-width: 660px
标题：--font-heading 48px weight 500
  → 纯色文字 var(--foreground)，不加任何渐变
  → 中文："记录技术、分享思考" 或更个人化的表达
副标题：Geist Sans 18px weight 400 var(--foreground-secondary)
  → 1-2 句话，简洁有力
CTA：单个按钮，质朴风格
  → 背景 var(--foreground)，文字 var(--background)
  → 圆角 9999px（药丸形）
  → hover 时微缩 scale(0.98)，不加渐变
留白：标题上方 space-10（128px），标题下方 space-8（64px）

删除：技能三栏区域（"Web 开发"、"技术写作"、"开源"）
  → 在个人博客中没有信息量

首页打字机效果：不进入 v1
  → 会干扰首屏阅读效率
```

### 6.3 博客列表页 — 索引式

**改造方案：**

```
布局：简洁的行列表，每行一篇文章，按年份分组
每行结构：
  [日期 auto] [标题 flex-1]

日期：Geist Sans 13px var(--foreground-faint)
  → 统一短格式：2026.03.14（中英文一致，避免长度差异）
  → 不固定宽度，用 min-width + tabular-nums 对齐
标题：Geist Sans 16px weight 500 var(--foreground)
  → hover：品牌色 var(--accent)
标签：不在列表行中显示（减少噪音）
  → 标签筛选改为顶部轻量文字链接，不用胶囊按钮

行间距：space-3（12px）
行 padding：space-2（8px）上下
分隔：无显式分隔线，靠间距区分
年份分组：年份作为分组标题，Newsreader 斜体 14px var(--foreground-faint)

分页：保留，样式跟随新设计语言
空状态：保留，文案简化
```

### 6.4 项目页 — 编辑化列表（不套索引式）

评审指出项目页需要封面、标签、链接等信息密度，不适合纯索引。

**改造方案：**

```
布局：纵向列表，每个项目一个轻量区块
每个项目：
  标题行：项目名（--font-heading 22px）+ 日期
  描述：1-2 行文字，var(--foreground-secondary)
  标签：纯文字标签，13px，用 · 分隔
  链接：GitHub / Demo 文字链接，品牌色

不用卡片边框和阴影
项目间用 space-7（48px）分隔 + 细分隔线（1px border）
封面图：如有，小尺寸展示（120x80px），不做满幅
Featured 标记：标题旁一个小 · 标记，不做大徽章
```

### 6.5 Notes 页面 — 轻量时间流

```
保留日期分组结构
去掉卡片边框
每条笔记：日期 + 标题 + 1-2 行预览
条目间用 space-4（16px）分隔
日期分组标题用小字 + 分隔线锚定节奏
```

### 6.6 文章详情页

#### 标题区域

```
标题：--font-heading 36px weight 500，左对齐
元信息：日期 + 阅读时间，13px var(--foreground-muted)
  → 不加图标，纯文字："2026.03.14 · 8 min"
标签：行内排列，13px，品牌色文字，无背景
分隔：标题区域与正文之间 space-8（64px）
```

#### 正文排版

```
字号：17px，行高 1.8
段落间距：space-5（24px）
链接：品牌色 + 下划线 underline-offset-3
引用块：左边框 2px var(--border)，斜体，padding-left 24px
H2：--font-heading 28px，上方 space-8（64px），下方 space-4（16px），不加 border-bottom
H3：Geist Sans 22px weight 600，上方 space-7（48px）
```

#### 代码块

```
桌面端（lg+）：比正文宽，margin-left: -40px, margin-right: -40px
移动端：与正文同宽（margin: 0）
背景：var(--code-bg)
边框：1px solid var(--code-border)，圆角 8px
文件名标签：顶部左对齐，13px，JetBrains Mono，var(--foreground-muted)
代码字体：JetBrains Mono 14px，行高 1.6
行高亮：左边框 2px var(--accent)，背景 var(--accent-muted)
复制按钮：右上角，hover 时 opacity 从 0 到 1
语法主题：自定义，基于 github-dark-dimmed 微调
```

#### 外围模块统一规则

文章正文之外的模块（Share、Author Card、Newsletter、Comments）统一设计：

```
全部跟随正文 max-width: 660px
模块间距：space-8（64px）
模块内用 1px border-top 分隔（轻量）

Share 按钮：改为纯文字链接，不用图标按钮
Author Card：简化为一行"关于作者"文字 + 简短 bio
Newsletter：保持已有结构，去掉渐变按钮
Comments（Giscus）：样式由 Giscus 主题控制，但容器 padding 对齐
```

#### TOC 样式对齐

```
位置：right sticky，只在 xl(1280px+) 显示（保持现有逻辑）
标题：13px font-semibold var(--foreground-muted)
链接：13px var(--foreground-muted)
  → hover：var(--foreground)
  → 激活：var(--foreground)，左边框 2px var(--accent)
整体宽度：200px
与正文间距：space-8（64px）
```

#### 阅读进度条

```
去掉渐变，改为单色 var(--accent)
高度从 3px 减为 2px
```

### 6.7 About 页面

```
简化为书信风格：
  一段简洁的自我介绍文字（--font-heading 正文排版）
  timeline 保留但简化：纯文字列表，无圆点无线条
  技术栈：保留但改为纯文字列表（去掉卡片网格）
  社交链接：底部一行文字链接，不用图标按钮
```

### 6.8 Footer

```
极简：一行
  左："Finn Days"（Logo 同款衬线斜体）
  右：导航链接（纯文字，用 · 分隔）+ RSS 链接

去掉社交图标按钮、去掉 "Built with Next.js and Tailwind CSS"
padding：上方 space-9（96px），下方 space-8（64px）
```

### 6.9 按钮系统

```
Primary（实心）：
  背景 var(--foreground)，文字 var(--background)
  圆角 9999px（药丸形）
  hover：scale(0.98) + opacity 0.9

Ghost（透明）：
  无背景无边框
  hover：背景 var(--surface)

Link（文字链接）：
  品牌色 + 下划线

Outline（保留，用于次要操作）：
  1px border var(--border)，圆角 9999px
  hover：背景 var(--surface)

删除：secondary、destructive 变体
```

### 6.10 Callout 组件 — 保留最小语义差异

评审指出技术文章需要 warning/danger 的可感知差异，完全抹平会降低可读性。

```
三档语义：

note（默认）：
  背景 var(--surface)
  左边框 3px solid var(--border)
  无图标

warning：
  背景 var(--semantic-warning-bg)
  左边框 3px solid var(--semantic-warning)
  标题前加文字标记 "注意" / "Warning"（不用图标）

danger：
  背景 var(--semantic-danger-bg)
  左边框 3px solid var(--semantic-danger)
  标题前加文字标记 "危险" / "Danger"

暗色模式下语义色降饱和但保持可感知差异。
```

---

## 七、交互与动效

### 签名缓动曲线

```css
--ease-out: cubic-bezier(0.22, 0.68, 0, 1.0);   /* 快出，微弹 */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);     /* 标准过渡 */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* 弹性效果 */
```

### 交互清单

| 元素 | 效果 | 时长 | 缓动 |
|------|------|------|------|
| 导航项 hover | 背景淡入 + 文字变深 | 150ms | ease-in-out |
| 工具按钮 hover | 背景 var(--surface) + 图标变深 | 150ms | ease-in-out |
| 文章列表行 hover | 整行微移右 translateX(4px) + 文字变品牌色 | 200ms | ease-out |
| 外链 hover | 下划线从左展开 | 200ms | ease-out |
| CTA 按钮 hover | scale(0.98) + opacity 0.9 | 150ms | ease-spring |
| 代码复制按钮 | hover 时 opacity 从 0 到 1 | 150ms | ease-in-out |
| 页面切换 | View Transition 淡入淡出（保留现有实现）| 200ms | ease-out |
| 主题切换 | 背景色 + 文字色平滑过渡 | 300ms | ease-in-out |

### 去掉的效果

- 卡片 hover 上浮 + shadow-lg（模板感太强）
- 图片 hover 放大（无意义）
- 进度条渐变动画
- 首页打字机效果（干扰首屏阅读）

---

## 八、暗色模式专项

1. **永远不用纯黑** — 背景带微蓝调 (`hsl(220 12% 7%)`)，像深夜天空而不是洞穴
2. **层级 = 明度** — 背景 7% → 卡片 11% → 弹窗 14%，三阶递进
3. **文字不用纯白** — 主文字 `hsl(40 10% 90%)` 带暖调，减少刺眼感
4. **代码块更暗** — 代码背景比页面背景更暗 1-2 阶，形成"凹陷"效果
5. **品牌色降饱和** — 暗色下 accent 饱和度降 10%、亮度提 7%
6. **阴影换边框** — 暗色下阴影不可见，用 1px border 代替
7. **字重微增** — 暗色下正文字重 400 → 430（利用 Geist 可变字体）
8. **语义色保持可感知** — warning/danger 在暗色下仍有明确差异

---

## 九、特殊设计元素（个性化）

### 克制的温度感

只在**少数位置**引入不规则元素打破几何完美，判断标准是**不伤害阅读效率**：

1. **文章封面图（如果有）** — 微旋转 `rotate(-1deg)` + 轻微不规则圆角
2. **404 页面** — 可以放一个手绘风格的插图，是整站唯一的"释放"

不进入 v1 的元素（虽然 YouMind 有，但会干扰技术博客阅读）：
- 引用块弯曲边框（影响扫描效率）
- 首页打字机效果（干扰首屏内容获取）
- wobbly radius（在代码/表格等结构化内容旁违和）

### 唯一记忆点

**Logo "Finn Days" 用 Newsreader 斜体。**
  → 斜体衬线 Logo 在开发者博客中极其罕见
  → 传递"文学性/手写感"而不是"技术/代码"
  → 这一个选择就能让人记住
  → 后续 Phase 2 可以围绕这个锚点发展更多品牌符号

---

## 十、改造范围与文件清单

### 需要修改的文件

| 文件 | 改动 |
|------|------|
| `src/app/[locale]/layout.tsx` | 引入 Newsreader + Noto Serif SC + JetBrains Mono（via next/font）|
| `src/app/globals.css` | 重写全部 CSS 自定义属性（色彩、间距、动效），保持 @theme inline 机制 |
| `src/app/[locale]/page.tsx` | 重新设计首页 Hero + 去掉技能区域 |
| `src/app/[locale]/blog/page.tsx` | 卡片布局 → 索引式列表 |
| `src/app/[locale]/blog/[slug]/page.tsx` | 文章详情排版 + 外围模块间距 |
| `src/app/[locale]/about/page.tsx` | 简化为书信风格 |
| `src/app/[locale]/notes/page.tsx` | 去卡片边框、轻量化 |
| `src/app/[locale]/projects/page.tsx` | 编辑化列表（保留适度媒体） |
| `src/components/layout/navbar.tsx` | 去渐变、去毛玻璃、衬线 Logo、统一工具按钮 |
| `src/components/layout/footer.tsx` | 极简化 |
| `src/components/layout/desktop-nav.tsx` | 样式更新 |
| `src/components/layout/mobile-nav.tsx` | 重新设计为侧滑面板 |
| `src/components/post-card.tsx` | 改为索引行组件 |
| `src/components/post-header.tsx` | 衬线标题 + 去图标 |
| `src/components/project-card.tsx` | 编辑化列表条目 |
| `src/components/notes/note-card.tsx` | 轻量化 |
| `src/components/mdx-content.tsx` | 正文排版升级 |
| `src/components/mdx/callout.tsx` | 三档语义系统 |
| `src/components/mdx/code-block.tsx` | 响应式外扩 + JetBrains Mono |
| `src/components/blog/reading-progress.tsx` | 去渐变，单色 |
| `src/components/blog/share-buttons.tsx` | 改为文字链接 |
| `src/components/blog/author-card.tsx` | 简化 |
| `src/components/common/newsletter.tsx` | 去渐变，纯色按钮 |
| `src/components/ui/button.tsx` | 简化为 4 种变体（primary/ghost/link/outline）|
| `src/components/toc.tsx` | 样式对齐新设计语言 |
| `src/components/tag-badge.tsx` | 去背景色，改为纯文字 |
| `src/styles/mdx.css` | 大幅扩展文章排版样式 |
| `src/components/layout/theme-toggle.tsx` | 统一工具按钮尺寸 |
| `src/components/layout/language-switcher.tsx` | 统一工具按钮尺寸 |

### 不新增平行样式文件

评审指出不要创建 `fonts.css` / `tokens.css` 等平行入口。所有 token 在 `globals.css` 中通过 `@theme inline` 管理。

### 不可破坏项

- i18n 路由与翻译机制
- View Transition（保留，不丢弃 reduced motion 保护）
- 代码高亮（rehype-pretty-code pipeline）
- 搜索（Command Palette）
- 评论（Giscus）
- 订阅（Newsletter/Buttondown）
- RSS/Atom feeds
- SEO 结构化数据

---

## 十一、实施顺序

```
Phase A — 地基（色彩 + 字体 + 间距 token）
  → globals.css 重写（色彩 token + 间距 token + 动效曲线）
  → layout.tsx 引入新字体（Newsreader + Noto Serif SC + JetBrains Mono）
  → 全站立刻有质感变化

Phase B — 骨架（布局 + 导航 + 页脚 + 列表页）
  → navbar 重设计（衬线 Logo、去毛玻璃、统一工具按钮）
  → footer 极简化
  → 首页 Hero 重设计（左对齐、去渐变、去技能区）
  → 博客列表页改为索引式
  → 项目页改为编辑化列表
  → Notes 页轻量化
  → About 页书信化
  → 按钮系统简化
  → 移动菜单重设计

Phase C — 肌肤（文章排版 + 代码块 + MDX 组件）
  → mdx-content.tsx 排版升级（660px 宽幅、衬线标题、中文行高）
  → 代码块响应式外扩 + JetBrains Mono
  → Callout 三档语义系统
  → Tag 纯文字化
  → 阅读进度条去渐变
  → TOC 样式对齐
  → 文章页外围模块间距统一

Phase D — 表情（交互 + 暗色模式打磨）
  → hover 效果全站更新
  → 缓动曲线统一
  → 暗色模式三阶层级优化
  → 暗色下字重微增
  → 暗色下语义色验证
  → 最终打磨
```

---

## 十二、验收标准

### 视觉验收

六个核心页面逐一截图对比（改造前 vs 改造后）：
- [ ] 首页
- [ ] 博客列表
- [ ] 文章详情（含代码块的长文）
- [ ] About
- [ ] Notes
- [ ] Projects

### 品牌验收

- [ ] 任意页面截屏，能识别出 "Finn Days" 品牌（衬线 Logo + 暖白底 + 砖红点缀）
- [ ] 不再有紫蓝渐变出现在任何位置

### 可读性验收

- [ ] 正文每行 35-40 中文字 / 65-75 英文字符（660px 宽度验证）
- [ ] 正文对比度 ≥ 4.5:1（WCAG AA）— 浅色和深色分别验证
- [ ] 代码块可正常显示 80 列代码（740px 宽度验证）
- [ ] 链接色与正文有明确视觉差异

### 响应式验收

三档断点实测：
- [ ] 375px（iPhone SE）
- [ ] 768px（iPad）
- [ ] 1280px+（Desktop）

每档验证：导航可用、内容不溢出、代码块不水平滚动（或可控滚动）、TOC 正确显示/隐藏

### 性能验收

- [ ] 新增字体后首屏 CLS < 0.1
- [ ] Lighthouse Performance Score ≥ 90
- [ ] 字体总加载量 < 300KB（Noto Serif SC 控制字重数量）

### 功能验收

- [ ] i18n 切换正常（中英文字体均正确渲染）
- [ ] View Transition 正常工作
- [ ] 暗色/浅色模式切换平滑
- [ ] Command Palette 可用
- [ ] 代码高亮正常（文件名标签、行高亮、复制按钮）
- [ ] RSS feed 正常
- [ ] Giscus 评论正常
- [ ] Newsletter 订阅正常

---

## 十三、效果预期

| 维度 | 当前 | 改造后 |
|------|------|--------|
| 第一印象 | "一个 AI 生成的博客模板" | "一个有品味的开发者的个人空间" |
| 色彩记忆 | 紫蓝渐变（和一万个 AI 站一样）| 暖白纸张 + 砖红点缀（独特）|
| 字体记忆 | 无（和所有 Vercel 模板一样）| 衬线斜体 Logo + 中英衬线标题（文学感）|
| 阅读体验 | 及格（太宽、行距一般）| 优秀（660px 窄幅、1.8 行高、衬线标题）|
| 暗色模式 | 粗糙（纯黑、无层次）| 精致（蓝调深色、3 层层级）|
| 交互感受 | 平淡（只有微上浮）| 有质感（微弹、位移、品牌色反馈）|
| 内容分层 | Blog = Project = Notes（同一模板）| 三种内容各有适配布局 |
| 整体定位 | shadcn/ui 模板 | 高度对齐 YouMind 审美的技术写作系统 |
