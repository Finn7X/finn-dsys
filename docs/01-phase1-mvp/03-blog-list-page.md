# 博客列表页

## 概述

博客列表页是 Finn Days 博客的核心页面之一，展示所有已发布的文章列表，支持分页浏览和标签筛选。页面采用 Server Component 实现，在构建时静态生成，提供最佳的加载性能和 SEO 表现。

## 技术方案

- **路由**：`/blog` -> `src/app/blog/page.tsx`
- **渲染方式**：Server Component + 静态生成 (SSG)
- **数据来源**：通过 `src/lib/content.ts` 从 Velite 编译数据获取
- **分页方式**：URL 搜索参数 `?page=2`
- **标签筛选**：URL 搜索参数 `?tag=Next.js`
- **排序**：按发布日期倒序

## 页面布局设计

```
┌─────────────────────────────────────────┐
│              Navbar (公共)               │
├─────────────────────────────────────────┤
│                                         │
│  博客                                    │
│  探索技术文章和开发心得                      │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 标签筛选区域（可选）               │    │
│  │ [All] [Next.js] [React] [CSS]  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌──────────┐ ┌──────────┐              │
│  │ PostCard │ │ PostCard │              │
│  │          │ │          │              │  ← 响应式网格
│  └──────────┘ └──────────┘              │     移动端1列
│  ┌──────────┐ ┌──────────┐              │     平板2列
│  │ PostCard │ │ PostCard │              │
│  │          │ │          │              │
│  └──────────┘ └──────────┘              │
│                                         │
│        ← 1 2 3 ... 10 →                │  ← 分页导航
│                                         │
├─────────────────────────────────────────┤
│              Footer (公共)               │
└─────────────────────────────────────────┘
```

### 响应式网格规则

| 屏幕宽度 | 网格列数 | 说明 |
|----------|---------|------|
| < 640px (sm) | 1 列 | 移动端，全宽卡片 |
| 640px - 1023px (md) | 2 列 | 平板端 |
| >= 1024px (lg) | 2 列 | 桌面端，列表页保持2列更利于阅读 |

## PostCard 组件设计

### 文件位置：`src/components/post-card.tsx`

```typescript
// src/components/post-card.tsx
import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, Tag } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PostCardProps {
  title: string
  description: string
  date: string
  readingTime: string
  tags: string[]
  slug: string          // slugAsParams
  permalink: string
  cover?: string
}

export function PostCard({
  title,
  description,
  date,
  readingTime,
  tags,
  permalink,
  cover,
}: PostCardProps) {
  return (
    <Link href={permalink} className="group block">
      <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/20 group-hover:-translate-y-0.5">
        {/* 封面图（可选） */}
        {cover && (
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={cover}
              alt={title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
            />
          </div>
        )}

        <CardHeader className={cn("pb-3", !cover && "pt-6")}>
          {/* 日期和阅读时长 */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <time dateTime={date}>
                {new Date(date).toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {readingTime}
            </span>
          </div>

          {/* 标题 */}
          <h3 className="text-xl font-semibold leading-tight tracking-tight group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
        </CardHeader>

        <CardContent className="pt-0">
          {/* 摘要 */}
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4">
            {description}
          </p>

          {/* 标签 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="inline-flex items-center text-xs text-muted-foreground">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
```

### PostCard 设计要点

1. **整个卡片可点击**：外层 `<Link>` 包裹整个卡片，使用 `group` 类实现联动 hover 效果
2. **封面图可选**：有封面图时显示 `aspect-video` 区域，无封面图时直接显示内容
3. **标签数量限制**：最多显示 3 个标签，超出显示 `+N`
4. **文本截断**：标题最多 2 行（`line-clamp-2`），摘要最多 2 行
5. **hover 效果**：卡片上浮 + 阴影加深 + 标题变色 + 封面图微缩放
6. **语义化 HTML**：日期使用 `<time>` 元素，包含 `dateTime` 属性
7. **图片优化**：使用 Next.js `<Image>` 的 `fill` + `sizes` 实现响应式图片

