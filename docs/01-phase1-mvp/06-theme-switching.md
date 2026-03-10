# 暗色/亮色主题切换

## 概述

Finn Days 博客支持亮色、暗色和系统跟随三种主题模式。使用 `next-themes` 库实现主题切换，配合 shadcn/ui 的 CSS 变量系统实现无缝的颜色过渡。当前项目的 `globals.css` 已配置了完整的 `:root`（亮色）和 `.dark`（暗色）CSS 变量，只需集成 `next-themes` 并创建主题切换组件即可。

## 技术方案

- **核心库**：`next-themes` — 处理主题状态管理、持久化、系统偏好检测
- **CSS 方案**：CSS 变量 + Tailwind `dark:` 变体 + shadcn/ui 自动适配
- **切换方式**：三态循环（亮色 -> 暗色 -> 系统）
- **持久化**：localStorage（`next-themes` 默认行为）
- **代码高亮**：Shiki 双主题跟随暗色模式

## 依赖说明

```bash
npm install next-themes
```

`next-themes` 是一个轻量级库（~3KB），专为 Next.js 设计，支持 App Router。

## 安装与配置

### 步骤 1：安装 next-themes

```bash
npm install next-themes
```

### 步骤 2：创建 ThemeProvider 组件

```typescript
// src/components/layout/theme-provider.tsx
'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

// 直接使用 next-themes 的 ThemeProviderProps 类型
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

**为什么需要这个包装组件？**

`next-themes` 的 `ThemeProvider` 使用了 React Context（`createContext`），必须在 Client Component 中使用。通过创建一个独立的 `'use client'` 包装组件，避免在 `layout.tsx`（Server Component）中直接标记 `'use client'`。

### 步骤 3：在 layout.tsx 中集成

```typescript
// src/app/layout.tsx
import { ThemeProvider } from "@/components/layout/theme-provider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            {/* Navbar, main, Footer */}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### ThemeProvider 配置参数详解

| 参数 | 值 | 说明 |
|------|-----|------|
| `attribute` | `"class"` | 通过添加/移除 `class="dark"` 到 `<html>` 元素切换主题 |
| `defaultTheme` | `"system"` | 默认跟随系统偏好（而非固定亮色或暗色） |
| `enableSystem` | `true` | 启用系统主题偏好检测 |
| `disableTransitionOnChange` | `true` | 切换主题时禁用过渡动画，避免闪烁 |

## 避免主题闪烁 (FOUC)

### 问题说明

主题闪烁（Flash of Unstyled Content）是指页面首次加载时短暂显示错误的主题颜色。例如：用户选择了暗色模式，但页面先显示亮色再跳到暗色。

### 解决方案

`next-themes` 通过以下机制避免闪烁：

#### 1. `suppressHydrationWarning`

```html
<html lang="zh-CN" suppressHydrationWarning>
```

**必须添加在 `<html>` 标签上**。`next-themes` 会在服务端和客户端渲染不同的 `class` 属性值，`suppressHydrationWarning` 告诉 React 忽略这个不匹配。

> 注意：`suppressHydrationWarning` 只抑制 `<html>` 元素本身的警告，不会影响子元素。

#### 2. `attribute="class"`

使用 CSS class 而非 `data-theme` 属性。这与 Tailwind CSS 的 `dark:` 变体和 shadcn/ui 的 `.dark` 选择器完全兼容。

#### 3. 注入阻塞脚本

`next-themes` 自动在 `<html>` 中注入一个阻塞（blocking）`<script>` 标签，在页面渲染前同步读取 localStorage 并设置 `class="dark"`。这确保了首次渲染就使用正确的主题。

流程：

```
1. 服务端渲染 HTML（无 dark class）
2. 浏览器接收 HTML
3. 阻塞脚本执行 → 读取 localStorage → 添加/移除 dark class
4. 页面渲染（已经是正确的主题）
5. React 水化
```

#### 4. `defaultTheme="system"`

默认使用系统偏好，意味着大多数用户在首次访问时就能看到他们偏好的主题。

## ThemeToggle 组件设计

### `src/components/layout/theme-toggle.tsx`

