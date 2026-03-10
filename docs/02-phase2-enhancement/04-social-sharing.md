# 社交分享

## 概述

为 Finn Days 博客的文章详情页添加社交分享功能，允许读者一键将文章分享到 Twitter/X、LinkedIn，或复制文章链接。采用纯 URL 拼接方式实现，不引入任何重型第三方 JS SDK，确保页面性能不受影响。同时在支持 Web Share API 的移动端浏览器上提供原生分享体验。

## 功能设计

### 分享渠道

| 渠道 | 实现方式 | 说明 |
|------|---------|------|
| Twitter/X | URL 拼接，新窗口打开 | `https://twitter.com/intent/tweet?...` |
| LinkedIn | URL 拼接，新窗口打开 | `https://www.linkedin.com/sharing/share-offsite/?url=...` |
| 复制链接 | `navigator.clipboard.writeText()` | 复制文章 URL 到剪贴板 |
| 原生分享（移动端增强） | `navigator.share()` | 调用系统原生分享面板 |

### 不使用 JS SDK 的理由

- 社交平台的 JS SDK（如 Twitter widgets.js）体积大，会拖慢页面加载
- SDK 通常包含追踪代码，影响用户隐私
- 基于 URL 拼接的分享方式同样功能完整，且零依赖
- 更易维护，不受平台 SDK 版本变更影响

## 技术方案

### 分享链接格式

**Twitter/X 分享链接：**

```
https://twitter.com/intent/tweet?text={title}&url={url}&via={twitterHandle}
```

参数说明：
- `text`：推文内容（文章标题）
- `url`：文章 URL
- `via`：推荐关注的 Twitter 账号（可选）

**LinkedIn 分享链接：**

```
https://www.linkedin.com/sharing/share-offsite/?url={url}
```

参数说明：
- `url`：文章 URL（LinkedIn 会自动抓取页面的 Open Graph 标签生成预览）

### Open Graph 标签

确保每篇文章页面包含完整的 Open Graph 标签，这样在社交平台上分享时能正确显示预览卡片：

```typescript
// src/app/blog/[slug]/page.tsx 中的 metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://finndays.com/blog/${params.slug}`,
      siteName: "Finn Days",
      type: "article",
      publishedTime: post.date,
      authors: ["Finn"],
      images: [
        {
          url: post.image || "https://finndays.com/og-default.png",
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
      images: [post.image || "https://finndays.com/og-default.png"],
      creator: "@your_twitter_handle",
    },
  };
}
```

## 实现步骤

### 步骤 1：创建分享工具函数

```typescript
// src/lib/sharing.ts

export interface ShareData {
  title: string;
  url: string;
  description?: string;
}

/**
 * 生成 Twitter/X 分享链接
 */
