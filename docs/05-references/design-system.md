# 设计规范

## 设计理念与原则

Finn Days 博客的视觉设计遵循以下核心原则：

1. **内容优先**：设计服务于内容的可读性，避免过度装饰干扰阅读
2. **简洁克制**：使用最少的视觉元素传达信息，留白即设计
3. **一致性**：所有页面和组件遵循统一的设计语言，确保用户体验的连贯性
4. **可访问性**：满足 WCAG 2.1 AA 标准，确保所有用户都能获得良好的体验
5. **响应式**：从移动端到桌面端的流畅适配，移动优先策略
6. **暗色模式**：完整的亮色/暗色双主题支持，通过 CSS 变量系统实现无缝切换

---

## 颜色系统

### CSS 变量架构

颜色系统基于 HSL 格式的 CSS 变量构建，通过 Tailwind CSS 4 的 `@theme inline` 映射为 Tailwind 类名。所有颜色值存储在 `src/app/globals.css` 中。

### 完整 CSS 变量表

#### 亮色模式（`:root`）

| 变量名 | HSL 值 | 色值 | 说明 |
| --- | --- | --- | --- |
| `--background` | `0 0% 100%` | #ffffff | 页面背景 |
| `--foreground` | `0 0% 3.9%` | #0a0a0a | 主要文本 |
| `--card` | `0 0% 100%` | #ffffff | 卡片背景 |
| `--card-foreground` | `0 0% 3.9%` | #0a0a0a | 卡片文本 |
| `--popover` | `0 0% 100%` | #ffffff | 弹出层背景 |
| `--popover-foreground` | `0 0% 3.9%` | #0a0a0a | 弹出层文本 |
| `--primary` | `0 0% 9%` | #171717 | 主要操作色 |
| `--primary-foreground` | `0 0% 98%` | #fafafa | 主要操作文本 |
| `--secondary` | `0 0% 96.1%` | #f5f5f5 | 次要操作色 |
| `--secondary-foreground` | `0 0% 9%` | #171717 | 次要操作文本 |
| `--muted` | `0 0% 96.1%` | #f5f5f5 | 柔和背景 |
| `--muted-foreground` | `0 0% 45.1%` | #737373 | 柔和文本（辅助文字） |
| `--accent` | `0 0% 96.1%` | #f5f5f5 | 强调背景 |
| `--accent-foreground` | `0 0% 9%` | #171717 | 强调文本 |
| `--destructive` | `0 84.2% 60.2%` | #ef4444 | 危险操作 |
| `--destructive-foreground` | `0 0% 98%` | #fafafa | 危险操作文本 |
| `--border` | `0 0% 89.8%` | #e5e5e5 | 边框 |
| `--input` | `0 0% 89.8%` | #e5e5e5 | 输入框边框 |
| `--ring` | `0 0% 3.9%` | #0a0a0a | 聚焦环 |

#### 暗色模式（`.dark`）

| 变量名 | HSL 值 | 色值 | 说明 |
| --- | --- | --- | --- |
| `--background` | `0 0% 3.9%` | #0a0a0a | 页面背景 |
| `--foreground` | `0 0% 98%` | #fafafa | 主要文本 |
| `--card` | `0 0% 3.9%` | #0a0a0a | 卡片背景 |
| `--card-foreground` | `0 0% 98%` | #fafafa | 卡片文本 |
| `--popover` | `0 0% 3.9%` | #0a0a0a | 弹出层背景 |
| `--popover-foreground` | `0 0% 98%` | #fafafa | 弹出层文本 |
| `--primary` | `0 0% 98%` | #fafafa | 主要操作色 |
| `--primary-foreground` | `0 0% 9%` | #171717 | 主要操作文本 |
| `--secondary` | `0 0% 14.9%` | #262626 | 次要操作色 |
| `--secondary-foreground` | `0 0% 98%` | #fafafa | 次要操作文本 |
| `--muted` | `0 0% 14.9%` | #262626 | 柔和背景 |
| `--muted-foreground` | `0 0% 63.9%` | #a3a3a3 | 柔和文本 |
| `--accent` | `0 0% 14.9%` | #262626 | 强调背景 |
| `--accent-foreground` | `0 0% 98%` | #fafafa | 强调文本 |
| `--destructive` | `0 62.8% 30.6%` | #7f1d1d | 危险操作 |
| `--destructive-foreground` | `0 0% 98%` | #fafafa | 危险操作文本 |
| `--border` | `0 0% 14.9%` | #262626 | 边框 |
| `--input` | `0 0% 14.9%` | #262626 | 输入框边框 |
| `--ring` | `0 0% 83.1%` | #d4d4d4 | 聚焦环 |

