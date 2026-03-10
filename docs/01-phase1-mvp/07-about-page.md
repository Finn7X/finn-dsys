# 关于页面

## 概述

关于页面展示博主的个人信息、技术栈、经历和联系方式。作为博客的重要补充页面，帮助读者了解博主背景，建立信任和连接。页面采用 Server Component 实现，内容可以直接在组件中编写，也可以使用 MDX 文件作为内容源。

## 技术方案

- **路由**：`/about` -> `src/app/about/page.tsx`
- **渲染方式**：Server Component + 静态生成
- **内容来源**：直接在 TSX 中编写（推荐 MVP 阶段）或使用 MDX 文件
- **样式**：Tailwind CSS + shadcn/ui 组件

## 页面内容设计

```
┌─────────────────────────────────────────┐
│              Navbar (公共)               │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────┐      │
│  │       个人介绍区域             │      │
│  │  ┌──────┐                     │      │
│  │  │ 头像  │  Finn              │      │
│  │  │      │  Web Developer      │      │
│  │  └──────┘                     │      │
│  │                               │      │
│  │  Hello! 我是 Finn，一个热爱    │      │
│  │  技术的 Web 开发者...          │      │
│  │                               │      │
│  │  [GitHub] [Twitter] [Email]   │      │
│  └───────────────────────────────┘      │
│                                         │
│  ┌───────────────────────────────┐      │
│  │       技术栈展示               │      │
│  │                               │      │
│  │  Frontend:                    │      │
│  │  [React] [Next.js] [TS] ...  │      │
│  │                               │      │
│  │  Backend:                     │      │
│  │  [Node.js] [Python] ...      │      │
│  │                               │      │
│  │  Tools:                       │      │
│  │  [Docker] [Git] [Linux] ...  │      │
│  └───────────────────────────────┘      │
│                                         │
│  ┌───────────────────────────────┐      │
│  │       经历时间线（可选）        │      │
│  │                               │      │
│  │  2024 ── 某公司 前端开发       │      │
│  │          │                    │      │
│  │  2022 ── 某大学 计算机科学     │      │
│  │          │                    │      │
│  │  2020 ── 开始编程学习          │      │
│  └───────────────────────────────┘      │
│                                         │
│  ┌───────────────────────────────┐      │
│  │       联系方式                 │      │
│  │                               │      │
│  │  可以通过以下方式联系我：       │      │
│  │  Email / GitHub / Twitter     │      │
│  └───────────────────────────────┘      │
│                                         │
├─────────────────────────────────────────┤
│              Footer (公共)               │
└─────────────────────────────────────────┘
```

## 实现方案

### 方案 A：直接在 TSX 中编写（推荐 MVP）

简单直接，适合内容不多、不频繁更新的场景。

### 方案 B：使用 MDX 文件作为内容源

将关于页面的内容写在 `content/pages/about.mdx` 中，通过 Velite 编译后渲染。适合内容较长、需要频繁更新的场景。

**MVP 阶段推荐方案 A**，后续根据需要迁移到方案 B。

## 完整实现

### 数据配置：`src/config/about.ts`

```typescript
// src/config/about.ts

export const aboutConfig = {
  name: "Finn",
  role: "Web Developer",
  avatar: "/images/avatar.jpg",  // 头像图片路径
  bio: [
    "Hello! 我是 Finn，一个热爱技术的 Web 开发者。",
    "我喜欢探索新技术，并将学习过程记录在这个博客中。我相信通过分享知识，我们可以一起成长。",
    "目前专注于 React 生态系统和现代 Web 开发，同时对 DevOps 和云原生技术充满兴趣。",
  ],
  location: "China",
}

// 技术栈配置
export const techStack = {
  Frontend: [
    { name: "React", icon: "react" },
    { name: "Next.js", icon: "nextjs" },
    { name: "TypeScript", icon: "typescript" },
    { name: "Tailwind CSS", icon: "tailwindcss" },
    { name: "HTML/CSS", icon: "html" },
    { name: "JavaScript", icon: "javascript" },
  ],
  Backend: [
    { name: "Node.js", icon: "nodejs" },
    { name: "Python", icon: "python" },
    { name: "PostgreSQL", icon: "postgresql" },
    { name: "Redis", icon: "redis" },
  ],
  DevOps: [
    { name: "Docker", icon: "docker" },
    { name: "Linux", icon: "linux" },
    { name: "Git", icon: "git" },
    { name: "Nginx", icon: "nginx" },
  ],
} as const

// 经历时间线
export const timeline = [
  {
    year: "2024",
    title: "某科技公司",
    role: "前端开发工程师",
    description: "负责公司核心产品的前端开发，使用 React 和 TypeScript。",
  },
  {
    year: "2022",
    title: "某大学",
    role: "计算机科学学士",
    description: "主修计算机科学与技术，学习了数据结构、算法、操作系统等课程。",
  },
  {
    year: "2020",
    title: "自学编程",
    role: "编程学习之旅",
    description: "开始学习 HTML、CSS 和 JavaScript，踏上 Web 开发之路。",
  },
] as const
```

