# 标签系统

## 概述

标签系统是博客内容组织的重要方式，允许用户通过标签浏览相关主题的文章。Finn Days 博客的标签系统包含两个页面：标签索引页（`/tags`）展示所有标签及其文章数量；标签筛选页（`/tags/[tag]`）展示特定标签下的所有文章。

标签数据直接从所有文章的 frontmatter 中聚合，不需要额外的数据源或配置文件。

## 技术方案

- **标签索引页路由**：`/[locale]/tags` -> `src/app/[locale]/tags/page.tsx`
- **标签筛选页路由**：`/[locale]/tags/[tag]` -> `src/app/[locale]/tags/[tag]/page.tsx`
- **数据来源**：从 Velite 编译后的文章数据中提取 `tags` 字段，聚合统计
- **静态生成**：使用 `generateStaticParams` 预渲染所有标签页
- **渲染方式**：Server Components

## 路由设计

```
/tags              → 标签索引页（显示所有标签）
/tags/next-js      → 标签筛选页（显示 "Next.js" 标签下的文章）
/tags/react        → 标签筛选页（显示 "React" 标签下的文章）
```

### 标签 slug 规则

标签名需要转为 URL 安全的 slug：

```typescript
// src/lib/tag-utils.ts

/**
 * 将标签名转换为 URL 友好的 slug
 * 例如: "Next.js" -> "next-js", "C++" -> "cpp", "Tailwind CSS" -> "tailwind-css"
 */
export function tagToSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/\+\+/g, 'pp')          // C++ -> cpp
    .replace(/\./g, '-')              // Next.js -> next-js
    .replace(/\s+/g, '-')             // Tailwind CSS -> tailwind-css
    .replace(/[^\w\u4e00-\u9fff-]/g, '') // 移除其他特殊字符
    .replace(/-+/g, '-')              // 合并连续连字符
    .replace(/^-|-$/g, '')            // 去掉首尾连字符
}

/**
 * 根据 slug 查找原始标签名
 */
export function slugToTag(slug: string, allTags: string[]): string | undefined {
  return allTags.find((tag) => tagToSlug(tag) === slug)
}
```

## 标签数据来源

标签数据从所有已发布文章的 `tags` 字段聚合。相关工具函数已在 `src/lib/content.ts` 中定义：

```typescript
// src/lib/content.ts（相关函数摘录）

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
 * 根据标签获取文章列表
 */
export function getPostsByTag(tag: string) {
  return getAllPosts().filter((post) =>
    post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  )
}
```

## /tags 索引页设计

### 页面布局

```
┌─────────────────────────────────────────┐
│              Navbar (公共)               │
├─────────────────────────────────────────┤
│                                         │
│  标签                                    │
│  浏览所有标签，发现感兴趣的内容            │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │  [Next.js (8)]  [React (6)]    │    │
│  │  [TypeScript (5)]  [CSS (4)]   │    │  ← 标签云
│  │  [Docker (3)]  [Linux (2)]     │    │
│  │  [Git (1)]                     │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
├─────────────────────────────────────────┤
│              Footer (公共)               │
└─────────────────────────────────────────┘
```

### `src/app/[locale]/tags/page.tsx`