#### Chart 颜色

亮色模式：

| 变量名 | HSL 值 | 说明 |
| --- | --- | --- |
| `--chart-1` | `12 76% 61%` | 图表色 1（橙红） |
| `--chart-2` | `173 58% 39%` | 图表色 2（青绿） |
| `--chart-3` | `197 37% 24%` | 图表色 3（深蓝灰） |
| `--chart-4` | `43 74% 66%` | 图表色 4（金黄） |
| `--chart-5` | `27 87% 67%` | 图表色 5（橙色） |

暗色模式：

| 变量名 | HSL 值 | 说明 |
| --- | --- | --- |
| `--chart-1` | `220 70% 50%` | 图表色 1（蓝色） |
| `--chart-2` | `160 60% 45%` | 图表色 2（绿色） |
| `--chart-3` | `30 80% 55%` | 图表色 3（橙色） |
| `--chart-4` | `280 65% 60%` | 图表色 4（紫色） |
| `--chart-5` | `340 75% 55%` | 图表色 5（粉红） |

### 语义色说明

| 语义名称 | 用途 | Tailwind 类名 |
| --- | --- | --- |
| `background` / `foreground` | 页面级别的背景和文本色 | `bg-background`, `text-foreground` |
| `primary` / `primary-foreground` | 主要交互元素（按钮、链接） | `bg-primary`, `text-primary-foreground` |
| `secondary` / `secondary-foreground` | 次要交互元素 | `bg-secondary`, `text-secondary-foreground` |
| `muted` / `muted-foreground` | 柔和元素（辅助文字、禁用状态） | `bg-muted`, `text-muted-foreground` |
| `accent` / `accent-foreground` | 强调元素（hover 状态、活跃项） | `bg-accent`, `text-accent-foreground` |
| `destructive` / `destructive-foreground` | 危险操作（删除、错误） | `bg-destructive`, `text-destructive-foreground` |
| `border` | 所有边框 | `border-border` |
| `input` | 表单输入框边框 | `border-input` |
| `ring` | 焦点环（focus-visible） | `ring-ring` |
| `card` / `card-foreground` | 卡片容器 | `bg-card`, `text-card-foreground` |
| `popover` / `popover-foreground` | 弹出层（下拉菜单、命令面板） | `bg-popover`, `text-popover-foreground` |

### 品牌渐变色

Finn Days 的品牌渐变色从 **purple-600** 到 **blue-600**，用于以下场景：

- Logo 文字
- 首页 Hero 区域标题
- 特殊强调元素
- 渐变背景装饰

```html
<!-- Tailwind 用法 -->
<span class="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
  Finn Days
</span>

<!-- 背景渐变 -->
<div class="bg-gradient-to-r from-purple-600 to-blue-600">
  <!-- 内容 -->
</div>

<!-- 边框渐变（使用伪元素或 CSS） -->
<div class="bg-gradient-to-r from-purple-600 to-blue-600 p-px rounded-lg">
  <div class="bg-background rounded-[calc(var(--radius)-1px)]">
    <!-- 内容 -->
  </div>
</div>
```

### 颜色使用规范

| 场景 | 推荐用法 | 避免 |
| --- | --- | --- |
| 主文本 | `text-foreground` | 直接使用 `text-black` / `text-white` |
| 辅助文本 | `text-muted-foreground` | 使用低透明度文本 |
| 背景 | `bg-background` / `bg-card` / `bg-muted` | 硬编码颜色值 |
| 边框 | `border-border` | `border-gray-200` 等硬编码色 |
| 交互 hover | `hover:bg-accent` | 硬编码 hover 颜色 |
| 链接 | `text-primary` | `text-blue-500` 等硬编码色 |
| 品牌强调 | 渐变 `from-purple-600 to-blue-600` | 单色品牌色 |

---

## 排版系统

### 字体族

| 用途 | 字体 | CSS 变量 | Tailwind 类名 |
| --- | --- | --- | --- |
| 正文 / UI | Geist Sans | `--font-geist-sans` | `font-sans` |
| 代码 / 等宽 | Geist Mono | `--font-geist-mono` | `font-mono` |

