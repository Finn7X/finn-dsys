# View Transitions

## 概述

View Transitions API 是一项浏览器原生功能，允许开发者在 DOM 状态更新（包括跨页面导航）时创建平滑的过渡动画。对于 Finn Days 博客来说，它可以为页面切换、列表到详情的跳转等场景提供优雅的视觉过渡效果，显著提升用户体验。

---

## View Transitions API 介绍

### 核心概念

View Transitions API 的工作原理：

1. **捕获旧状态**：浏览器对当前页面进行截图
2. **执行 DOM 更新**：应用新的 DOM 状态
3. **捕获新状态**：对新页面进行截图
4. **执行动画**：在旧截图和新截图之间播放过渡动画

### 两种类型

| 类型 | 适用场景 | API |
| --- | --- | --- |
| Same-document (SPA) | 单页应用内的状态变更 | `document.startViewTransition()` |
| Cross-document (MPA) | 跨页面导航（传统页面跳转） | `@view-transition` CSS at-rule |

在 Next.js App Router 中，客户端导航属于 SPA 模式（Same-document），使用 `document.startViewTransition()` API。

---

## 浏览器支持情况

| 浏览器 | Same-document | Cross-document | 版本 |
| --- | --- | --- | --- |
| Chrome / Edge | 支持 | 支持 | 111+ / 126+ (cross-doc) |
| Safari | 支持 | 支持 | 18+ |
| Firefox | 支持 | 支持中 | 125+ (behind flag) → 稳定版中 |

> 截至 2026 年初，主流浏览器已基本支持 Same-document View Transitions。Cross-document 支持也在快速推进。

### Can I Use 数据

Same-document View Transitions 全球覆盖率约 **85%+**，对于技术博客的读者群体（通常使用较新版本浏览器），实际覆盖率更高。

---

## 在 Next.js App Router 中的使用方式

### 基础原理

Next.js App Router 使用客户端导航（soft navigation），我们可以通过 `document.startViewTransition()` 在路由切换时触发过渡动画。

### 启用 View Transitions

Next.js 已内建对 View Transitions 的实验性支持，可以通过配置开启：

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
```

启用后，Next.js 会自动在路由导航时调用 `document.startViewTransition()`。

---

## 页面过渡动画效果

### 1. 页面间淡入淡出

最基础的过渡效果——旧页面淡出，新页面淡入。

#### CSS 实现

```css
/* src/app/globals.css */

/* 默认的 View Transition 动画 */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

::view-transition-old(root) {
  animation: fade-out 200ms ease-out;
}

::view-transition-new(root) {
  animation: fade-in 200ms ease-in;
}
```

#### 带滑动的页面过渡

```css
/* 旧页面向左滑出 + 淡出 */
::view-transition-old(root) {
  animation: 300ms ease-out both slide-out-left;
}

/* 新页面从右滑入 + 淡入 */
::view-transition-new(root) {
  animation: 300ms ease-out both slide-in-right;
}

@keyframes slide-out-left {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-30px);
  }
}

@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### 2. 列表项到详情页的元素过渡

当用户从博客文章列表点击进入文章详情页时，文章标题可以从列表位置平滑"飞入"详情页的标题位置。

#### 步骤一：标记共享元素

在列表页和详情页中，使用 `view-transition-name` 标记相同的元素：

```tsx
// 列表页中的文章卡片标题
// src/components/blog/post-card.tsx
export function PostCard({ post }: { post: Post }) {
  return (
    <article>
      <h2
        style={{ viewTransitionName: `post-title-${post.slug}` }}
        className="text-xl font-bold"
      >
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>
      {/* ... */}
    </article>
  );
}
```

```tsx
// 详情页中的文章标题
// src/app/blog/[slug]/page.tsx
export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  return (
    <article>
      <h1
        style={{ viewTransitionName: `post-title-${post.slug}` }}
        className="text-3xl font-bold"
      >
        {post.title}
      </h1>
      {/* ... */}
    </article>
  );
}
```

#### 步骤二：定义共享元素的过渡动画

```css
/* 共享元素过渡动画 */
::view-transition-old(post-title-*) {
  animation: none; /* 使用浏览器默认的位置/大小插值 */
}

::view-transition-new(post-title-*) {
  animation: none;
}

/* 也可以自定义共享元素的过渡效果 */
::view-transition-group(post-title-*) {
  animation-duration: 300ms;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 3. 共享元素动画进阶

#### 文章封面图过渡

```tsx
// 列表页
<img
  src={post.coverImage}
  alt={post.title}
  style={{ viewTransitionName: `post-cover-${post.slug}` }}
  className="rounded-lg"
