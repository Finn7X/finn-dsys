# 作者卡片

## 概述

在文章详情页底部展示作者信息卡片，包含头像、姓名、简介和社交链接。AuthorCard 组件作为文章与评论之间的过渡区域，帮助读者了解作者并通过社交链接与作者建立联系。作者信息统一从站点配置常量中读取，便于维护。

## 功能说明

- **位置**：文章正文底部，分享按钮下方，评论区上方
- **内容**：头像、姓名、简介、社交链接（GitHub、Twitter/X、Email）
- **样式**：卡片式设计，与文章内容区等宽，视觉上与文章内容区分
- **头像**：使用 `next/image` 组件加载，圆形裁剪，带边框

## 技术方案

### 数据源设计

作者信息存储在 `src/lib/constants.ts` 中的站点配置对象内，集中管理便于修改：

```typescript
// src/lib/constants.ts

export const siteConfig = {
  title: "Finn Days",
  description:
    "Exploring technology, sharing knowledge, and documenting my journey in web development",
  url: "https://finndays.com",
  author: {
    name: "Finn",
    bio: "全栈开发者，热爱开源技术和知识分享。专注于 React、Next.js 和现代 Web 开发。",
    avatar: "/images/avatar.jpg", // 存放在 public/images/ 下
    github: "https://github.com/your-username",
    twitter: "https://twitter.com/your-handle",
    email: "your-email@example.com",
  },
};
```

### 头像资源

- 头像文件放置在 `public/images/avatar.jpg`
- 推荐尺寸：400x400 像素或更高
- 格式推荐：WebP（体积小）或 JPEG
- 使用 `next/image` 自动优化图片大小和格式

## 实现步骤

### 步骤 1：更新站点配置

确保 `src/lib/constants.ts` 中包含完整的作者信息（见上方数据源设计）。

### 步骤 2：创建 AuthorCard 组件