字体通过 `next/font/google` 加载，自动优化（字体子集化、预加载、无布局偏移）：

```tsx
// src/app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

### 字号规范

| 元素 | 字号 | rem | px | 行高 | Tailwind 类名 | 用途 |
| --- | --- | --- | --- | --- | --- | --- |
| H1 | 2.25rem | 2.25 | 36 | 2.5rem | `text-4xl` | 页面主标题 |
| H2 | 1.875rem | 1.875 | 30 | 2.25rem | `text-3xl` | 文章标题、板块标题 |
| H3 | 1.5rem | 1.5 | 24 | 2rem | `text-2xl` | 子标题 |
| H4 | 1.25rem | 1.25 | 20 | 1.75rem | `text-xl` | 小标题 |
| Body | 1rem | 1 | 16 | 1.75rem | `text-base` | 正文 |
| Small | 0.875rem | 0.875 | 14 | 1.25rem | `text-sm` | 辅助文本、元信息 |
| XSmall | 0.75rem | 0.75 | 12 | 1rem | `text-xs` | 标签、徽章、时间 |
| Code | 0.875rem | 0.875 | 14 | 1.625rem | `text-sm font-mono` | 行内代码 |

### 字重

| 字重 | 值 | Tailwind 类名 | 用途 |
| --- | --- | --- | --- |
| Regular | 400 | `font-normal` | 正文 |
| Medium | 500 | `font-medium` | 导航项、标签 |
| Semibold | 600 | `font-semibold` | 小标题、按钮 |
| Bold | 700 | `font-bold` | 页面标题、强调 |

### 行高

| 场景 | 行高值 | Tailwind 类名 |
| --- | --- | --- |
| 标题 | 1.2 - 1.3 | `leading-tight` / `leading-snug` |
| 正文 | 1.75 | `leading-relaxed` |
| 代码 | 1.625 | `leading-relaxed` |
| 紧凑（UI 元素） | 1 | `leading-none` |

### 字间距

| 场景 | Tailwind 类名 | 用途 |
| --- | --- | --- |
| 紧凑 | `tracking-tight` | 大标题（H1、H2） |
| 正常 | `tracking-normal` | 正文 |
| 宽松 | `tracking-wide` | 小写标签、分组标题 |

### MDX 内容排版

MDX 文章内容使用 Tailwind Typography (`@tailwindcss/typography`) 插件的 `prose` 类：

```html
<article class="prose prose-neutral dark:prose-invert max-w-none">
  <!-- MDX 渲染内容 -->
</article>
```

关键 prose 配置：

| 元素 | 样式 |
| --- | --- |
| 段落 | `text-base leading-relaxed`，段间距 `1.25em` |
| 标题 | `font-bold tracking-tight`，上方间距 `2em` |
| 链接 | `text-primary underline underline-offset-4` |
| 行内代码 | `bg-muted px-1.5 py-0.5 rounded font-mono text-sm` |
| 代码块 | 由 rehype-pretty-code 处理，自定义样式 |
| 引用 | `border-l-2 border-border pl-4 italic text-muted-foreground` |
| 列表 | 标准缩进，`disc`/`decimal` 列表样式 |
| 图片 | `rounded-lg`，居中显示 |
| 表格 | 全宽，带边框和条纹行 |

---

## 间距系统

### 基础间距尺度

基于 Tailwind 的 4px 间距尺度（`1 unit = 4px = 0.25rem`）：

| Tailwind 值 | px | rem | 用途 |
| --- | --- | --- | --- |
| `0.5` | 2 | 0.125 | 微间距 |
| `1` | 4 | 0.25 | 最小间距 |
| `1.5` | 6 | 0.375 | 紧凑间距 |
| `2` | 8 | 0.5 | 小间距 |
| `3` | 12 | 0.75 | 组内间距 |
| `4` | 16 | 1 | 标准间距（组件内边距） |
| `5` | 20 | 1.25 | 中等间距 |
| `6` | 24 | 1.5 | 组件外边距 |
| `8` | 32 | 2 | 板块间距 |
| `10` | 40 | 2.5 | 大间距 |
| `12` | 48 | 3 | 页面板块间距 |
| `16` | 64 | 4 | 大型板块间距 |

### 常用间距约定

| 场景 | 间距 | Tailwind 类名 |
| --- | --- | --- |
| 页面水平边距（移动端） | 16px | `px-4` |
| 页面水平边距（桌面端） | 24px - 32px | `px-6` / `px-8` |
| 页面顶部间距 | 32px | `pt-8` |
| 卡片内边距 | 24px | `p-6` |
| 卡片间距 | 16px - 24px | `gap-4` / `gap-6` |
| 表单元素间距 | 16px | `space-y-4` |
| 导航项间距 | 8px - 12px | `gap-2` / `gap-3` |
| 按钮内部图标间距 | 8px | `gap-2` |
| 文字与图标间距 | 6px - 8px | `gap-1.5` / `gap-2` |
| 标签/徽章内边距 | 水平 8px，垂直 2px | `px-2 py-0.5` |

### 页面边距

```
┌──────────────────────────────────────────────────┐
│ ← px-4 (移动端) / px-6 (平板) / px-8 (桌面) →   │
│ ┌──────────────────────────────────────────────┐ │
│ │            max-w-4xl (896px)                 │ │
│ │         文章内容最大宽度                       │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │            max-w-6xl (1152px)                │ │
│ │         页面布局最大宽度                       │ │
│ └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