```typescript
// src/components/layout/theme-toggle.tsx
'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // 只在客户端渲染后显示，避免水化不匹配
  useEffect(() => {
    setMounted(true)
  }, [])

  // 三态循环：light → dark → system
  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  // 未挂载时显示占位按钮（避免布局跳动）
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
        <Sun className="h-4 w-4" />
        <span className="sr-only">切换主题</span>
      </Button>
    )
  }

  // 获取当前图标
  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-4 w-4" />
    }
    if (resolvedTheme === 'dark') {
      return <Moon className="h-4 w-4" />
    }
    return <Sun className="h-4 w-4" />
  }

  // 获取当前标签
  const getLabel = () => {
    switch (theme) {
      case 'light': return '亮色模式'
      case 'dark': return '暗色模式'
      default: return '跟随系统'
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={cycleTheme}
      aria-label={getLabel()}
      title={getLabel()}
    >
      {getIcon()}
      <span className="sr-only">{getLabel()}</span>
    </Button>
  )
}
```

### 动画过渡效果（可选增强）

如果希望图标切换时有过渡动画：

```typescript
// 带动画的 ThemeToggle
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
        <span className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 relative"
      onClick={cycleTheme}
      aria-label={theme === 'light' ? '亮色模式' : theme === 'dark' ? '暗色模式' : '跟随系统'}
    >
      {/* 太阳图标 */}
      <Sun
        className={cn(
          "h-4 w-4 absolute transition-all duration-300",
          resolvedTheme === 'light' && theme !== 'system'
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        )}
      />
      {/* 月亮图标 */}
      <Moon
        className={cn(
          "h-4 w-4 absolute transition-all duration-300",
          resolvedTheme === 'dark' && theme !== 'system'
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0"
        )}
      />
      {/* 系统图标 */}
      <Monitor
        className={cn(
          "h-4 w-4 absolute transition-all duration-300",
          theme === 'system'
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0"
        )}
      />
      <span className="sr-only">切换主题</span>
    </Button>
  )
}
```

### 三态切换逻辑

```
点击循环顺序：

  ☀️ Light  →  🌙 Dark  →  🖥️ System  →  ☀️ Light  → ...

每个状态：
- Light:  强制亮色，忽略系统偏好
- Dark:   强制暗色，忽略系统偏好
- System: 跟随操作系统偏好设置
```

### 为什么需要 mounted 检查？

```typescript
const [mounted, setMounted] = useState(false)
useEffect(() => { setMounted(true) }, [])
```

因为 `useTheme()` 返回的 `theme` 值在服务端和客户端可能不同（服务端不知道用户选了什么主题），直接渲染会导致水化不匹配。通过 `mounted` 状态确保只在客户端渲染后才显示真实的主题图标。

## CSS 变量映射

### 已有配置（globals.css）

项目的 `globals.css` 已经配置了完整的 CSS 变量系统：

```css
/* 亮色模式 */
:root {
  --background: 0 0% 100%;        /* 白色背景 */
  --foreground: 0 0% 3.9%;        /* 近黑色文字 */
  --card: 0 0% 100%;              /* 白色卡片 */
  --primary: 0 0% 9%;             /* 深色主色 */
  --secondary: 0 0% 96.1%;        /* 浅灰色次要色 */
  --muted: 0 0% 96.1%;            /* 柔和色 */
  --muted-foreground: 0 0% 45.1%; /* 柔和文字色 */
  --accent: 0 0% 96.1%;           /* 强调色 */
  --border: 0 0% 89.8%;           /* 边框色 */
  --ring: 0 0% 3.9%;              /* 聚焦环色 */
  /* ... 更多变量 */
}

/* 暗色模式 */
.dark {
  --background: 0 0% 3.9%;        /* 近黑色背景 */
  --foreground: 0 0% 98%;          /* 近白色文字 */
  --card: 0 0% 3.9%;              /* 深色卡片 */
  --primary: 0 0% 98%;             /* 浅色主色 */
  --secondary: 0 0% 14.9%;        /* 深灰色次要色 */
  --muted: 0 0% 14.9%;            /* 柔和色 */
  --muted-foreground: 0 0% 63.9%; /* 柔和文字色 */
  --accent: 0 0% 14.9%;           /* 强调色 */
  --border: 0 0% 14.9%;           /* 边框色 */
  --ring: 0 0% 83.1%;             /* 聚焦环色 */
  /* ... 更多变量 */
}
```

### Tailwind 与 CSS 变量的映射

在 `globals.css` 的 `@theme inline` 块中，Tailwind 的颜色类映射到 CSS 变量：

```css
@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-primary: hsl(var(--primary));
  /* ... */
}
```

