# Velite 内容管理系统

## 概述

Velite 是一个轻量级、高性能的内容构建工具，专为将 Markdown/MDX 文件转换为类型安全的 JSON 数据而设计。在 Finn Days 博客项目中，我们使用 Velite 管理所有博客文章和项目展示的内容，实现内容与代码的分离，同时保持完整的 TypeScript 类型安全。

## 为什么选择 Velite

### 方案对比

| 特性 | Velite | Contentlayer | next-mdx-remote |
|------|--------|-------------|-----------------|
| 维护状态 | 活跃维护 | 已停止维护 | 活跃维护 |
| 类型安全 | Zod schema 原生支持 | 内置类型生成 | 需手动定义类型 |
| 构建性能 | 极快（esbuild） | 较慢 | 运行时渲染 |
| MDX 支持 | 原生支持 | 原生支持 | 原生支持 |
| Next.js App Router | 完全兼容 | 兼容性问题 | 完全兼容 |
| 配置复杂度 | 简单 | 中等 | 需要大量模板代码 |
| 热更新 | 支持 | 支持 | 不需要（运行时） |
| 插件生态 | rehype/remark 插件 | 有限 | rehype/remark 插件 |

### 选择 Velite 的核心理由

1. **Contentlayer 已停止维护**：Contentlayer 自 2023 年起不再更新，与 Next.js 14+ 存在兼容性问题，社区已迁移至其他方案
2. **构建时处理 vs 运行时处理**：与 next-mdx-remote 不同，Velite 在构建时将 MDX 编译为数据，零运行时开销
3. **Zod Schema 驱动**：使用 Zod 定义内容结构，编译时校验 frontmatter，IDE 自动补全
4. **esbuild 加速**：底层使用 esbuild 处理 MDX，构建速度远超 Contentlayer
5. **与 Next.js App Router 完美配合**：生成的数据可直接在 Server Components 中导入使用

## 依赖说明

```bash
npm install velite
```

需要的 peer dependencies（大多数场景下已存在）：

```bash
# 可选：用于代码高亮（在文章详情页文档中详细说明）
npm install rehype-pretty-code shiki

# 可选：用于自动生成目录
npm install rehype-slug rehype-autolink-headings

# 可选：GFM 支持（表格、任务列表等）
npm install remark-gfm
```

## 安装与配置

### 步骤 1：安装 Velite

```bash
npm install velite
```

### 步骤 2：创建 velite.config.ts

在项目根目录创建 `velite.config.ts`：