---

## 圆角

### 基础值

```css
--radius: 0.5rem; /* 8px */
```

### 变体

| 变体 | 计算方式 | 实际值 | Tailwind 类名 | 用途 |
| --- | --- | --- | --- | --- |
| sm | `--radius - 4px` | 4px | `rounded-sm` | 小型元素（标签、徽章） |
| md | `--radius - 2px` | 6px | `rounded-md` | 中型元素（按钮、输入框） |
| lg | `--radius` | 8px | `rounded-lg` | 大型元素（卡片、对话框） |
| xl | `--radius + 4px` | 12px | `rounded-xl` | 超大元素（Hero 区域、图片容器） |
| full | - | 9999px | `rounded-full` | 圆形（头像、标签圆角） |

### 使用规范

| 元素 | 圆角 |
| --- | --- |
| Button | `rounded-md` |
| Card | `rounded-xl` |
| Input | `rounded-md` |
| Badge | `rounded-full` 或 `rounded-md` |
| Dialog | `rounded-lg` |
| Image | `rounded-lg` |
| Code Block | `rounded-lg` |
| Avatar | `rounded-full` |
| Toast | `rounded-lg` |

---

## 阴影

### 常用阴影层级

| 层级 | Tailwind 类名 | 用途 |
| --- | --- | --- |
| 无阴影 | `shadow-none` | 默认状态的大部分元素 |
| 极轻 | `shadow-sm` | 按钮、输入框 |
| 轻度 | `shadow` | 卡片默认状态 |
| 中度 | `shadow-md` | 卡片 hover 状态、下拉菜单 |
| 重度 | `shadow-lg` | 对话框、命令面板 |
| 超重 | `shadow-xl` | 模态窗口 |

### 使用规范

- 扁平设计为主，阴影仅用于表达层级关系
- hover 状态可以增加阴影层级（如 `shadow` → `shadow-md`）
- 暗色模式下阴影效果减弱，可搭配边框使用
- 避免在同一页面中使用过多不同层级的阴影

---

## 响应式设计

### 断点定义

| 断点名 | 宽度 | Tailwind 前缀 | 典型设备 |
| --- | --- | --- | --- |
| 默认 | < 640px | (无前缀) | 手机竖屏 |
| sm | >= 640px | `sm:` | 手机横屏 / 小平板 |
| md | >= 768px | `md:` | 平板竖屏 |
| lg | >= 1024px | `lg:` | 平板横屏 / 笔记本 |
| xl | >= 1280px | `xl:` | 桌面显示器 |

### 各断点下的布局策略

#### 默认（< 640px）：移动端

- 单栏布局
- 导航栏折叠为汉堡菜单
- 页面边距 `px-4`
- 卡片全宽，垂直堆叠
- 文章列表单列
- 字号保持基础大小

#### sm（>= 640px）：手机横屏

- 保持单栏布局
- 可以出现双列小卡片
- 页面边距 `px-6`

#### md（>= 768px）：平板

