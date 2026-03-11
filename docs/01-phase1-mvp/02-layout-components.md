# 公共布局组件抽取

## 概述

当前 Finn Days 博客的所有布局代码（导航栏、页脚等）都混合在 `src/app/page.tsx` 中，且整个页面被标记为 `'use client'` 组件。这导致无法利用 Next.js Server Components 的优势，代码难以复用，且增加了客户端 JavaScript 包体积。

本文档详细描述将公共布局组件抽取到独立文件的完整方案，包括 Navbar、Footer、MobileNav、ThemeToggle 等组件的设计与实现。

## 当前问题分析

### 现有代码结构

```
src/app/page.tsx  (约190行, 'use client')
├── 导航栏 (nav) — 包含状态管理 (mobileMenuOpen)
├── Hero Section
├── Recent Posts — 硬编码数据
├── Skills Section
└── Footer
```

### 具体问题

1. **整个页面是 Client Component**
   - `page.tsx` 顶部声明了 `'use client'`
   - 导致整个首页（包括静态内容）都在客户端渲染
   - 无法使用 Server Components 的性能优势（零 JS bundle、直接数据库查询等）
   - SEO 不友好（尽管 Next.js 会做 SSR，但增加了水化成本）

2. **布局代码不可复用**
   - 导航栏和页脚直接写在 `page.tsx` 中
   - 新增页面（/blog、/about 等）需要复制粘贴
   - 样式/链接修改需要在多处同步

3. **交互状态管理不合理**
   - `mobileMenuOpen` 状态导致整个页面必须是 Client Component
   - 只有移动端菜单需要 `useState`，不应该影响整个页面

4. **无主题切换功能**
   - 没有集成 ThemeProvider
   - 导航栏缺少暗色模式切换按钮

5. **导航链接使用 Button 而非 Link**
   - 当前使用 `<Button variant="ghost">Blog</Button>`
   - 没有实际的路由跳转功能
   - 应该使用 `next/link` 的 `<Link>` 组件

## 重构目标

1. 将导航栏和页脚提取为独立组件
2. 最小化 Client Component 的使用范围
3. 在 `layout.tsx` 中集成公共布局
4. 所有页面共享统一的 Navbar + Footer
5. 导航链接使用 `next/link` 实现路由
6. 集成暗色模式切换
7. 支持移动端响应式菜单

## 组件文件位置

```
src/
├── components/
│   ├── layout/
│   │   ├── navbar.tsx         # 导航栏（Server Component 外壳）
│   │   ├── mobile-nav.tsx     # 移动端菜单（Client Component）
│   │   ├── footer.tsx         # 页脚（Server Component）
│   │   ├── theme-toggle.tsx   # 主题切换按钮（Client Component）
│   │   └── site-header.tsx    # 可选：导航栏包装组件
│   ├── ui/
│   │   ├── button.tsx         # 已有
│   │   └── card.tsx           # 已有
│   └── icons.tsx              # 可选：自定义图标组件
├── app/
│   ├── layout.tsx             # 修改：集成 Navbar + Footer + ThemeProvider
│   └── page.tsx               # 修改：移除布局代码，只保留页面内容
└── config/
    └── site.ts                # 站点配置（导航链接、社交链接等）
```

## 站点配置文件

### `src/config/site.ts`

将导航链接、社交链接等抽取为统一配置：

```typescript
// src/config/site.ts

export const siteConfig = {
  name: "Finn Days",
  description: "Exploring technology, sharing knowledge, and documenting my journey in web development",
  url: "https://finn7x.com",  // 站点 URL
  author: {
    name: "Finn",
    email: "finn@example.com",
    github: "https://github.com/finn",
    twitter: "https://twitter.com/finn",
  },
  links: {
    github: "https://github.com/finn/finn-days",
  },
}

// 导航链接配置
export const navLinks = [
  { title: "Blog", href: "/blog" },
  { title: "Projects", href: "/projects" },
  { title: "Tags", href: "/tags" },
  { title: "About", href: "/about" },
] as const

// 社交链接配置
export const socialLinks = [
  {
    title: "GitHub",
    href: "https://github.com/finn",
    icon: "github",   // 对应 lucide-react 图标名
  },
  {
    title: "Twitter",
    href: "https://twitter.com/finn",
    icon: "twitter",
  },
  {
    title: "Email",
    href: "mailto:finn@example.com",
    icon: "mail",
  },
] as const
```

