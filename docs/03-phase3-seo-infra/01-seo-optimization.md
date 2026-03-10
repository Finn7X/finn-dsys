# SEO 优化方案

> Finn Days 博客 - Phase 3: SEO 与基础设施
> 文档版本：v1.0
> 最后更新：2026-03-09

---

## 一、概述

搜索引擎优化 (SEO) 是博客获取自然流量的关键手段。本文档详细规划 Finn Days 博客在 Next.js App Router 架构下的 SEO 优化方案，涵盖静态与动态 Metadata、Open Graph、Twitter Cards、结构化数据 (JSON-LD)、Sitemap、Robots.txt 以及 Canonical URL 等核心要素。

### 目标

- 所有页面具备完整的 SEO 元数据
- 文章页面自动从 frontmatter 生成动态 Metadata
- 社交媒体分享时展示丰富的预览信息
- 搜索引擎能正确索引所有公开页面
- Lighthouse SEO 评分达到 100 分

---

## 二、技术方案

### 2.1 Next.js App Router 的 SEO 能力概览

Next.js App Router 提供了一套基于文件约定的 SEO 能力体系：

| 能力 | 实现方式 | 说明 |
|------|---------|------|
| 静态 Metadata | `export const metadata` | 在 `layout.tsx` 或 `page.tsx` 中导出静态元数据对象 |
| 动态 Metadata | `export async function generateMetadata()` | 根据路由参数动态生成元数据 |
| Open Graph 图片 | `opengraph-image.tsx` | 基于文件约定自动关联 OG 图片 |
| Sitemap | `sitemap.ts` | 在 `app` 目录下导出 sitemap 函数 |
| Robots | `robots.ts` | 在 `app` 目录下导出 robots 配置 |
| JSON-LD | 手动注入 `<script type="application/ld+json">` | 通过组件注入结构化数据 |

Next.js 会自动合并父级布局与子页面的 Metadata，子页面可覆盖父级定义。

### 2.2 Metadata 合并规则

```
Root Layout (metadata)
  └── Blog Layout (metadata)  → 合并/覆盖
      └── Blog Post Page (generateMetadata) → 最终合并/覆盖
```

- `title.template` 在父级定义后，子页面只需提供 `title` 字符串即可自动套用模板
- `metadataBase` 在根级别定义一次，所有相对 URL 会自动解析为绝对 URL
- 数组类型字段（如 `keywords`）会被替换而非合并

---

## 三、实现步骤

### 3.1 根布局静态 Metadata

在 `src/app/layout.tsx` 中定义全站通用的元数据基础配置。

**文件：`src/app/layout.tsx`**