```typescript
// src/components/blog/author-card.tsx
import Image from "next/image";
import { Github, Twitter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/constants";

export function AuthorCard() {
  const { author } = siteConfig;

  return (
    <div className="mt-12 pt-8 border-t">
      <div className="flex flex-col sm:flex-row items-start gap-5 rounded-xl border bg-card p-6">
        {/* 头像 */}
        <div className="shrink-0">
          <Image
            src={author.avatar}
            alt={author.name}
            width={80}
            height={80}
            className="rounded-full border-2 border-muted"
            priority={false}
          />
        </div>

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          {/* 姓名 */}
          <h3 className="text-lg font-semibold">{author.name}</h3>

          {/* 简介 */}
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {author.bio}
          </p>

          {/* 社交链接 */}
          <div className="mt-3 flex items-center gap-1">
            {author.github && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                asChild
              >
                <a
                  href={author.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            )}

            {author.twitter && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                asChild
              >
                <a
                  href={author.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
            )}

            {author.email && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                asChild
              >
                <a href={`mailto:${author.email}`} aria-label="Email">
                  <Mail className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 步骤 3：可选——支持多作者

如果未来博客需要支持多位作者（Guest Post），可以扩展组件接收作者信息 prop：

```typescript
// src/components/blog/author-card.tsx（多作者版本）
import Image from "next/image";
import { Github, Twitter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/constants";

interface Author {
  name: string;
  bio: string;
  avatar: string;
  github?: string;
  twitter?: string;
  email?: string;
}

interface AuthorCardProps {
  author?: Author;
}

export function AuthorCard({ author }: AuthorCardProps) {
  // 默认使用站点配置中的作者信息
  const authorData = author || siteConfig.author;

  return (
    <div className="mt-12 pt-8 border-t">
      <div className="flex flex-col sm:flex-row items-start gap-5 rounded-xl border bg-card p-6">
        <div className="shrink-0">
          <Image
            src={authorData.avatar}
            alt={authorData.name}
            width={80}
            height={80}
            className="rounded-full border-2 border-muted"
            priority={false}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold">{authorData.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {authorData.bio}
          </p>

          <div className="mt-3 flex items-center gap-1">
            {authorData.github && (
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" asChild>
                <a href={authorData.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            )}
            {authorData.twitter && (
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" asChild>
                <a href={authorData.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
            )}
            {authorData.email && (
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" asChild>
                <a href={`mailto:${authorData.email}`} aria-label="Email">
                  <Mail className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 步骤 4：在文章详情页中集成

```typescript
// src/app/blog/[slug]/page.tsx（相关部分）
import { AuthorCard } from "@/components/blog/author-card";
import { ShareButtons } from "@/components/blog/share-buttons";
import { Comments } from "@/components/blog/comments";

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

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

      {/* 分享按钮 */}
      <div className="mt-12 pt-6 border-t">
        <ShareButtons title={post.title} url={`...`} />
      </div>

      {/* 作者卡片 */}
      <AuthorCard />

      {/* 评论区 */}
      <Comments />
    </article>
  );
}
```

文章详情页底部区域的完整排列顺序：

1. 文章正文
2. 分享按钮
3. **作者卡片**
4. Newsletter 订阅（可选，见 06-newsletter.md）
5. 评论区

### 样式细节说明

**卡片容器：**
- `rounded-xl`：圆角边框，与 shadcn/ui 的 Card 风格一致
- `border bg-card`：使用主题感知的边框和背景色
- `p-6`：内边距

**头像：**
- `rounded-full`：圆形裁剪
- `border-2 border-muted`：2px 柔和边框
- 尺寸 80x80 像素，在小屏上不会过大
- 使用 `next/image` 自动优化（WebP 转换、响应式尺寸）

**布局：**
- `flex-col sm:flex-row`：小屏上头像和文字上下排列，中屏以上左右排列
- `items-start`：顶部对齐
- `gap-5`：头像与文字间距

**社交链接：**
- 使用圆形 ghost 按钮 + lucide-react 图标
- 通过 `asChild` prop 将 Button 渲染为 `<a>` 标签
- 外链使用 `target="_blank"` + `rel="noopener noreferrer"` 安全属性

## 文件清单

| 文件路径 | 说明 | 操作 |
|---------|------|------|
| `src/lib/constants.ts` | 站点配置（添加 author 信息） | 新建/修改 |
| `src/components/blog/author-card.tsx` | 作者卡片组件 | 新建 |
| `src/app/blog/[slug]/page.tsx` | 文章详情页 | 修改（集成组件） |
| `public/images/avatar.jpg` | 作者头像图片 | 新增资源 |

## 依赖说明

本功能不需要额外安装任何依赖包，完全基于：

- `next/image`：Next.js 内置图片优化组件
- lucide-react：图标（项目已安装）
- shadcn/ui Button：按钮组件（项目已安装）

## 测试要点

1. **视觉测试**
   - 头像正确加载，显示为圆形
   - 姓名和简介文字清晰可读
   - 社交链接图标正确显示
   - 卡片在亮色和暗色模式下视觉效果良好

2. **响应式测试**
   - 桌面端：头像和文字左右排列
   - 移动端：头像和文字上下排列
   - 卡片宽度不超出文章内容区

3. **链接测试**
   - GitHub 链接在新标签页打开正确地址
   - Twitter 链接在新标签页打开正确地址
   - Email 链接触发邮件客户端
   - 所有外链包含 `rel="noopener noreferrer"` 安全属性

4. **图片优化测试**
   - `next/image` 自动生成适当尺寸的图片
   - 图片加载不阻塞页面渲染（`priority={false}`）
   - 图片有正确的 alt 属性

5. **无障碍测试**
   - 社交链接按钮有明确的 `aria-label`
   - 头像图片有 alt 属性
   - 键盘可以 Tab 聚焦到每个社交链接按钮

## 注意事项

1. **头像尺寸**：`next/image` 的 `width` 和 `height` 属性是渲染尺寸，实际图片文件应大于此尺寸以保证在高 DPI 屏幕上清晰（推荐 400x400 以上）
2. **默认头像**：如果头像文件不存在，可以添加一个 fallback 方案（如显示姓名首字母）
3. **数据一致性**：作者信息集中在 `constants.ts` 中管理，修改一处即可全站生效，避免在多个组件中硬编码
4. **Server Component**：AuthorCard 组件不需要客户端交互，可以保持为 Server Component（不添加 `"use client"` 指令），这样可以在服务端渲染，减少客户端 JS 体积
5. **多作者支持**：当前设计以单作者为主，但预留了通过 prop 传入作者信息的扩展接口，未来可以从文章 frontmatter 的 `author` 字段读取不同作者