## Navbar 组件设计

### 设计原则

- 外壳为 Server Component，仅将需要交互的部分拆为 Client Component
- 桌面端导航为静态链接列表
- 移动端汉堡菜单为 Client Component（需要 `useState`）
- 主题切换按钮为 Client Component（需要 `useTheme`）
- 滚动时添加模糊背景效果
- 活跃链接高亮显示

### `src/components/layout/navbar.tsx`

```typescript
// src/components/layout/navbar.tsx
import Image from "next/image"
import { Link } from "@/i18n/routing"
import { siteConfig } from "@/config/site"
import { DesktopNav } from "./desktop-nav"
import { MobileNav } from "./mobile-nav"
import { ThemeToggle } from "./theme-toggle"
import { LanguageSwitcher } from "./language-switcher"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        {/* Logo + 站点名称 */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/favicon.svg"
            alt="Logo"
            width={28}
            height={28}
            className="rounded-sm"
          />
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-lg font-bold text-transparent">
            {siteConfig.name}
          </span>
        </Link>

        {/* 桌面端导航 */}
        <DesktopNav />

        {/* 右侧操作区：语言切换 + 主题切换 + 移动端菜单 */}
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
```

> **注意**：导航链接使用 `@/i18n/routing` 的 `Link` 组件而非 `next/link`，确保链接自动携带当前 locale 前缀（如 `/zh/tags`、`/en/blog`）。

### 桌面端导航 `src/components/layout/desktop-nav.tsx`

```typescript
// src/components/layout/desktop-nav.tsx
'use client'

import { Link } from "@/i18n/routing"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
}

interface DesktopNavProps {
  items: readonly NavItem[]
}

export function DesktopNav({ items }: DesktopNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {items.map((item) => {
        // 判断是否为活跃链接
        const isActive =
          pathname === item.href ||
          pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-md transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              isActive
                ? "text-foreground bg-accent"
                : "text-muted-foreground"
            )}
          >
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
```

**活跃链接高亮逻辑**：

- `pathname === item.href`：精确匹配，如 `/blog` 页面高亮 "Blog"
- `pathname.startsWith(item.href + '/')`：前缀匹配，如 `/blog/my-post` 也高亮 "Blog"

### 滚动时的样式变化

Navbar 使用 `sticky top-0` 定位，通过 CSS 实现模糊背景效果：

```css
/* 关键样式说明 */
bg-background/80        /* 80% 不透明度的背景色 */
backdrop-blur-md        /* 模糊背景 */
border-b border-border/40  /* 半透明下边框 */
```

这种方式不需要 JavaScript 监听滚动事件，纯 CSS 实现，性能更好。

如果需要滚动后才显示边框/背景（初始透明），可以添加滚动检测：

```typescript
// 可选：滚动检测 hook
// src/hooks/use-scroll.ts
'use client'

import { useState, useEffect } from 'react'

export function useScroll(threshold = 10) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > threshold)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return scrolled
}
```

## MobileNav 组件设计

### `src/components/layout/mobile-nav.tsx`