```typescript
import type { Metadata } from "next";

// 站点常量（建议统一放在 src/lib/constants.ts）
const SITE_URL = "https://finn-days.com";
const SITE_NAME = "Finn Days";
const SITE_DESCRIPTION =
  "Exploring technology, sharing knowledge, and documenting my journey in web development";
const AUTHOR_NAME = "Finn7X";
const AUTHOR_EMAIL = "xujifennng@gmail.com";

export const metadata: Metadata = {
  // 标题模板：子页面提供的 title 会填入 %s 位置
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },

  // 站点描述
  description: SITE_DESCRIPTION,

  // 关键词
  keywords: [
    "技术博客",
    "前端开发",
    "Next.js",
    "React",
    "TypeScript",
    "Web Development",
  ],

  // 作者信息
  authors: [
    {
      name: AUTHOR_NAME,
      url: `https://github.com/${AUTHOR_NAME}`,
    },
  ],

  // 创建者
  creator: AUTHOR_NAME,

  // 发布者
  publisher: SITE_NAME,

  // 元数据基础 URL：所有相对 URL 会基于此解析
  metadataBase: new URL(SITE_URL),

  // 默认 Open Graph 配置
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },

  // 默认 Twitter Card 配置
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    creator: "@Finn7X",
    images: ["/og-default.png"],
  },

  // Robots 默认配置
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // 图标配置
  icons: {
    icon: "/favicon/favicon.svg",
    apple: "/favicon/apple-touch-icon.png",
  },

  // 替代链接
  alternates: {
    canonical: SITE_URL,
    types: {
      "application/rss+xml": `${SITE_URL}/feed.xml`,
      "application/atom+xml": `${SITE_URL}/atom.xml`,
    },
  },
};
```

### 3.2 站点常量文件

建议将站点常量统一管理，便于在 Metadata、SEO 组件、页脚等处复用。

**文件：`src/lib/constants.ts`**

```typescript
export const siteConfig = {
  name: "Finn Days",
  url: "https://finn-days.com",
  description:
    "Exploring technology, sharing knowledge, and documenting my journey in web development",
  author: {
    name: "Finn7X",
    email: "xujifennng@gmail.com",
    url: "https://github.com/Finn7X",
    twitter: "@Finn7X",
    github: "https://github.com/Finn7X",
  },
  links: {
    github: "https://github.com/Finn7X/finn-dsys",
  },
  locale: "zh_CN",
  language: "zh-CN",
} as const;
```

### 3.3 动态 Metadata — 博客列表页

**文件：`src/app/blog/page.tsx`**

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "博客",
  description: "Finn 的技术博客文章列表，涵盖前端开发、React、Next.js 等技术主题",
  openGraph: {
    title: "博客 | Finn Days",
    description: "Finn 的技术博客文章列表",
    url: "/blog",
  },
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPage() {
  // ...页面组件
}
```

### 3.4 动态 Metadata — 文章详情页

根据每篇文章的 frontmatter 动态生成 Metadata，这是 SEO 最核心的部分。

**文件：`src/app/blog/[slug]/page.tsx`**

