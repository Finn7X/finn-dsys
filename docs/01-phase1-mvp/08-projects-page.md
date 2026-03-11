# 项目展示页

## 概述

项目展示页用于展示个人项目作品集，每个项目以卡片形式呈现，包含项目名称、描述、技术标签、GitHub 链接和在线预览链接。项目数据来源于 `content/projects/` 目录下的 MDX 文件，通过 Velite 在构建时编译为类型安全的数据。

## 技术方案

- **路由**：`/[locale]/projects` -> `src/app/[locale]/projects/page.tsx`
- **渲染方式**：Server Component + 静态生成
- **数据来源**：`content/projects/*.mdx`，通过 Velite 编译
- **组件**：ProjectCard 展示项目卡片

## 项目数据来源

### content/projects/ 目录结构

```
content/
└── projects/
    ├── finn-days-blog.mdx
    ├── my-cli-tool.mdx
    └── open-source-library.mdx
```

### 项目 MDX 文件示例

```yaml
---
title: "Finn Days Blog"
description: "A modern personal blog built with Next.js 16, Tailwind CSS, and Velite. Features dark mode, MDX content management, responsive design, and Docker deployment."
date: "2025-02-01"
github: "https://github.com/finn/finn-days"
demo: "https://finn7x.com"
cover: "/images/projects/finn-days-cover.png"
tags: ["Next.js", "TypeScript", "Tailwind CSS", "Velite", "Docker"]
featured: true
---

## 项目背景

这个博客是我的个人技术博客...

## 主要功能

- MDX 内容管理
- 暗色/亮色主题切换
- 响应式设计
- RSS 订阅
- 代码语法高亮

## 技术架构

...
```

## Project Schema（Velite 配置）

已在 `velite.config.ts` 中定义（详见 Velite 内容管理系统文档）：

```typescript
const projects = defineCollection({
  name: 'Project',
  pattern: 'projects/**/*.mdx',
  schema: s
    .object({
      title: s.string().max(100),            // 项目名称
      description: s.string().max(300),      // 项目描述
      date: s.isodate(),                     // 项目创建/发布日期
      github: s.string().url().optional(),   // GitHub 仓库链接
      demo: s.string().url().optional(),     // 在线预览链接
      cover: s.string().optional(),          // 项目封面图
      tags: s.array(s.string()).default([]), // 技术标签
      featured: s.boolean().default(false),  // 是否为精选项目
      draft: s.boolean().default(false),     // 是否为草稿
      slug: s.path(),
      content: s.mdx(),
      metadata: s.metadata(),
    })
    .transform((data) => ({
      ...data,
      slugAsParams: data.slug.split('/').slice(1).join('/'),
      permalink: `/projects/${data.slug.split('/').slice(1).join('/')}`,
    })),
})
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | `string` | 是 | 项目名称，最大100字符 |
| `description` | `string` | 是 | 项目简短描述 |
| `date` | `isodate` | 是 | 项目日期 |
| `github` | `string` (URL) | 否 | GitHub 仓库链接 |
| `demo` | `string` (URL) | 否 | 在线预览/Demo 链接 |
| `cover` | `string` | 否 | 封面图路径 |
| `tags` | `string[]` | 否 | 技术标签数组 |
| `featured` | `boolean` | 否 | 是否为精选项目 |
| `draft` | `boolean` | 否 | 是否为草稿 |

## ProjectCard 组件设计

### `src/components/project-card.tsx`

```typescript
// src/components/project-card.tsx
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { Github, ExternalLink, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  title: string
  description: string
  date: string
  github?: string
  demo?: string
  cover?: string
  tags: string[]
  featured: boolean
}