```typescript
// src/components/layout/mobile-nav.tsx
'use client'

import { useState } from "react"
import { Link } from "@/i18n/routing"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { siteConfig } from "@/config/site"

interface NavItem {
  title: string
  href: string
}

interface MobileNavProps {
  items: readonly NavItem[]
}

export function MobileNav({ items }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* 汉堡菜单按钮 */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={() => setOpen(!open)}
        aria-label={open ? "关闭菜单" : "打开菜单"}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* 移动端菜单面板 */}
      {open && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 top-14 z-40 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* 菜单内容 */}
          <div className="fixed inset-x-0 top-14 z-50 border-b bg-background p-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1">
              {items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)} // 点击链接后关闭菜单
                    className={cn(
                      "flex items-center rounded-md px-3 py-2.5 text-base font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive
                        ? "text-foreground bg-accent"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.title}
                  </Link>
                )
              })}
            </nav>

            {/* 底部站点信息 */}
            <div className="mt-4 border-t pt-4">
              <p className="text-sm text-muted-foreground">
                {siteConfig.description}
              </p>
            </div>
          </div>
        </>
      )}
    </>
  )
}
```

### MobileNav 设计要点

1. **背景遮罩**：点击背景区域关闭菜单
2. **动画效果**：使用 tw-animate-css 的 `animate-in slide-in-from-top-2` 实现滑入动画
3. **自动关闭**：点击导航链接后自动关闭菜单（`onClick={() => setOpen(false)}`）
4. **可访问性**：`aria-label` 和 `aria-expanded` 属性
5. **路由变化关闭**：可选添加 `useEffect` 监听 `pathname` 变化自动关闭

## Footer 组件设计

### `src/components/layout/footer.tsx`

```typescript
// src/components/layout/footer.tsx
import { Link } from "@/i18n/routing"
import { Github, Twitter, Mail, Rss } from "lucide-react"
import { Button } from "@/components/ui/button"
import { siteConfig, navLinks } from "@/config/site"

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* 上部：导航 + 社交链接 */}
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          {/* 导航链接 */}
          <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.title}
              </Link>
            ))}
          </nav>

          {/* 社交链接 */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild>
              <a
                href={siteConfig.author.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a
                href={siteConfig.author.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a
                href={`mailto:${siteConfig.author.email}`}
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/feed.xml" aria-label="RSS Feed">
                <Rss className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* 分割线 */}
        <div className="mt-8 border-t pt-8">
          {/* 版权信息 */}
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteConfig.name}. Built with{" "}
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:text-foreground"
            >
              Next.js
            </a>{" "}
            and{" "}
            <a
              href="https://tailwindcss.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:text-foreground"
            >
              Tailwind CSS
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  )
}
```

### Footer 设计要点

1. **Server Component**：Footer 是纯静态内容，不需要 `'use client'`
2. **社交链接使用 `asChild`**：Button 的 `asChild` prop 让 `<a>` 元素获得按钮样式
3. **外部链接安全**：`target="_blank"` + `rel="noopener noreferrer"`
4. **RSS 链接**：指向 `/feed.xml`
5. **动态年份**：`new Date().getFullYear()` 自动显示当前年份
6. **响应式布局**：移动端垂直居中排列，桌面端水平两端分布

## layout.tsx 修改方案

### 布局架构：Root Layout + Locale Layout

项目使用 `next-intl` 实现国际化，布局分为两层：

#### `src/app/layout.tsx`（Root Layout — 纯 passthrough）

```typescript
// src/app/layout.tsx
import "./globals.css"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
```

Root Layout 只负责引入全局样式，不包含 `<html>` 或 `<body>` 标签。

#### `src/app/[locale]/layout.tsx`（Locale Layout — 实际布局）