## 分页方案

### 推荐方案：URL 搜索参数分页

使用 `?page=N` 作为分页参数，便于 SEO、书签和分享。

### 分页组件：`src/components/pagination.tsx`

```typescript
// src/components/pagination.tsx
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string       // 如 '/blog'
  searchParams?: Record<string, string>  // 保留其他搜索参数（如 tag）
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null

  // 生成分页链接
  function getPageUrl(page: number): string {
    const params = new URLSearchParams(searchParams)
    if (page > 1) {
      params.set("page", String(page))
    } else {
      params.delete("page")
    }
    const query = params.toString()
    return query ? `${basePath}?${query}` : basePath
  }

  // 计算显示的页码范围
  function getPageNumbers(): (number | "ellipsis")[] {
    const pages: (number | "ellipsis")[] = []
    const delta = 2 // 当前页前后显示的页数

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||                    // 始终显示第一页
        i === totalPages ||            // 始终显示最后一页
        (i >= currentPage - delta && i <= currentPage + delta)  // 当前页附近
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== "ellipsis") {
        pages.push("ellipsis")
      }
    }

    return pages
  }

  return (
    <nav
      className="flex items-center justify-center gap-1"
      aria-label="分页导航"
    >
      {/* 上一页 */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        disabled={currentPage <= 1}
        asChild={currentPage > 1}
      >
        {currentPage > 1 ? (
          <Link href={getPageUrl(currentPage - 1)} aria-label="上一页">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}
      </Button>

      {/* 页码 */}
      {getPageNumbers().map((pageNum, idx) => {
        if (pageNum === "ellipsis") {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
            >
              ...
            </span>
          )
        }

        const isActive = pageNum === currentPage
        return (
          <Button
            key={pageNum}
            variant={isActive ? "default" : "ghost"}
            size="icon"
            className={cn("h-9 w-9", isActive && "pointer-events-none")}
            asChild={!isActive}
          >
            {isActive ? (
              <span aria-current="page">{pageNum}</span>
            ) : (
              <Link href={getPageUrl(pageNum)} aria-label={`第 ${pageNum} 页`}>
                {pageNum}
              </Link>
            )}
          </Button>
        )
      })}

      {/* 下一页 */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        disabled={currentPage >= totalPages}
        asChild={currentPage < totalPages}
      >
        {currentPage < totalPages ? (
          <Link href={getPageUrl(currentPage + 1)} aria-label="下一页">
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </nav>
  )
}
```

### 分页逻辑说明

- **每页显示 10 篇文章**
- **第一页 URL**：`/blog`（不显示 `?page=1`）
- **后续页 URL**：`/blog?page=2`、`/blog?page=3`
- **带标签筛选**：`/blog?tag=Next.js&page=2`
- **省略号逻辑**：当总页数较多时，中间显示省略号，始终显示首尾页

## 标签筛选

### 筛选方式

通过 URL 搜索参数 `?tag=xxx` 实现标签筛选：

- `/blog` — 显示所有文章
- `/blog?tag=Next.js` — 只显示标签包含 "Next.js" 的文章
- `/blog?tag=React&page=2` — 标签筛选 + 分页

### 标签筛选区域

```typescript
// 标签筛选区域（在博客列表页中）
interface TagFilterProps {
  tags: { tag: string; count: number }[]
  activeTag?: string
}

function TagFilter({ tags, activeTag }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <Link
        href="/blog"
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors",
          !activeTag
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        )}
      >
        All
      </Link>
      {tags.map(({ tag, count }) => (
        <Link
          key={tag}
          href={`/blog?tag=${encodeURIComponent(tag)}`}
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors",
            activeTag === tag
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          {tag}
          <span className="ml-1.5 text-xs opacity-70">({count})</span>
        </Link>
      ))}
    </div>
  )
}
```

## 博客列表页完整实现

### `src/app/blog/page.tsx`

