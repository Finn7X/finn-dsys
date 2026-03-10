# RSS 订阅

## 概述

RSS (Really Simple Syndication) 订阅功能允许读者通过 RSS 阅读器订阅博客更新。Finn Days 博客同时提供 RSS 2.0 (`/feed.xml`) 和 Atom (`/atom.xml`) 两种订阅格式，通过 Next.js Route Handlers 在构建时生成。

## 技术方案

- **核心库**：`feed` — 生成 RSS/Atom/JSON Feed 的 Node.js 库
- **RSS 2.0 路由**：`/feed.xml` -> `src/app/feed.xml/route.ts`
- **Atom 路由**：`/atom.xml` -> `src/app/atom.xml/route.ts`
- **生成方式**：Route Handler + `export const dynamic = 'force-static'` 构建时生成
- **数据来源**：通过 `src/lib/content.ts` 获取所有已发布文章

## 依赖说明

```bash
npm install feed
```

`feed` 是一个轻量级库，支持生成 RSS 2.0、Atom 1.0 和 JSON Feed 1.0 三种格式。

### 为什么选择 `feed` 库

| 特性 | feed | rss | 手动拼接 XML |
|------|------|-----|-------------|
| RSS 2.0 支持 | 支持 | 支持 | 需要手动 |
| Atom 支持 | 支持 | 不支持 | 需要手动 |
| JSON Feed 支持 | 支持 | 不支持 | 需要手动 |
| TypeScript 类型 | 完善 | 基础 | 无 |
| 维护状态 | 活跃 | 较少 | - |
| Bundle 大小 | ~15KB | ~8KB | 0 |

## 安装与配置

### 步骤 1：安装 feed 库

```bash
npm install feed
```

### 步骤 2：创建 Feed 生成函数

#### `src/lib/feed.ts`

```typescript
// src/lib/feed.ts
import { Feed } from 'feed'
import { getAllPosts } from '@/lib/content'
import { siteConfig } from '@/config/site'

/**
 * 创建并返回配置好的 Feed 实例
 */
export function generateFeed(): Feed {
  const posts = getAllPosts()
  const siteUrl = siteConfig.url
  const author = {
    name: siteConfig.author.name,
    email: siteConfig.author.email,
    link: siteUrl,
  }

  // 创建 Feed 实例
  const feed = new Feed({
    title: siteConfig.name,
    description: siteConfig.description,
    id: siteUrl,
    link: siteUrl,
    language: 'zh-CN',
    image: `${siteUrl}/favicon.svg`,
    favicon: `${siteUrl}/favicon.svg`,
    copyright: `Copyright ${new Date().getFullYear()} ${siteConfig.author.name}. All rights reserved.`,
    updated: posts.length > 0 ? new Date(posts[0].date) : new Date(),
    generator: 'Next.js + Feed',
    feedLinks: {
      rss2: `${siteUrl}/feed.xml`,
      atom: `${siteUrl}/atom.xml`,
    },
    author,
  })

  // 添加文章条目
  posts.forEach((post) => {
    const postUrl = `${siteUrl}${post.permalink}`

    feed.addItem({
      title: post.title,
      id: postUrl,
      link: postUrl,
      description: post.description,
      content: post.description, // 使用摘要作为内容，避免全文输出
      author: [author],
      date: new Date(post.date),
      published: new Date(post.date),
      category: post.tags.map((tag) => ({
        name: tag,
      })),
      image: post.cover ? `${siteUrl}${post.cover}` : undefined,
    })
  })

  return feed
}
```

### 步骤 3：创建 /feed.xml 路由

#### `src/app/feed.xml/route.ts`

```typescript
// src/app/feed.xml/route.ts
import { generateFeed } from '@/lib/feed'

// 构建时静态生成
export const dynamic = 'force-static'
export const revalidate = false

export function GET() {
  const feed = generateFeed()

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
```

### 步骤 4：创建 /atom.xml 路由

#### `src/app/atom.xml/route.ts`

```typescript
// src/app/atom.xml/route.ts
import { generateFeed } from '@/lib/feed'

// 构建时静态生成
export const dynamic = 'force-static'
export const revalidate = false

export function GET() {
  const feed = generateFeed()

  return new Response(feed.atom1(), {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
```

### 步骤 5：在 HTML head 中声明 Feed

在 `layout.tsx` 的 metadata 中添加 alternates：

```typescript
// src/app/layout.tsx
export const metadata: Metadata = {
  // ... 其他配置
  alternates: {
    types: {
      'application/rss+xml': [
        { url: '/feed.xml', title: `${siteConfig.name} RSS Feed` },
      ],
      'application/atom+xml': [
        { url: '/atom.xml', title: `${siteConfig.name} Atom Feed` },
      ],
    },
  },
}
```

这会在 HTML `<head>` 中生成：

```html
<link rel="alternate" type="application/rss+xml" title="Finn Days RSS Feed" href="/feed.xml" />
<link rel="alternate" type="application/atom+xml" title="Finn Days Atom Feed" href="/atom.xml" />
```