```typescript
// src/app/[locale]/layout.tsx
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import { siteConfig } from "@/config/site"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: { icon: "/favicon.svg" },
  metadataBase: new URL(siteConfig.url),
  alternates: {
    types: {
      "application/rss+xml": [
        { url: "/feed.xml", title: `${siteConfig.name} RSS Feed` },
      ],
      "application/atom+xml": [
        { url: "/atom.xml", title: `${siteConfig.name} Atom Feed` },
      ],
    },
  },
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as "zh" | "en")) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

### 关键设计说明

1. **`lang={locale}` 动态设置**：`<html>` 的 `lang` 属性根据当前路由的 locale 参数动态设置（`zh` 或 `en`），而非硬编码 `"zh-CN"`
2. **`suppressHydrationWarning`**：在 `<html>` 标签上添加，防止 next-themes 导致的水化警告
3. **`NextIntlClientProvider`**：包裹整个页面，为所有子组件提供国际化翻译上下文
4. **`ThemeProvider` 包裹**：启用暗色模式支持（详见主题切换文档）
5. **`flex min-h-screen flex-col`**：确保 Footer 始终在底部（即使内容不足一屏）
6. **`main.flex-1`**：主内容区域占据剩余空间
7. **`metadata.title.template`**：子页面标题自动拼接站点名称
8. **RSS alternates**：在 HTML head 中声明 RSS 链接
9. **locale 校验**：不合法的 locale 参数会触发 `notFound()`

## 重构后的 page.tsx

移除布局代码后，`page.tsx` 只需保留页面内容：

```typescript
// src/app/[locale]/page.tsx
// 注意：移除 'use client'，变为 Server Component
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Github } from "lucide-react"
import { getAllPosts } from "@/lib/content"

export default function HomePage() {
  // Server Component 中直接获取数据
  const recentPosts = getAllPosts().slice(0, 3)

  return (
    <>
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Welcome to Finn Days
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Exploring technology, sharing knowledge, and documenting my journey
          </p>
          <div className="flex justify-center gap-4">
            <Button className="gap-2" asChild>
              <a href={`mailto:finn@example.com`}>
                <Mail className="h-4 w-4" />
                Subscribe
              </a>
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <a href="https://github.com/finn" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Recent Posts - 使用真实数据 */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Recent Posts</h2>
            <Button variant="ghost" asChild>
              <Link href="/blog">View all →</Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <Link key={post.slugAsParams} href={post.permalink}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                      <span>{post.readingTime} read</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                    <p className="text-muted-foreground line-clamp-2">
                      {post.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section - 保持不变 */}
      {/* ... */}
    </>
  )
}
```

## 完整代码结构示意

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx              # ← Root Layout（passthrough，仅引入 globals.css）
│   ├── [locale]/
│   │   ├── layout.tsx          # ← Locale Layout（html/body/providers/Navbar/Footer）
│   │   ├── page.tsx            # 首页（Server Component）
│   │   ├── blog/
│   │   │   ├── page.tsx        # 博客列表页
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # 文章详情页
│   │   ├── projects/
│   │   │   └── page.tsx        # 项目展示页
│   │   ├── about/
│   │   │   └── page.tsx        # 关于页面
│   │   └── tags/
│   │       ├── page.tsx        # 标签索引页
│   │       └── [tag]/
│   │           └── page.tsx    # 标签筛选页
│   ├── feed.xml/
│   │   └── route.ts            # RSS feed
│   └── atom.xml/
│       └── route.ts            # Atom feed
├── components/
│   ├── layout/
│   │   ├── navbar.tsx          # 导航栏（Server Component）
│   │   ├── desktop-nav.tsx     # 桌面端导航（Client Component - usePathname）
│   │   ├── mobile-nav.tsx      # 移动端菜单（Client Component - useState）
│   │   ├── footer.tsx          # 页脚（Server Component）
│   │   ├── theme-toggle.tsx    # 主题切换按钮（Client Component）
│   │   └── theme-provider.tsx  # 主题 Provider（Client Component）
│   └── ui/
│       ├── button.tsx          # 已有
│       └── card.tsx            # 已有
├── config/
│   └── site.ts                 # 站点配置
├── hooks/
│   └── use-scroll.ts           # 可选：滚动检测 hook
└── lib/
    ├── utils.ts                # 已有
    └── content.ts              # 内容查询函数
```

