# 性能优化方案

> Finn Days 博客 - Phase 3: SEO 与基础设施
> 文档版本：v1.0
> 最后更新：2026-03-09

---

## 一、概述

性能是用户体验的基石，也是搜索引擎排名的重要因素。Google 已将 Core Web Vitals 纳入排名算法，页面加载速度直接影响 SEO 效果和用户留存率。

本文档详细规划 Finn Days 博客的全方位性能优化策略，涵盖图片优化、字体优化、静态生成、JavaScript 优化、CSS 优化、缓存策略、Bundle 分析以及 Core Web Vitals 优化。

### 性能目标

| Lighthouse 类别 | 目标分数 |
|-----------------|---------|
| Performance | 90+ |
| Accessibility | 90+ |
| Best Practices | 90+ |
| SEO | 100 |

### Core Web Vitals 目标

| 指标 | 全称 | 目标值 | 说明 |
|------|------|--------|------|
| **LCP** | Largest Contentful Paint | < 2.5s | 最大内容绘制时间 |
| **INP** | Interaction to Next Paint | < 200ms | 交互到下一帧绘制 |
| **CLS** | Cumulative Layout Shift | < 0.1 | 累计布局偏移 |

---

## 二、技术方案

### 2.1 图片优化

图片通常是页面中最大的资源，也是影响 LCP 的关键因素。

#### next/image 组件使用规范

Next.js 的 `<Image>` 组件提供了开箱即用的图片优化能力：

```typescript
import Image from "next/image";

// 基本用法：已知尺寸的图片
<Image
  src="/images/hero.jpg"
  alt="Hero Image"
  width={1200}
  height={630}
  priority  // 首屏关键图片，禁用懒加载
/>

// 填充模式：容器自适应
<div className="relative aspect-video">
  <Image
    src={post.cover}
    alt={post.title}
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  />
</div>

// 带模糊占位符
<Image
  src="/images/article-cover.jpg"
  alt="Article Cover"
  width={800}
  height={400}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQ..."  // 低分辨率占位图
  loading="lazy"
/>
```

#### WebP/AVIF 自动格式转换

Next.js 图片优化默认支持自动格式协商：

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    // 优先使用 AVIF，回退 WebP，最后 JPEG
    formats: ["image/avif", "image/webp"],

    // 响应式断点
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // 远程图片域名白名单
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.github.com",
      },
    ],
  },
};
```

#### 响应式 sizes 配置

`sizes` 属性告诉浏览器图片在不同视口宽度下的显示尺寸，浏览器据此选择最合适的图片源：

```typescript
// 文章列表页的卡片图片
// 移动端占满宽度，平板占一半，桌面占三分之一
<Image
  src={post.cover}
  alt={post.title}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>

// 文章详情页的内容图片
// 最大宽度为文章内容区域 768px
<Image
  src={imgSrc}
  alt={imgAlt}
  width={768}
  height={432}
  sizes="(max-width: 768px) 100vw, 768px"
/>
```

#### 懒加载策略

```typescript
// 首屏图片：使用 priority，禁用懒加载
<Image src={heroImage} alt="Hero" priority />

// 非首屏图片：默认懒加载
<Image src={articleImage} alt="Article" loading="lazy" />

// 注意：next/image 默认启用懒加载（loading="lazy"），
// 只需要对首屏关键图片设置 priority
```

#### 模糊占位符

为文章封面图生成模糊占位符，避免图片加载时的布局空白：

```typescript
// 方式一：静态导入（自动生成 blurDataURL）
import coverImage from "@/public/images/cover.jpg";

<Image
  src={coverImage}
  alt="Cover"
  placeholder="blur"  // 自动使用导入时生成的 blurDataURL
/>

// 方式二：动态图片，手动提供 blurDataURL
// 可以使用 plaiceholder 库在构建时生成
import { getPlaiceholder } from "plaiceholder";

const { base64 } = await getPlaiceholder(imageBuffer);

<Image
  src={remoteSrc}
  alt="Remote Image"
  placeholder="blur"
  blurDataURL={base64}