/>

// 详情页
<img
  src={post.coverImage}
  alt={post.title}
  style={{ viewTransitionName: `post-cover-${post.slug}` }}
  className="rounded-xl w-full"
/>
```

#### 导航栏保持不动

在页面过渡时，导航栏不应该参与过渡动画：

```tsx
// src/components/layout/header.tsx
<header
  style={{ viewTransitionName: "header" }}
  className="sticky top-0 z-50 ..."
>
  {/* 导航内容 */}
</header>
```

```css
/* 导航栏不参与过渡动画 */
::view-transition-old(header),
::view-transition-new(header) {
  animation: none;
  /* 混合模式确保不会出现重影 */
  mix-blend-mode: normal;
}
```

---

## useViewTransition Hook

封装一个自定义 Hook，提供命令式的 View Transition 控制能力：

```tsx
// src/hooks/use-view-transition.ts
"use client";

import * as React from "react";

interface ViewTransitionOptions {
  /** 过渡完成后的回调 */
  onFinished?: () => void;
  /** 过渡开始前设置过渡类名（用于条件性动画） */
  types?: string[];
}

export function useViewTransition() {
  const startTransition = React.useCallback(
    async (
      updateCallback: () => void | Promise<void>,
      options?: ViewTransitionOptions
    ) => {
      // 检测浏览器是否支持
      if (!document.startViewTransition) {
        // 不支持时直接执行更新
        await updateCallback();
        options?.onFinished?.();
        return;
      }

      const transition = document.startViewTransition(async () => {
        await updateCallback();
      });

      // 设置过渡类型（Chrome 126+）
      if (options?.types && transition.types) {
        options.types.forEach((type) => transition.types.add(type));
      }

      // 等待过渡完成
      try {
        await transition.finished;
        options?.onFinished?.();
      } catch (error) {
        // 过渡被跳过或取消
        console.debug("View transition was skipped:", error);
      }
    },
    []
  );

  return { startTransition };
}
```

### 使用示例：主题切换动画

```tsx
"use client";

import { useTheme } from "next-themes";
import { useViewTransition } from "@/hooks/use-view-transition";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const { startTransition } = useViewTransition();

  const handleToggle = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";

    startTransition(
      () => setTheme(newTheme),
      { types: ["theme-change"] }
    );
  };

  return <button onClick={handleToggle}>切换主题</button>;
}
```

配合 CSS 实现圆形展开动画：

```css
/* 主题切换的圆形展开效果 */
::view-transition-new(root).theme-change {
  animation: circle-expand 500ms ease-in-out;
}

@keyframes circle-expand {
  from {
    clip-path: circle(0% at var(--click-x, 50%) var(--click-y, 50%));
  }
  to {
    clip-path: circle(150% at var(--click-x, 50%) var(--click-y, 50%));
  }
}
```

---

## CSS @view-transition 规则

### 跨文档过渡（MPA 模式）

如果未来考虑使用 MPA 模式或需要跨文档过渡，可以通过 CSS `@view-transition` 规则启用：

```css
@view-transition {
  navigation: auto;
}
```

此规则会让浏览器在所有同源导航中自动应用 View Transition。

### 条件性过渡

可以基于导航类型应用不同的过渡效果：

```css
/* 仅在前进导航时应用滑动效果 */
@view-transition {
  navigation: auto;
  types: slide, forwards;
}

/* 后退导航的反向滑动 */
::view-transition-old(root):active-view-transition-type(back) {
  animation: slide-in-right 300ms ease-out reverse;
}