```typescript
// velite.config.ts
import { defineConfig, defineCollection, s } from 'velite'
import rehypeSlug from 'rehype-slug'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkGfm from 'remark-gfm'

// 计算阅读时长的辅助函数
function computeReadingTime(content: string): string {
  // 中文字符计数
  const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length
  // 英文单词计数
  const englishWords = content
    .replace(/[\u4e00-\u9fff]/g, '')
    .split(/\s+/)
    .filter(Boolean).length

  const chineseMinutes = chineseChars / 300 // 中文 ~300字/分钟
  const englishMinutes = englishWords / 200   // 英文 ~200词/分钟
  const totalMinutes = Math.ceil(chineseMinutes + englishMinutes)

  return `${Math.max(1, totalMinutes)} min`
}

// 从 Markdown 内容中提取 headings（用于 TOC）
function computeHeadings(content: string) {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm
  const headings: { depth: number; text: string; slug: string }[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const depth = match[1].length
    const text = match[2].trim()
    const slug = text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff]+/g, '-')
      .replace(/^-|-$/g, '')

    headings.push({ depth, text, slug })
  }

  return headings
}

// Post 集合定义
const posts = defineCollection({
  name: 'Post',
  pattern: 'blog/**/*.mdx',
  schema: s
    .object({
      // --- 基础字段 ---
      title: s.string().max(120),           // 文章标题，最大120字符
      description: s.string().max(260),      // 文章摘要，用于 SEO 和列表页展示
      date: s.isodate(),                     // 发布日期，ISO 格式：2025-03-01
      updated: s.isodate().optional(),       // 最后更新日期（可选）

      // --- 分类与标签 ---
      tags: s.array(s.string()).default([]), // 标签数组，如 ['Next.js', 'React']
      category: s.string().optional(),       // 分类（可选），如 'Frontend'

      // --- 系列文章 ---
      series: s.object({                     // 系列文章信息（可选）
        title: s.string(),                   // 系列名称
        order: s.number(),                   // 在系列中的顺序
      }).optional(),

      // --- 封面与展示 ---
      cover: s.string().optional(),          // 封面图路径（可选）
      draft: s.boolean().default(false),     // 是否为草稿，默认 false

      // --- Velite 自动生成字段 ---
      slug: s.path(),                        // 从文件路径自动生成 slug
      content: s.mdx(),                      // MDX 编译后的内容
      metadata: s.metadata(),                // 文件元数据（字数等）
      toc: s.toc(),                          // 自动生成目录结构
    })
    // 添加计算字段
    .transform((data) => ({
      ...data,
      slugAsParams: data.slug.split('/').slice(1).join('/'), // 去掉 'blog/' 前缀
      readingTime: computeReadingTime(data.content),
      permalink: `/blog/${data.slug.split('/').slice(1).join('/')}`,
    })),
})

// Project 集合定义
const projects = defineCollection({
  name: 'Project',
  pattern: 'projects/**/*.mdx',
  schema: s
    .object({
      // --- 基础字段 ---
      title: s.string().max(100),            // 项目名称
      description: s.string().max(300),      // 项目描述
      date: s.isodate(),                     // 项目创建/发布日期

      // --- 链接 ---
      github: s.string().url().optional(),   // GitHub 仓库链接
      demo: s.string().url().optional(),     // 在线预览链接

      // --- 展示 ---
      cover: s.string().optional(),          // 项目封面图
      tags: s.array(s.string()).default([]), // 技术标签
      featured: s.boolean().default(false),  // 是否为精选项目
      draft: s.boolean().default(false),     // 是否为草稿

      // --- 自动生成 ---
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

export default defineConfig({
  root: 'content',              // 内容文件根目录
  output: {
    data: '.velite',            // 生成数据的输出目录
    assets: 'public/static',   // 静态资源输出目录
    base: '/static/',          // 静态资源的公共路径
    name: '[name]-[hash:6].[ext]', // 资源文件命名规则
    clean: true,                // 每次构建前清理输出目录
  },
  collections: { posts, projects },
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypePrettyCode, {
        theme: {
          dark: 'github-dark',
          light: 'github-light',
        },
        defaultLang: 'plaintext',
      }],
      [rehypeAutolinkHeadings, {
        behavior: 'wrap',
        properties: {
          className: ['anchor'],
        },
      }],
    ],
  },
})
```

### 步骤 3：修改 next.config.ts

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 让 webpack 在构建时触发 velite
  webpack: (config) => {
    config.plugins.push(new VeliteWebpackPlugin())
    return config
  },
};

export default nextConfig;

// Velite Webpack 插件
class VeliteWebpackPlugin {
  static started = false
  apply(compiler: any) {
    // 确保只在开发模式下启动一次
    compiler.hooks.beforeCompile.tapPromise('VeliteWebpackPlugin', async () => {
      if (VeliteWebpackPlugin.started) return
      VeliteWebpackPlugin.started = true
      const dev = compiler.options.mode === 'development'
      const { build } = await import('velite')
      await build({ watch: dev, clean: !dev })
    })
  }
}
```

### 步骤 4：配置 .gitignore

在 `.gitignore` 中添加 Velite 生成的目录：

```gitignore
# Velite 生成文件
.velite
```

### 步骤 5：配置 tsconfig.json

在 `tsconfig.json` 的 `paths` 中添加 Velite 数据路径别名：

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "#site/content": ["./.velite"]
    }
  }
}
```