/>
```

### 2.2 字体优化

#### next/font 自托管（已配置）

项目已使用 `next/font` 自托管 Geist Sans 和 Geist Mono 字体：

```typescript
// src/app/layout.tsx（当前配置）
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

**next/font 自动完成的优化：**

| 优化项 | 说明 |
|--------|------|
| 自托管 | 字体文件从自己的域名加载，避免第三方请求 |
| 预加载 | 自动添加 `<link rel="preload">` |
| font-display: swap | 文字立即以系统字体显示，字体加载完成后替换 |
| 零布局偏移 | 使用 CSS 变量 + `size-adjust` 消除 CLS |
| 子集化 | 仅加载指定的 `subsets`，减小字体文件体积 |

#### 预加载策略

`next/font` 会自动预加载字体，但可以进一步优化：

```typescript
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",        // 确保使用 swap 策略
  preload: true,           // 默认开启
  adjustFontFallback: true, // 自动调整回退字体以匹配自定义字体度量
});
```

### 2.3 静态生成 (SSG)

#### 博客文章预渲染

博客文章在构建时不会变化，应使用静态生成获得最佳性能。

```typescript
// src/app/blog/[slug]/page.tsx

// 声明所有文章的静态参数，构建时预渲染
export async function generateStaticParams() {
  return posts
    .filter((post) => !post.draft)
    .map((post) => ({
      slug: post.slug,
    }));
}

// 页面组件不使用任何动态数据（如 cookies、headers）
// Next.js 会自动将其识别为静态页面
export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  // ...渲染静态内容
}
```

#### 其他页面的静态生成

```typescript
// 标签页
// src/app/tags/[tag]/page.tsx
export async function generateStaticParams() {
  const allTags = [...new Set(posts.flatMap((post) => post.tags))];
  return allTags.map((tag) => ({
    tag: encodeURIComponent(tag),
  }));
}

// 博客列表页（静态，无需 generateStaticParams）
// src/app/blog/page.tsx — 直接导出组件即可
```

#### ISR（增量静态再生，可选）

如果未来需要在不重新构建的情况下更新页面：

```typescript
// src/app/blog/[slug]/page.tsx

// 每 3600 秒（1 小时）重新验证一次
export const revalidate = 3600;

// 或在 layout 级别设置
// src/app/blog/layout.tsx
export const revalidate = 3600;
```

**注意：** 对于纯静态博客（内容通过 Velite 在构建时处理），ISR 通常不必要。新文章直接触发 CI/CD 重新构建部署即可。

### 2.4 JavaScript 优化

#### 代码分割（dynamic import）

```typescript
import dynamic from "next/dynamic";

// 评论组件：用户滚动到底部才加载
const Comments = dynamic(() => import("@/components/blog/comments"), {
  loading: () => <div className="h-32 animate-pulse bg-muted rounded" />,
  ssr: false,  // 评论组件不需要 SSR
});

// 搜索对话框：用户主动触发才加载
const SearchDialog = dynamic(
  () => import("@/components/search/search-dialog"),
  { ssr: false }
);

// 代码演练场：仅在 MDX 中使用时加载
const CodePlayground = dynamic(
  () => import("@/components/mdx/code-playground"),
  { ssr: false }
);
```

#### 第三方脚本延迟加载

```typescript
import Script from "next/script";

// Umami 分析：空闲时加载
<Script
  src="https://analytics.finndays.com/script.js"
  data-website-id="xxx"
  strategy="lazyOnload"
/>

// Giscus 评论：交互后加载
// 通过 dynamic import + Intersection Observer 实现
// 用户滚动到评论区域时才加载 Giscus
```

#### Tree Shaking

Next.js + webpack/Turbopack 默认支持 Tree Shaking，但需注意：

```typescript
// 推荐：具名导入，便于 Tree Shaking
import { Button } from "@/components/ui/button";
import { Github, Mail } from "lucide-react";

// 避免：默认导入整个模块
// import * as Icons from "lucide-react";  // 会导入所有图标
```

**lucide-react 的 Tree Shaking：** lucide-react 支持按需导入，仅打包使用到的图标。确保始终使用具名导入。

### 2.5 CSS 优化

