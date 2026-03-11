# 文章详情页

## 概述

文章详情页是博客的核心阅读体验页面，展示单篇文章的完整 MDX 内容。页面包含文章标题、元信息、正文排版、代码语法高亮、目录导航 (TOC)、上下篇导航等功能。采用静态生成 (SSG) 实现，构建时预渲染所有已发布文章。

## 技术方案

- **路由**：`/[locale]/blog/[slug]` -> `src/app/[locale]/blog/[slug]/page.tsx`
- **渲染方式**：Server Component + generateStaticParams 静态生成
- **内容渲染**：Velite 编译后的 MDX 通过 `useMDXComponent` 渲染
- **代码高亮**：Shiki + rehype-pretty-code（在 Velite 构建时处理）
- **目录导航**：Intersection Observer 实现滚动高亮
- **排版样式**：Tailwind Typography (`@tailwindcss/typography` 的 `prose` 类)

## 页面整体布局

```
┌──────────────────────────────────────────────────┐
│                   Navbar (公共)                    │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────┬───────────────────────┬─────────┐    │
│  │        │     PostHeader        │         │    │
│  │        │  ┌─────────────────┐  │         │    │
│  │        │  │ 分类 Badge      │  │         │    │
│  │ 左侧   │  │ 文章标题        │  │ 右侧    │    │
│  │ 空白   │  │ 日期 · 阅读时长  │  │ TOC     │    │
│  │        │  │ 标签列表        │  │ 侧边栏  │    │
│  │        │  └─────────────────┘  │         │    │
│  │        │                       │ ┌─────┐ │    │
│  │        │     MDX 正文内容       │ │目录  │ │    │
│  │        │                       │ │     │ │    │
│  │        │  # Heading 1          │ │ H1  │ │    │
│  │        │  正文段落...           │ │ H2 ←│ │ ← 高亮
│  │        │  ## Heading 2         │ │ H3  │ │    │
│  │        │  代码块               │ │     │ │    │
│  │        │  ...                  │ └─────┘ │    │
│  │        │                       │         │    │
│  │        │  ┌─────────────────┐  │         │    │
│  │        │  │ 系列文章导航     │  │         │    │
│  │        │  └─────────────────┘  │         │    │
│  │        │  ┌─────────────────┐  │         │    │
│  │        │  │ ← 上一篇 下一篇 →│  │         │    │
│  │        │  └─────────────────┘  │         │    │
│  └────────┴───────────────────────┴─────────┘    │
│                                                  │
├──────────────────────────────────────────────────┤
│                   Footer (公共)                    │
└──────────────────────────────────────────────────┘
```

### 布局规格

| 区域 | 宽度 | 说明 |
|------|------|------|
| 左侧空白 | 自适应 | 居中对齐的留白 |
| 内容区域 | max-w-3xl (768px) | 文章正文最大宽度 |
| TOC 侧边栏 | w-56 (224px) | 固定在右侧，仅桌面端显示 |

### 响应式行为

| 屏幕宽度 | 布局 |
|----------|------|
| < 1280px (xl) | 内容居中，TOC 隐藏 |
| >= 1280px (xl) | 内容 + TOC 侧边栏 |

## 依赖说明

```bash
# MDX 渲染（Velite 已自带 MDX 编译，但需要运行时组件）
# Velite 已包含 MDX 支持，无需额外安装

# 代码语法高亮（在 Velite 构建时处理）
npm install rehype-pretty-code shiki

# Markdown 增强
npm install rehype-slug rehype-autolink-headings remark-gfm

# 排版样式
npm install @tailwindcss/typography
```

## PostHeader 组件

### `src/components/post-header.tsx`

```typescript
// src/components/post-header.tsx
import { useLocale } from "next-intl"
import { Link } from "@/i18n/routing"
import { tagToSlug } from "@/lib/tag-utils"
import { Calendar, Clock, RotateCw } from "lucide-react"

interface PostHeaderProps {
  title: string
  date: string
  updated?: string
  readingTime: string
  tags: string[]
}

export function PostHeader({
  title,
  date,
  updated,
  readingTime,
  tags,
}: PostHeaderProps) {
  const locale = useLocale()
  const dateLocale = locale === "zh" ? "zh-CN" : "en-US"

  return (
    <header className="mb-8">
      {/* 标题 */}
      <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h1>

      {/* 元信息 */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        {/* 发布日期 */}
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {new Date(date).toLocaleDateString(dateLocale, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>

        {/* 更新日期 */}
        {updated && (
          <span className="flex items-center gap-1">
            <RotateCw className="h-3.5 w-3.5" />
            {new Date(updated).toLocaleDateString(dateLocale, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        )}

        {/* 阅读时长 */}
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {readingTime}
        </span>
      </div>

      {/* 标签 — 使用 tagToSlug 而非 encodeURIComponent */}
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${tagToSlug(tag)}`}
              className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