export function getTwitterShareUrl(data: ShareData): string {
  const params = new URLSearchParams({
    text: data.title,
    url: data.url,
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/**
 * 生成 LinkedIn 分享链接
 */
export function getLinkedInShareUrl(data: ShareData): string {
  const params = new URLSearchParams({
    url: data.url,
  });
  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 降级方案：使用 execCommand（兼容旧浏览器）
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * 检测是否支持 Web Share API
 */
export function canNativeShare(): boolean {
  return typeof navigator !== "undefined" && !!navigator.share;
}

/**
 * 调用原生分享 API
 */
export async function nativeShare(data: ShareData): Promise<boolean> {
  if (!canNativeShare()) return false;

  try {
    await navigator.share({
      title: data.title,
      text: data.description || data.title,
      url: data.url,
    });
    return true;
  } catch (error) {
    // 用户取消分享不算错误
    if (error instanceof Error && error.name === "AbortError") {
      return false;
    }
    return false;
  }
}
```

### 步骤 2：创建 ShareButtons 组件

```typescript
// src/components/blog/share-buttons.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Twitter, Linkedin, Link2, Check, Share2 } from "lucide-react";
import {
  getTwitterShareUrl,
  getLinkedInShareUrl,
  copyToClipboard,
  canNativeShare,
  nativeShare,
  type ShareData,
} from "@/lib/sharing";

interface ShareButtonsProps {
  title: string;
  url: string;
  description?: string;
}

export function ShareButtons({ title, url, description }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareData: ShareData = { title, url, description };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    await nativeShare(shareData);
  };

  const openShareWindow = (shareUrl: string) => {
    window.open(shareUrl, "_blank", "width=600,height=400,noopener,noreferrer");
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground mr-1">分享：</span>

      {/* Twitter/X */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]"
        onClick={() => openShareWindow(getTwitterShareUrl(shareData))}
        aria-label="分享到 Twitter"
      >
        <Twitter className="h-4 w-4" />
      </Button>

      {/* LinkedIn */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]"
        onClick={() => openShareWindow(getLinkedInShareUrl(shareData))}
        aria-label="分享到 LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </Button>

      {/* 复制链接 */}
      <Button
        variant="ghost"
        size="icon"
        className={`h-9 w-9 rounded-full transition-colors ${
          copied
            ? "text-green-600 hover:bg-green-600/10"
            : "hover:bg-accent hover:text-accent-foreground"
        }`}
        onClick={handleCopyLink}
        aria-label={copied ? "已复制" : "复制链接"}
      >
        {copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
      </Button>

      {/* 原生分享（仅移动端显示） */}
      {canNativeShare() && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full hover:bg-accent hover:text-accent-foreground"
          onClick={handleNativeShare}
          aria-label="更多分享选项"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
```

### 步骤 3：带 Toast 提示的增强版本

如果项目中已安装 shadcn/ui 的 Toast 组件，可以使用 Toast 替代简单的图标切换：

```typescript
// src/components/blog/share-buttons.tsx（Toast 增强版，核心变更部分）
import { useToast } from "@/hooks/use-toast";

// 在组件内部
const { toast } = useToast();

const handleCopyLink = async () => {
  const success = await copyToClipboard(url);
  if (success) {
    toast({
      description: "链接已复制到剪贴板",
      duration: 2000,
    });
  } else {
    toast({
      description: "复制失败，请手动复制",
      variant: "destructive",
      duration: 2000,
    });
  }
};
```

### 步骤 4：在文章详情页中集成

**方案 A：文章底部（推荐）**

```typescript
// src/app/blog/[slug]/page.tsx（相关部分）
import { ShareButtons } from "@/components/blog/share-buttons";
import { siteConfig } from "@/config/site";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const postUrl = `${siteConfig.url}/blog/${slug}`;

  return (
    <article className="container mx-auto max-w-3xl py-16 px-4">
      {/* 文章头部 */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      </header>

      {/* 文章正文 */}
      <div className="prose dark:prose-invert max-w-none">
        {/* MDX Content */}
      </div>

      {/* 分享按钮 - 文章底部 */}
      <div className="mt-12 pt-6 border-t flex items-center justify-between">
        <ShareButtons
          title={post.title}
          url={postUrl}
          description={post.description}
        />
      </div>

      {/* 作者卡片 */}
      {/* 评论区 */}
    </article>
  );
}
```

**方案 B：侧边栏浮动（适合桌面端宽屏布局）**

```typescript
// src/components/blog/floating-share.tsx
"use client";

import { ShareButtons } from "@/components/blog/share-buttons";

interface FloatingShareProps {
  title: string;
  url: string;
  description?: string;
}

export function FloatingShare({ title, url, description }: FloatingShareProps) {
  return (
    <div className="hidden xl:block fixed left-[calc(50%-450px)] top-1/2 -translate-y-1/2 -translate-x-16">
      <div className="flex flex-col items-center gap-2 rounded-full border bg-background/80 backdrop-blur-sm p-2 shadow-sm">
        <ShareButtons title={title} url={url} description={description} />
      </div>
    </div>
  );
}
```

> **注意**：侧边栏浮动方案需要调整 ShareButtons 组件的 flex 方向为 `flex-col`，可通过 prop 控制。推荐先使用文章底部方案，简单且兼容所有屏幕尺寸。

### 步骤 5：移动端 Web Share API 增强

Web Share API（`navigator.share`）在移动端浏览器（iOS Safari、Android Chrome）上可以调用系统原生的分享面板，让用户分享到微信、Telegram 等任意已安装的应用。

上述 ShareButtons 组件已包含此功能。`canNativeShare()` 检测浏览器是否支持该 API：
- 支持时：显示额外的"更多分享"按钮
- 不支持时：仅显示 Twitter、LinkedIn、复制链接按钮

桌面浏览器通常不支持 `navigator.share`（除 Safari 和部分 Chromium 版本），因此该按钮主要在移动端可见。

## 文件清单

| 文件路径 | 说明 | 操作 |
|---------|------|------|
| `src/lib/sharing.ts` | 分享工具函数 | 新建 |
| `src/components/blog/share-buttons.tsx` | 分享按钮组件 | 新建 |
| `src/components/blog/floating-share.tsx` | 侧边浮动分享（可选） | 新建 |
| `src/app/blog/[slug]/page.tsx` | 文章详情页 | 修改（集成分享按钮） |

## 依赖说明

本功能不需要额外安装任何依赖包，完全基于：

- 浏览器原生 API（`navigator.clipboard`、`navigator.share`、`window.open`）
- lucide-react 图标（项目已安装）
- shadcn/ui Button 组件（项目已安装）
- 可选：shadcn/ui Toast 组件（用于复制成功提示）

如需 Toast 提示功能，安装 shadcn/ui 的 toast 组件：

```bash
npx shadcn@latest add toast
```

## 测试要点

1. **分享链接测试**
   - 点击 Twitter 按钮，新窗口打开 Twitter 发推页面，预填内容正确
   - 点击 LinkedIn 按钮，新窗口打开 LinkedIn 分享页面，预览正确
   - 分享链接中的 URL 编码正确，特殊字符不会导致 URL 断裂
   - 文章标题包含特殊字符（引号、& 等）时分享链接正常

2. **复制链接测试**
   - 点击复制按钮，文章 URL 被正确复制到剪贴板
   - 复制成功后图标从链接图标变为勾选图标，2 秒后恢复
   - 在不支持 `navigator.clipboard` 的浏览器中降级方案正常工作
   - HTTPS 环境下 `navigator.clipboard` 正常工作

3. **原生分享测试（移动端）**
   - iOS Safari 上点击分享按钮弹出系统分享面板
   - Android Chrome 上点击分享按钮弹出系统分享面板
   - 桌面浏览器（不支持时）不显示原生分享按钮
   - 用户取消分享不产生错误提示

4. **Open Graph 预览测试**
   - 使用 [Twitter Card Validator](https://cards-dev.twitter.com/validator) 验证推特卡片预览
   - 使用 [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) 验证 LinkedIn 预览
   - 确认分享预览包含正确的标题、描述和图片

5. **UI 交互测试**
   - 按钮 hover 效果正常（品牌色高亮）
   - 按钮点击状态反馈明确
   - 分享窗口大小合适（600x400）

6. **响应式测试**
   - 移动端分享按钮布局不溢出
   - 侧边浮动分享（如使用）仅在宽屏显示

## 注意事项

1. **HTTPS 要求**：`navigator.clipboard` 和 `navigator.share` 均要求页面在 HTTPS 环境下运行，本地开发可使用 `localhost`
2. **弹窗拦截**：部分浏览器可能拦截 `window.open` 弹出的分享窗口，确保 `window.open` 在用户点击事件的同步调用链中执行
3. **URL 编码**：使用 `URLSearchParams` 自动处理 URL 编码，避免手动拼接导致的编码问题
4. **社交平台变更**：Twitter/X 和 LinkedIn 的分享 URL 格式偶尔会变更，需要定期检查是否仍然有效
5. **分享统计**：如需统计分享次数，可以在分享事件中添加 Analytics 事件追踪（如 Google Analytics 的 event tracking）