::view-transition-new(root):active-view-transition-type(back) {
  animation: slide-out-left 300ms ease-out reverse;
}
```

---

## 性能影响评估

### 性能特征

| 维度 | 影响 | 说明 |
| --- | --- | --- |
| CPU | 低 | 浏览器原生实现，利用合成层加速 |
| 内存 | 中等 | 需要同时保留新旧两个快照的位图 |
| 帧率 | 高 | 通常保持 60fps（使用 GPU 合成） |
| JS 阻塞 | 无 | 动画在合成线程执行，不阻塞主线程 |
| LCP 影响 | 无 | 不影响 LCP 指标 |
| CLS 影响 | 无 | View Transition 不会产生布局偏移 |

### 性能建议

1. **限制过渡时长**：建议 200-400ms，过长会让用户感到延迟
2. **限制共享元素数量**：同时过渡的元素不宜过多（建议 < 5 个），每个元素都需要独立的位图
3. **避免大面积裁剪动画**：`clip-path` 动画在低端设备上可能卡顿
4. **考虑 `prefers-reduced-motion`**：尊重用户的减少动画偏好

```css
/* 尊重用户的减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 0s;
  }

  ::view-transition-group(*) {
    animation-duration: 0s;
  }
}
```

---

## 降级方案

对于不支持 View Transitions API 的浏览器，采用优雅降级——页面正常导航，不会出现任何错误。

### 自动降级

```tsx
// 检测支持情况
function supportsViewTransitions(): boolean {
  return typeof document !== "undefined" && "startViewTransition" in document;
}

// 条件性应用
if (supportsViewTransitions()) {
  document.startViewTransition(() => {
    // DOM 更新逻辑
  });
} else {
  // 直接执行 DOM 更新
}
```

### CSS 降级

`::view-transition-*` 伪元素在不支持的浏览器中会被忽略，不会产生任何副作用。`view-transition-name` CSS 属性同样如此。

### Next.js 内建降级

如果使用了 Next.js 的 `experimental.viewTransition` 配置，框架会自动处理不支持浏览器的降级逻辑，无需手动判断。

---

## 完整代码示例

### 示例一：博客文章列表 → 详情页过渡

```tsx
// src/components/blog/post-card.tsx
import Link from "next/link";
import type { Post } from "#site/content"; // Velite 生成的类型

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="group rounded-lg border p-6 transition-colors hover:bg-muted/30">
      {/* 封面图（共享元素） */}
      {post.coverImage && (
        <div
          className="mb-4 overflow-hidden rounded-lg"
          style={{ viewTransitionName: `post-cover-${post.slug}` }}
        >
          <img
            src={post.coverImage}
            alt={post.title}
            className="aspect-video w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}

      {/* 标题（共享元素） */}
      <h2
        className="text-xl font-bold"
        style={{ viewTransitionName: `post-title-${post.slug}` }}
      >
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>

      {/* 日期（共享元素） */}
      <time
        className="mt-2 text-sm text-muted-foreground"
        style={{ viewTransitionName: `post-date-${post.slug}` }}
      >
        {new Date(post.date).toLocaleDateString("zh-CN")}
      </time>
    </article>
  );
}
```

```tsx
// src/app/blog/[slug]/page.tsx
export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  return (
    <article className="mx-auto max-w-4xl px-4 py-8">
      {/* 封面图（匹配列表页的共享元素） */}
      {post.coverImage && (
        <div
          className="mb-8 overflow-hidden rounded-xl"
          style={{ viewTransitionName: `post-cover-${post.slug}` }}
        >
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full"
          />
        </div>
      )}

      {/* 标题（匹配列表页的共享元素） */}
      <h1
        className="text-3xl font-bold tracking-tight"
        style={{ viewTransitionName: `post-title-${post.slug}` }}
      >
        {post.title}
      </h1>

      {/* 日期（匹配列表页的共享元素） */}
      <time
        className="mt-4 block text-sm text-muted-foreground"
        style={{ viewTransitionName: `post-date-${post.slug}` }}
      >
        {new Date(post.date).toLocaleDateString("zh-CN")}
      </time>

      {/* 文章内容 */}
      <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none">
        <MDXContent code={post.content} />
      </div>
    </article>
  );
}
```

### 示例二：全局过渡 CSS

```css
/* src/app/globals.css 中添加 */

/* ===== View Transitions ===== */

/* 页面级淡入淡出 */
::view-transition-old(root) {
  animation: 200ms ease-out fade-out;
}

::view-transition-new(root) {
  animation: 200ms ease-in fade-out reverse;
}

/* 共享元素过渡 */
::view-transition-group(post-title-*),
::view-transition-group(post-cover-*),
::view-transition-group(post-date-*) {
  animation-duration: 300ms;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* 导航栏固定（不参与过渡） */
::view-transition-old(header),
::view-transition-new(header) {
  animation: none;
}

/* 尊重减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*),
  ::view-transition-new(*),
  ::view-transition-group(*) {
    animation: none !important;
  }
}
```

---

## 实现优先级

| 阶段 | 功能 | 复杂度 |
| --- | --- | --- |
| P0 | Next.js viewTransition 实验性配置 | 低 |
| P0 | 页面间淡入淡出基础过渡 | 低 |
| P1 | 文章标题/封面的共享元素过渡 | 中 |
| P1 | prefers-reduced-motion 适配 | 低 |
| P2 | 主题切换圆形展开动画 | 中 |
| P2 | useViewTransition Hook 封装 | 低 |
| P3 | 条件性过渡（前进/后退不同效果） | 中 |
