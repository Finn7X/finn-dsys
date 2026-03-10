# 阅读进度条

## 概述

在文章详情页（`/blog/[slug]`）顶部添加一个水平进度条，实时显示用户的阅读进度百分比。当用户向下滚动页面时，进度条从左到右逐渐填充，使用品牌渐变色（purple-600 → blue-600）。该功能仅在文章详情页显示，不影响其他页面。

## 功能说明

- **位置**：页面最顶部，固定定位（fixed），位于 Navbar 上方
- **样式**：高度 2-3px 的水平条，使用品牌渐变色 `from-purple-600 to-blue-600`
- **行为**：随页面滚动实时更新宽度，从 0% 到 100%
- **范围**：仅在 `/blog/[slug]` 文章详情页显示
- **性能**：使用 `requestAnimationFrame` 节流滚动事件处理

## 技术方案

### 核心原理

通过监听 `scroll` 事件，计算当前滚动位置占文档可滚动总高度的百分比：

```
进度 = scrollTop / (documentHeight - viewportHeight) * 100
```

其中：
- `scrollTop`：当前滚动距离（`window.scrollY` 或 `document.documentElement.scrollTop`）
- `documentHeight`：文档总高度（`document.documentElement.scrollHeight`）
- `viewportHeight`：视口高度（`window.innerHeight`）

### 与 Navbar 的层级关系

```
z-60  ReadingProgress  (最顶层，位于 Navbar 上方)
z-50  Navbar           (导航栏)
z-40  其他浮动元素
```

进度条使用 `z-60`（或自定义更高的 z-index），确保始终显示在 Navbar 之上。进度条固定在页面最顶部（`top: 0`），高度仅 2-3px，不会遮挡 Navbar 内容。

## 实现步骤

### 步骤 1：创建 ReadingProgress 组件

```typescript
// src/components/blog/reading-progress.tsx
"use client";

import { useEffect, useState, useCallback } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  const updateProgress = useCallback(() => {
    const scrollTop = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const scrollableHeight = documentHeight - viewportHeight;

    if (scrollableHeight <= 0) {
      setProgress(0);
      return;
    }

    const currentProgress = Math.min(
      Math.max((scrollTop / scrollableHeight) * 100, 0),
      100
    );

    setProgress(currentProgress);
  }, []);

  useEffect(() => {
    let rafId: number;

    const handleScroll = () => {
      // 使用 requestAnimationFrame 节流
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(updateProgress);
    };

    // 初始计算
    updateProgress();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [updateProgress]);

  return (
    <div
      className="fixed top-0 left-0 w-full h-[3px] z-[60] bg-transparent"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="阅读进度"
    >
      <div
        className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
```

### 步骤 2：替代方案——使用 Throttle

如果不使用 `requestAnimationFrame`，也可以使用手动 throttle 实现：

```typescript
// src/components/blog/reading-progress.tsx（throttle 版本）
"use client";

import { useEffect, useState, useRef } from "react";

function useThrottle<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): T {
  const lastCall = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  return ((...args: unknown[]) => {
    const now = Date.now();
    const remaining = delay - (now - lastCall.current);

    if (remaining <= 0) {
      lastCall.current = now;
      fn(...args);
    } else {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        lastCall.current = Date.now();
        fn(...args);
      }, remaining);
    }
  }) as T;
}

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  const calculateProgress = () => {
    const scrollTop = window.scrollY;
    const scrollableHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    if (scrollableHeight <= 0) {
      setProgress(0);
      return;
    }

    setProgress(
      Math.min(Math.max((scrollTop / scrollableHeight) * 100, 0), 100)
    );
  };

  const throttledCalculate = useThrottle(calculateProgress, 16); // ~60fps

  useEffect(() => {
    calculateProgress();
    window.addEventListener("scroll", throttledCalculate, { passive: true });
    window.addEventListener("resize", throttledCalculate, { passive: true });

    return () => {
      window.removeEventListener("scroll", throttledCalculate);
      window.removeEventListener("resize", throttledCalculate);
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 w-full h-[3px] z-[60] bg-transparent"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="阅读进度"
    >
      <div
        className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
```

> **推荐使用 `requestAnimationFrame` 方案**，原因是它由浏览器自动调度，天然与屏幕刷新率同步，不会出现过度渲染或丢帧问题。

### 步骤 3：在文章详情页中集成

在文章详情页的布局中引入 ReadingProgress 组件：

```typescript
// src/app/blog/[slug]/page.tsx（相关部分）
import { ReadingProgress } from "@/components/blog/reading-progress";

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return (
    <>
      {/* 阅读进度条 - 仅在文章详情页显示 */}
      <ReadingProgress />

      <article className="container mx-auto max-w-3xl py-16 px-4">
        {/* 文章内容 */}
      </article>
    </>
  );
}
```