## Zod Schema 字段详细说明

### Post Schema

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `title` | `string` | 是 | - | 文章标题，最大120字符 |
| `description` | `string` | 是 | - | 文章摘要/描述，用于 SEO meta description 和列表页，最大260字符 |
| `date` | `isodate` | 是 | - | 发布日期，格式 `YYYY-MM-DD` |
| `updated` | `isodate` | 否 | - | 最后更新日期 |
| `tags` | `string[]` | 否 | `[]` | 标签数组 |
| `category` | `string` | 否 | - | 文章分类 |
| `series` | `object` | 否 | - | 系列文章信息，含 `title` 和 `order` |
| `cover` | `string` | 否 | - | 封面图路径（相对于 content 目录） |
| `draft` | `boolean` | 否 | `false` | 草稿标记 |
| `slug` | 自动生成 | - | - | 从文件路径自动生成 |
| `content` | 自动生成 | - | - | MDX 编译后的内容 |
| `metadata` | 自动生成 | - | - | 文件元数据（字数、读取时间等） |
| `toc` | 自动生成 | - | - | 自动提取的目录结构 |

### 计算字段（transform）

| 字段 | 类型 | 说明 |
|------|------|------|
| `slugAsParams` | `string` | 去掉 `blog/` 前缀后的 slug，用于路由参数 |
| `readingTime` | `string` | 计算后的阅读时长，如 `5 min` |
| `permalink` | `string` | 完整的文章 URL 路径 |

### Project Schema

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `title` | `string` | 是 | - | 项目名称 |
| `description` | `string` | 是 | - | 项目描述 |
| `date` | `isodate` | 是 | - | 项目日期 |
| `github` | `string` (URL) | 否 | - | GitHub 链接 |
| `demo` | `string` (URL) | 否 | - | 在线预览链接 |
| `cover` | `string` | 否 | - | 封面图 |
| `tags` | `string[]` | 否 | `[]` | 技术标签 |
| `featured` | `boolean` | 否 | `false` | 是否精选 |
| `draft` | `boolean` | 否 | `false` | 草稿标记 |

## content/ 目录结构规范

```
content/
├── blog/
│   ├── getting-started-with-nextjs.mdx
│   ├── tailwind-css-best-practices.mdx
│   ├── react-server-components/
│   │   └── index.mdx              # 可使用目录形式管理复杂文章
│   └── series/
│       ├── docker-basics-part-1.mdx
│       └── docker-basics-part-2.mdx
├── projects/
│   ├── finn-days-blog.mdx
│   └── my-awesome-tool.mdx
└── README.md                       # 内容目录说明（可选）
```

### 目录规范说明

1. **文件命名**：使用 kebab-case（小写字母 + 连字符），如 `getting-started-with-nextjs.mdx`
2. **文件扩展名**：统一使用 `.mdx` 扩展名
3. **嵌套目录**：文章可放在子目录中，slug 会自动包含路径
4. **图片放置**：与文章同目录或放在 `public/images/blog/` 下

## Frontmatter 规范与示例

### 博客文章 Frontmatter 示例

```yaml
---
title: "Getting Started with Next.js App Router"
description: "A comprehensive guide to building modern web applications with Next.js App Router, covering routing, data fetching, and server components."
date: "2025-03-01"
updated: "2025-03-05"
tags: ["Next.js", "React", "Web Development"]
category: "Frontend"
cover: "/images/blog/nextjs-app-router.png"
draft: false
series:
  title: "Next.js 完全指南"
  order: 1
---

正文内容从这里开始...
```

### 最简 Frontmatter（仅必填字段）

```yaml
---
title: "My First Blog Post"
description: "A brief introduction to my blog."
date: "2025-03-01"
---

正文内容...
```

### 草稿文章

```yaml
---
title: "Work in Progress Article"
description: "This article is still being written."
date: "2025-03-01"
draft: true
---
```

