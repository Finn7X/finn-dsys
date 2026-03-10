# 系列文章导航

## 概述

为 Finn Days 博客添加系列文章导航功能，让属于同一系列的文章能够通过导航组件串联起来。读者可以在文章详情页中看到当前文章所属系列的完整文章列表，快速跳转到上一篇或下一篇，并清晰地了解自己在系列中的阅读进度。

## 功能说明

- **系列定义**：通过文章 frontmatter 中的 `series` 字段标记文章所属的系列
- **导航列表**：显示系列内所有文章的标题列表，当前文章高亮标记
- **快速跳转**：提供上一篇/下一篇按钮，方便线性阅读
- **展开/收起**：文章列表支持折叠，默认展开，用户可手动收起节省空间
- **显示位置**：文章正文上方，让读者在阅读前了解系列上下文

## 技术方案

### 系列文章数据结构

在文章的 frontmatter 中添加 `series` 相关字段：

```yaml
---
title: "Next.js 入门指南（一）：项目搭建"
date: 2026-01-15
series:
  title: "Next.js 入门指南"
  order: 1
tags:
  - Next.js
  - React
---
```

字段说明：

| 字段 | 类型 | 说明 |
|------|------|------|
| `series.title` | `string` | 系列名称，同一系列的所有文章必须使用完全相同的名称 |
| `series.order` | `number` | 在系列中的排序序号（从 1 开始） |

### Velite Schema 扩展

在 Velite 的内容 schema 中添加 `series` 字段定义：

```typescript
// velite.config.ts（相关部分）
import { defineConfig, s } from "velite";

const posts = {
  name: "Post",
  pattern: "blog/**/*.mdx",
  schema: s
    .object({
      title: s.string(),
      slug: s.slug("blog"),
      date: s.isodate(),
      description: s.string().optional(),
      tags: s.array(s.string()).optional(),
      published: s.boolean().default(true),
      // 系列文章字段
      series: s
        .object({
          title: s.string(),
          order: s.number(),
        })
        .optional(),
      body: s.mdx(),
    })
    .transform((data) => ({
      ...data,
      slugAsParams: data.slug.split("/").slice(1).join("/"),
    })),
};
```

### 系列文章查询函数

创建查询函数，根据系列名称获取该系列下的所有文章：

```typescript
// src/lib/posts.ts（添加以下函数）

interface SeriesPost {
  title: string;
  slug: string;
  date: string;
  order: number;
}

interface SeriesInfo {
  title: string;
  posts: SeriesPost[];
  currentIndex: number;
  prevPost: SeriesPost | null;
  nextPost: SeriesPost | null;
}

/**
 * 根据系列名称获取系列内的所有文章
 * @param seriesTitle 系列名称
 * @param currentSlug 当前文章的 slug
 */
export function getSeriesInfo(
  seriesTitle: string,
  currentSlug: string
): SeriesInfo | null {
  // 从 Velite 生成的数据中筛选同系列文章
  const seriesPosts = allPosts
    .filter(
      (post) =>
        post.series?.title === seriesTitle && post.published !== false
    )
    .sort((a, b) => (a.series?.order ?? 0) - (b.series?.order ?? 0))
    .map((post) => ({
      title: post.title,
      slug: post.slugAsParams,
      date: post.date,
      order: post.series!.order,
    }));

  if (seriesPosts.length === 0) return null;

  const currentIndex = seriesPosts.findIndex(
    (post) => post.slug === currentSlug
  );

  return {
    title: seriesTitle,
    posts: seriesPosts,
    currentIndex,
    prevPost: currentIndex > 0 ? seriesPosts[currentIndex - 1] : null,
    nextPost:
      currentIndex < seriesPosts.length - 1
        ? seriesPosts[currentIndex + 1]
        : null,
  };
}

/**
 * 获取所有系列的列表（用于系列索引页面，可选）
 */
export function getAllSeries(): { title: string; postCount: number }[] {
  const seriesMap = new Map<string, number>();

  allPosts.forEach((post) => {
    if (post.series?.title) {
      seriesMap.set(
        post.series.title,
        (seriesMap.get(post.series.title) || 0) + 1
      );
    }
  });

  return Array.from(seriesMap.entries())
    .map(([title, postCount]) => ({ title, postCount }))
    .sort((a, b) => a.title.localeCompare(b.title));
}
```

## 实现步骤

### 步骤 1：创建 SeriesNav 组件