```typescript
// src/app/[locale]/tags/page.tsx
import type { Metadata } from "next"
import { Link } from "@/i18n/routing"
import { Tag } from "lucide-react"
import { getAllTags } from "@/lib/content"
import { tagToSlug } from "@/lib/tag-utils"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Tags",
  description: "浏览所有标签，发现感兴趣的内容",
}

export default function TagsPage() {
  const allTags = getAllTags()

  // 计算标签大小（用于标签云效果）
  const maxCount = Math.max(...allTags.map((t) => t.count))
  const minCount = Math.min(...allTags.map((t) => t.count))

  function getTagSize(count: number): string {
    if (maxCount === minCount) return "text-base"
    const ratio = (count - minCount) / (maxCount - minCount)
    if (ratio > 0.75) return "text-xl font-semibold"
    if (ratio > 0.5) return "text-lg font-medium"
    if (ratio > 0.25) return "text-base"
    return "text-sm"
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      {/* 页面标题 */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
        </div>
        <p className="text-muted-foreground">
          共 {allTags.length} 个标签，{allTags.reduce((sum, t) => sum + t.count, 0)} 篇文章
        </p>
      </div>

      {/* 标签云 */}
      {allTags.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {allTags.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/tags/${tagToSlug(tag)}`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 transition-all",
                "hover:bg-primary hover:text-primary-foreground hover:border-primary",
                "hover:shadow-md hover:-translate-y-0.5",
                getTagSize(count)
              )}
            >
              <span>{tag}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {count}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">暂无标签</p>
        </div>
      )}

      {/* 可选：标签列表视图（按字母排序） */}
      <div className="mt-16">
        <h2 className="text-xl font-semibold mb-6">按字母排序</h2>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {[...allTags]
            .sort((a, b) => a.tag.localeCompare(b.tag))
            .map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/tags/${tagToSlug(tag)}`}
                className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <span className="font-medium">{tag}</span>
                <span className="text-muted-foreground">{count} 篇</span>
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
}
```

### 标签云设计说明

1. **大小比例**：根据文章数量计算标签的字体大小，文章越多的标签越大
2. **排序方式**：默认按文章数量降序排列（标签云区域），另提供按字母排序的列表视图
3. **hover 效果**：鼠标悬停时标签变为主题色背景 + 微上浮 + 阴影
4. **数量显示**：每个标签旁边显示文章数量

## /tags/[tag] 筛选页设计

### 页面布局

```
┌─────────────────────────────────────────┐
│              Navbar (公共)               │
├─────────────────────────────────────────┤
│                                         │
│  标签 / Next.js        ← 面包屑导航     │
│                                         │
│  标签: Next.js                           │
│  共 8 篇文章                             │
│                                         │
│  ┌──────────┐ ┌──────────┐              │
│  │ PostCard │ │ PostCard │              │
│  └──────────┘ └──────────┘              │
│  ┌──────────┐ ┌──────────┐              │
│  │ PostCard │ │ PostCard │              │
│  └──────────┘ └──────────┘              │
│  ...                                    │
│                                         │
├─────────────────────────────────────────┤
│              Footer (公共)               │
└─────────────────────────────────────────┘
```

### `src/app/[locale]/tags/[tag]/page.tsx`

```typescript
// src/app/[locale]/tags/[tag]/page.tsx
import type { Metadata } from "next"
import { Link } from "@/i18n/routing"
import { notFound } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { getAllTags, getPostsByTag, getTagSlugs } from "@/lib/content"
import { tagToSlug, slugToTag } from "@/lib/tag-utils"
import { PostCard } from "@/components/post-card"

interface TagPageProps {
  params: Promise<{
    tag: string
  }>
}

// 静态生成所有标签页（含 locale 变体）
export function generateStaticParams() {
  const tags = getTagSlugs()
  return tags.flatMap((tag) => [
    { locale: "zh", tag: tagToSlug(tag) },
    { locale: "en", tag: tagToSlug(tag) },
  ])
}

// 动态 SEO metadata
export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { tag: tagSlug } = await params
  const allTagNames = getTagSlugs()
  const tagName = slugToTag(tagSlug, allTagNames)

  if (!tagName) {
    return { title: "标签未找到" }
  }

  return {
    title: `${tagName}`,
    description: `标签 "${tagName}" 下的所有文章`,
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag: tagSlug } = await params

  // 根据 slug 查找原始标签名
  const allTagNames = getTagSlugs()
  const tagName = slugToTag(tagSlug, allTagNames)

  if (!tagName) {
    notFound()
  }

  // 获取该标签下的所有文章
  const posts = getPostsByTag(tagName)

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      {/* 面包屑导航 */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link
          href="/tags"
          className="hover:text-foreground transition-colors"
        >
          标签
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{tagName}</span>
      </nav>

      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          标签:{" "}
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {tagName}
          </span>
        </h1>
        <p className="text-muted-foreground">
          共 {posts.length} 篇文章
        </p>
      </div>

      {/* 文章列表 */}
      {posts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <PostCard
              key={post.slugAsParams}
              title={post.title}
              description={post.description}
              date={post.date}
              readingTime={post.readingTime}
              tags={post.tags}
              slug={post.slugAsParams}
              permalink={post.permalink}
              cover={post.cover}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-muted-foreground mb-4">
            该标签下暂无文章
          </p>
          <Link
            href="/tags"
            className="text-primary hover:underline underline-offset-4"
          >
            查看所有标签
          </Link>
        </div>
      )}

      {/* 返回标签索引 */}
      <div className="mt-12 text-center">
        <Link
          href="/tags"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 查看所有标签
        </Link>
      </div>
    </div>
  )
}
```

## 标签 Badge 组件样式

### `src/components/tag-badge.tsx`

```typescript
// src/components/tag-badge.tsx
import { Link } from "@/i18n/routing"
import { tagToSlug } from "@/lib/tag-utils"
import { cn } from "@/lib/utils"

interface TagBadgeProps {
  tag: string
  count?: number       // 可选：显示文章数量
  linked?: boolean     // 是否可点击跳转
  size?: "sm" | "md"   // 大小变体
  className?: string
}

export function TagBadge({
  tag,
  count,
  linked = true,
  size = "sm",
  className,
}: TagBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  }

  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md font-medium transition-colors",
        "bg-secondary text-secondary-foreground",
        linked && "hover:bg-primary hover:text-primary-foreground cursor-pointer",
        sizeClasses[size],
        className
      )}
    >
      {tag}
      {count !== undefined && (
        <span className="text-[0.7em] opacity-70">({count})</span>
      )}
    </span>
  )

  if (linked) {
    return (
      <Link href={`/tags/${tagToSlug(tag)}`}>
        {content}
      </Link>
    )
  }

  return content
}
```

### 使用示例

```tsx
{/* 基础用法 */}
<TagBadge tag="Next.js" />

{/* 带数量 */}
<TagBadge tag="React" count={6} />

{/* 不可点击 */}
<TagBadge tag="TypeScript" linked={false} />

{/* 较大尺寸 */}
<TagBadge tag="CSS" size="md" />

{/* 多标签列表 */}
<div className="flex flex-wrap gap-1.5">
  {post.tags.map((tag) => (
    <TagBadge key={tag} tag={tag} />
  ))}
</div>
```

## generateStaticParams（预渲染所有标签页）

```typescript
// src/app/[locale]/tags/[tag]/page.tsx
export function generateStaticParams() {
  const tags = getTagSlugs()
  return tags.flatMap((tag) => [
    { locale: "zh", tag: tagToSlug(tag) },
    { locale: "en", tag: tagToSlug(tag) },
  ])
}
```

**工作流程**：

1. 构建时调用 `getTagSlugs()` 获取所有唯一标签名
2. 将每个标签名转为 URL slug，并为每个 locale（zh/en）生成变体
3. Next.js 为每个 locale + slug 组合生成静态 HTML 页面
4. 访问时直接返回预渲染的 HTML，无需服务端计算

## 标签命名规范

### 推荐规范

| 规则 | 示例 | 说明 |
|------|------|------|
| 使用官方名称 | `Next.js`（而非 `nextjs`） | 尊重项目官方写法 |
| 首字母大写 | `React`、`Docker` | 英文标签首字母大写 |
| 技术标签保留原样 | `TypeScript`、`CSS` | 不做大小写转换 |
| 多词用空格 | `Tailwind CSS`（而非 `tailwind-css`） | frontmatter 中使用原始名称 |
| 避免重复 | 选 `JavaScript` 或 `JS`，不要两者都用 | 保持标签一致性 |
| 中文标签 | `前端`、`教程` | 可以使用，但不推荐与英文标签混用 |

### 示例 frontmatter

```yaml
# 推荐
tags: ["Next.js", "React", "TypeScript"]

# 不推荐
tags: ["nextjs", "react", "typescript"]    # 丢失了原始大小写
tags: ["Next.js", "nextjs"]                # 重复标签
tags: ["tailwind css", "Tailwind CSS"]     # 大小写不一致
```

### 标签匹配规则

在 `getPostsByTag` 中使用大小写不敏感匹配，确保即使 frontmatter 中标签大小写不一致也能正确聚合：

```typescript
export function getPostsByTag(tag: string) {
  return getAllPosts().filter((post) =>
    post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  )
}
```

## 文件清单

| 文件路径 | 说明 |
|----------|------|
| `src/app/[locale]/tags/page.tsx` | 标签索引页 |
| `src/app/[locale]/tags/[tag]/page.tsx` | 标签筛选页 |
| `src/components/tag-badge.tsx` | 标签 Badge 组件 |
| `src/components/post-card.tsx` | 文章卡片组件（复用，已在博客列表页定义） |
| `src/lib/tag-utils.ts` | 标签工具函数（slug 转换） |
| `src/lib/content.ts` | 内容查询函数（已有标签相关函数） |

## 依赖说明

无需新增依赖。使用的组件和工具均已在项目中：

- `@/i18n/routing` — i18n 路由链接（`Link` 组件，自动保留 locale 前缀）
- `lucide-react` — 图标（Tag, ChevronRight）
- `@/components/ui/button` — 按钮组件（可选）
- `@/lib/utils` — cn 工具函数

## 测试要点

1. **标签索引页**
   - 确认显示所有标签及正确的文章数量
   - 确认标签云的大小比例正确（文章多的标签字体更大）
   - 确认字母排序列表正确
   - 点击标签跳转到正确的筛选页

2. **标签筛选页**
   - 确认显示正确标签名称和文章数量
   - 确认文章列表只包含该标签的文章
   - 确认文章按日期倒序排列
   - 确认面包屑导航正确

3. **标签 slug 转换**
   - `Next.js` -> `next-js` -> 反查回 `Next.js`
   - `Tailwind CSS` -> `tailwind-css` -> 反查回 `Tailwind CSS`
   - `C++` -> `cpp` -> 反查回 `C++`
   - 中文标签正确处理

4. **静态生成**
   - 确认 `generateStaticParams` 生成了所有标签页
   - 构建后访问标签页不需要服务端渲染

5. **404 处理**
   - 访问不存在的标签 slug（如 `/tags/nonexistent`）显示 404
   - 确认 404 页面有返回标签索引的链接

6. **标签 Badge 组件**
   - 确认可点击的标签跳转正确
   - 确认不可点击的标签没有链接
   - 确认大小变体样式正确

7. **大小写一致性**
   - frontmatter 中写 `next.js` 和 `Next.js` 应该被视为同一标签
   - 确认标签聚合时大小写处理正确

## 注意事项

1. **标签 slug 一致性**：`tagToSlug` 和 `slugToTag` 必须配对使用，确保双向转换一致
2. **URL 编码**：某些标签名可能包含特殊字符，确保 URL 正确编码/解码
3. **空标签处理**：如果某个标签下的所有文章都是草稿，该标签不应出现在索引页
4. **标签数量控制**：如果标签数量非常多（> 50个），标签云可能过于密集，考虑分组或只显示 top N
5. **SEO**：每个标签页有独立的 metadata，便于搜索引擎索引
6. **params 异步**：Next.js 15+ 中 `params` 是 `Promise` 类型
7. **复用 PostCard**：标签筛选页复用博客列表页的 `PostCard` 组件，保持一致的视觉效果
8. **性能考虑**：标签数据在构建时计算，运行时直接使用，无性能开销
