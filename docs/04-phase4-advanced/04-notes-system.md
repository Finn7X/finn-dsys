# 短笔记系统

## 概述

短笔记系统是 Finn Days 博客中独立于长篇博客文章的轻量内容板块。它的定位类似于 "Today I Learned (TIL)"、技术备忘录或灵感速记——快速记录零碎的技术知识、想法和发现，不需要长篇博文的正式结构。

---

## 功能定位

### 内容类型

| 类型 | 说明 | 示例 |
| --- | --- | --- |
| Today I Learned (TIL) | 当天学到的技术知识点 | "TIL: CSS `:has()` 选择器可以实现父选择器功能" |
| 技术备忘 | 常用但容易忘记的命令/技巧 | "Git 撤销最近一次提交但保留更改：`git reset --soft HEAD~1`" |
| 灵感记录 | 项目想法、设计灵感 | "想法：用 View Transitions API 实现博客文章列表的共享元素动画" |
| 踩坑记录 | 遇到的 bug 和解决方案 | "Next.js 15 中 `useSearchParams` 需要在 Suspense 边界内使用" |
| 工具推荐 | 发现的好工具/库 | "推荐：Bruno - 开源的 API 客户端，可替代 Postman" |

### 与博客文章的区别

| 维度 | 博客文章 (Post) | 短笔记 (Note) |
| --- | --- | --- |
| 长度 | 通常 1000+ 字 | 通常 < 500 字 |
| 格式 | 正式、结构化 | 随意、碎片化 |
| 封面图 | 需要 | 不需要 |
| 标签/分类 | 必填 | 可选 |
| 目录 (TOC) | 有 | 无 |
| SEO 优化 | 完整 meta | 简化 |
| 发布频率 | 低（每周/双周） | 高（每天/每几天） |
| 写作门槛 | 高（需要构思结构） | 低（随手记录） |

---

## Velite Schema 设计

### Note Collection 定义

```ts
// velite.config.ts
import { defineConfig, defineCollection, s } from "velite";

const notes = defineCollection({
  name: "Note",
  pattern: "notes/**/*.mdx",
  schema: s.object({
    // 标题
    title: s.string().max(200),

    // 发布日期
    date: s.isodate(),

    // 标签（可选，与博客文章不同，不强制要求）
    tags: s.array(s.string()).optional().default([]),

    // MDX 正文
    content: s.mdx(),

    // Velite 自动生成的 slug
    slug: s.slug("notes"),

    // 元数据（自动生成）
    metadata: s.metadata(),
  }),
});

export default defineConfig({
  collections: {
    // ... 已有的 posts collection
    notes,
  },
});
```

### 内容目录结构

```
content/
├── blog/                     # 博客文章（已有）
│   ├── my-first-post.mdx
│   └── ...
└── notes/                    # 短笔记
    ├── 2026-03-01-css-has.mdx
    ├── 2026-03-05-git-reset.mdx
    ├── 2026-03-08-view-transitions.mdx
    └── ...
```

### 笔记文件示例

```mdx
---
title: "CSS :has() 选择器终于可以实现父选择器了"
date: 2026-03-01
tags:
  - css
---

今天发现 CSS `:has()` 选择器已经在所有主流浏览器中获得支持。这意味着我们终于可以根据子元素的状态来选择父元素了！

```css
/* 当 card 内部有图片时，给 card 添加特殊样式 */
.card:has(img) {
  grid-column: span 2;
}

/* 当表单中有无效输入时，禁用提交按钮 */
form:has(:invalid) button[type="submit"] {
  opacity: 0.5;
  pointer-events: none;
}
```

参考：[MDN - :has()](https://developer.mozilla.org/en-US/docs/Web/CSS/:has)
```

---

## /notes 页面设计

### 路由

```
/notes          → 笔记列表页
/notes/[slug]   → 笔记详情页（可选，见下方讨论）
```

### 列表页设计

页面采用类似 Twitter/微博的时间线布局，按日期分组，每条笔记以简洁的卡片形式呈现。

#### 页面组件

```tsx
// src/app/notes/page.tsx
import { allNotes } from "contentlayer/generated"; // 或 Velite 的导出方式
import { NoteCard } from "@/components/notes/note-card";
import { groupNotesByDate } from "@/lib/notes";

export const metadata = {
  title: "笔记 - Finn Days",
  description: "技术备忘、日常学习和灵感记录",
};

export default function NotesPage() {
  // 按日期倒序排列
  const sortedNotes = allNotes.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // 按日期分组
  const groupedNotes = groupNotesByDate(sortedNotes);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">笔记</h1>
        <p className="mt-2 text-muted-foreground">
          技术备忘、日常学习和灵感记录
        </p>
      </div>

      {/* 时间线 */}
      <div className="space-y-8">
        {Object.entries(groupedNotes).map(([dateLabel, notes]) => (
          <div key={dateLabel}>
            {/* 日期分隔 */}
            <div className="sticky top-16 z-10 mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-sm font-medium text-muted-foreground">
                {dateLabel}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* 当日笔记列表 */}
            <div className="space-y-4">
              {notes.map((note) => (
                <NoteCard key={note.slug} note={note} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 日期分组工具函数

```tsx
// src/lib/notes.ts
import type { Note } from "contentlayer/generated";