如果使用文章详情页的专属布局文件，也可以在 layout 中集成：

```typescript
// src/app/blog/[slug]/layout.tsx
import { ReadingProgress } from "@/components/blog/reading-progress";

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ReadingProgress />
      {children}
    </>
  );
}
```

### 步骤 4：响应式处理

进度条在所有屏幕尺寸上的表现一致，因为它是一个宽度为 100% 的固定定位元素。无需特殊的响应式处理，但以下几点需要注意：

```css
/* 如果需要在移动端隐藏进度条（不推荐，保持一致性更好） */
@media (max-width: 640px) {
  /* .reading-progress { display: none; } */
}
```

在移动端，由于地址栏的自动隐藏/显示会导致视口高度变化，可能影响进度计算。可以通过在 `resize` 事件中重新计算来解决（上述代码已包含 resize 监听）。

### 步骤 5：动画过渡效果

进度条使用 CSS `transition` 实现平滑过渡：

```css
/* 已在组件 className 中包含 */
transition-[width] duration-150 ease-out
```

- `transition-[width]`：仅对宽度属性添加过渡，避免影响其他属性
- `duration-150`：150ms 过渡时长，在流畅感和实时性之间取平衡
- `ease-out`：缓出缓动函数，让进度条变化看起来更自然

如果需要更精致的效果，可以在进度条末端添加一个发光效果：

```typescript
<div
  className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-[width] duration-150 ease-out relative"
  style={{ width: `${progress}%` }}
>
  {/* 末端发光效果 */}
  <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-r from-transparent to-blue-400/50 blur-sm" />
</div>
```

## 文件清单

| 文件路径 | 说明 | 操作 |
|---------|------|------|
| `src/components/blog/reading-progress.tsx` | 阅读进度条组件 | 新建 |
| `src/app/blog/[slug]/page.tsx` 或 `layout.tsx` | 文章详情页 | 修改（引入组件） |

## 依赖说明

本功能不需要额外安装任何依赖包，完全基于：

- React hooks（`useState`, `useEffect`, `useCallback`）
- 浏览器原生 API（`window.scrollY`, `requestAnimationFrame`）
- Tailwind CSS 样式类

## 测试要点

1. **进度计算测试**
   - 页面顶部时进度为 0%
   - 页面底部时进度为 100%
   - 中间位置进度准确反映滚动比例
   - 短文章（不足一屏）不显示进度或显示 0%

2. **视觉效果测试**
   - 渐变色（purple-600 → blue-600）正确渲染
   - 进度条高度为 3px，视觉清晰但不突兀
   - 过渡动画平滑，无跳跃感
   - 进度条始终位于 Navbar 上方，不被遮挡

3. **性能测试**
   - 快速滚动时无明显卡顿
   - 使用 Chrome DevTools Performance 面板检查无过度重绘
   - `requestAnimationFrame` 节流正常工作
   - `passive: true` 事件监听器不阻塞滚动

4. **响应式测试**
   - 桌面端、平板端、移动端均正常显示
   - 移动端地址栏隐藏/显示时进度仍准确
   - 横屏切换时进度重新计算

5. **页面范围测试**
   - 仅在 `/blog/[slug]` 文章详情页显示
   - 首页、博客列表页、标签页等不显示进度条
   - 从文章页导航到其他页面时进度条正确消失

6. **无障碍测试**
   - `role="progressbar"` 属性正确设置
   - `aria-valuenow`、`aria-valuemin`、`aria-valuemax` 正确更新
   - 屏幕阅读器能够识别进度条

7. **暗色模式测试**
   - 渐变色在亮色和暗色模式下均清晰可见
   - 背景色不影响进度条的可视性

## 注意事项

1. **仅文章页显示**：进度条组件只在 `/blog/[slug]` 页面引入，不要放在全局布局中。如果放在全局布局，需要通过路径判断条件渲染
2. **z-index 管理**：进度条的 `z-[60]` 需要高于 Navbar 的 `z-50`，确保在整个项目中统一管理 z-index 层级
3. **内存泄漏**：组件卸载时必须清除 scroll 和 resize 事件监听器以及 `requestAnimationFrame` 回调
4. **SSR 兼容**：组件使用 `"use client"` 指令，所有 `window` 和 `document` 访问都在 `useEffect` 中，不会导致服务端渲染错误
5. **打印优化**：可以在打印样式中隐藏进度条 `@media print { .reading-progress { display: none; } }`