### `src/app/about/page.tsx`

```typescript
// src/app/about/page.tsx
import type { Metadata } from "next"
import Image from "next/image"
import { Github, Twitter, Mail, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { siteConfig } from "@/config/site"
import { aboutConfig, techStack, timeline } from "@/config/about"

export const metadata: Metadata = {
  title: "About",
  description: `关于 ${aboutConfig.name} — ${aboutConfig.role}`,
}

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      {/* ==================== */}
      {/* 个人介绍区域 */}
      {/* ==================== */}
      <section className="mb-16">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
          {/* 头像 */}
          <div className="shrink-0">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-primary/10 shadow-lg">
              <Image
                src={aboutConfig.avatar}
                alt={aboutConfig.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* 个人信息 */}
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              {aboutConfig.name}
            </h1>
            <p className="text-lg text-primary font-medium mb-1">
              {aboutConfig.role}
            </p>
            {aboutConfig.location && (
              <p className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-4 sm:justify-start">
                <MapPin className="h-3.5 w-3.5" />
                {aboutConfig.location}
              </p>
            )}

            {/* 个人简介 */}
            <div className="space-y-3 text-muted-foreground max-w-2xl">
              {aboutConfig.bio.map((paragraph, index) => (
                <p key={index} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* 社交链接 */}
            <div className="mt-6 flex items-center justify-center gap-2 sm:justify-start">
              <Button variant="outline" size="sm" asChild>
                <a
                  href={siteConfig.author.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={siteConfig.author.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`mailto:${siteConfig.author.email}`}
                  className="gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== */}
      {/* 技术栈展示 */}
      {/* ==================== */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold tracking-tight mb-6">技术栈</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(techStack).map(([category, items]) => (
            <Card key={category}>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 text-primary">
                  {category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <span
                      key={item.name}
                      className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-sm font-medium text-secondary-foreground"
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ==================== */}
      {/* 经历时间线 */}
      {/* ==================== */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold tracking-tight mb-6">经历</h2>
        <div className="relative border-l-2 border-border pl-8 space-y-10">
          {timeline.map((item, index) => (
            <div key={index} className="relative">
              {/* 时间线节点 */}
              <div className="absolute -left-[calc(2rem+5px)] top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />

              {/* 年份 */}
              <span className="text-sm font-medium text-primary">
                {item.year}
              </span>

              {/* 内容 */}
              <h3 className="text-lg font-semibold mt-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground font-medium">
                {item.role}
              </p>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== */}
      {/* 联系方式 */}
      {/* ==================== */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4">联系我</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4 leading-relaxed">
              如果你有任何问题、合作意向，或者只是想打个招呼，都欢迎通过以下方式联系我。
              我通常会在 24 小时内回复。
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <a
                  href={`mailto:${siteConfig.author.email}`}
                  className="gap-2"
                >
                  <Mail className="h-4 w-4" />
                  发送邮件
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a
                  href={siteConfig.author.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <Github className="h-4 w-4" />
                  GitHub Issues
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
```

## MDX 内容源方案（可选）

如果后续希望将关于页面内容用 MDX 管理，可以按以下方式实现。

### 在 Velite 中添加 Pages 集合