RSS 阅读器会自动发现这些 link 标签并提示用户订阅。

### 步骤 6：在页脚添加 RSS 图标

已在 Footer 组件中添加（详见布局组件文档）：

```typescript
// src/components/layout/footer.tsx
import { Rss } from "lucide-react"

// 在社交链接区域添加
<Button variant="ghost" size="icon" asChild>
  <Link href="/feed.xml" aria-label="RSS Feed">
    <Rss className="h-4 w-4" />
  </Link>
</Button>
```

## Feed 内容构建详解

### Feed Metadata

| 字段 | 值 | 说明 |
|------|-----|------|
| `title` | `"Finn Days"` | Feed 标题，通常与站点名称一致 |
| `description` | 站点描述 | Feed 描述 |
| `id` | 站点 URL | Feed 唯一标识符 |
| `link` | 站点 URL | Feed 对应的网站链接 |
| `language` | `"zh-CN"` | Feed 语言 |
| `image` | favicon URL | Feed 图标 |
| `copyright` | 版权信息 | 版权声明 |
| `updated` | 最新文章日期 | Feed 最后更新时间 |
| `feedLinks` | RSS/Atom URL | 各格式 Feed 的自引用链接 |
| `author` | 作者信息 | 包含 name, email, link |

### Feed Item（文章条目）

| 字段 | 来源 | 说明 |
|------|------|------|
| `title` | `post.title` | 文章标题 |
| `id` | 文章完整 URL | 文章唯一标识符 |
| `link` | 文章完整 URL | 文章链接 |
| `description` | `post.description` | 文章摘要 |
| `content` | `post.description` | 文章内容（使用摘要） |
| `author` | 站点作者 | 文章作者 |
| `date` | `post.date` | 发布日期 |
| `category` | `post.tags` | 文章标签/分类 |
| `image` | `post.cover` | 文章封面图 |

### 关于 content 字段

Feed item 的 `content` 字段有两种策略：

**策略 1：仅摘要（推荐）**

```typescript
content: post.description,  // 简短摘要，引导读者点击阅读
```

优点：Feed 文件体积小，引导流量到博客

**策略 2：全文输出**

```typescript
content: post.content,  // MDX 编译后的 HTML 内容
```

优点：读者可在 RSS 阅读器中阅读全文

> MVP 阶段推荐策略 1（仅摘要）。

## 构建时自动生成

### `dynamic = 'force-static'`

```typescript
export const dynamic = 'force-static'
export const revalidate = false
```

这两个导出配置告诉 Next.js：

1. `force-static`：在构建时生成静态文件，不在运行时动态渲染
2. `revalidate = false`：不进行增量静态再生，内容只在重新构建时更新

### 构建流程

```
npm run build
  ↓
Next.js 构建
  ↓
Velite 编译内容 → 生成文章数据
  ↓
Route Handler 执行
  ↓
generateFeed() → 读取文章数据 → 生成 Feed
  ↓
/feed.xml → 静态 RSS 2.0 XML 文件
/atom.xml → 静态 Atom XML 文件
```

## Feed 输出示例

### RSS 2.0 (`/feed.xml`)

```xml
<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Finn Days</title>
    <link>https://finn7x.com</link>
    <description>Exploring technology, sharing knowledge...</description>
    <language>zh-CN</language>
    <lastBuildDate>Sat, 01 Mar 2025 00:00:00 GMT</lastBuildDate>
    <atom:link href="https://finn7x.com/feed.xml" rel="self" type="application/rss+xml"/>

    <item>
      <title>Getting Started with Next.js</title>
      <link>https://finn7x.com/blog/getting-started-with-nextjs</link>
      <guid>https://finn7x.com/blog/getting-started-with-nextjs</guid>
      <pubDate>Sat, 01 Mar 2025 00:00:00 GMT</pubDate>
      <description>A comprehensive guide to building modern web applications...</description>
      <category>Next.js</category>
      <category>React</category>
    </item>

    <!-- 更多文章... -->
  </channel>
</rss>
```

### Atom (`/atom.xml`)

```xml
<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Finn Days</title>
  <subtitle>Exploring technology, sharing knowledge...</subtitle>
  <link href="https://finn7x.com"/>
  <link href="https://finn7x.com/atom.xml" rel="self"/>
  <id>https://finn7x.com</id>
  <updated>2025-03-01T00:00:00.000Z</updated>
  <author>
    <name>Finn</name>
    <email>finn@example.com</email>
    <uri>https://finn7x.com</uri>
  </author>

  <entry>
    <title>Getting Started with Next.js</title>
    <link href="https://finn7x.com/blog/getting-started-with-nextjs"/>
    <id>https://finn7x.com/blog/getting-started-with-nextjs</id>
    <published>2025-03-01T00:00:00.000Z</published>
    <updated>2025-03-01T00:00:00.000Z</updated>
    <summary>A comprehensive guide to building modern web applications...</summary>
    <category term="Next.js"/>
    <category term="React"/>
  </entry>

  <!-- 更多文章... -->
</feed>
```