- 导航栏展开，显示所有导航项
- 可以出现侧边栏（如文章目录 TOC）
- 文章列表可以双列网格
- 页面边距 `px-6`

#### lg（>= 1024px）：笔记本

- 完整的侧边栏布局
- 文章详情页：内容区 + 右侧 TOC
- 文章列表三列网格
- 页面边距 `px-8`

#### xl（>= 1280px）：桌面

- 最大宽度限制生效
- 内容居中显示
- 更宽裕的间距

### 内容最大宽度

| 场景 | 最大宽度 | Tailwind 类名 |
| --- | --- | --- |
| 文章正文 | 896px | `max-w-4xl` |
| 页面容器 | 1152px | `max-w-6xl` |
| 全宽布局 | 1280px | `max-w-7xl` |
| 窄容器（笔记、关于页） | 672px | `max-w-2xl` |

---

## 组件规范

### Button 变体

基于 `class-variance-authority` (CVA) 实现的按钮变体系统：

| 变体 | 样式 | 用途 |
| --- | --- | --- |
| `default` | 实心背景，primary 色 | 主要操作（提交、确认） |
| `secondary` | 实心背景，secondary 色 | 次要操作（取消、返回） |
| `outline` | 边框样式，透明背景 | 中性操作 |
| `ghost` | 无边框无背景，hover 显示背景 | 工具栏按钮、导航项 |
| `link` | 下划线文本链接样式 | 内联文本链接 |
| `destructive` | 红色背景 | 危险操作（删除） |

#### 尺寸

| 尺寸 | 高度 | 水平内边距 | 字号 | Tailwind |
| --- | --- | --- | --- | --- |
| `sm` | 32px (h-8) | 12px (px-3) | 12px (text-xs) | `size="sm"` |
| `default` | 36px (h-9) | 16px (px-4) | 14px (text-sm) | `size="default"` |
| `lg` | 40px (h-10) | 32px (px-8) | 14px (text-sm) | `size="lg"` |
| `icon` | 36px (h-9 w-9) | - | - | `size="icon"` |

### Card 使用规范

Card 是内容容器的基础组件：

```
┌─ Card ────────────────────────────────────┐
│ ┌─ CardHeader ─────────────────────────┐  │
│ │ CardTitle                            │  │
│ │ CardDescription                      │  │
│ └──────────────────────────────────────┘  │
│ ┌─ CardContent ────────────────────────┐  │
│ │ 主要内容                              │  │
│ └──────────────────────────────────────┘  │
│ ┌─ CardFooter ─────────────────────────┐  │
│ │ 操作按钮                              │  │
│ └──────────────────────────────────────┘  │
└───────────────────────────────────────────┘
```

| 属性 | 值 |
| --- | --- |
| 圆角 | `rounded-xl` |
| 边框 | `border border-border` |
| 背景 | `bg-card` |
| 阴影 | `shadow` |
| Header 内边距 | `p-6` |
| Content 内边距 | `p-6 pt-0` |
| Footer 内边距 | `p-6 pt-0` |
| Hover 效果（可选） | `hover:shadow-md transition-shadow` |

### Badge 标签样式

Badge 用于标签、分类、状态展示：

| 变体 | 样式 |
| --- | --- |
| `default` | `bg-primary text-primary-foreground` |
| `secondary` | `bg-secondary text-secondary-foreground` |
| `outline` | `border border-border text-foreground` |
| `destructive` | `bg-destructive text-destructive-foreground` |

通用样式：`rounded-full px-2.5 py-0.5 text-xs font-semibold`

### Input / Form 表单样式

| 属性 | 值 |
| --- | --- |
| 高度 | `h-10` (40px) |
| 圆角 | `rounded-md` |
| 边框 | `border border-input` |
| 背景 | `bg-background` |
| 字号 | `text-sm` |
| 内边距 | `px-3 py-2` |
| 聚焦 | `focus-visible:ring-2 ring-ring ring-offset-2` |
| 禁用 | `disabled:opacity-50 disabled:cursor-not-allowed` |
| placeholder | `text-muted-foreground` |

---

## 动画规范

### 过渡时长

| 时长 | 用途 | Tailwind 类名 |
| --- | --- | --- |
| 150ms | 快速反馈（按钮颜色变化、图标旋转） | `duration-150` |
| 200ms | 标准过渡（hover 效果、背景色切换） | `duration-200` |
| 300ms | 中等过渡（展开/收起、弹出） | `duration-300` |
| 500ms | 慢速过渡（页面级动画、View Transitions） | `duration-500` |