这意味着：
- `bg-background` → `hsl(var(--background))` → 亮色 `hsl(0 0% 100%)` / 暗色 `hsl(0 0% 3.9%)`
- `text-foreground` → `hsl(var(--foreground))` → 亮色 `hsl(0 0% 3.9%)` / 暗色 `hsl(0 0% 98%)`

### 暗色模式变体

在 `globals.css` 中已配置：

```css
@custom-variant dark (&:is(.dark *));
```

这允许使用 Tailwind 的 `dark:` 变体：

```html
<div class="bg-white dark:bg-gray-900">
  <p class="text-gray-900 dark:text-gray-100">Hello</p>
</div>
```

但在大多数情况下，使用 CSS 变量类（如 `bg-background`、`text-foreground`）更好，因为它们自动适配两种模式。

## Tailwind CSS dark: 变体使用指南

### 使用 CSS 变量（推荐）

```tsx
// 推荐：使用 shadcn/ui CSS 变量类
<div className="bg-background text-foreground">
  <p className="text-muted-foreground">自动适配暗色模式</p>
  <div className="border border-border rounded-md">
    <Card className="bg-card text-card-foreground">...</Card>
  </div>
</div>
```

### 使用 dark: 变体（特殊场景）

```tsx
// 仅在需要覆盖 CSS 变量默认值时使用
<div className="bg-purple-100 dark:bg-purple-900/30">
  <span className="text-purple-800 dark:text-purple-300">
    自定义暗色模式颜色
  </span>
</div>
```

### 品牌渐变色

品牌渐变色（`purple-600 → blue-600`）在两种模式下表现一致，不需要特殊处理：

```tsx
<h1 className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
  Finn Days
</h1>
```

## 代码高亮主题跟随暗色模式

### Shiki 双主题方案

在 `velite.config.ts` 中配置 `rehype-pretty-code` 使用双主题：

```typescript
[rehypePrettyCode, {
  theme: {
    dark: 'github-dark',
    light: 'github-light',
  },
}]
```

### CSS 切换逻辑

双主题方案会生成两套代码样式（通过 `data-theme` 属性区分），在 `globals.css` 中控制显示/隐藏：

```css
/* globals.css 中添加 */

/* 代码块暗色模式切换 */
[data-rehype-pretty-code-figure] code[data-theme="dark"],
[data-rehype-pretty-code-figure] pre[data-theme="dark"] {
  display: none;
}

.dark [data-rehype-pretty-code-figure] code[data-theme="dark"],
.dark [data-rehype-pretty-code-figure] pre[data-theme="dark"] {
  display: block;
}

.dark [data-rehype-pretty-code-figure] code[data-theme="light"],
.dark [data-rehype-pretty-code-figure] pre[data-theme="light"] {
  display: none;
}
```

**原理**：

1. Shiki 为每个代码块生成两个版本（light 和 dark）
2. 默认显示 light 版本，隐藏 dark 版本
3. 当 `<html>` 添加 `class="dark"` 时，CSS 规则切换显示/隐藏
4. 整个过程纯 CSS，无 JavaScript 参与

## shadcn/ui 组件自动适配暗色模式

shadcn/ui 的所有组件使用 CSS 变量定义颜色，因此自动适配暗色模式：

```tsx
// Button 组件
// bg-primary → 亮色 hsl(0 0% 9%)（深色按钮）
// bg-primary → 暗色 hsl(0 0% 98%)（浅色按钮）
<Button>Click me</Button>

// Card 组件
// bg-card → 亮色 白色
// bg-card → 暗色 近黑色
<Card>Content</Card>
```

无需为每个 shadcn/ui 组件单独处理暗色模式。

## Cookie 持久化用户偏好

`next-themes` 默认使用 `localStorage` 存储主题偏好。如果需要服务端也能读取（例如 SSR 时避免闪烁），可以配置 cookie 存储：

```typescript
// 可选：使用 cookie 存储
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  storageKey="finn-days-theme"  // 自定义存储键名
>
```

> 注意：对于大多数博客场景，`localStorage` 已足够。`next-themes` 的阻塞脚本方案已经很好地解决了闪烁问题。

## 实现步骤汇总

### 步骤 1：安装依赖

```bash
npm install next-themes
```

### 步骤 2：创建 ThemeProvider

创建 `src/components/layout/theme-provider.tsx`（见上方代码）

### 步骤 3：创建 ThemeToggle