export function ProjectCard({
  title,
  description,
  date,
  github,
  demo,
  cover,
  tags,
  featured,
}: ProjectCardProps) {
  const locale = useLocale()
  const t = useTranslations("projects")
  const dateLocale = locale === "zh" ? "zh-CN" : "en-US"

  return (
    <Card
      className={cn(
        "group overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
        featured && "border-primary/30 shadow-md"
      )}
    >
      {/* 封面图 */}
      {cover && (
        <div className="relative aspect-video overflow-hidden border-b">
          <Image
            src={cover}
            alt={title}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* 精选标记 */}
          {featured && (
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground shadow">
              <Star className="h-3 w-3 fill-current" />
              {t("featuredBadge")}
            </div>
          )}
        </div>
      )}

      <CardHeader className={cn("pb-3", !cover && "pt-6")}>
        {/* 精选标记（无封面图时） */}
        {!cover && featured && (
          <div className="mb-2 flex items-center gap-1 text-xs text-primary font-medium">
            <Star className="h-3.5 w-3.5 fill-current" />
            {t("featuredBadge")}
          </div>
        )}

        {/* 项目名称 */}
        <h3 className="text-xl font-semibold tracking-tight">
          {title}
        </h3>

        {/* 日期 */}
        <p className="text-sm text-muted-foreground">
          {new Date(date).toLocaleDateString(dateLocale, {
            year: "numeric",
            month: "long",
          })}
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        {/* 描述 */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
          {description}
        </p>

        {/* 技术标签 */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          {github && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-1.5"
              >
                <Github className="h-4 w-4" />
                {t("viewSource")}
              </a>
            </Button>
          )}
          {demo && (
            <Button size="sm" asChild>
              <a
                href={demo}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-1.5"
              >
                <ExternalLink className="h-4 w-4" />
                {t("viewDemo")}
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

### ProjectCard 设计要点

1. **封面图可选**：有封面图时显示 `aspect-video` 区域，无封面图时直接显示内容
2. **精选标记**：`featured: true` 的项目显示星标和边框高亮
3. **技术标签**：使用与博客标签一致的 Badge 样式
4. **操作按钮**：GitHub Source 按钮和 Demo 按钮
5. **外部链接**：所有链接都在新标签页打开，带 `rel="noopener noreferrer"`
6. **hover 效果**：卡片微上浮 + 阴影加深 + 封面图微缩放
7. **描述截断**：最多 3 行（`line-clamp-3`）

## 页面布局

### 网格布局

```
移动端 (< 640px):  1 列
平板端 (640px+):   2 列
桌面端 (1024px+):  3 列（可选，如果项目数量较多）
```

### `src/app/[locale]/projects/page.tsx`

```typescript
// src/app/[locale]/projects/page.tsx
import type { Metadata } from "next"
import { getAllProjects, getFeaturedProjects } from "@/lib/content"
import { ProjectCard } from "@/components/project-card"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "Projects",
  description: `${siteConfig.author.name} 的个人项目作品集`,
}

export default function ProjectsPage() {
  const allProjects = getAllProjects()
  const featuredProjects = allProjects.filter((p) => p.featured)
  const otherProjects = allProjects.filter((p) => !p.featured)

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      {/* 页面标题 */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Projects</h1>
        <p className="text-muted-foreground">
          我的个人项目和开源作品，共 {allProjects.length} 个项目
        </p>
      </div>

      {/* 精选项目 */}
      {featuredProjects.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="text-primary">*</span>
            精选项目
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {featuredProjects.map((project) => (
              <ProjectCard
                key={project.slugAsParams}
                title={project.title}
                description={project.description}
                date={project.date}
                github={project.github}
                demo={project.demo}
                cover={project.cover}
                tags={project.tags}
                featured={project.featured}
              />
            ))}
          </div>
        </section>
      )}

      {/* 其他项目 */}
      {otherProjects.length > 0 && (
        <section>
          {featuredProjects.length > 0 && (
            <h2 className="text-xl font-semibold mb-6">其他项目</h2>
          )}
          <div className="grid gap-6 sm:grid-cols-2">
            {otherProjects.map((project) => (
              <ProjectCard
                key={project.slugAsParams}
                title={project.title}
                description={project.description}
                date={project.date}
                github={project.github}
                demo={project.demo}
                cover={project.cover}
                tags={project.tags}
                featured={project.featured}
              />
            ))}
          </div>
        </section>
      )}

      {/* 空状态 */}
      {allProjects.length === 0 && (
        <div className="py-20 text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-xl font-semibold mb-2">项目正在建设中</h2>
          <p className="text-muted-foreground">
            敬请期待，更多项目即将上线
          </p>
        </div>
      )}
    </div>
  )
}
```

## 与博客文章的关联

### 在项目页面中关联博客文章

如果某个项目有相关的博客文章（如开发日志、技术解析），可以通过标签或自定义字段关联。

### 方案 1：通过标签关联

项目和文章使用相同的标签，在项目详情中展示相关文章：

```typescript
// 获取与项目相关的文章（通过共同标签）
function getRelatedPosts(projectTags: string[]) {
  return getAllPosts().filter((post) =>
    post.tags.some((tag) => projectTags.includes(tag))
  ).slice(0, 3)  // 最多显示 3 篇
}
```

### 方案 2：在项目 frontmatter 中声明关联文章

```yaml
# content/projects/finn-days-blog.mdx
---
title: "Finn Days Blog"
relatedPosts:
  - "getting-started-with-nextjs"
  - "tailwind-css-best-practices"
---
```

> MVP 阶段可以暂时不实现关联功能，后续迭代添加。

## 项目详情页（可选扩展）

如果需要为每个项目提供独立的详情页面（展示 MDX 正文内容），可以添加：

```
src/app/projects/[slug]/page.tsx
```

实现方式与博客文章详情页类似：

```typescript
// src/app/projects/[slug]/page.tsx
import { getProjectBySlug, getAllProjects } from '@/lib/content'
import { MdxContent } from '@/components/mdx-content'
import { notFound } from 'next/navigation'

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slugAsParams }))
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) notFound()

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <MdxContent code={project.content} />
      </div>
    </div>
  )
}
```

> MVP 阶段可以不实现项目详情页，项目卡片直接链接到 GitHub 或 Demo。

## 文件清单

| 文件路径 | 说明 |
|----------|------|
| `src/app/[locale]/projects/page.tsx` | 项目展示页主文件 |
| `src/components/project-card.tsx` | 项目卡片组件 |
| `content/projects/*.mdx` | 项目数据 MDX 文件 |
| `src/lib/content.ts` | 内容查询函数（已有 getAllProjects, getFeaturedProjects） |
| `public/images/projects/` | 项目封面图目录 |
| `src/app/[locale]/projects/[slug]/page.tsx` | 可选：项目详情页 |

## 依赖说明

无需新增依赖。使用的组件均已在项目中：

- `next/image` — 图片优化
- `lucide-react` — 图标（Github, ExternalLink, Star）
- `@/components/ui/button` — 按钮组件
- `@/components/ui/card` — 卡片组件

## 测试要点

1. **项目列表展示**
   - 确认所有非草稿项目正确显示
   - 确认精选项目排在前面，有明显的视觉标记
   - 确认项目按日期倒序排列

2. **ProjectCard 组件**
   - 确认标题、描述、日期、标签正确显示
   - 确认 GitHub 和 Demo 按钮链接正确
   - 确认没有 GitHub/Demo 时对应按钮隐藏
   - 确认封面图正确显示（有/无两种情况）
   - 确认描述文字在 3 行后截断

3. **响应式布局**
   - 移动端 1 列
   - 平板端 2 列
   - 卡片高度自适应内容

4. **暗色模式**
   - 确认卡片、标签、按钮在暗色模式下样式正确
   - 确认精选项目边框颜色在暗色模式下可见

5. **外部链接**
   - 确认所有外部链接在新标签页打开
   - 确认 `rel="noopener noreferrer"` 属性

6. **空状态**
   - 无项目时显示友好提示

7. **SEO**
   - 确认页面标题为 "Projects | Finn Days"
   - 确认 meta description 正确

## 注意事项

1. **封面图尺寸**：推荐 16:9 比例（如 1280x720），与 `aspect-video` 一致
2. **项目描述长度**：控制在 300 字符以内，卡片中会截断显示
3. **技术标签数量**：每个项目建议 3-6 个标签，避免标签溢出
4. **精选项目数量**：建议控制在 2-4 个，过多会失去"精选"的意义
5. **MVP 简化**：项目详情页可以在 Phase 2 实现，MVP 阶段直接链接到 GitHub
6. **图片优化**：使用 Next.js `<Image>` 组件的 `sizes` 属性优化不同屏幕下的图片加载
7. **项目顺序**：默认按日期倒序，精选项目始终在前面
8. **草稿项目**：`draft: true` 的项目不会在生产环境显示