```typescript
// src/app/blog/page.tsx
import type { Metadata } from "next"
import { getAllPosts, getAllTags, getPostsByTag, getPaginatedPosts } from "@/lib/content"
import { PostCard } from "@/components/post-card"
import { Pagination } from "@/components/pagination"
import { siteConfig } from "@/config/site"
import Link from "next/link"
import { cn } from "@/lib/utils"

// SEO Metadata
export const metadata: Metadata = {
  title: "Blog",
  description: `${siteConfig.name} 的技术博客，分享 Web 开发、React、Next.js 等技术文章。`,
}

// 搜索参数类型
interface BlogPageProps {
  searchParams: Promise<{
    page?: string
    tag?: string
  }>
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const activeTag = params.tag

  // 获取所有标签（用于筛选区域）
  const allTags = getAllTags()

  // 根据标签筛选或获取所有文章
  let filteredPosts = activeTag
    ? getPostsByTag(activeTag)
    : getAllPosts()

  // 分页计算
  const perPage = 10
  const totalPages = Math.ceil(filteredPosts.length / perPage)
  const start = (currentPage - 1) * perPage
  const paginatedPosts = filteredPosts.slice(start, start + perPage)

  // 保留搜索参数（用于分页链接）
  const searchParamsForPagination: Record<string, string> = {}
  if (activeTag) searchParamsForPagination.tag = activeTag

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Blog</h1>
        <p className="text-muted-foreground">
          {activeTag
            ? `标签 "${activeTag}" 下的文章（${filteredPosts.length} 篇）`
            : `探索技术文章和开发心得（共 ${filteredPosts.length} 篇）`}
        </p>
      </div>

      {/* 标签筛选 */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/blog"
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors",
            !activeTag
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          All
        </Link>
        {allTags.slice(0, 10).map(({ tag, count }) => (
          <Link
            key={tag}
            href={`/blog?tag=${encodeURIComponent(tag)}`}
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors",
              activeTag === tag
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {tag}
            <span className="ml-1.5 text-xs opacity-70">({count})</span>
          </Link>
        ))}
      </div>

      {/* 文章列表 */}
      {paginatedPosts.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            {paginatedPosts.map((post) => (
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

          {/* 分页 */}
          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/blog"
              searchParams={searchParamsForPagination}
            />
          </div>
        </>
      ) : (
        /* 空状态 */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl font-semibold mb-2">暂无文章</h2>
          <p className="text-muted-foreground mb-4">
            {activeTag
              ? `标签 "${activeTag}" 下还没有文章`
              : "还没有发布任何文章"}
          </p>
          {activeTag && (
            <Link
              href="/blog"
              className="text-primary hover:underline underline-offset-4"
            >
              查看所有文章
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
```

## 空状态处理

当没有匹配的文章时，显示友好的空状态提示：

```
┌─────────────────────────────────┐
│                                 │
│             📝                   │
│                                 │
│         暂无文章                 │
│  标签 "xxx" 下还没有文章          │
│                                 │
│       [查看所有文章]              │
│                                 │
└─────────────────────────────────┘
```

空状态场景：
1. 博客刚创建，还没有文章
2. 筛选的标签下没有文章
3. 页码超出范围

## SEO 配置

### generateMetadata

博客列表页的 metadata 已在页面文件顶部通过 `export const metadata` 定义。如果需要根据标签动态生成 metadata，可以改用 `generateMetadata` 函数：

```typescript
export async function generateMetadata({
  searchParams,
}: BlogPageProps): Promise<Metadata> {
  const params = await searchParams
  const tag = params.tag

  if (tag) {
    return {
      title: `${tag} - Blog`,
      description: `标签 "${tag}" 下的所有文章`,
    }
  }

  return {
    title: "Blog",
    description: `${siteConfig.name} 的技术博客`,
  }
}
```

### SEO 最佳实践