```

> **关键变更**：
> - 使用 `@/i18n/routing` 的 `Link` 替代 `next/link`，确保标签链接保留 locale 前缀
> - 标签 href 使用 `tagToSlug(tag)` 替代 `encodeURIComponent(tag)`，避免含点号的 URL 被 middleware 排除
> - 日期格式化使用 `useLocale()` 动态获取 locale，而非硬编码 `"zh-CN"`

## MDX 内容渲染

### MDX Component 渲染方案

Velite 在构建时将 MDX 编译为代码字符串。在运行时，我们需要将其渲染为 React 组件。

### `src/components/mdx-content.tsx`

```typescript
// src/components/mdx-content.tsx
'use client'

import * as runtime from 'react/jsx-runtime'
import { Children, isValidElement, useMemo } from 'react'
import { CopyButton } from './copy-button'

/**
 * 递归提取 React children 树中的纯文本内容
 * 用于代码块复制功能 — Velite 不注入 raw 属性，需要手动提取
 */
function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (!node) return ''
  if (isValidElement(node)) {
    return extractText((node.props as { children?: React.ReactNode }).children)
  }
  if (Array.isArray(node)) return node.map(extractText).join('')
  return Children.toArray(node).map(extractText).join('')
}

function useMDXComponent(code: string) {
  return useMemo(() => {
    const fn = new Function(code)
    return fn({ ...runtime }).default
  }, [code])
}

// 自定义 MDX 组件映射
const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="mt-8 scroll-m-20 text-3xl font-bold tracking-tight" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mt-8 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mt-6 scroll-m-20 text-xl font-semibold tracking-tight" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="leading-7 [&:not(:first-child)]:mt-4" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="font-medium text-primary underline underline-offset-4" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="my-4 ml-6 list-disc [&>li]:mt-2" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="my-4 ml-6 list-decimal [&>li]:mt-2" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="mt-4 border-l-4 border-primary/30 pl-4 italic text-muted-foreground" {...props} />
  ),
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="border border-border bg-muted px-4 py-2 text-left font-semibold" {...props} />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="border border-border px-4 py-2" {...props} />
  ),

  // 代码块 — 使用 extractText 提取文本，传给 CopyButton
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => {
    const codeText = extractText(children)
    return (
      <div className="group relative my-4">
        {codeText && (
          <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
            <CopyButton text={codeText} />
          </div>
        )}
        <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-4 text-sm leading-relaxed" {...props}>
          {children}
        </pre>
      </div>
    )
  },

  // 行内代码
  code: (props: React.HTMLAttributes<HTMLElement>) => {
    const isInline = typeof props.children === 'string'
    if (isInline && !props.className) {
      return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" {...props} />
    }
    return <code {...props} />
  },

  // 图片
  img: ({ alt, src, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="my-4 rounded-lg border" alt={alt ?? ''} src={src} loading="lazy" {...props} />
  ),

  hr: () => <hr className="my-6 border-border" />,
}

interface MdxContentProps {
  code: string
}

export function MdxContent({ code }: MdxContentProps) {
  const render = useMDXComponent(code)
  return (
    <article className="prose-custom">
      {render({ components })}
    </article>
  )
}
```

> **关键变更**：
> - `extractText()` 递归提取 React children 中的文本，替代了依赖 Velite 注入 `raw` 属性的方案
> - `CopyButton` 组件接收 `text` prop 直接传入代码文本，而非通过 DOM 查找
> - `useMDXComponent` 使用 `useMemo` 缓存编译结果
> - 渲染方式从 `<Component components={components} />` 改为 `{render({ components })}`，避免 ESLint `react-hooks/static-components` 报错

## 代码语法高亮

### Shiki + rehype-pretty-code 集成配置

代码语法高亮在 Velite 构建时通过 `rehype-pretty-code` 处理，不需要运行时 JavaScript。

### 在 velite.config.ts 中的配置

```typescript
// velite.config.ts 的 mdx 配置部分
mdx: {
  rehypePlugins: [
    rehypeSlug,
    [rehypePrettyCode, {
      // 双主题：跟随暗色模式
      theme: {
        dark: 'github-dark',
        light: 'github-light',
      },
      defaultLang: 'plaintext',
      // 启用行号
      grid: true,
      // 保持与 Shiki 的默认行为一致
      keepBackground: false,
    }],
    // ...
  ],
}
```

### 主题跟随暗色模式

rehype-pretty-code 的双主题方案会生成两套代码样式，通过 CSS 变量和 `data-theme` 属性切换：

```css
/* 在 globals.css 中添加 */