## Server Component vs Client Component 划分

| 组件 | 类型 | 原因 |
|------|------|------|
| `Navbar` | Server Component | 纯静态结构，组合子组件 |
| `DesktopNav` | Client Component | 需要 `usePathname` 判断活跃链接 |
| `MobileNav` | Client Component | 需要 `useState` 控制菜单展开 |
| `Footer` | Server Component | 纯静态内容 |
| `ThemeToggle` | Client Component | 需要 `useTheme` hook |
| `ThemeProvider` | Client Component | 需要 context Provider |
| `HomePage` | Server Component | 数据获取在服务端完成 |

## 依赖说明

当前已有的依赖足以实现基础布局组件，无需新增依赖：

- `@/i18n/routing` — i18n 路由链接（`Link` 组件，自动保留 locale 前缀）
- `next/image` — 图片优化
- `next-intl` — 国际化（`NextIntlClientProvider`、`useTranslations`、`useLocale`）
- `lucide-react` — 图标
- `@/components/ui/button` — 按钮组件
- `tailwind-merge` + `clsx` — 样式合并
- `next-themes` — 主题切换（详见主题文档）

## 测试要点

1. **导航功能**
   - 点击每个导航链接，确认路由正确跳转
   - 确认活跃链接高亮正确（精确匹配 + 前缀匹配）
   - 在各个子页面确认导航栏正常显示

2. **移动端菜单**
   - 缩小浏览器窗口到移动端尺寸
   - 确认汉堡菜单按钮显示，桌面导航隐藏
   - 点击汉堡菜单，确认菜单面板正确展开
   - 点击导航链接后菜单自动关闭
   - 点击背景遮罩关闭菜单
   - 测试动画效果是否流畅

3. **响应式布局**
   - 测试 320px、768px、1024px、1440px 等常见断点
   - 确认 Footer 在内容不足一屏时固定在底部
   - 确认导航栏在各分辨率下不溢出

4. **Server Component 验证**
   - 确认 `page.tsx` 已移除 `'use client'`
   - 检查浏览器 Network 面板，确认页面初始 HTML 包含完整内容
   - 确认 Client Component 的 JS bundle 最小化

5. **可访问性**
   - 键盘导航测试（Tab 键遍历所有链接）
   - Screen reader 测试 `aria-label` 和 `aria-expanded`
   - 对比度检查（特别是暗色模式下）

6. **SEO**
   - 确认页面标题正确（子页面使用 template 格式）
   - 确认 HTML head 包含 RSS link 声明
   - 确认社交链接使用正确的 `rel` 属性

## 注意事项

1. **不要在 Server Component 中使用 hooks**：`useState`、`useEffect` 等 React hooks 只能在 Client Component 中使用
2. **Client Component 边界最小化**：只把需要交互的最小部分标记为 `'use client'`
3. **`asChild` 的使用**：当需要让 `<Button>` 渲染为 `<a>` 或 `<Link>` 时，使用 `asChild` prop
4. **图片路径**：Logo 使用 `public/favicon.svg`，通过 `<Image>` 组件引用，路径为 `/favicon.svg`
5. **配置集中管理**：所有站点信息放在 `src/config/site.ts`，便于统一修改
6. **样式一致性**：使用 shadcn/ui 的 CSS 变量（`text-muted-foreground` 等），确保暗色模式自动适配
7. **导航栏高度**：固定 `h-14`（56px），页面内容区域需要留出对应的顶部间距
8. **动画依赖**：`animate-in slide-in-from-top-2` 需要 `tw-animate-css`（已安装）
9. **使用 i18n Link**：所有内部导航链接必须使用 `@/i18n/routing` 的 `Link` 组件，而非 `next/link`，否则会丢失 locale 前缀
10. **HTML lang 动态设置**：`<html lang={locale}>` 根据路由参数动态设置，不硬编码