#### Tailwind CSS Purge

Tailwind CSS 4.x 默认在生产构建时自动清除未使用的样式类。确保配置正确覆盖所有模板文件：

```css
/* src/app/globals.css */
@import "tailwindcss";

/* Tailwind 4.x 通过 @import 自动扫描源文件 */
/* 确保所有使用 Tailwind 类名的文件都在扫描范围内 */
```

**效果：** 生产构建的 CSS 文件通常只有 10-30KB（gzip 后），相比完整的 Tailwind CSS 数 MB 有巨大缩减。

#### 关键 CSS 内联

Next.js App Router 默认会将关键 CSS 内联到 HTML 中：

- 首次渲染需要的 CSS 直接嵌入 `<head>` 的 `<style>` 标签
- 非关键 CSS 异步加载
- 这一优化由 Next.js 自动完成，无需手动配置

### 2.6 缓存策略

#### Next.js 默认缓存行为

| 资源类型 | 缓存策略 | 说明 |
|---------|---------|------|
| 静态页面 | 构建时生成，永久缓存 | SSG 页面 |
| 静态资源 | `/_next/static/` 路径，强缓存 1 年 | JS/CSS/字体 |
| 图片 | 按需优化，缓存到 `.next/cache/images` | next/image |
| API Route | 根据配置 | revalidate 控制 |

#### CDN 缓存头配置

如果前面有 CDN（如 Cloudflare）或反向代理（Nginx），配置缓存头：

**Nginx 配置示例：**

```nginx
server {
    listen 443 ssl http2;
    server_name finndays.com;

    location / {
        proxy_pass http://127.0.0.1:8200;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态资源长期缓存（Next.js 静态文件包含哈希值）
    location /_next/static/ {
        proxy_pass http://127.0.0.1:8200;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # 图片缓存
    location /images/ {
        proxy_pass http://127.0.0.1:8200;
        expires 30d;
        add_header Cache-Control "public";
    }

    # 字体文件缓存
    location ~* \.(woff2?|ttf|otf|eot)$ {
        proxy_pass http://127.0.0.1:8200;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Next.js headers 配置

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // 静态资源强缓存
        source: "/:path*.(js|css|woff2|png|jpg|svg|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};
```

---

## 三、Bundle 分析

### 3.1 安装 @next/bundle-analyzer

```bash
npm install -D @next/bundle-analyzer
```

### 3.2 配置

**文件：`next.config.ts`**

```typescript
import type { NextConfig } from "next";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // ...其他配置
};

export default withBundleAnalyzer(nextConfig);
```

### 3.3 使用

```bash
# 运行 bundle 分析
ANALYZE=true npm run build

# 这会自动打开浏览器，显示：
# 1. client.html — 客户端 bundle 分析
# 2. server.html — 服务端 bundle 分析
```

### 3.4 分析要点

| 检查项 | 优化方向 |
|--------|---------|
| 大型第三方库 | 考虑替换为更轻量的替代品 |
| 重复依赖 | 检查多个版本的同一库 |
| 不必要的客户端 JS | 确认是否可以在服务端处理 |
| 懒加载候选 | 大型组件是否可以 dynamic import |

### 3.5 关注的 Bundle 体积基准

| 资源 | 建议上限 |
|------|---------|
| First Load JS | < 100KB (gzip) |
| 单个页面 JS | < 50KB (gzip) |
| 总 CSS | < 30KB (gzip) |
| Largest Bundle | < 200KB (gzip) |

---

## 四、Core Web Vitals 优化策略

### 4.1 LCP (Largest Contentful Paint) 优化

**目标：< 2.5s**

LCP 通常是首屏的最大图片或文字块。对于博客来说：

| 页面 | 预期 LCP 元素 | 优化策略 |
|------|--------------|---------|
| 首页 | Hero 区域标题文字 | 服务端渲染，无需等待 JS |
| 文章列表 | 第一张文章卡片图片 | `priority` 属性预加载 |
| 文章详情 | 文章标题或封面图 | `priority` + 预加载 |