export function groupNotesByDate(
  notes: Note[]
): Record<string, Note[]> {
  const groups: Record<string, Note[]> = {};

  for (const note of notes) {
    const date = new Date(note.date);
    const label = formatDateLabel(date);

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(note);
  }

  return groups;
}

function formatDateLabel(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "今天";
  if (diffDays === 1) return "昨天";
  if (diffDays < 7) return `${diffDays} 天前`;

  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
```

#### NoteCard 组件

```tsx
// src/components/notes/note-card.tsx
import { cn } from "@/lib/utils";
import type { Note } from "contentlayer/generated";
import { MDXContent } from "@/components/mdx-content";

interface NoteCardProps {
  note: Note;
  className?: string;
}

export function NoteCard({ note, className }: NoteCardProps) {
  return (
    <article
      className={cn(
        "rounded-lg border bg-card p-5 transition-colors hover:bg-muted/30",
        className
      )}
    >
      {/* 标题 */}
      <h3 className="mb-2 font-semibold leading-tight">
        {note.title}
      </h3>

      {/* 内容 */}
      <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
        <MDXContent code={note.content} />
      </div>

      {/* 底部元信息 */}
      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <time dateTime={note.date}>
          {new Date(note.date).toLocaleDateString("zh-CN", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>

        {/* 标签 */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex gap-1.5">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
```

---

## 路由设计讨论

### 方案 A：无独立详情页（推荐）

笔记内容较短，直接在列表页展示全文，无需独立详情页。

- 优点：用户无需跳转，浏览体验流畅
- 优点：减少页面数量，降低维护成本
- 缺点：无法单独分享某条笔记的链接

### 方案 B：有独立详情页

每条笔记有独立的 `/notes/[slug]` 页面。

- 优点：每条笔记有独立 URL，便于分享
- 优点：SEO 更友好
- 缺点：对于短内容，独立页面显得空旷

### 方案 C：混合方案（推荐折中）

列表页展示全文，但每条笔记有锚点链接（`/notes#slug`），可以直接定位到某条笔记。

```tsx
// NoteCard 添加锚点
<article id={note.slug} className="scroll-mt-20 ...">
  {/* 内容 */}
  <a
    href={`/notes#${note.slug}`}
    className="text-xs text-muted-foreground hover:text-foreground"
    aria-label="笔记永久链接"
  >
    #
  </a>
</article>
```

---

## 首页展示最新笔记

可在博客首页添加"最新笔记"板块，展示最近的 3-5 条笔记。

```tsx
// src/app/page.tsx 中的最新笔记板块
import { allNotes } from "contentlayer/generated";

function LatestNotes() {
  const latestNotes = allNotes
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">最新笔记</h2>
        <a
          href="/notes"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          查看全部 →
        </a>
      </div>

      <div className="mt-4 space-y-3">
        {latestNotes.map((note) => (
          <div
            key={note.slug}
            className="rounded-lg border p-4 text-sm"
          >
            <p className="font-medium">{note.title}</p>
            <time className="mt-1 text-xs text-muted-foreground">
              {new Date(note.date).toLocaleDateString("zh-CN")}
            </time>
          </div>
        ))}
      </div>
    </section>
  );
}
```

---

## RSS 整合

短笔记应纳入 RSS 订阅源，有两种策略：

### 方案 A：统一 RSS（推荐初期）

将笔记和博客文章合并到同一个 RSS feed 中，按时间排序。

```tsx
// src/app/feed.xml/route.ts
import { allPosts, allNotes } from "contentlayer/generated";

export async function GET() {
  const items = [
    ...allPosts.map((post) => ({
      title: post.title,
      link: `/blog/${post.slug}`,
      date: post.date,
      description: post.description,
      type: "post" as const,
    })),
    ...allNotes.map((note) => ({
      title: note.title,
      link: `/notes#${note.slug}`,
      date: note.date,
      description: note.title, // 笔记通常没有单独的 description
      type: "note" as const,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Finn Days</title>
    <link>https://finn-days.com</link>
    <description>博客与笔记</description>
    <atom:link href="https://finn-days.com/feed.xml" rel="self" type="application/rss+xml"/>
    ${items
      .map(
        (item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>https://finn-days.com${item.link}</link>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <category>${item.type === "post" ? "博客" : "笔记"}</category>
      <description>${escapeXml(item.description)}</description>
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: { "Content-Type": "application/xml" },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
```

### 方案 B：独立 RSS

为笔记创建独立的 RSS feed：`/notes/feed.xml`。

- 适用于订阅者希望分别订阅博客和笔记的场景
- 可以在后期根据用户需求添加

---

## 实现优先级

| 阶段 | 功能 | 复杂度 |
| --- | --- | --- |
| P0 | Velite schema 定义 + content/notes 目录 | 低 |
| P0 | /notes 列表页（时间线布局） | 中 |
| P1 | 日期分组 + 锚点链接 | 低 |
| P1 | 首页最新笔记板块 | 低 |
| P2 | RSS 整合 | 中 |
| P2 | 标签筛选 | 低 |