### 缓动函数

| 函数 | CSS 值 | Tailwind 类名 | 用途 |
| --- | --- | --- | --- |
| ease-out | `cubic-bezier(0, 0, 0.2, 1)` | `ease-out` | 元素出现（弹出、展开） |
| ease-in | `cubic-bezier(0.4, 0, 1, 1)` | `ease-in` | 元素消失（收起、关闭） |
| ease-in-out | `cubic-bezier(0.4, 0, 0.2, 1)` | `ease-in-out` | 位置移动、大小变化 |
| spring | `cubic-bezier(0.4, 0, 0.2, 1)` | 自定义 | 弹性效果 |

### Hover 状态

| 元素 | hover 效果 |
| --- | --- |
| Button (default) | `hover:bg-primary/90` |
| Button (ghost) | `hover:bg-accent hover:text-accent-foreground` |
| Card | `hover:shadow-md` 或 `hover:bg-muted/30` |
| Link | `hover:underline` 或 `hover:text-primary` |
| 导航项 | `hover:bg-accent hover:text-accent-foreground` |
| 图片 | `hover:scale-105`（配合 `transition-transform`） |

### Focus 状态

所有可交互元素必须有清晰的 focus-visible 样式：

```css
/* 全局 focus-visible 样式 */
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-ring
focus-visible:ring-offset-2
focus-visible:ring-offset-background
```

### 常用动画 Keyframes

通过 `tw-animate-css` 提供的动画：

| 动画名 | 用途 |
| --- | --- |
| `animate-in` | 元素进入动画基础 |
| `fade-in` | 淡入（配合 `animate-in`） |
| `slide-in-from-top` | 从顶部滑入 |
| `slide-in-from-bottom` | 从底部滑入 |
| `zoom-in` | 缩放进入 |
| `accordion-down` | 手风琴展开 |
| `accordion-up` | 手风琴收起 |

---

## 图标规范

### 图标库