```typescript
// 文章详情页 — 封面图设为 priority
<Image
  src={post.cover}
  alt={post.title}
  width={1200}
  height={630}
  priority  // 告诉浏览器预加载这张图片
  sizes="(max-width: 768px) 100vw, 768px"
/>
```

### 4.2 INP (Interaction to Next Paint) 优化

**目标：< 200ms**

INP 衡量页面响应用户交互的速度。

| 优化策略 | 说明 |
|---------|------|
| 减少主线程阻塞 | 避免长任务（> 50ms）占用主线程 |
| 服务端组件 | 尽量使用 React Server Components，减少客户端 JS |
| 延迟非关键 JS | 评论、分析等脚本延迟加载 |
| 优化事件处理 | 使用 `useTransition` 或 `useDeferredValue` 处理低优先级更新 |

```typescript
// 搜索功能使用 useTransition 避免阻塞输入
"use client";
import { useTransition, useState } from "react";

function SearchInput() {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState([]);

  const handleSearch = (value: string) => {
    setQuery(value);
    startTransition(() => {
      // 搜索是低优先级的，不会阻塞输入
      setResults(filterPosts(value));
    });
  };

  return (
    <input
      value={query}
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="搜索文章..."
    />
  );
}
```

### 4.3 CLS (Cumulative Layout Shift) 优化

**目标：< 0.1**

CLS 衡量页面可见内容的意外移动。

| 常见原因 | 解决方案 |
|---------|---------|
| 图片无尺寸 | 始终为 `<Image>` 指定 `width` 和 `height` |
| 字体加载闪烁 | `next/font` 的 `size-adjust` 自动处理 |
| 动态内容插入 | 为动态加载的内容预留空间 |
| 广告/嵌入 | 为嵌入内容设置固定尺寸容器 |

```typescript
// 为评论区预留空间，避免加载后布局偏移
<div className="min-h-[400px]">
  <Suspense fallback={<CommentsSkeleton />}>
    <Comments />
  </Suspense>
</div>

// 为图片设置宽高比容器
<div className="relative aspect-video">
  <Image src={src} alt={alt} fill className="object-cover" />
</div>
```

---

## 五、Lighthouse CI 自动化测试

### 5.1 GitHub Actions 集成

在 CI/CD 流水线中添加 Lighthouse CI 步骤，自动检测性能回归。

**文件：`.github/workflows/lighthouse.yml`（可选，独立工作流）**

```yaml
name: Lighthouse CI

on:
  pull_request:
    branches:
      - main

jobs:
  lighthouse:
    name: Lighthouse Audit
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v12
        with:
          configPath: "./lighthouserc.json"
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### 5.2 Lighthouse CI 配置

**文件：`lighthouserc.json`**

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm start",
      "startServerReadyPattern": "started server",
      "url": [
        "http://localhost:8200/",
        "http://localhost:8200/blog"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 1.0 }]
      }
    }
  }
}
```

### 5.3 本地 Lighthouse 测试

```bash
# 安装 Lighthouse CLI
npm install -g lighthouse

# 构建并启动
npm run build && npm start &

# 运行 Lighthouse（输出 HTML 报告）
lighthouse http://localhost:8200 \
  --output html \
  --output-path ./lighthouse-report.html \
  --chrome-flags="--headless --no-sandbox"

# 打开报告
open lighthouse-report.html
```

---

## 六、文件清单

| 文件路径 | 说明 |
|---------|------|
| `next.config.ts` | 图片优化配置、缓存头、Bundle Analyzer |
| `src/app/layout.tsx` | 字体优化配置 |
| `src/app/blog/[slug]/page.tsx` | SSG + 图片优化 |
| `lighthouserc.json` | Lighthouse CI 配置 |
| `.github/workflows/lighthouse.yml` | Lighthouse CI 工作流（可选） |

---

## 七、依赖说明

| 依赖 | 类型 | 说明 |
|------|------|------|
| `next/image` | 内置 | 图片优化组件 |
| `next/font` | 内置 | 字体优化 |
| `next/dynamic` | 内置 | 动态导入 / 代码分割 |
| `next/script` | 内置 | 脚本加载策略 |
| `@next/bundle-analyzer` | devDependency | Bundle 体积分析 |
| `plaiceholder` | devDependency（可选） | 图片模糊占位符生成 |
| `lighthouse` | 全局 CLI（可选） | 本地 Lighthouse 测试 |