```typescript
// velite.config.ts 中添加
const pages = defineCollection({
  name: 'Page',
  pattern: 'pages/**/*.mdx',
  schema: s.object({
    title: s.string(),
    description: s.string(),
    slug: s.path(),
    content: s.mdx(),
  }),
})
```

### 创建内容文件

```markdown
<!-- content/pages/about.mdx -->
---
title: "About"
description: "关于 Finn"
---

## Hello!

我是 Finn，一个热爱技术的 Web 开发者...
```

### 在页面中渲染

```typescript
// src/app/about/page.tsx
import { pages } from '#site/content'
import { MdxContent } from '@/components/mdx-content'

export default function AboutPage() {
  const page = pages.find((p) => p.slug === 'pages/about')
  if (!page) return null

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <MdxContent code={page.content} />
      </div>
    </div>
  )
}
```

## 页面布局方案

### 响应式布局

| 区域 | 移动端 | 桌面端 |
|------|--------|--------|
| 个人介绍 | 垂直居中排列 | 水平排列（头像左，文字右） |
| 技术栈 | 1 列 | 2-3 列网格 |
| 时间线 | 紧凑排列 | 标准间距 |
| 联系方式 | 全宽卡片 | 全宽卡片 |

### 最大宽度

页面内容区域最大宽度 `max-w-4xl`（896px），与博客列表页保持一致。

## SEO Metadata

```typescript
export const metadata: Metadata = {
  title: "About",
  description: `关于 ${aboutConfig.name} — ${aboutConfig.role}`,
  openGraph: {
    title: `About | ${siteConfig.name}`,
    description: `关于 ${aboutConfig.name}`,
    type: "profile",
  },
}
```

页面标题通过 layout.tsx 中的 `title.template` 渲染为 "About | Finn Days"。

## 文件清单

| 文件路径 | 说明 |
|----------|------|
| `src/app/about/page.tsx` | 关于页面主文件 |
| `src/config/about.ts` | 关于页面数据配置 |
| `src/config/site.ts` | 站点配置（社交链接等，已有） |
| `public/images/avatar.jpg` | 头像图片（需准备） |

## 依赖说明

无需新增依赖。使用的组件均已在项目中：

- `next/image` — 头像图片优化
- `lucide-react` — 图标（Github, Twitter, Mail, MapPin）
- `@/components/ui/button` — 按钮组件
- `@/components/ui/card` — 卡片组件

## 测试要点

1. **内容展示**
   - 确认头像图片正确显示
   - 确认个人信息（姓名、角色、位置、简介）正确
   - 确认技术栈分类和标签正确显示
   - 确认时间线按时间倒序排列

2. **社交链接**
   - 确认 GitHub、Twitter、Email 链接跳转正确
   - 确认外部链接在新标签页打开
   - 确认 Email 链接触发邮件客户端

3. **响应式布局**
   - 移动端：头像和文字垂直居中排列
   - 桌面端：头像和文字水平排列
   - 技术栈网格在各尺寸下布局正确

4. **暗色模式**
   - 确认所有元素在暗色模式下样式正确
   - 特别注意头像圆形边框、时间线节点颜色

5. **SEO**
   - 确认页面标题为 "About | Finn Days"
   - 确认 meta description 正确

6. **图片**
   - 确认头像使用 `priority` 属性优先加载
   - 确认图片 `fill` 模式下 `object-cover` 效果正确

## 注意事项

1. **头像图片准备**：需要将头像图片放在 `public/images/avatar.jpg`，如果暂时没有，可以使用占位图片或 Gravatar
2. **数据配置分离**：将个人信息放在 `src/config/about.ts` 中，便于修改，不影响页面逻辑
3. **内容真实性**：时间线和技术栈需要根据实际情况填写，这里是示例数据
4. **图片优化**：头像图片建议使用正方形（如 256x256），JPG 或 WebP 格式
5. **MVP 优先**：Phase 1 先用 TSX 直接编写内容，不要过度工程化
6. **时间线组件可扩展**：后续可以增加更多细节（如链接、图标等）
7. **技术栈图标**：当前使用文字 Badge，后续可以替换为实际的技术 Logo SVG
8. **联系方式安全**：邮箱地址直接暴露在源码中，如果担心垃圾邮件，可以使用联系表单替代