1. **页面标题**：使用 `template` 格式，最终渲染为 "Blog | Finn Days"
2. **canonical URL**：避免分页产生的重复内容问题
3. **description**：简洁描述页面内容
4. **noindex 分页页面**（可选）：第 2 页起可以添加 `robots: { index: false }`

## 静态生成

由于博客列表页使用了 `searchParams`，Next.js 会将其作为动态路由处理。如果希望静态生成第一页，可以考虑以下策略：

### 方案：让第一页静态生成

```typescript
// 在 page.tsx 中
export const dynamic = 'force-static'  // 不推荐，会导致搜索参数失效
```

**推荐做法**：不强制静态生成列表页，让 Next.js 按需渲染。搜索参数（分页、标签筛选）本身适合动态渲染，且 Next.js 的增量静态再生 (ISR) 会自动缓存。

如果文章数量较少（< 50 篇），分页和筛选的响应速度在 SSR 下也足够快。

## 文件清单

| 文件路径 | 说明 |
|----------|------|
| `src/app/blog/page.tsx` | 博客列表页主文件 |
| `src/components/post-card.tsx` | 文章卡片组件 |
| `src/components/pagination.tsx` | 分页导航组件 |
| `src/lib/content.ts` | 内容查询函数（已在 Velite 文档中定义） |
| `src/config/site.ts` | 站点配置 |

## 依赖说明

无需新增依赖。使用的组件和工具均已在项目中：

- `next/link` — 路由链接
- `next/image` — 图片优化
- `lucide-react` — 图标（Calendar, Clock, ChevronLeft, ChevronRight）
- `@/components/ui/card` — Card 组件
- `@/components/ui/button` — Button 组件

## 测试要点

1. **文章列表展示**
   - 确认文章按发布日期倒序排列
   - 确认草稿文章不显示
   - 确认 PostCard 正确显示标题、摘要、日期、标签、阅读时长
   - 确认点击 PostCard 跳转到正确的文章详情页

2. **分页功能**
   - 访问 `/blog`，确认显示前 10 篇文章
   - 访问 `/blog?page=2`，确认显示第 11-20 篇文章
   - 确认上一页/下一页按钮状态正确（第一页禁用"上一页"，最后一页禁用"下一页"）
   - 确认页码高亮正确
   - 测试超出范围的页码（如 `?page=999`）

3. **标签筛选**
   - 点击标签，确认 URL 更新为 `?tag=xxx`
   - 确认只显示包含该标签的文章
   - 确认 "All" 按钮清除标签筛选
   - 确认标签筛选 + 分页组合正确

4. **空状态**
   - 使用不存在的标签筛选，确认显示空状态
   - 确认空状态下有返回链接

5. **响应式布局**
   - 移动端 1 列布局
   - 平板/桌面 2 列布局
   - PostCard 在各尺寸下样式正常

6. **封面图**
   - 有封面图的文章正确显示
   - 无封面图的文章不显示空白区域
   - 图片加载时的占位处理

7. **性能**
   - 页面首屏加载时间 < 1 秒
   - 图片使用 lazy loading
   - 确认没有不必要的客户端 JavaScript

## 注意事项

1. **searchParams 是异步的**：在 Next.js 15+ 中，`searchParams` 是 `Promise` 类型，需要 `await` 获取
2. **标签 URL 编码**：标签名可能包含特殊字符（如 `C++`、`Next.js`），使用 `encodeURIComponent` 编码
3. **分页边界处理**：页码小于 1 或大于总页数时，应重定向到有效页码或显示空状态
4. **标签数量限制**：筛选区域最多显示 10 个标签，避免标签过多导致页面拥挤
5. **PostCard 标签限制**：每个卡片最多显示 3 个标签
6. **图片 sizes 属性**：`PostCard` 中的 `<Image>` 需要正确设置 `sizes` 以优化加载
7. **line-clamp 兼容性**：`line-clamp-2` 在 Tailwind CSS 4 中已原生支持
8. **日期格式化**：使用 `toLocaleDateString("zh-CN")` 显示中文日期格式