## 在导航中添加 RSS 入口

### Footer 中的 RSS 链接

已在 Footer 组件文档中描述，使用 Lucide 的 `Rss` 图标。

### 可选：在 Navbar 中添加 RSS 按钮

如果希望在导航栏中也提供 RSS 入口：

```typescript
// 在 navbar.tsx 中添加
import { Rss } from "lucide-react"

// 桌面端导航区域
<Button variant="ghost" size="icon" className="h-9 w-9" asChild>
  <a href="/feed.xml" aria-label="RSS Feed">
    <Rss className="h-4 w-4" />
  </a>
</Button>
```

## Feed 验证

### 在线验证工具

1. **W3C Feed Validation Service**
   - https://validator.w3.org/feed/
   - 输入 Feed URL，检查 XML 格式是否合规

2. **Feed Validator**
   - https://www.feedvalidator.org/
   - 支持 RSS 和 Atom 格式验证

### 本地验证

构建后检查生成的 XML 文件：

```bash
# 构建项目
npm run build

# 检查生成的 feed 文件
# 在 .next/server/app/ 目录下查找
cat .next/server/app/feed.xml.body
cat .next/server/app/atom.xml.body
```

### 使用 RSS 阅读器测试

推荐使用以下 RSS 阅读器进行测试：

- **Feedly** — Web/iOS/Android
- **Inoreader** — Web/iOS/Android
- **NetNewsWire** — macOS/iOS（免费开源）
- **Reeder** — macOS/iOS

在阅读器中添加 `https://your-domain.com/feed.xml`，确认文章列表正确显示。

## 实现步骤汇总

1. 安装 `feed` 库
2. 创建 `src/lib/feed.ts` — Feed 生成函数
3. 创建 `src/app/feed.xml/route.ts` — RSS 2.0 路由
4. 创建 `src/app/atom.xml/route.ts` — Atom 路由
5. 修改 `src/app/layout.tsx` — 在 metadata 中声明 Feed 链接
6. 确认 Footer 中包含 RSS 图标链接
7. 构建并验证 Feed 输出

## 文件清单

| 文件路径 | 说明 |
|----------|------|
| `src/lib/feed.ts` | Feed 生成核心函数 |
| `src/app/feed.xml/route.ts` | RSS 2.0 Route Handler |
| `src/app/atom.xml/route.ts` | Atom Route Handler |
| `src/app/layout.tsx` | 修改：添加 Feed alternates 声明 |
| `src/components/layout/footer.tsx` | 已包含 RSS 图标链接 |

## 测试要点

1. **Feed 生成**
   - 确认 `/feed.xml` 返回有效的 RSS 2.0 XML
   - 确认 `/atom.xml` 返回有效的 Atom XML
   - 确认 Content-Type header 正确

2. **Feed 内容**
   - 确认包含所有已发布的文章（排除草稿）
   - 确认文章按日期倒序排列
   - 确认每个条目包含标题、链接、描述、日期、标签
   - 确认链接为完整的绝对 URL

3. **Feed 验证**
   - 使用 W3C Feed Validator 验证 XML 格式
   - 使用 RSS 阅读器测试订阅功能
   - 确认 Feed 中没有格式错误或编码问题

4. **HTML head 声明**
   - 确认页面 HTML 中包含 `<link rel="alternate">` 标签
   - 确认 RSS 阅读器能自动发现 Feed

5. **构建时生成**
   - 确认 `npm run build` 后 Feed 文件正确生成
   - 确认 Feed 是静态文件，不需要运行时生成

6. **中文内容**
   - 确认中文标题和描述在 Feed 中正确编码
   - 确认 UTF-8 编码声明正确

7. **边界情况**
   - 没有文章时 Feed 不报错（生成空的但有效的 XML）
   - 文章描述中包含特殊字符（`<`, `>`, `&`）时正确转义

## 注意事项

1. **站点 URL 配置**：`siteConfig.url` 必须是完整的 URL（如 `https://finn7x.com`），Feed 中所有链接都需要绝对 URL
2. **构建时生成**：Feed 只在 `npm run build` 时生成，开发模式下每次请求实时生成（性能影响可忽略）
3. **内容更新**：新增或修改文章后需要重新构建才能更新 Feed
4. **Feed 大小**：如果文章数量很多（> 100 篇），可以考虑只输出最近的 20-50 篇
5. **特殊字符转义**：`feed` 库会自动处理 XML 特殊字符的转义
6. **日期格式**：`feed` 库自动将 JavaScript Date 对象转为 RFC 2822 格式（RSS）或 ISO 8601 格式（Atom）
7. **缓存策略**：设置了 `Cache-Control` header，CDN 会缓存 Feed 内容，减少服务器负载
8. **JSON Feed**：如果需要 JSON Feed 格式，`feed` 库也支持，可以添加 `/feed.json` 路由