**安装命令：**

```bash
# Bundle 分析器
npm install -D @next/bundle-analyzer

# 模糊占位符（可选）
npm install plaiceholder sharp
```

---

## 八、测试要点

### 8.1 性能基准测试

```bash
# 构建项目
npm run build

# 查看构建输出的页面大小
# Next.js 会在构建日志中显示每个页面的 First Load JS 大小
# 关注是否有超过 100KB 的页面

# 启动生产服务器
npm start
```

### 8.2 Lighthouse 审计

1. 打开 Chrome DevTools → Lighthouse 面板
2. 选择 "Navigation" 模式
3. 勾选所有类别（Performance, Accessibility, Best Practices, SEO）
4. 选择 "Mobile" 设备模拟
5. 点击 "Analyze page load"
6. 检查各项分数是否达标

### 8.3 Core Web Vitals 检测

```bash
# 使用 web-vitals 库在客户端监控
npm install web-vitals
```

```typescript
// src/components/common/web-vitals.tsx
"use client";

import { useEffect } from "react";
import { onCLS, onINP, onLCP } from "web-vitals";

export function WebVitals() {
  useEffect(() => {
    onCLS(console.log);
    onINP(console.log);
    onLCP(console.log);
  }, []);

  return null;
}
```

### 8.4 Bundle 分析

```bash
# 运行 Bundle Analyzer
ANALYZE=true npm run build

# 检查清单：
# - First Load JS 总量 < 100KB
# - 没有不必要的大型库
# - 没有重复的依赖
# - 客户端 bundle 中没有服务端代码
```

### 8.5 图片优化验证

```bash
# 在浏览器 Network 面板中检查：
# 1. 图片格式是否为 WebP 或 AVIF
# 2. 图片尺寸是否与显示尺寸匹配
# 3. 非首屏图片是否懒加载
# 4. 首屏图片是否使用 priority
```

---

## 九、注意事项

1. **不要过度优化**：性能优化应该是渐进式的。先确保功能正确，再根据 Lighthouse 报告有针对性地优化瓶颈。过早的优化可能引入不必要的复杂性。

2. **Server Components 优先**：Next.js App Router 默认使用 React Server Components。尽量保持组件在服务端渲染，只有需要客户端交互的组件才添加 `"use client"` 指令。这能显著减少客户端 JS 体积。

3. **图片 priority 不要滥用**：只对首屏的 LCP 关键图片使用 `priority`。过多的 priority 图片会增加初始加载时间。

4. **字体子集化**：如果未来需要支持中文字体，注意中文字体文件通常很大（> 5MB）。应使用字体子集化工具（如 `fonttools`）或动态字体加载方案。当前仅使用 Latin 子集的 Geist 字体体积很小，无需特别处理。

5. **第三方脚本影响**：Giscus（评论）、Umami（分析）等第三方脚本会影响性能分数。确保它们使用 `lazyOnload` 或 `afterInteractive` 策略加载，不阻塞首次渲染。

6. **开发模式 vs 生产模式**：开发模式下性能远差于生产模式（无优化、无压缩、有 HMR 开销）。性能测试必须在 `npm run build && npm start` 后的生产模式下进行。

7. **移动端优先**：Lighthouse 的 Performance 分数基于模拟的移动设备。移动端网络更慢、CPU 更弱，优化时应以移动端为基准。

8. **持续监控**：性能是一个持续的过程。建议在 CI/CD 中集成 Lighthouse CI（参见第五节），在每次 Pull Request 时自动检测性能回归。

9. **standalone 输出**：启用 `output: "standalone"` 可以显著减小 Docker 镜像体积（从 ~500MB 减到 ~100MB），同时也减少了服务端启动时间。

10. **HTTP/2 和压缩**：确保生产环境的反向代理启用了 HTTP/2 和 gzip/brotli 压缩。这对静态资源的传输速度有显著影响。

---

*本文档为 Finn Days 博客性能优化方案的完整参考。*