创建 `src/components/layout/theme-toggle.tsx`（见上方代码）

### 步骤 4：修改 layout.tsx

```typescript
// 添加 suppressHydrationWarning 和 ThemeProvider
<html lang="zh-CN" suppressHydrationWarning>
  <body>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {/* ... */}
    </ThemeProvider>
  </body>
</html>
```

### 步骤 5：在 Navbar 中集成 ThemeToggle

```typescript
// 在 navbar.tsx 中
import { ThemeToggle } from "./theme-toggle"

// 桌面端
<div className="hidden md:flex items-center gap-1">
  <DesktopNav items={navLinks} />
  <div className="ml-2 border-l pl-2">
    <ThemeToggle />
  </div>
</div>

// 移动端
<div className="flex items-center gap-2 md:hidden">
  <ThemeToggle />
  <MobileNav items={navLinks} />
</div>
```

### 步骤 6：添加代码高亮主题切换 CSS

在 `globals.css` 中添加代码块的暗色模式 CSS 规则（见上方）

## 文件清单

| 文件路径 | 说明 |
|----------|------|
| `src/components/layout/theme-provider.tsx` | 新建：ThemeProvider 包装组件 |
| `src/components/layout/theme-toggle.tsx` | 新建：主题切换按钮组件 |
| `src/app/layout.tsx` | 修改：集成 ThemeProvider，添加 suppressHydrationWarning |
| `src/components/layout/navbar.tsx` | 修改：集成 ThemeToggle |
| `src/app/globals.css` | 修改：添加代码高亮暗色模式 CSS |

## 测试要点

1. **主题切换功能**
   - 点击 ThemeToggle，确认主题在 Light -> Dark -> System 之间循环
   - 确认图标正确对应当前主题
   - 确认 `<html>` 元素的 class 正确切换（`dark` / 无）

2. **主题持久化**
   - 选择暗色模式后刷新页面，确认保持暗色
   - 清除 localStorage 后刷新，确认回到系统默认
   - 确认 localStorage 中存储了正确的主题值

3. **避免闪烁 (FOUC)**
   - 设置暗色模式，硬刷新页面（Ctrl+Shift+R）
   - 确认没有亮色闪烁
   - 使用浏览器开发者工具的 Network 面板禁用缓存后测试

4. **系统偏好跟随**
   - 将主题设为 "system"
   - 修改操作系统暗色模式设置，确认页面实时跟随
   - Windows: 设置 → 个性化 → 颜色
   - macOS: 系统偏好设置 → 外观

5. **CSS 变量生效**
   - 确认 `bg-background`、`text-foreground` 等类在两种模式下颜色正确
   - 确认 shadcn/ui 组件（Button、Card 等）在暗色模式下样式正确
   - 确认边框、阴影等细节在暗色模式下可见

6. **代码高亮主题**
   - 确认亮色模式下显示 `github-light` 主题
   - 确认暗色模式下显示 `github-dark` 主题
   - 确认切换时代码块主题同步变化

7. **品牌渐变色**
   - 确认 `from-purple-600 to-blue-600` 渐变在两种模式下视觉效果良好

8. **可访问性**
   - 确认 ThemeToggle 有 `aria-label`
   - 确认 screen reader 能读取当前主题状态
   - 确认键盘可以操作 ThemeToggle

## 注意事项

1. **`suppressHydrationWarning` 的位置**：必须放在 `<html>` 标签上，不是 `<body>`
2. **不要在 Server Component 中使用 `useTheme`**：`useTheme` 是 Client Component 专属的 hook
3. **mounted 检查**：ThemeToggle 必须在客户端挂载后才渲染真实图标
4. **`disableTransitionOnChange`**：建议启用，否则切换主题时所有有 `transition` 的元素会闪烁
5. **CSS 变量 vs dark: 变体**：优先使用 CSS 变量类（`bg-background`），只在需要自定义暗色效果时使用 `dark:` 变体
6. **Tailwind CSS 4 的 dark 变体配置**：已在 `globals.css` 中通过 `@custom-variant dark (&:is(.dark *))` 配置，确保 `.dark` 类在 `<html>` 上时所有子元素都能响应 `dark:` 变体
7. **next-themes 版本**：确保安装的版本支持 Next.js 15+ 和 React 19
8. **初始加载性能**：`next-themes` 注入的阻塞脚本非常小（约 200 字节），不影响首屏性能
