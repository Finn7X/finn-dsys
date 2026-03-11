# Giscus 评论系统

## 概述

为 Finn Days 博客的文章详情页（`/blog/[slug]`）集成 Giscus 评论系统，让读者能够针对每篇文章进行评论与讨论。Giscus 是一个基于 GitHub Discussions 的开源评论系统，所有评论数据存储在 GitHub 仓库的 Discussions 中，无需额外数据库。

## 什么是 Giscus

Giscus 利用 GitHub Discussions API，将博客的评论与 GitHub 仓库的 Discussions 功能关联。当用户在博客中发表评论时，实际上是在对应的 GitHub Discussion 中创建了一条回复。

**工作原理：**

1. 用户访问文章页面，Giscus 通过 `<iframe>` 加载评论组件
2. Giscus 根据配置的 mapping 策略（如 pathname），在 GitHub Discussions 中查找或创建对应的 Discussion
3. 用户通过 GitHub OAuth 授权后即可发表评论
4. 评论内容实时同步到 GitHub Discussions

## 为什么选择 Giscus

| 特性 | Giscus | Disqus | Utterances | Cusdis |
|------|--------|--------|------------|--------|
| 数据归属 | GitHub 仓库 | Disqus 平台 | GitHub Issues | 自托管数据库 |
| 广告 | 无 | 免费版有广告 | 无 | 无 |
| 隐私 | 仅 GitHub OAuth | 追踪用户 | 仅 GitHub OAuth | 需自建后端 |
| 嵌套回复 | 支持 | 支持 | 不支持 | 不支持 |
| Reactions | 支持 | 支持 | 不支持 | 不支持 |
| 暗色模式 | 原生支持 | 需定制 | 支持 | 需定制 |
| 维护成本 | 零 | 零 | 零 | 高（自托管） |
| CJK 支持 | 良好 | 良好 | 良好 | 取决于实现 |

**选择 Giscus 的理由：**

- 数据完全归属于自己的 GitHub 仓库
- 无广告、无追踪，尊重读者隐私
- 支持嵌套回复和 Reactions，交互体验优于 Utterances
- 原生支持暗色/亮色主题切换
- 零维护成本，无需自建后端
- 技术博客读者群体大多有 GitHub 账号，登录门槛低

## 前提条件

### 1. GitHub 仓库配置

- 仓库必须是 **公开仓库**（Public）
- 在仓库 Settings -> Features 中启用 **Discussions** 功能
- 在 Discussions 中创建一个专用分类（Category），建议命名为 `Blog Comments`，类型选择 **Announcements**（仅维护者可创建新 Discussion，防止垃圾内容）

### 2. 安装 Giscus GitHub App