### 项目 Frontmatter 示例

```yaml
---
title: "Finn Days Blog"
description: "A personal blog built with Next.js, Tailwind CSS, and Velite. Features dark mode, MDX content, and responsive design."
date: "2025-02-01"
github: "https://github.com/username/finn-days"
demo: "https://finn.days.dev"
cover: "/images/projects/finn-days.png"
tags: ["Next.js", "TypeScript", "Tailwind CSS", "MDX"]
featured: true
---

## 项目详情

这里可以写更详细的项目说明...
```

## 与 Next.js 集成方式

### next.config.ts 修改

Velite 需要在 Next.js 构建流程中触发。通过自定义 Webpack 插件实现：

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.plugins.push(new VeliteWebpackPlugin())
    return config
  },
};

export default nextConfig;

class VeliteWebpackPlugin {
  static started = false
  apply(compiler: any) {
    compiler.hooks.beforeCompile.tapPromise('VeliteWebpackPlugin', async () => {
      if (VeliteWebpackPlugin.started) return
      VeliteWebpackPlugin.started = true
      const dev = compiler.options.mode === 'development'
      const { build } = await import('velite')
      await build({ watch: dev, clean: !dev })
    })
  }
}
```

**工作原理**：

1. Webpack 编译开始前，VeliteWebpackPlugin 会触发 Velite 构建
2. 开发模式（`dev: true`）下启用 watch 模式，内容文件修改后自动重新编译
3. 使用 `static started` 确保多次编译只启动一次 Velite
4. 生产构建时（`clean: true`）会清理旧的生成文件

## 内容查询工具函数

### 文件位置：`src/lib/content.ts`

```typescript
// src/lib/content.ts
import { posts, projects } from '#site/content'

// =====================
// 博客文章查询函数
// =====================

/**
 * 获取所有已发布的文章（排除草稿），按日期倒序排列
 */