```typescript
import type { Metadata } from "next";
import { posts } from "#site/content"; // Velite 生成的内容
import { siteConfig } from "@/lib/constants";
import { notFound } from "next/navigation";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

// 根据 slug 获取文章
function getPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug);
}

// 动态生成 Metadata
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "文章未找到",
    };
  }

  const ogUrl = `/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: siteConfig.author.name }],

    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: ogUrl,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
      authors: [siteConfig.author.name],
      tags: post.tags,
      images: [
        {
          url: `/blog/${post.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      creator: siteConfig.author.twitter,
      images: [`/blog/${post.slug}/opengraph-image`],
    },

    alternates: {
      canonical: ogUrl,
    },
  };
}

// 静态参数生成（SSG 预渲染）
export async function generateStaticParams() {
  return posts
    .filter((post) => !post.draft)
    .map((post) => ({
      slug: post.slug,
    }));
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // ...渲染文章
}
```

### 3.5 动态 Metadata — 标签页

**文件：`src/app/tags/[tag]/page.tsx`**

```typescript
import type { Metadata } from "next";
import { posts } from "#site/content";

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  return {
    title: `${decodedTag} 相关文章`,
    description: `查看所有标记为「${decodedTag}」的技术文章`,
    openGraph: {
      title: `${decodedTag} 相关文章 | Finn Days`,
      description: `查看所有标记为「${decodedTag}」的技术文章`,
      url: `/tags/${tag}`,
    },
    alternates: {
      canonical: `/tags/${tag}`,
    },
  };
}
```

### 3.6 Open Graph 标签完整配置

Open Graph 协议定义了在社交平台分享链接时展示的预览信息。Next.js 的 `Metadata` API 原生支持 Open Graph 配置。

**完整的 OG 字段映射：**

| OG 标签 | Next.js Metadata 字段 | 说明 |
|---------|----------------------|------|
| `og:title` | `openGraph.title` | 分享标题 |
| `og:description` | `openGraph.description` | 分享描述 |
| `og:image` | `openGraph.images` | 预览图片 URL |
| `og:url` | `openGraph.url` | 页面规范 URL |
| `og:type` | `openGraph.type` | 内容类型（website / article） |
| `og:site_name` | `openGraph.siteName` | 站点名称 |
| `og:locale` | `openGraph.locale` | 语言区域（zh_CN） |
| `article:published_time` | `openGraph.publishedTime` | 文章发布时间 |
| `article:modified_time` | `openGraph.modifiedTime` | 文章修改时间 |
| `article:author` | `openGraph.authors` | 文章作者 |
| `article:tag` | `openGraph.tags` | 文章标签 |

**注意事项：**

- 首页和列表页使用 `type: "website"`
- 文章详情页使用 `type: "article"`，并附带文章相关的时间和标签信息
- OG 图片推荐尺寸 1200x630 像素
- `metadataBase` 设置后，相对 URL 会自动补全为绝对 URL

### 3.7 Twitter Cards 配置

Twitter（X）使用自己的 meta 标签来展示链接预览卡片。

```typescript
twitter: {
  // 卡片类型：summary_large_image 显示大图预览
  card: "summary_large_image",

  // 卡片标题
  title: post.title,

  // 卡片描述
  description: post.description,

  // 预览图片
  images: [`/blog/${post.slug}/opengraph-image`],

  // 内容创作者的 Twitter 用户名
  creator: "@Finn7X",

  // 站点的 Twitter 用户名（可选）
  site: "@Finn7X",
}
```

**卡片类型说明：**

| 类型 | 效果 |
|------|------|
| `summary` | 小型方形缩略图 + 标题/描述 |
| `summary_large_image` | 大图横幅 + 标题/描述（推荐） |
| `player` | 可嵌入媒体播放器 |
| `app` | 应用下载卡片 |

### 3.8 结构化数据 (JSON-LD)

结构化数据帮助搜索引擎理解页面内容的语义。通过 JSON-LD 格式在页面中嵌入 Schema.org 标准的结构化数据。

#### SEO 组件

**文件：`src/components/common/seo.tsx`**

```typescript
import { siteConfig } from "@/lib/constants";

// ============================================================
// WebSite Schema — 用于根布局
// ============================================================
export function WebSiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    author: {
      "@type": "Person",
      name: siteConfig.author.name,
      url: siteConfig.author.url,
    },
    // 站内搜索（如果已实现搜索功能）
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ============================================================
// Person Schema — 作者信息
// ============================================================
export function PersonJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.author.name,
    url: siteConfig.author.url,
    email: siteConfig.author.email,
    sameAs: [
      siteConfig.author.github,
      `https://twitter.com/${siteConfig.author.twitter?.replace("@", "")}`,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ============================================================
// BlogPosting Schema — 文章详情页
// ============================================================
interface BlogPostingJsonLdProps {
  title: string;
  description: string;
  date: string;
  updated?: string;
  slug: string;
  tags?: string[];
  image?: string;
}

export function BlogPostingJsonLd({
  title,
  description,
  date,
  updated,
  slug,
  tags,
  image,
}: BlogPostingJsonLdProps) {
  const url = `${siteConfig.url}/blog/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: description,
    url: url,
    datePublished: date,
    dateModified: updated || date,
    author: {
      "@type": "Person",
      name: siteConfig.author.name,
      url: siteConfig.author.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/favicon/favicon.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    image: image || `${url}/opengraph-image`,
    keywords: tags?.join(", "),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ============================================================
// BreadcrumbList Schema — 面包屑导航
// ============================================================
interface BreadcrumbItem {
  name: string;
  href: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

#### 在页面中使用 SEO 组件

**根布局 `src/app/layout.tsx`：**

```typescript
import { WebSiteJsonLd, PersonJsonLd } from "@/components/common/seo";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <WebSiteJsonLd />
        <PersonJsonLd />
        {children}
      </body>
    </html>
  );
}
```

**文章详情页 `src/app/blog/[slug]/page.tsx`：**

```typescript
import {
  BlogPostingJsonLd,
  BreadcrumbJsonLd,
} from "@/components/common/seo";

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  return (
    <>
      <BlogPostingJsonLd
        title={post.title}
        description={post.description}
        date={post.date}
        updated={post.updated}
        slug={post.slug}
        tags={post.tags}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "首页", href: "/" },
          { name: "博客", href: "/blog" },
          { name: post.title, href: `/blog/${post.slug}` },
        ]}
      />
      {/* 文章内容 */}
    </>
  );
}
```

### 3.9 Sitemap 自动生成

Sitemap 告知搜索引擎网站上有哪些页面可供抓取。

**文件：`src/app/sitemap.ts`**

```typescript
import type { MetadataRoute } from "next";
import { posts } from "#site/content";
import { siteConfig } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

  // 静态页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  // 博客文章页面
  const postPages: MetadataRoute.Sitemap = posts
    .filter((post) => !post.draft)
    .map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated || post.date),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  // 标签页面
  const allTags = [...new Set(posts.flatMap((post) => post.tags))];
  const tagPages: MetadataRoute.Sitemap = allTags.map((tag) => ({
    url: `${baseUrl}/tags/${encodeURIComponent(tag)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.4,
  }));

  return [...staticPages, ...postPages, ...tagPages];
}
```

**生成效果：** Next.js 会在构建时自动生成 `/sitemap.xml`，格式如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://finn-days.com</loc>
    <lastmod>2026-03-09</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://finn-days.com/blog/getting-started-with-nextjs</loc>
    <lastmod>2026-02-20</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- ... -->
</urlset>
```

### 3.10 Robots.txt

**文件：`src/app/robots.ts`**

```typescript
import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
```

**生成效果：**

```
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /_next/

Sitemap: https://finn-days.com/sitemap.xml
Host: https://finn-days.com
```

### 3.11 Canonical URL

每个页面应声明自己的 Canonical URL，防止搜索引擎因 URL 参数、协议差异等原因产生重复内容。

在 Next.js 中通过 `alternates.canonical` 实现：

```typescript
// 在各页面的 metadata 或 generateMetadata 中
alternates: {
  canonical: "/blog/getting-started-with-nextjs",
}
```

由于 `metadataBase` 已在根布局设置为 `https://finn-days.com`，相对路径会自动补全为完整 URL。

---

## 四、文件清单

| 文件路径 | 说明 |
|---------|------|
| `src/app/layout.tsx` | 根布局，定义全局 Metadata、JSON-LD |
| `src/app/sitemap.ts` | Sitemap 自动生成 |
| `src/app/robots.ts` | Robots.txt 配置 |
| `src/app/blog/page.tsx` | 博客列表页 Metadata |
| `src/app/blog/[slug]/page.tsx` | 文章详情页动态 Metadata + JSON-LD |
| `src/app/tags/[tag]/page.tsx` | 标签页动态 Metadata |
| `src/components/common/seo.tsx` | JSON-LD 结构化数据组件集 |
| `src/lib/constants.ts` | 站点常量配置 |

---

## 五、依赖说明

本 SEO 方案完全基于 Next.js 内置能力，**无需安装额外 npm 依赖**。

| 能力 | 来源 |
|------|------|
| Metadata API | `next` (内置) |
| Sitemap 生成 | `next` (内置) |
| Robots.txt 生成 | `next` (内置) |
| JSON-LD | 原生 `<script>` 标签 |
| Open Graph | Metadata API (内置) |
| Twitter Cards | Metadata API (内置) |

---

## 六、测试要点

### 6.1 本地验证

```bash
# 构建项目（Metadata 在构建时静态生成）
npm run build

# 启动生产模式
npm start
```

使用浏览器开发者工具查看页面 `<head>` 中的 meta 标签：

```bash
# 检查页面 meta 标签
curl -s http://localhost:8200/blog/getting-started | grep -E '<(meta|title|link)'
```

### 6.2 在线验证工具

| 工具 | URL | 检查内容 |
|------|-----|---------|
| Google Rich Results Test | https://search.google.com/test/rich-results | JSON-LD 结构化数据 |
| Schema.org Validator | https://validator.schema.org | Schema 语法正确性 |
| Facebook Sharing Debugger | https://developers.facebook.com/tools/debug/ | Open Graph 标签 |
| Twitter Card Validator | https://cards-dev.twitter.com/validator | Twitter Cards |
| Google Search Console | https://search.google.com/search-console | 索引状态、Sitemap 提交 |

### 6.3 Lighthouse SEO 审计

```bash
# 使用 Chrome DevTools → Lighthouse → SEO 类别
# 目标分数：100
```

关注的检查项：
- Document has a `<title>` element
- Document has a meta description
- Page has successful HTTP status code
- Document has a valid `hreflang`
- Document has a valid `rel=canonical`
- Page is not blocked from indexing
- Image elements have `alt` attributes
- Links have descriptive text
- Document has a valid `robots.txt`

### 6.4 Sitemap 验证

```bash
# 本地访问 sitemap
curl http://localhost:8200/sitemap.xml

# 部署后提交到 Google Search Console
# https://search.google.com/search-console → Sitemaps → 提交 sitemap.xml
```

---

## 七、注意事项

1. **`metadataBase` 必须设置**：在生产环境中，不设置 `metadataBase` 会导致 OG 图片等使用相对 URL 的场景出错。确保在根布局中正确配置。

2. **草稿文章排除**：在 Sitemap 和 `generateStaticParams` 中过滤掉 `draft: true` 的文章，避免搜索引擎索引未完成的内容。

3. **Canonical URL 一致性**：确保每个页面的 canonical URL 与实际访问 URL 一致，避免出现带尾斜杠和不带尾斜杠的混乱。在 `next.config.ts` 中配置 `trailingSlash` 选项：

   ```typescript
   const nextConfig: NextConfig = {
     trailingSlash: false, // 统一不带尾斜杠
   };
   ```

4. **动态路由 SEO**：使用 `generateMetadata` 而非静态 `metadata` 导出，确保每篇文章都有唯一的标题、描述和 OG 标签。

5. **图片 alt 属性**：所有 `<img>` 和 `next/image` 组件必须提供有意义的 `alt` 属性，这既是可访问性要求也是 SEO 最佳实践。

6. **语义化 HTML**：使用正确的 HTML 语义标签（`<article>`、`<nav>`、`<main>`、`<header>`、`<footer>`、`<section>`），帮助搜索引擎理解页面结构。

7. **JSON-LD 数据准确性**：确保结构化数据中的日期、作者、URL 等信息与页面实际内容一致，避免被搜索引擎标记为不一致。

8. **定期监控**：部署后在 Google Search Console 中监控索引状态、搜索表现，及时发现和修复 SEO 问题。

---

## 八、其他 SEO 最佳实践

### 8.1 内容层面

- **标题优化**：文章标题控制在 60 字符以内，包含目标关键词
- **描述优化**：description 控制在 120-160 字符，自然包含关键词
- **URL 结构**：使用短而有意义的 slug，如 `/blog/nextjs-getting-started`
- **内部链接**：在文章中适当添加指向其他文章的内部链接，提升页面权重传递

### 8.2 技术层面

- **页面加载速度**：Core Web Vitals 对 SEO 排名有直接影响（参见性能优化文档）
- **移动端适配**：确保所有页面在移动端的良好体验（已通过 Tailwind CSS 响应式设计实现）
- **HTTPS**：确保生产环境使用 HTTPS（通过反向代理实现）
- **404 页面**：创建自定义 404 页面 (`src/app/not-found.tsx`)，提供导航回到主要页面

### 8.3 提交搜索引擎

部署后需要手动向主流搜索引擎提交站点：

```
Google:  https://search.google.com/search-console
Bing:    https://www.bing.com/webmasters
百度:     https://ziyuan.baidu.com
```

---

*本文档为 Finn Days 博客 Phase 3 SEO 优化方案的完整参考。*