```typescript
// src/components/blog/series-nav.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SeriesPost {
  title: string;
  slug: string;
  order: number;
}

interface SeriesNavProps {
  /** 系列标题 */
  seriesTitle: string;
  /** 系列内所有文章 */
  posts: SeriesPost[];
  /** 当前文章在列表中的索引 */
  currentIndex: number;
  /** 上一篇文章 */
  prevPost: SeriesPost | null;
  /** 下一篇文章 */
  nextPost: SeriesPost | null;
}

export function SeriesNav({
  seriesTitle,
  posts,
  currentIndex,
  prevPost,
  nextPost,
}: SeriesNavProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-10 rounded-xl border bg-card overflow-hidden">
      {/* 头部：系列标题 + 展开/收起按钮 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-accent/50 transition-colors"
        aria-expanded={isExpanded}
        aria-controls="series-post-list"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-purple-600 shrink-0" />
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              系列文章
            </div>
            <div className="font-semibold mt-0.5">{seriesTitle}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {posts.length}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* 文章列表 */}
      {isExpanded && (
        <div id="series-post-list" className="border-t">
          <ol className="divide-y" role="list">
            {posts.map((post, index) => {
              const isCurrent = index === currentIndex;

              return (
                <li key={post.slug}>
                  {isCurrent ? (
                    <div
                      className="flex items-center gap-3 px-5 py-3 bg-accent/50"
                      aria-current="page"
                    >
                      {/* 序号 */}
                      <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-medium shrink-0">
                        {post.order}
                      </span>
                      {/* 标题（当前文章，不可点击） */}
                      <span className="font-medium text-sm">
                        {post.title}
                      </span>
                      {/* 当前标记 */}
                      <span className="ml-auto text-xs text-purple-600 font-medium shrink-0">
                        当前
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={`/blog/${post.slug}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-accent/30 transition-colors group"
                    >
                      {/* 序号 */}
                      <span className="flex items-center justify-center h-6 w-6 rounded-full border text-xs font-medium text-muted-foreground group-hover:border-purple-600 group-hover:text-purple-600 transition-colors shrink-0">
                        {post.order}
                      </span>
                      {/* 标题 */}
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {post.title}
                      </span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>

          {/* 上一篇/下一篇快速导航 */}
          <div className="border-t px-5 py-3 flex items-center justify-between gap-4">
            {prevPost ? (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link href={`/blog/${prevPost.slug}`}>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline truncate max-w-[150px]">
                    {prevPost.title}
                  </span>
                  <span className="sm:hidden">上一篇</span>
                </Link>
              </Button>
            ) : (
              <div />
            )}

            {nextPost ? (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link href={`/blog/${nextPost.slug}`}>
                  <span className="hidden sm:inline truncate max-w-[150px]">
                    {nextPost.title}
                  </span>
                  <span className="sm:hidden">下一篇</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <div />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 步骤 2：在文章详情页中集成

```typescript
// src/app/blog/[slug]/page.tsx（相关部分）
import { SeriesNav } from "@/components/blog/series-nav";
import { getPostBySlug, getSeriesInfo } from "@/lib/posts";

export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getPostBySlug(params.slug);

  // 获取系列信息（如果文章属于某个系列）
  const seriesInfo = post.series
    ? getSeriesInfo(post.series.title, params.slug)
    : null;

  return (
    <article className="container mx-auto max-w-3xl py-16 px-4">
      {/* 文章头部：标题、日期、标签 */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        {/* 日期、标签等 */}
      </header>

      {/* 系列文章导航 - 文章正文上方 */}
      {seriesInfo && (
        <SeriesNav
          seriesTitle={seriesInfo.title}
          posts={seriesInfo.posts}
          currentIndex={seriesInfo.currentIndex}
          prevPost={seriesInfo.prevPost}
          nextPost={seriesInfo.nextPost}
        />
      )}

      {/* 文章正文 */}
      <div className="prose dark:prose-invert max-w-none">
        {/* MDX Content */}
      </div>

      {/* 底部也可以添加上一篇/下一篇导航（可选） */}
      {seriesInfo && (seriesInfo.prevPost || seriesInfo.nextPost) && (
        <div className="mt-12 pt-6 border-t flex items-center justify-between">
          {seriesInfo.prevPost && (
            <a
              href={`/blog/${seriesInfo.prevPost.slug}`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← {seriesInfo.prevPost.title}
            </a>
          )}
          {seriesInfo.nextPost && (
            <a
              href={`/blog/${seriesInfo.nextPost.slug}`}
              className="text-sm text-muted-foreground hover:text-foreground ml-auto"
            >
              {seriesInfo.nextPost.title} →
            </a>
          )}
        </div>
      )}

      {/* 分享按钮 */}
      {/* 作者卡片 */}
      {/* Newsletter */}
      {/* 评论区 */}
    </article>
  );
}
```

### 步骤 3：系列文章示例 frontmatter

以一个 "Next.js 入门指南" 系列为例，包含 3 篇文章：

**第 1 篇：**
```yaml
---
title: "Next.js 入门指南（一）：项目搭建与基础概念"
date: 2026-01-15
description: "从零开始创建 Next.js 项目，了解 App Router 的核心概念"
series:
  title: "Next.js 入门指南"
  order: 1
tags:
  - Next.js
  - React
---
```

**第 2 篇：**
```yaml
---
title: "Next.js 入门指南（二）：路由与数据获取"
date: 2026-01-22
description: "深入理解 App Router 的路由系统和数据获取策略"
series:
  title: "Next.js 入门指南"
  order: 2
tags:
  - Next.js
  - React
---
```

**第 3 篇：**
```yaml
---
title: "Next.js 入门指南（三）：部署与性能优化"
date: 2026-01-29
description: "将 Next.js 应用部署到生产环境并进行性能调优"
series:
  title: "Next.js 入门指南"
  order: 3
tags:
  - Next.js
  - React
---
```

### 步骤 4：样式设计说明

**整体容器：**
- `rounded-xl border bg-card`：圆角卡片，与其他组件风格统一
- `overflow-hidden`：确保内部元素不溢出圆角

**头部区域：**
- 紫色书本图标（`BookOpen`）标识这是系列文章
- 显示系列标题和当前进度（如 "2 / 5"）
- 整个头部可点击，控制列表展开/收起

**文章列表：**
- 有序列表，每项包含序号和标题
- 当前文章：渐变色序号圆圈 + 加粗标题 + "当前"标记 + 灰色背景
- 其他文章：边框序号圆圈 + 可点击标题，hover 时变色
- 使用 `divide-y` 分隔线区分每一项

**上一篇/下一篇：**
- 底部独立区域，左对齐上一篇，右对齐下一篇
- 桌面端显示文章标题（截断过长标题），移动端显示"上一篇/下一篇"文字
- 使用 ghost 按钮样式，低调不抢眼

## 文件清单

| 文件路径 | 说明 | 操作 |
|---------|------|------|
| `velite.config.ts` | Velite schema 添加 series 字段 | 修改 |
| `src/lib/posts.ts` | 添加 `getSeriesInfo`、`getAllSeries` 函数 | 修改 |
| `src/components/blog/series-nav.tsx` | 系列文章导航组件 | 新建 |
| `src/app/blog/[slug]/page.tsx` | 文章详情页 | 修改（集成 SeriesNav） |
| `content/blog/*.mdx` | 系列文章 frontmatter 添加 series 字段 | 修改 |

## 依赖说明

本功能不需要额外安装任何依赖包，完全基于：

- React hooks（`useState`）
- Next.js `Link` 组件
- lucide-react 图标（项目已安装）
- shadcn/ui Button 组件（项目已安装）
- Velite 内容管理（Phase 1 已集成）

## 测试要点

1. **数据查询测试**
   - `getSeriesInfo` 正确返回同系列的所有文章
   - 文章按 `series.order` 正确排序
   - `currentIndex` 正确标识当前文章位置
   - `prevPost` 和 `nextPost` 正确计算
   - 系列第一篇文章的 `prevPost` 为 `null`
   - 系列最后一篇文章的 `nextPost` 为 `null`
   - 不属于任何系列的文章不显示 SeriesNav 组件

2. **UI 交互测试**
   - 展开/收起按钮正常工作，切换图标正确
   - 当前文章高亮显示，不可点击
   - 其他文章可点击跳转到对应页面
   - 上一篇/下一篇链接指向正确的文章
   - hover 效果和过渡动画流畅

3. **响应式测试**
   - 桌面端上一篇/下一篇显示文章标题
   - 移动端上一篇/下一篇显示简短文字
   - 文章标题过长时正确截断（`truncate`）
   - 整体布局在小屏幕上不溢出

4. **边界情况测试**
   - 系列只有 1 篇文章时的显示（不显示上一篇/下一篇按钮）
   - 系列有大量文章（10+ 篇）时的列表滚动体验
   - `series.title` 包含特殊字符时正常工作
   - `series.order` 不连续（如 1, 3, 5）时排序正确

5. **数据一致性测试**
   - 修改系列名称后所有文章的关联更新正确
   - 新增系列文章后列表自动包含（构建后生效）
   - 删除系列中的某篇文章后列表正确更新

6. **无障碍测试**
   - 展开/收起按钮有 `aria-expanded` 属性
   - 文章列表有正确的 `role="list"` 属性
   - 当前文章有 `aria-current="page"` 属性
   - 键盘可以 Tab 聚焦到所有可交互元素

## 注意事项

1. **系列名称一致性**：同一系列的所有文章必须使用完全相同的 `series.title` 值，包括大小写和标点符号。建议在文档中维护一个系列名称清单作为参考
2. **排序字段**：`series.order` 建议使用整数，从 1 开始递增。不要求连续，但必须唯一（同一系列内不能有两篇文章使用相同的 order 值）
3. **性能**：`getSeriesInfo` 在构建时执行（SSG），运行时不会有性能问题。如果文章数量极大（1000+ 篇），可以考虑在 Velite 构建阶段预计算系列索引
4. **向后兼容**：`series` 字段是可选的（`.optional()`），已有的不属于任何系列的文章无需修改 frontmatter
5. **展开默认状态**：默认展开文章列表，让读者一眼看到系列全貌。如果系列文章数量超过一定数量（如 8 篇），可以考虑默认收起以减少视觉占用
6. **SEO 增强**：可以考虑为系列添加 JSON-LD 结构化数据（`ItemList`），帮助搜索引擎理解文章之间的关联关系