- 访问 [https://github.com/apps/giscus](https://github.com/apps/giscus)
- 点击 Install，选择博客对应的仓库
- 授予 Giscus 读写 Discussions 的权限

### 3. 获取配置参数

- 访问 [https://giscus.app/zh-CN](https://giscus.app/zh-CN)
- 输入仓库信息，系统会自动生成 `repoId` 和 `categoryId`
- 记录以下参数供后续配置使用

## 技术方案

### 依赖安装

```bash
npm install @giscus/react
```

### Giscus 配置参数详解

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| `repo` | GitHub 仓库全名 | `"your-username/finn-days"` |
| `repoId` | 仓库 ID（从 giscus.app 获取） | `"R_xxxxxxxx"` |
| `category` | Discussions 分类名称 | `"Blog Comments"` |
| `categoryId` | 分类 ID（从 giscus.app 获取） | `"DIC_xxxxxxxx"` |
| `mapping` | 页面与 Discussion 的映射策略 | `"pathname"` |
| `reactionsEnabled` | 是否启用文章 Reactions | `"1"` |
| `emitMetadata` | 是否发送元数据 | `"0"` |
| `inputPosition` | 评论输入框位置 | `"top"` |
| `theme` | 主题样式 | 动态跟随博客主题 |
| `lang` | 界面语言 | `"zh-CN"` |
| `loading` | 加载策略 | `"lazy"` |

**mapping 策略说明：**

- `pathname`（推荐）：使用页面路径作为 Discussion 标识，如 `/blog/my-first-post`
- `url`：使用完整 URL，域名变更会导致评论丢失
- `title`：使用页面标题，标题修改会导致评论丢失
- `og:title`：使用 Open Graph 标题
- `specific`：手动指定 Discussion 编号

选择 `pathname` 可以在域名变更时保留评论关联。

## 实现步骤

### 步骤 1：创建站点配置常量

在 `src/config/site.ts` 中添加 Giscus 配置：

```typescript
// src/config/site.ts

export const siteConfig = {
  title: "Finn Days",
  description: "Exploring technology, sharing knowledge, and documenting my journey in web development",
  url: "https://finn7x.com",
  author: {
    name: "Finn",
    github: "https://github.com/your-username",
    twitter: "https://twitter.com/your-handle",
    email: "your-email@example.com",
  },
};

export const giscusConfig = {
  repo: "your-username/finn-days" as `${string}/${string}`,
  repoId: "R_xxxxxxxx",
  category: "Blog Comments",
  categoryId: "DIC_xxxxxxxx",
  mapping: "pathname" as const,
  reactionsEnabled: "1" as const,
  emitMetadata: "0" as const,
  inputPosition: "top" as const,
  lang: "zh-CN",
  loading: "lazy" as const,
};
```

### 步骤 2：创建 Comments 组件

```typescript
// src/components/blog/comments.tsx
"use client";

import { useEffect, useState } from "react";
import Giscus from "@giscus/react";
import { useTheme } from "next-themes";
import { giscusConfig } from "@/config/site";

export function Comments() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 避免 SSR 水合不匹配
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mt-12 pt-8 border-t">
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  // 映射博客主题到 Giscus 主题
  const giscusTheme = resolvedTheme === "dark" ? "dark" : "light";

  return (
    <section className="mt-12 pt-8 border-t" id="comments">
      <h2 className="text-2xl font-bold mb-6">评论</h2>
      <Giscus
        repo={giscusConfig.repo}
        repoId={giscusConfig.repoId}
        category={giscusConfig.category}
        categoryId={giscusConfig.categoryId}
        mapping={giscusConfig.mapping}
        reactionsEnabled={giscusConfig.reactionsEnabled}
        emitMetadata={giscusConfig.emitMetadata}
        inputPosition={giscusConfig.inputPosition}
        theme={giscusTheme}
        lang={giscusConfig.lang}
        loading={giscusConfig.loading}
      />
    </section>
  );
}
```

### 步骤 3：暗色模式同步方案

当用户切换博客的暗色/亮色模式时，Giscus 的主题也需要同步更新。上述组件通过 `useTheme()` 的 `resolvedTheme` 来获取当前实际主题值，并将其映射为 Giscus 的主题参数。

当 `resolvedTheme` 变化时，React 会重新渲染 `<Giscus>` 组件，内部会通过 `postMessage` 通知 iframe 更新主题，无需手动操作 iframe。

如果需要更精细的控制（例如使用自定义 Giscus 主题 CSS），可以通过 `postMessage` 手动通知：

```typescript
// 高级方案：手动发送主题切换消息
useEffect(() => {
  const iframe = document.querySelector<HTMLIFrameElement>(
    "iframe.giscus-frame"
  );
  if (iframe) {
    iframe.contentWindow?.postMessage(
      {
        giscus: {
          setConfig: {
            theme: resolvedTheme === "dark" ? "dark" : "light",
          },
        },
      },
      "https://giscus.app"
    );
  }
}, [resolvedTheme]);
```

### 步骤 4：在文章详情页中集成

在文章详情页（`/blog/[slug]`）的布局中，将 Comments 组件放置在文章内容底部：

```typescript
// src/app/blog/[slug]/page.tsx（相关部分）
import { Comments } from "@/components/blog/comments";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // ... 获取文章数据

  return (
    <article className="container mx-auto max-w-3xl py-16 px-4">
      {/* 文章头部：标题、日期、标签等 */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        {/* ... 其他元信息 */}
      </header>

      {/* 文章正文（MDX 渲染） */}
      <div className="prose dark:prose-invert max-w-none">
        {/* MDX Content */}
      </div>

      {/* 作者卡片（见 05-author-card.md） */}

      {/* 评论区 */}
      <Comments />
    </article>
  );
}
```

### 步骤 5：懒加载实现

Giscus 的 `loading: "lazy"` 配置会使 iframe 使用浏览器原生的懒加载机制（`loading="lazy"` 属性），仅当评论区域进入视口附近时才开始加载。

如果需要更精细的懒加载控制（例如完全不渲染组件直到用户滚动到位），可以使用 Intersection Observer：

```typescript
// src/components/blog/comments.tsx（增强懒加载版本）
"use client";

import { useEffect, useRef, useState } from "react";
import Giscus from "@giscus/react";
import { useTheme } from "next-themes";
import { giscusConfig } from "@/config/site";

export function Comments() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // 提前 200px 开始加载
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const giscusTheme = resolvedTheme === "dark" ? "dark" : "light";

  return (
    <section className="mt-12 pt-8 border-t" id="comments" ref={containerRef}>
      <h2 className="text-2xl font-bold mb-6">评论</h2>
      {mounted && isVisible ? (
        <Giscus
          repo={giscusConfig.repo}
          repoId={giscusConfig.repoId}
          category={giscusConfig.category}
          categoryId={giscusConfig.categoryId}
          mapping={giscusConfig.mapping}
          reactionsEnabled={giscusConfig.reactionsEnabled}
          emitMetadata={giscusConfig.emitMetadata}
          inputPosition={giscusConfig.inputPosition}
          theme={giscusTheme}
          lang={giscusConfig.lang}
          loading={giscusConfig.loading}
        />
      ) : (
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
      )}
    </section>
  );
}
```

## 文件清单

| 文件路径 | 说明 | 操作 |
|---------|------|------|
| `src/config/site.ts` | 站点配置与 Giscus 配置常量 | 新建/修改 |
| `src/components/blog/comments.tsx` | Comments 评论组件 | 新建 |
| `src/app/blog/[slug]/page.tsx` | 文章详情页 | 修改（集成 Comments） |

## 依赖说明

| 依赖包 | 版本 | 说明 |
|--------|------|------|
| `@giscus/react` | `^3.1.0` | Giscus React 组件 |
| `next-themes` | Phase 1 已安装 | 主题管理（用于暗色模式同步） |

## 隐私与合规性说明

- Giscus 不追踪用户行为，不植入广告
- 评论需要 GitHub 账号登录，通过 GitHub OAuth 授权
- 所有评论数据存储在你自己的 GitHub 仓库 Discussions 中
- Giscus 源码完全开源：[https://github.com/giscus/giscus](https://github.com/giscus/giscus)
- 可在隐私政策页面中注明评论系统使用 GitHub 作为身份验证和数据存储

## 测试要点

1. **基础功能测试**
   - 访问文章详情页，确认评论区正常加载
   - 使用 GitHub 账号登录后能够发表评论
   - 评论发表后可在 GitHub Discussions 中看到对应内容
   - 回复评论功能正常

2. **主题同步测试**
   - 亮色模式下评论区显示亮色主题
   - 暗色模式下评论区显示暗色主题
   - 切换主题时评论区主题实时同步，无需刷新页面

3. **懒加载测试**
   - 页面加载时评论区 iframe 不应立即加载
   - 滚动到评论区域附近时 iframe 开始加载
   - 使用 Network 面板确认 Giscus 资源延迟加载

4. **映射测试**
   - 不同文章页面对应不同的 Discussion
   - 同一文章多次访问加载相同的评论
   - 文章 URL 中的 slug 变化不影响评论对应关系

5. **响应式测试**
   - 移动端评论区布局正常
   - 评论输入框在小屏幕上可用

6. **SSR 兼容性测试**
   - 确认组件使用 `"use client"` 指令
   - 服务端渲染不出现水合错误
   - 加载骨架屏在组件挂载前正确显示

## 注意事项

1. **仓库可见性**：Giscus 仅支持公开仓库，如果博客源码在私有仓库中，需要创建一个单独的公开仓库专门用于存放评论
2. **配置参数安全**：`repoId` 和 `categoryId` 是公开信息，不属于敏感数据，可以直接写在前端代码中，无需使用环境变量
3. **评论迁移**：如果未来需要更换评论系统，可以导出 GitHub Discussions 数据进行迁移
4. **rate limiting**：GitHub API 有请求频率限制，高流量时可能影响评论加载，但对于个人博客场景通常不会触达限制
5. **自定义主题**：如需深度自定义评论区样式，可以创建自定义 CSS 文件并托管在博客域名下，通过 `theme` 参数传入 CSS URL

---

## 实现状态

> 本节记录实际实现与上述设计的差异，于 Phase 2 验收通过 (2026-03-12) 后补充。

### 已完成

- Giscus 已接入并上线，评论组件渲染真实 `giscus-widget`
- 暗色模式同步、IntersectionObserver 懒加载均按设计实现
- GitHub App 已安装到仓库 `Finn7X/finn-dsys`，Discussions 已启用

### 与设计的差异

| 项目 | 设计文档 | 实际实现 |
|------|---------|---------|
| 仓库 | `your-username/finn-days` (占位) | `Finn7X/finn-dsys` |
| Discussion 分类 | `Blog Comments` (Announcements) | `General` (使用仓库默认分类) |
| `lang` 字段 | 写死 `"zh-CN"` | 移除硬编码，改为根据 `useLocale()` 动态设置 (`zh-CN` / `en`) |
| 挂载检测 | `useState` + `useEffect` | `useSyncExternalStore` (更符合 React 18+ 并发模式) |
| i18n | 无（硬编码中文） | 使用 `useTranslations("comments")` 本地化标题和降级文案 |
| 配置降级 | 无 | 新增 `isGiscusConfigured` 检查，配置为占位值时显示友好提示 |
| 页面路径 | `src/app/blog/[slug]/page.tsx` | `src/app/[locale]/blog/[slug]/page.tsx` (locale 路由) |