/* rehype-pretty-code 双主题支持 */
[data-rehype-pretty-code-figure] pre {
  @apply overflow-x-auto rounded-lg border p-4;
}

[data-rehype-pretty-code-figure] code {
  @apply text-sm;
  counter-reset: line;
}

/* 亮色主题下隐藏暗色主题代码 */
[data-rehype-pretty-code-figure] code[data-theme="dark"] {
  display: none;
}

.dark [data-rehype-pretty-code-figure] code[data-theme="light"] {
  display: none;
}

.dark [data-rehype-pretty-code-figure] code[data-theme="dark"] {
  display: block;
}
```

### 行高亮

在 MDX 中使用行高亮语法：

````markdown
```typescript {3,5-7}
const a = 1
const b = 2
const c = 3  // 高亮行
const d = 4
const e = 5  // 高亮行
const f = 6  // 高亮行
const g = 7  // 高亮行
```
````

对应的 CSS：

```css
/* 高亮行样式 */
[data-rehype-pretty-code-figure] code [data-highlighted-line] {
  @apply bg-primary/10 border-l-2 border-primary;
}
```

### 行号

```css
/* 行号样式 */
[data-rehype-pretty-code-figure] code[data-line-numbers] {
  counter-reset: line;
}

[data-rehype-pretty-code-figure] code[data-line-numbers] > [data-line]::before {
  counter-increment: line;
  content: counter(line);
  @apply mr-4 inline-block w-4 text-right text-muted-foreground/50;
}
```

### 文件名标签

在 MDX 中使用：

````markdown
```typescript title="src/lib/utils.ts"
export function cn(...inputs) {
  // ...
}
```
````

对应的 CSS：

```css
/* 文件名标签 */
[data-rehype-pretty-code-title] {
  @apply rounded-t-lg border border-b-0 bg-muted px-4 py-2 text-sm font-medium text-muted-foreground;
}

[data-rehype-pretty-code-title] + pre {
  @apply rounded-t-none;
}
```

### 代码块复制按钮

#### `src/components/copy-button.tsx`

```typescript
// src/components/copy-button.tsx
'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </Button>
  )
}
```

> **关键变更**：CopyButton 接收 `text` prop 直接传入代码文本，而非通过 DOM 查找 (`button.closest('.group')?.querySelector('pre')`)。代码文本由 `extractText()` 在 `pre` 组件中提取后传入。

## 目录导航 (TOC)

### 数据来源

Velite 在编译 MDX 时自动提取标题生成 TOC 数据结构（通过 `s.toc()` schema）。

TOC 数据格式：

```typescript
interface TocEntry {
  title: string
  url: string      // '#heading-slug'
  items?: TocEntry[]  // 子标题
}
```

### TOC 组件：`src/components/toc.tsx`

```typescript
// src/components/toc.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface TocEntry {
  title: string
  url: string
  items?: TocEntry[]
}

interface TableOfContentsProps {
  toc: TocEntry[]
}