项目使用 [Lucide React](https://lucide.dev/) 作为图标库。

选型理由：
- 一致的视觉风格（1.5px 线宽）
- 完整的 TypeScript 类型
- 支持 tree-shaking，按需引入
- 与 shadcn/ui 官方推荐一致

### 图标尺寸标准

| 场景 | 尺寸 | Tailwind 类名 |
| --- | --- | --- |
| 行内文字旁 | 14px | `h-3.5 w-3.5` |
| 按钮内 | 16px | `h-4 w-4` |
| 导航栏 | 16px - 20px | `h-4 w-4` / `h-5 w-5` |
| 功能图标 | 20px | `h-5 w-5` |
| 大型展示 | 24px | `h-6 w-6` |
| Hero 区域 | 32px+ | `h-8 w-8` 或更大 |

### 使用方式

```tsx
import { Search, Moon, Sun, ArrowRight } from "lucide-react";

// 基础用法
<Search className="h-4 w-4" />

// 按钮内
<Button>
  <ArrowRight className="h-4 w-4" />
  下一步
</Button>

// 带颜色
<Sun className="h-5 w-5 text-muted-foreground" />
```

### 图标颜色规范

| 场景 | 颜色 |
| --- | --- |
| 默认 | `text-foreground`（继承文本色） |
| 辅助 | `text-muted-foreground` |
| 交互 | `text-primary` |
| 成功 | `text-green-500` |
| 警告 | `text-yellow-500` |
| 错误 | `text-red-500` / `text-destructive` |

---

## 无障碍 (a11y) 标准

### 颜色对比度

遵循 WCAG 2.1 AA 标准：

| 场景 | 最低对比度 |
| --- | --- |
| 正文文本 | 4.5:1 |
| 大文本（>= 18px bold 或 >= 24px） | 3:1 |
| UI 组件和图形 | 3:1 |

验证工具：
- Chrome DevTools 颜色选择器
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### 焦点可见性

```css
/* 所有可交互元素必须有 focus-visible 样式 */
/* shadcn/ui 组件已默认配置，自定义组件需手动添加 */

.custom-interactive-element {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2;
}
```

规则：
- 使用 `focus-visible` 而非 `focus`，避免鼠标点击时出现聚焦环
- 聚焦环颜色使用 `ring` 变量，确保在所有主题下可见
- `ring-offset-2` 提供与背景的间距，增强可见性

### 语义化 HTML

| 场景 | 正确用法 | 错误用法 |
| --- | --- | --- |
| 页面标题 | `<h1>` - `<h6>` 正确层级 | 跳过标题层级 |
| 导航 | `<nav>` | `<div>` |
| 文章列表 | `<ul>` / `<ol>` | 无列表标记的 div 堆叠 |
| 文章 | `<article>` | `<div>` |
| 页脚 | `<footer>` | `<div>` |
| 按钮 | `<button>` | `<div onClick>` |
| 链接 | `<a href>` | `<span onClick>` |
| 时间 | `<time datetime>` | `<span>` |
| 图片 | `<img alt="描述">` | `<img>` 无 alt |

### ARIA 标签

| 场景 | ARIA 属性 | 示例 |
| --- | --- | --- |
| 图标按钮（无文字） | `aria-label` | `<button aria-label="切换主题">` |
| 展开/收起 | `aria-expanded` | `<button aria-expanded={isOpen}>` |
| 当前页面导航 | `aria-current="page"` | `<a aria-current="page">` |
| 加载状态 | `aria-busy` | `<div aria-busy={isLoading}>` |
| 实时区域 | `aria-live` | `<div aria-live="polite">` |
| 模态框 | `role="dialog"` + `aria-modal` | 由 Radix UI 自动处理 |
| 搜索区域 | `role="search"` | `<form role="search">` |

### 键盘导航要求

- 所有交互元素可通过 Tab 键按逻辑顺序访问
- 模态框打开时焦点被限制在模态框内（焦点陷阱）
- Esc 键关闭所有弹出层
- 下拉菜单/命令面板支持方向键导航
- Skip to content 跳过导航链接

---

## 命名约定

### 文件命名

| 类型 | 命名风格 | 示例 |
| --- | --- | --- |
| 组件文件 | kebab-case | `command-palette.tsx`, `post-card.tsx` |
| 工具函数 | kebab-case | `format-date.ts`, `cn.ts` |
| 类型定义 | kebab-case | `post-types.ts` |
| 页面文件 | Next.js 约定 | `page.tsx`, `layout.tsx`, `loading.tsx` |
| CSS 文件 | kebab-case | `globals.css` |
| 配置文件 | 工具约定 | `next.config.ts`, `tailwind.config.ts` |
| MDX 内容 | kebab-case | `my-first-post.mdx` |

### 组件命名

| 类型 | 命名风格 | 示例 |
| --- | --- | --- |
| React 组件 | PascalCase | `CommandPalette`, `PostCard` |
| 组件导出 | 命名导出 | `export function PostCard() {}` |
| HOC | with 前缀 | `withAuth` |
| Hook | use 前缀 | `useViewTransition`, `useTheme` |
| Context | PascalCase + Context | `ThemeContext` |
| Provider | PascalCase + Provider | `ThemeProvider` |

### CSS 变量

| 类型 | 命名风格 | 示例 |
| --- | --- | --- |
| 颜色变量 | --kebab-case | `--background`, `--primary-foreground` |
| 尺寸变量 | --kebab-case | `--radius` |
| 字体变量 | --font-kebab-case | `--font-geist-sans` |

### TypeScript 类型

| 类型 | 命名风格 | 示例 |
| --- | --- | --- |
| 接口 | PascalCase | `PostCardProps`, `SiteConfig` |
| 类型别名 | PascalCase | `CalloutType`, `NavItem` |
| 枚举 | PascalCase | `Theme.Light`, `Theme.Dark` |
| 泛型参数 | 单个大写字母或 PascalCase | `T`, `TData`, `TError` |

### 目录命名

```
src/
├── app/            # Next.js App Router 页面（小写）
├── components/     # 组件（kebab-case 子目录）
│   ├── ui/         # shadcn/ui 基础组件
│   ├── layout/     # 布局组件
│   ├── blog/       # 博客相关组件
│   ├── mdx/        # MDX 自定义组件
│   ├── notes/      # 笔记相关组件
│   └── search/     # 搜索相关组件
├── hooks/          # 自定义 Hooks
├── lib/            # 工具函数和配置
├── styles/         # 全局样式（如有额外 CSS）
└── types/          # 全局类型定义
```