export function getAllPosts() {
  return posts
    .filter((post) => !post.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * 获取所有文章（包含草稿），用于开发/预览
 */
export function getAllPostsIncludingDrafts() {
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

/**
 * 根据 slug 获取单篇文章
 * @param slug - 文章 slug（不含 blog/ 前缀）
 * @returns 文章对象或 undefined
 */
export function getPostBySlug(slug: string) {
  return posts.find((post) => post.slugAsParams === slug)
}

/**
 * 根据标签获取文章列表
 * @param tag - 标签名称（大小写不敏感）
 */
export function getPostsByTag(tag: string) {
  return getAllPosts().filter((post) =>
    post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  )
}

/**
 * 根据分类获取文章列表
 */
export function getPostsByCategory(category: string) {
  return getAllPosts().filter(
    (post) => post.category?.toLowerCase() === category.toLowerCase()
  )
}

/**
 * 根据系列获取文章列表（按系列顺序排列）
 */
export function getPostsBySeries(seriesTitle: string) {
  return getAllPosts()
    .filter((post) => post.series?.title === seriesTitle)
    .sort((a, b) => (a.series?.order ?? 0) - (b.series?.order ?? 0))
}

/**
 * 获取所有标签及其文章数量
 * @returns 按文章数量降序排列的标签数组
 */
export function getAllTags(): { tag: string; count: number }[] {
  const tagMap = new Map<string, number>()

  getAllPosts().forEach((post) => {
    post.tags.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
    })
  })

  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * 获取所有唯一标签名称
 */
export function getTagSlugs(): string[] {
  const tags = new Set<string>()
  getAllPosts().forEach((post) => {
    post.tags.forEach((tag) => tags.add(tag))
  })
  return Array.from(tags)
}

/**
 * 获取所有分类
 */
export function getAllCategories(): string[] {
  const categories = new Set<string>()
  getAllPosts().forEach((post) => {
    if (post.category) categories.add(post.category)
  })
  return Array.from(categories)
}

/**
 * 分页获取文章
 * @param page - 当前页码（从 1 开始）
 * @param perPage - 每页文章数
 */
export function getPaginatedPosts(page: number = 1, perPage: number = 10) {
  const allPosts = getAllPosts()
  const totalPages = Math.ceil(allPosts.length / perPage)
  const start = (page - 1) * perPage
  const end = start + perPage

  return {
    posts: allPosts.slice(start, end),
    pagination: {
      currentPage: page,
      totalPages,
      totalPosts: allPosts.length,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  }
}

/**
 * 获取相邻文章（上一篇/下一篇）
 */
export function getAdjacentPosts(slug: string) {
  const allPosts = getAllPosts()
  const currentIndex = allPosts.findIndex(
    (post) => post.slugAsParams === slug
  )

  return {
    prev: currentIndex < allPosts.length - 1
      ? allPosts[currentIndex + 1]
      : null,
    next: currentIndex > 0
      ? allPosts[currentIndex - 1]
      : null,
  }
}

// =====================
// 项目查询函数
// =====================

/**
 * 获取所有已发布的项目
 */
export function getAllProjects() {
  return projects
    .filter((project) => !project.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * 获取精选项目
 */
export function getFeaturedProjects() {
  return getAllProjects().filter((project) => project.featured)
}

/**
 * 根据 slug 获取单个项目
 */
export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slugAsParams === slug)
}
```

### 数据导入方式

```typescript
// 在 Server Components 中直接导入
import { posts, projects } from '#site/content'

// 或通过工具函数使用
import { getAllPosts, getPostBySlug } from '@/lib/content'
```

## 构建流程

### 开发模式 (`npm run dev`)

```
1. Next.js 启动 → Webpack 编译
2. VeliteWebpackPlugin.beforeCompile 触发
3. Velite build({ watch: true, clean: false })
   ├── 扫描 content/ 目录
   ├── 解析所有 .mdx 文件的 frontmatter
   ├── 通过 Zod schema 校验数据
   ├── 编译 MDX 内容
   ├── 生成 .velite/index.js 和 .velite/posts.json
   └── 启动文件监听（watch mode）
4. Webpack 继续编译 → 应用可用
5. 修改 content/ 文件 → Velite 自动重新编译 → HMR 更新
```

### 生产构建 (`npm run build`)

```
1. Next.js build 启动
2. VeliteWebpackPlugin.beforeCompile 触发
3. Velite build({ watch: false, clean: true })
   ├── 清理 .velite/ 目录
   ├── 完整编译所有内容文件
   ├── 校验所有 frontmatter
   ├── 生成优化后的数据文件
   └── 处理静态资源（图片等）
4. Next.js 继续构建
   ├── 静态生成所有页面
   ├── 从 .velite/ 读取数据
   └── 生成 HTML/JSON
```

## 开发模式下的热更新

Velite 在 watch 模式下具有以下热更新行为：

1. **修改现有文章内容**：自动重新编译该文件，Next.js HMR 触发页面更新
2. **修改 frontmatter**：自动重新校验和编译，数据立即更新
3. **新增文章文件**：自动检测新文件，添加到数据集
4. **删除文章文件**：自动从数据集中移除
5. **修改 velite.config.ts**：需要重启开发服务器

### 注意事项

- 开发模式下首次启动可能需要几秒钟编译所有内容
- 文件监听使用 chokidar，对文件系统事件响应迅速
- 如果 Zod 校验失败，控制台会输出详细的错误信息

## 静态资源（图片）处理方式

### 方式 1：public 目录（推荐简单场景）

将图片放在 `public/images/` 下，frontmatter 中直接引用：

```yaml
cover: "/images/blog/my-post-cover.png"
```

在 MDX 中使用：

```markdown
![描述文字](/images/blog/screenshot.png)
```

### 方式 2：Velite 资源处理（推荐复杂场景）

将图片放在 content 目录中与文章同级：

```
content/
└── blog/
    └── my-post/
        ├── index.mdx
        ├── cover.png
        └── screenshot.png
```

Velite 会自动将图片复制到 `public/static/` 并生成哈希文件名，确保缓存失效。

在 frontmatter 中引用：

```yaml
cover: "./cover.png"   # 相对路径，Velite 自动处理
```

### 图片优化建议

- 使用 Next.js `<Image>` 组件展示图片，自动优化
- 封面图推荐尺寸：1200x630（OG Image 标准）
- 格式推荐：WebP 或 PNG
- 大图片在 content 目录下使用，Velite 会自动添加哈希

## 草稿模式处理

### 过滤逻辑

在 `src/lib/content.ts` 中，所有公开查询函数默认过滤草稿：

```typescript
export function getAllPosts() {
  return posts
    .filter((post) => !post.draft)  // 过滤草稿
    .sort(...)
}
```

### 开发环境预览草稿

可以创建一个环境变量控制草稿显示：

```typescript
// src/lib/content.ts
const showDrafts = process.env.NODE_ENV === 'development'

export function getAllPosts() {
  return posts
    .filter((post) => showDrafts || !post.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
```

### 草稿标识

在文章列表/详情页中，可以为草稿文章添加视觉提示：

```tsx
{post.draft && (
  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
    Draft
  </span>
)}
```

## 文件清单

| 文件路径 | 说明 |
|----------|------|
| `velite.config.ts` | Velite 配置文件，定义集合和 MDX 处理管道 |
| `next.config.ts` | 需修改，添加 VeliteWebpackPlugin |
| `tsconfig.json` | 需修改，添加 `#site/content` 路径别名 |
| `.gitignore` | 需修改，添加 `.velite` |
| `content/blog/*.mdx` | 博客文章 MDX 文件 |
| `content/projects/*.mdx` | 项目 MDX 文件 |
| `src/lib/content.ts` | 内容查询工具函数 |
| `.velite/` | 自动生成，不纳入版本控制 |

## 测试要点

1. **Schema 校验**
   - 创建缺少必填字段的 MDX 文件，确认 Velite 构建失败并输出友好错误
   - 测试日期格式错误、超长标题等边界情况
   - 测试 tags 为空数组时的默认值

2. **内容编译**
   - 验证 MDX 文件正确编译为可渲染内容
   - 测试包含代码块、表格、链接等 Markdown 元素的文件
   - 验证中文内容正确处理

3. **查询函数**
   - 验证 `getAllPosts()` 返回按日期倒序排列的非草稿文章
   - 验证 `getPostBySlug()` 能正确匹配 slug
   - 验证 `getPostsByTag()` 大小写不敏感
   - 验证分页函数返回正确的分页信息

4. **构建集成**
   - 运行 `npm run build` 确认 Velite 与 Next.js 构建无冲突
   - 确认 `.velite/` 目录正确生成
   - 确认开发模式下热更新正常

5. **草稿过滤**
   - 确认生产环境不显示草稿文章
   - 确认开发环境可以预览草稿

## 注意事项

1. **不要将 `.velite/` 目录提交到 Git**：它是构建产物，每次构建自动生成
2. **frontmatter 日期格式**：必须使用 ISO 格式 `YYYY-MM-DD`，不支持其他格式
3. **slug 生成规则**：slug 基于文件路径自动生成，修改文件名会改变 slug（破坏已有链接）
4. **MDX 导入限制**：Velite 编译后的 MDX 不支持运行时 import，组件需通过 MDX Components 传入
5. **性能考虑**：内容文件数量在数百级别时性能良好，千级别以上需关注构建时间
6. **Velite 版本锁定**：建议在 package.json 中锁定 Velite 的确切版本，避免升级带来的 breaking changes
7. **编码格式**：所有 MDX 文件必须使用 UTF-8 编码
8. **文件名规范**：不要在文件名中使用空格、中文或特殊字符，统一使用 kebab-case