export function TableOfContents({ toc }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // 获取所有标题元素
    const headings = document.querySelectorAll('h2[id], h3[id], h4[id]')

    // 创建 Intersection Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-80px 0px -80% 0px', // 顶部偏移（导航栏高度）+ 只关注顶部 20% 区域
        threshold: 0,
      }
    )

    headings.forEach((heading) => {
      observerRef.current?.observe(heading)
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  if (toc.length === 0) return null

  // 递归渲染 TOC 项
  function renderTocItems(items: TocEntry[], depth: number = 0) {
    return (
      <ul className={cn("space-y-1", depth > 0 && "ml-4")}>
        {items.map((item) => {
          const id = item.url.replace('#', '')
          const isActive = activeId === id

          return (
            <li key={item.url}>
              <a
                href={item.url}
                onClick={(e) => {
                  e.preventDefault()
                  const element = document.getElementById(id)
                  if (element) {
                    const top = element.offsetTop - 80 // 导航栏高度补偿
                    window.scrollTo({ top, behavior: 'smooth' })
                  }
                }}
                className={cn(
                  "block py-1 text-sm transition-colors hover:text-foreground",
                  isActive
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {item.title}
              </a>
              {item.items && item.items.length > 0 && renderTocItems(item.items, depth + 1)}
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="hidden xl:block">
      <div className="sticky top-20">
        <p className="mb-3 text-sm font-semibold">目录</p>
        <nav className="max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
          {renderTocItems(toc)}
        </nav>
      </div>
    </div>
  )
}
```

### TOC 设计要点

1. **Intersection Observer**：监听所有标题元素的可见性，自动高亮当前阅读位置
2. **rootMargin**：`-80px 0px -80% 0px` 表示只关注视口顶部 20% 区域（扣除导航栏高度）
3. **平滑滚动**：点击 TOC 项时使用 `scrollTo({ behavior: 'smooth' })`
4. **固定定位**：使用 `sticky top-20` 固定在右侧，滚动时始终可见
5. **溢出处理**：`max-h-[calc(100vh-8rem)] overflow-y-auto` 处理超长目录
6. **响应式**：`hidden xl:block` 仅在超宽屏幕（>= 1280px）显示

## 阅读时长计算

阅读时长在 Velite 构建时计算（见 `velite.config.ts` 中的 `computeReadingTime` 函数）：

```typescript
function computeReadingTime(content: string): string {
  // 中文字符计数
  const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length
  // 英文单词计数
  const englishWords = content
    .replace(/[\u4e00-\u9fff]/g, '')
    .split(/\s+/)
    .filter(Boolean).length

  const chineseMinutes = chineseChars / 300  // 中文 ~300字/分钟
  const englishMinutes = englishWords / 200    // 英文 ~200词/分钟
  const totalMinutes = Math.ceil(chineseMinutes + englishMinutes)

  return `${Math.max(1, totalMinutes)} min`
}
```

### 阅读速度参考

| 语言 | 阅读速度 | 依据 |
|------|---------|------|
| 中文 | ~300 字/分钟 | 一般成人阅读速度 |
| 英文 | ~200 词/分钟 | Medium 平台标准 |

## 上一篇/下一篇导航

### `src/components/post-nav.tsx`

```typescript
// src/components/post-nav.tsx
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PostNavProps {
  prev: { title: string; slugAsParams: string } | null
  next: { title: string; slugAsParams: string } | null
}

export function PostNav({ prev, next }: PostNavProps) {
  const t = useTranslations("blog")

  if (!prev && !next) return null

  return (
    <nav className="mt-12 grid gap-4 border-t pt-8 sm:grid-cols-2">
      {/* 上一篇 — 使用 i18n 翻译 */}
      {prev ? (
        <Link
          href={`/blog/${prev.slugAsParams}`}
          className="group flex items-start gap-2 rounded-lg border p-4 transition-colors hover:bg-accent"
        >
          <ChevronLeft className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">{t("prev")}</p>
            <p className="line-clamp-2 text-sm font-medium group-hover:text-primary">
              {prev.title}
            </p>
          </div>
        </Link>
      ) : (
        <div />
      )}
      {/* 下一篇 */}
      {next ? (
        <Link
          href={`/blog/${next.slugAsParams}`}
          className="group flex items-start justify-end gap-2 rounded-lg border p-4 text-right transition-colors hover:bg-accent"
        >
          <div>
            <p className="text-xs text-muted-foreground">{t("next")}</p>
            <p className="line-clamp-2 text-sm font-medium group-hover:text-primary">
              {next.title}
            </p>
          </div>
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  )
}
```

> **关键变更**：使用 `useTranslations("blog")` 获取 `t("prev")` / `t("next")` 翻译，替代硬编码的"上一篇"/"下一篇"。使用 `@/i18n/routing` 的 `Link`。

## 系列文章导航

### `src/components/series-nav.tsx`

```typescript
// src/components/series-nav.tsx
import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { BookOpen } from "lucide-react"

interface SeriesPost {
  title: string
  permalink: string
  order: number
}

interface SeriesNavProps {
  seriesTitle: string
  posts: SeriesPost[]
  currentOrder: number
}

export function SeriesNav({ seriesTitle, posts, currentOrder }: SeriesNavProps) {
  return (
    <div className="my-8 rounded-lg border bg-muted/30 p-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">系列：{seriesTitle}</h3>
      </div>

      <ol className="space-y-2">
        {posts.map((post) => {
          const isCurrent = post.order === currentOrder
          return (
            <li key={post.permalink}>
              {isCurrent ? (
                <span
                  className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {post.order}
                  </span>
                  {post.title}（当前）
                </span>
              ) : (
                <Link
                  href={post.permalink}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs">
                    {post.order}
                  </span>
                  {post.title}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
```

## 文章详情页完整实现

### `src/app/blog/[slug]/page.tsx`

```typescript
// src/app/[locale]/blog/[slug]/page.tsx
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPostBySlug, getAllPosts, getAdjacentPosts, getPostsBySeries } from "@/lib/content"
import { PostHeader } from "@/components/post-header"
import { MdxContent } from "@/components/mdx-content"
import { TableOfContents } from "@/components/toc"
import { PostNav } from "@/components/post-nav"
import { SeriesNav } from "@/components/series-nav"
import { siteConfig } from "@/config/site"

interface PostPageProps {
  params: Promise<{
    slug: string
  }>
}

// 静态生成所有文章页面
export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slugAsParams,
  }))
}

// 动态 SEO metadata
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return {
      title: "文章未找到",
    }
  }

  return {
    title: post.title,
    description: post.description,
    authors: [{ name: siteConfig.author.name }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated,
      tags: post.tags,
      images: post.cover ? [{ url: post.cover }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: post.cover ? [post.cover] : undefined,
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  // 404 处理
  if (!post) {
    notFound()
  }

  // 获取上一篇/下一篇
  const { prev, next } = getAdjacentPosts(slug)

  // 获取系列文章（如果属于某个系列）
  const seriesPosts = post.series
    ? getPostsBySeries(post.series.title).map((p) => ({
        title: p.title,
        permalink: p.permalink,
        order: p.series!.order,
      }))
    : null

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="flex gap-12">
        {/* 主内容区域 */}
        <article className="min-w-0 flex-1 max-w-3xl mx-auto xl:mx-0">
          {/* 文章头部 */}
          <PostHeader
            title={post.title}
            date={post.date}
            updated={post.updated}
            readingTime={post.readingTime}
            tags={post.tags}
            category={post.category}
          />

          {/* 系列文章导航 */}
          {seriesPosts && post.series && (
            <SeriesNav
              seriesTitle={post.series.title}
              posts={seriesPosts}
              currentOrder={post.series.order}
            />
          )}

          {/* MDX 正文内容 */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <MdxContent code={post.content} />
          </div>

          {/* 上一篇/下一篇 */}
          <PostNav
            prev={prev ? { title: prev.title, permalink: prev.permalink } : null}
            next={next ? { title: next.title, permalink: next.permalink } : null}
          />
        </article>

        {/* TOC 侧边栏 */}
        <aside className="hidden xl:block w-56 shrink-0">
          <TableOfContents toc={post.toc} />
        </aside>
      </div>
    </div>
  )
}
```

## MDX 排版样式 (Tailwind Typography)

### 安装 @tailwindcss/typography

```bash
npm install @tailwindcss/typography
```

### 在 globals.css 中引入

```css
/* globals.css */
@import "tailwindcss";
@import "tw-animate-css";
@import "@tailwindcss/typography";  /* 添加 */
```

### prose 类说明

文章正文容器使用以下类：

```html
<div class="prose prose-neutral dark:prose-invert max-w-none">
```

| 类名 | 说明 |
|------|------|
| `prose` | 启用 Typography 排版样式 |
| `prose-neutral` | 使用 neutral 色系（与 shadcn/ui 一致） |
| `dark:prose-invert` | 暗色模式下反转文字颜色 |
| `max-w-none` | 取消 prose 的默认最大宽度限制（由外层容器控制） |

### 自定义排版样式

如果需要覆盖 prose 的默认样式，可在 globals.css 中添加：

```css
/* 自定义排版 */
.prose {
  --tw-prose-links: hsl(var(--primary));

  /* 行内代码样式（避免与代码块冲突） */
  :where(code):not(:where(pre *)) {
    @apply rounded bg-muted px-1.5 py-0.5 font-mono text-sm before:content-none after:content-none;
  }

  /* 图片圆角 */
  img {
    @apply rounded-lg;
  }

  /* 调整标题间距 */
  h2 {
    @apply scroll-m-20;
  }

  h3 {
    @apply scroll-m-20;
  }
}
```

## generateStaticParams 静态生成

```typescript
export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slugAsParams,
  }))
}
```

- 构建时自动为所有已发布文章生成静态 HTML
- 新增文章后需要重新构建
- 草稿文章（`draft: true`）不会生成静态页面

## 404 处理

当 slug 不匹配任何文章时：

```typescript
const post = getPostBySlug(slug)
if (!post) {
  notFound()  // 触发 Next.js 404 页面
}
```

可以创建自定义 404 页面：

```typescript
// src/app/[locale]/blog/[slug]/not-found.tsx
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"

export default function PostNotFound() {
  const t = useTranslations("blog")

  return (
    <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
      <h1 className="text-4xl font-bold mb-4">{t("notFound")}</h1>
      <p className="text-muted-foreground mb-8">
        {t("notFoundDescription")}
      </p>
      <Button asChild>
        <Link href="/blog">{t("backToList")}</Link>
      </Button>
    </div>
  )
}
```

> 使用 `useTranslations("blog")` 的 `notFound`、`notFoundDescription`、`backToList` 翻译键，替代硬编码的中文文案。

## 文件清单

| 文件路径 | 说明 |
|----------|------|
| `src/app/[locale]/blog/[slug]/page.tsx` | 文章详情页主文件 |
| `src/app/[locale]/blog/[slug]/not-found.tsx` | 文章 404 页面（使用 i18n 翻译） |
| `src/components/post-header.tsx` | 文章头部组件 |
| `src/components/mdx-content.tsx` | MDX 内容渲染组件（Client Component） |
| `src/components/copy-button.tsx` | 代码复制按钮（Client Component） |
| `src/components/toc.tsx` | 目录导航（Client Component） |
| `src/components/post-nav.tsx` | 上一篇/下一篇导航 |
| `src/components/series-nav.tsx` | 系列文章导航 |
| `src/app/globals.css` | 需修改：添加代码高亮和排版样式 |

## 测试要点

1. **内容渲染**
   - 确认 MDX 内容正确渲染为 HTML
   - 测试各种 Markdown 元素：标题、段落、列表、引用、表格、链接
   - 测试 GFM 扩展：任务列表、删除线、自动链接
   - 测试中英文混合内容排版

2. **代码语法高亮**
   - 确认代码块有正确的语法高亮
   - 测试不同语言的代码块（TypeScript、JavaScript、CSS、Bash 等）
   - 测试行高亮功能
   - 测试文件名标签显示
   - 确认亮色/暗色模式下代码主题正确切换
   - 测试代码复制按钮功能

3. **目录导航**
   - 确认 TOC 正确提取所有标题
   - 确认滚动时 TOC 高亮跟随正确
   - 确认点击 TOC 项平滑滚动到目标位置
   - 测试超长目录的滚动
   - 确认移动端 TOC 隐藏

4. **导航功能**
   - 确认上一篇/下一篇链接正确
   - 确认系列文章导航正确显示和排序
   - 确认第一篇/最后一篇文章的边界情况

5. **SEO**
   - 检查 `<title>` 标签
   - 检查 Open Graph 和 Twitter Card meta 标签
   - 确认 `generateStaticParams` 正确生成所有路径

6. **404 处理**
   - 访问不存在的 slug，确认显示 404 页面
   - 确认 404 页面有返回博客列表的链接

7. **响应式**
   - 桌面端：内容 + TOC 侧边栏
   - 移动端：仅显示内容，TOC 隐藏
   - 代码块横向滚动不溢出

## 注意事项

1. **MDX Component 是 Client Component**：`useMDXComponent` 使用了 `new Function`，必须在客户端执行
2. **scroll-m-20**：标题元素添加 `scroll-margin-top` 确保锚链接跳转时不被导航栏遮挡
3. **代码块样式覆盖**：MDX 自定义组件中的 `code` 样式可能与 `rehype-pretty-code` 生成的结构冲突，需要使用选择器优先级控制
4. **图片路径**：MDX 中引用的图片路径必须是绝对路径（如 `/images/xxx.png`）或由 Velite 处理的相对路径
5. **TOC 性能**：Intersection Observer 的 `rootMargin` 设置需要根据导航栏实际高度调整
6. **阅读时长精度**：计算结果取整（`Math.ceil`），最小值为 1 分钟
7. **`@tailwindcss/typography` 兼容性**：Tailwind CSS 4 使用 `@import` 引入，不同于 v3 的插件配置
8. **params 异步**：Next.js 15+ 中 `params` 是 `Promise` 类型，需要 `await`
