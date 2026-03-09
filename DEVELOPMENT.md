# Finn Days - 个人技术博客开发文档

> 项目名称：Finn Days
> 作者：Finn7X (xujifennng@gmail.com)
> GitHub：https://github.com/Finn7X
> 创建日期：2025-02
> 文档版本：v1.0 (2026-03-09)

---

## 一、项目概述

### 1.1 项目愿景

Finn Days 是一个面向技术社区的个人博客平台，用于发布技术实践分享、记录开发心得、展示个人项目。目标是打造一个**内容至上、体验优雅、长期可维护**的现代化技术博客。

### 1.2 定位与受众

- **内容方向**：前端/全栈开发实践、Next.js/React 生态、DevOps 实践、开源项目分享
- **目标受众**：中文技术社区的开发者
- **差异化**：注重交互体验与代码演示质量，追求极致的阅读体验

### 1.3 设计理念

参考业界优秀技术博客的设计哲学：

| 博客 | 理念 | 借鉴点 |
|------|------|--------|
| overreacted.io (Dan Abramov) | 极简主义，内容至上 | 纯净的阅读体验，零干扰 |
| joshwcomeau.com (Josh Comeau) | 交互优先，视觉教学 | 自定义 MDX 组件、代码演练场 |
| leerob.com (Lee Robinson) | 现代简洁，工程优雅 | Next.js + shadcn/ui 技术栈一致 |
| taniarascia.com (Tania Rascia) | 独立纯粹，无广告无追踪 | 内容分类体系（Blog/Notes/Deep Dives） |

---

## 二、当前项目现状

### 2.1 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router) | 16.1.6 |
| 语言 | TypeScript | 5.x |
| UI 组件 | shadcn/ui + Radix UI | - |
| 样式 | Tailwind CSS | 4.2.1 |
| 图标 | Lucide React | 0.577.0 |
| 字体 | Geist Sans / Geist Mono | next/font |
| 部署 | Docker (node:22-alpine) | - |
| 端口 | 8200 | - |

### 2.2 已完成功能

- [x] 项目基础框架搭建 (Next.js 15 + TypeScript + Tailwind)
- [x] shadcn/ui 组件集成 (Button, Card)
- [x] 响应式首页 (Hero、最近文章、技能展示、页脚)
- [x] 响应式导航栏 (桌面端 + 移动端汉堡菜单)
- [x] Docker 部署配置
- [x] 博客 Logo

### 2.3 当前目录结构

```
finn-dsys/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 根布局
│   │   ├── page.tsx            # 首页
│   │   ├── globals.css         # 全局样式
│   │   └── favicon.ico
│   ├── components/
│   │   └── ui/
│   │       ├── button.tsx      # 按钮组件
│   │       └── card.tsx        # 卡片组件
│   └── lib/
│       └── utils.ts            # 工具函数 (cn)
├── public/                     # 静态资源
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
├── components.json             # shadcn/ui 配置
├── Dockerfile
└── .dockerignore
```

---

## 三、功能规划与优先级

基于对主流技术博客的深度调研，将功能划分为四个阶段：

### Phase 1：核心内容系统 (MVP)

> 目标：能够发布和展示博客文章的最小可用版本

#### 3.1 MDX 内容管理系统

**推荐方案：Velite**

选择理由：
- 类型安全的数据层，基于 Zod schema 校验
- 框架无关，与 Next.js 完美集成
- 自动处理静态资源文件拷贝
- 活跃维护中（Contentlayer 已停维，不推荐）

```
content/
├── posts/
│   ├── getting-started-with-nextjs.mdx
│   ├── tailwind-css-best-practices.mdx
│   └── ...
└── projects/
    ├── lumi-draw.mdx
    └── deep-search.mdx
```

**Frontmatter 规范：**

```yaml
---
title: "Getting Started with Next.js"
description: "Learn how to build modern web applications with Next.js"
date: 2025-02-20
updated: 2025-02-22          # 可选，最后更新日期
tags: ["Next.js", "React", "TypeScript"]
category: "Frontend"
series: "Next.js 实战"        # 可选，系列文章
cover: "./cover.jpg"          # 可选，封面图
draft: false                  # 是否为草稿
---
```

#### 3.2 页面路由结构

```
/                       → 首页 (Hero + 最近文章 + 技能介绍)
/blog                   → 博客列表页 (分页 + 标签筛选)
/blog/[slug]            → 文章详情页
/projects               → 项目展示页
/about                  → 关于我
/tags                   → 标签索引页
/tags/[tag]             → 按标签筛选的文章列表
```

#### 3.3 文章详情页功能

| 功能 | 说明 | 实现方案 |
|------|------|---------|
| 代码语法高亮 | VS Code 级别的代码着色 | Shiki + rehype-pretty-code |
| 复制代码按钮 | 一键复制代码块 | 自定义 MDX 组件 |
| 目录导航 (TOC) | 自动生成，滚动高亮当前位置 | 从 headings 提取 + Intersection Observer |
| 阅读时长 | 基于字数自动计算 | ~300字/分钟（中文） |
| 标签展示 | 文章标签，可点击跳转 | 链接到 /tags/[tag] |
| 发布/更新日期 | 显示创建与更新时间 | 从 frontmatter 读取 |
| 上/下篇导航 | 前后文章快速跳转 | 根据日期排序计算 |
| 系列文章导航 | 同一系列内的文章列表 | 根据 series 字段聚合 |

#### 3.4 博客列表页

- 分页展示（每页 10 篇）
- 标签筛选（点击标签过滤）
- 按时间倒序排列
- 显示标题、摘要、日期、标签、阅读时长
- 响应式网格/列表布局

#### 3.5 暗色/亮色主题

- 基于 CSS 变量的主题切换
- 跟随系统 `prefers-color-scheme` 偏好
- 用户选择持久化至 Cookie（避免闪烁）
- 导航栏添加主题切换按钮
- 推荐库：`next-themes`

#### 3.6 RSS 订阅

- 生成 `/feed.xml` (RSS 2.0) 和 `/atom.xml` (Atom)
- 在 `<head>` 中声明 feed 链接
- 页脚/导航添加 RSS 图标入口
- 推荐库：`feed`

---

### Phase 2：体验增强

> 目标：提升阅读体验与互动性

#### 3.7 评论系统

**推荐方案：Giscus**

选择理由：
- 基于 GitHub Discussions，无需额外数据库
- 免费，无追踪，无广告
- 支持 40+ 语言（包括中文）
- 支持多主题（可与暗色模式同步）
- 支持 Reactions 表情反应
- 支持懒加载
- 提供 React 组件库

配置要点：
- 页面到 Discussion 的映射方式：按 pathname
- 主题跟随博客暗色/亮色模式

#### 3.8 搜索功能

**推荐方案（二选一）：**

| 方案 | 适用场景 | 特点 |
|------|---------|------|
| **Pagefind** (推荐) | 文章数量 < 10000 | 构建后索引，纯客户端，CJK 支持好，< 300KB |
| **Algolia** | 追求极致搜索体验 | 服务端托管，模糊匹配，有免费额度 |

初期文章较少时，也可先用简单的客户端数组过滤实现，后期再升级。

#### 3.9 阅读进度条

- 页面顶部水平进度条，显示当前阅读位置百分比
- 仅在文章详情页显示
- 基于 `scroll` 事件 + `Intersection Observer` 实现

#### 3.10 社交分享

- 文章底部添加分享按钮：Twitter/X、LinkedIn、复制链接
- 基于 URL 拼接实现（不引入重型 JS SDK）
- Open Graph 标签确保分享时预览正确

#### 3.11 作者卡片

- 文章底部展示作者信息
- 包含：头像、姓名、简介、社交链接
- 引导读者关注更多内容

#### 3.12 Newsletter 邮件订阅

**推荐方案：Buttondown**

选择理由：
- 开发者友好，界面简洁
- 免费额度（< 100 订阅者）
- 支持自定义域名
- 独立开发者构建，理念契合

实现位置：
- 首页 Hero 区域
- 文章底部（评论上方）
- 可选：独立 `/subscribe` 页面

---

### Phase 3：SEO 与基础设施

> 目标：提升搜索引擎可见性与运维能力

#### 3.13 SEO 优化

| 项目 | 实现方式 |
|------|---------|
| **Meta 标签** | Next.js `metadata` 导出 + `generateMetadata` 动态生成 |
| **Open Graph** | og:title, og:description, og:image, og:url, og:type |
| **Twitter Cards** | twitter:card, twitter:title, twitter:description, twitter:image |
| **结构化数据** | JSON-LD (`BlogPosting`, `Person`, `WebSite` schema) |
| **Sitemap** | `src/app/sitemap.ts` 自动生成 |
| **Robots.txt** | `src/app/robots.ts` |
| **Canonical URL** | 每个页面声明规范链接 |
| **OG 图片动态生成** | `opengraph-image.tsx` 为每篇文章自动生成品牌化预览图 |

#### 3.14 性能优化

- 图片优化：`next/image` (WebP/AVIF 格式，懒加载，响应式尺寸)
- 字体优化：`next/font` 自托管 (避免布局偏移)
- 博客文章静态生成 (SSG)：构建时预渲染
- 目标：Lighthouse 评分 90+

#### 3.15 隐私友好的分析

**推荐方案：Umami (自部署)**

选择理由：
- 开源，完全自托管
- 无 Cookie，GDPR 合规
- 单页面仪表盘，简洁直观
- 适合 Docker 部署（与博客同一 Docker Compose）

#### 3.16 CI/CD 流水线

**GitHub Actions 工作流：**

```yaml
# 触发条件：push to main
# 流程：
#   1. 代码检查 (lint + type-check)
#   2. 构建 Next.js
#   3. 构建 Docker 镜像
#   4. 推送至容器仓库 (GHCR / Docker Hub)
#   5. 部署至服务器 (SSH / Watchtower 自动更新)
```

---

### Phase 4：进阶功能

> 目标：差异化特色功能，提升博客竞争力

#### 3.17 命令面板 (Cmd+K)

- 键盘驱动的全局导航，面向高级用户
- 快速跳转到任意页面、文章、标签
- 推荐库：`cmdk` (by pacocoursey)

#### 3.18 自定义 MDX 组件库

打造独特的内容表达能力：

| 组件 | 用途 |
|------|------|
| `<Callout>` | 提示/警告/信息框 (info, warning, success, error) |
| `<CodePlayground>` | 交互式代码演练场 (基于 Sandpack) |
| `<Accordion>` | 可折叠内容区域 |
| `<Steps>` | 步骤式教程布局 |
| `<Tabs>` | 多标签代码对比 (如不同语言的实现) |
| `<FileTree>` | 目录结构展示 |
| `<LinkCard>` | 外部链接卡片预览 |
| `<YouTube>` / `<Tweet>` | 嵌入外部内容 |

#### 3.19 交互式代码演练场

- 基于 **Sandpack** (by CodeSandbox) 实现
- 支持 React 组件的实时编辑与预览
- 支持 Prettier 格式化
- 支持导出至 CodeSandbox

#### 3.20 国际化 (i18n)

- 支持中/英双语
- 内容层面：每篇文章独立的语言版本 (`post.zh.mdx` / `post.en.mdx`)
- UI 层面：JSON locale 文件存储翻译字符串
- 推荐库：`next-intl`

#### 3.21 View Transitions

- 页面间平滑过渡动画
- 基于 View Transitions API（Chrome + Firefox 已支持）
- 提升浏览流畅感

#### 3.22 短笔记 (Notes/TIL)

- 独立于长篇博客的轻量内容形式
- 用于记录「今日所学」(Today I Learned)、技术备忘
- 类似 Twitter/微博的短格式
- 路由：`/notes`

---

## 四、目标目录结构

基于以上规划，项目最终目标目录结构如下：

```
finn-dsys/
├── content/                        # 内容目录
│   ├── posts/                      # 博客文章 (MDX)
│   │   └── getting-started.mdx
│   ├── projects/                   # 项目介绍 (MDX)
│   │   └── lumi-draw.mdx
│   └── notes/                      # 短笔记 (MDX)
│       └── til-css-grid.mdx
│
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 根布局 (主题、字体、元数据)
│   │   ├── page.tsx                # 首页
│   │   ├── globals.css             # 全局样式 + CSS 变量
│   │   ├── sitemap.ts              # 自动生成 Sitemap
│   │   ├── robots.ts               # Robots.txt
│   │   ├── feed.xml/route.ts       # RSS Feed
│   │   ├── atom.xml/route.ts       # Atom Feed
│   │   │
│   │   ├── blog/
│   │   │   ├── page.tsx            # 博客列表页
│   │   │   └── [slug]/
│   │   │       └── page.tsx        # 文章详情页
│   │   │
│   │   ├── projects/
│   │   │   └── page.tsx            # 项目展示页
│   │   │
│   │   ├── about/
│   │   │   └── page.tsx            # 关于我
│   │   │
│   │   ├── tags/
│   │   │   ├── page.tsx            # 标签索引
│   │   │   └── [tag]/
│   │   │       └── page.tsx        # 按标签筛选
│   │   │
│   │   └── notes/
│   │       └── page.tsx            # 短笔记页
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui 基础组件
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                 # 布局组件
│   │   │   ├── navbar.tsx          # 导航栏
│   │   │   ├── footer.tsx          # 页脚
│   │   │   ├── theme-toggle.tsx    # 主题切换
│   │   │   └── mobile-nav.tsx      # 移动端导航
│   │   │
│   │   ├── blog/                   # 博客相关组件
│   │   │   ├── post-card.tsx       # 文章卡片
│   │   │   ├── post-header.tsx     # 文章头部 (标题、日期、标签)
│   │   │   ├── toc.tsx             # 目录导航
│   │   │   ├── reading-progress.tsx # 阅读进度条
│   │   │   ├── share-buttons.tsx   # 社交分享
│   │   │   ├── author-card.tsx     # 作者卡片
│   │   │   ├── post-navigation.tsx # 上/下篇导航
│   │   │   ├── series-nav.tsx      # 系列文章导航
│   │   │   └── comments.tsx        # 评论区 (Giscus)
│   │   │
│   │   ├── mdx/                    # 自定义 MDX 组件
│   │   │   ├── callout.tsx         # 提示框
│   │   │   ├── code-block.tsx      # 代码块 (含复制按钮)
│   │   │   ├── code-playground.tsx # 代码演练场
│   │   │   ├── tabs.tsx            # 标签页
│   │   │   ├── steps.tsx           # 步骤组件
│   │   │   ├── accordion.tsx       # 折叠组件
│   │   │   ├── file-tree.tsx       # 目录树
│   │   │   ├── link-card.tsx       # 链接卡片
│   │   │   └── index.tsx           # MDX 组件注册表
│   │   │
│   │   ├── search/                 # 搜索相关
│   │   │   ├── search-dialog.tsx   # 搜索弹窗
│   │   │   └── command-palette.tsx # 命令面板 (Cmd+K)
│   │   │
│   │   └── common/                 # 通用组件
│   │       ├── newsletter.tsx      # 邮件订阅表单
│   │       └── seo.tsx             # SEO JSON-LD
│   │
│   ├── lib/
│   │   ├── utils.ts                # 通用工具函数
│   │   ├── content.ts              # 内容查询工具 (获取文章列表、按标签筛选等)
│   │   └── constants.ts            # 站点常量 (站名、描述、社交链接等)
│   │
│   └── styles/
│       └── mdx.css                 # MDX 内容专用样式 (prose 排版)
│
├── public/
│   ├── favicon.svg
│   ├── favicon.ico
│   ├── og-default.png              # 默认 OG 图片
│   └── images/                     # 公共图片资源
│
├── velite.config.ts                # Velite 内容配置
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
├── Dockerfile
├── docker-compose.yml              # Docker Compose (博客 + Umami)
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD 部署流水线
│
└── DEVELOPMENT.md                  # 本文档
```

---

## 五、技术选型详细说明

### 5.1 内容层：Velite

```bash
npm install velite
```

Velite 配置示例 (`velite.config.ts`)：

```typescript
import { defineConfig, s } from 'velite'

export default defineConfig({
  collections: {
    posts: {
      name: 'Post',
      pattern: 'posts/**/*.mdx',
      schema: s.object({
        title: s.string().max(120),
        description: s.string().max(260),
        date: s.isodate(),
        updated: s.isodate().optional(),
        tags: s.array(s.string()),
        category: s.string(),
        series: s.string().optional(),
        cover: s.image().optional(),
        draft: s.boolean().default(false),
        slug: s.slug('posts'),
        content: s.mdx(),
        metadata: s.metadata(),  // 自动生成阅读时长等
      }),
    },
    projects: {
      name: 'Project',
      pattern: 'projects/**/*.mdx',
      schema: s.object({
        title: s.string(),
        description: s.string(),
        url: s.string().url().optional(),
        repo: s.string().url().optional(),
        tags: s.array(s.string()),
        cover: s.image().optional(),
        slug: s.slug('projects'),
        content: s.mdx(),
      }),
    },
  },
})
```

### 5.2 代码高亮：Shiki + rehype-pretty-code

```bash
npm install shiki rehype-pretty-code
```

特点：
- 与 VS Code 相同的 TextMate 语法引擎
- 构建时静态渲染（零客户端 JS）
- 支持行高亮、行号、文件名标签
- 主题推荐：`github-dark` / `github-light`（配合暗色模式切换）

### 5.3 主题切换：next-themes

```bash
npm install next-themes
```

- 开箱即用的 Next.js App Router 支持
- 避免主题闪烁（SSR 感知）
- 与 Tailwind CSS `dark:` 类完美配合

### 5.4 评论：Giscus

```bash
npm install @giscus/react
```

前提：
- GitHub 仓库开启 Discussions 功能
- 安装 Giscus GitHub App

### 5.5 RSS：feed

```bash
npm install feed
```

### 5.6 搜索：Pagefind

```bash
npm install -D pagefind
```

集成到构建流程：在 `next build` 后执行 `pagefind --site .next` 生成索引。

### 5.7 分析：Umami

通过 Docker Compose 自部署：

```yaml
# docker-compose.yml 片段
services:
  blog:
    build: .
    ports:
      - "8200:8200"

  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    ports:
      - "3001:3000"
    environment:
      DATABASE_URL: postgresql://umami:password@db:5432/umami
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    volumes:
      - umami-data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: umami
      POSTGRES_USER: umami
      POSTGRES_PASSWORD: password

volumes:
  umami-data:
```

---

## 六、开发路线图

### Phase 1：核心内容系统 (MVP)

```
预计工作量：中等

任务清单：
├── 1.1 集成 Velite 内容层
│   ├── 安装配置 velite
│   ├── 定义 Post / Project schema
│   └── 创建内容查询工具函数
│
├── 1.2 抽取公共布局组件
│   ├── 从 page.tsx 抽取 Navbar 组件
│   ├── 从 page.tsx 抽取 Footer 组件
│   └── 在 layout.tsx 中统一使用
│
├── 1.3 博客列表页 (/blog)
│   ├── 文章列表展示（分页）
│   ├── 标签筛选
│   └── PostCard 组件
│
├── 1.4 文章详情页 (/blog/[slug])
│   ├── MDX 内容渲染
│   ├── Shiki 代码高亮
│   ├── 复制代码按钮
│   ├── 目录导航 (TOC)
│   ├── 阅读时长显示
│   └── 上/下篇导航
│
├── 1.5 标签系统
│   ├── /tags 索引页
│   └── /tags/[tag] 筛选页
│
├── 1.6 暗色/亮色主题
│   ├── 集成 next-themes
│   ├── CSS 变量适配
│   └── 主题切换按钮
│
├── 1.7 About 页面 (/about)
│
├── 1.8 Projects 页面 (/projects)
│
├── 1.9 RSS Feed
│   └── /feed.xml 路由处理
│
└── 1.10 撰写首批文章
    ├── 写 2-3 篇真实技术文章
    └── 创建 2-3 个项目介绍
```

### Phase 2：体验增强

```
任务清单：
├── 2.1 Giscus 评论系统
├── 2.2 搜索功能 (Pagefind)
├── 2.3 阅读进度条
├── 2.4 社交分享按钮
├── 2.5 作者卡片
├── 2.6 Newsletter 订阅 (Buttondown)
└── 2.7 系列文章导航
```

### Phase 3：SEO 与基础设施

```
任务清单：
├── 3.1 完善 SEO (Meta / OG / JSON-LD / Sitemap)
├── 3.2 动态 OG 图片生成
├── 3.3 Umami 分析部署
├── 3.4 GitHub Actions CI/CD
├── 3.5 性能优化 (Lighthouse 90+)
└── 3.6 Docker Compose 编排
```

### Phase 4：进阶功能

```
任务清单：
├── 4.1 命令面板 (Cmd+K)
├── 4.2 自定义 MDX 组件库 (Callout, Tabs, Steps 等)
├── 4.3 交互式代码演练场 (Sandpack)
├── 4.4 短笔记系统 (/notes)
├── 4.5 国际化 (i18n)
└── 4.6 View Transitions
```

---

## 七、依赖清单

### 生产依赖（按阶段）

**Phase 1:**
```json
{
  "velite": "MDX 内容处理",
  "shiki": "代码语法高亮",
  "rehype-pretty-code": "代码块增强",
  "next-themes": "暗色/亮色主题",
  "feed": "RSS/Atom 生成"
}
```

**Phase 2:**
```json
{
  "@giscus/react": "评论系统",
  "pagefind": "全文搜索 (devDependency)"
}
```

**Phase 4:**
```json
{
  "cmdk": "命令面板",
  "@codesandbox/sandpack-react": "代码演练场",
  "next-intl": "国际化"
}
```

---

## 八、设计规范

### 8.1 颜色系统

基于当前 Tailwind 配置的 CSS 变量体系，支持亮色/暗色模式：

| 语义色 | 用途 |
|--------|------|
| `--background` / `--foreground` | 页面背景/前景 |
| `--primary` / `--primary-foreground` | 主品牌色 / CTA 按钮 |
| `--secondary` | 次要操作 |
| `--muted` / `--muted-foreground` | 低强调内容 |
| `--accent` | 强调色 (标签、链接hover) |
| `--destructive` | 错误/危险操作 |

品牌渐变色保持现有的 `purple-600 → blue-600`。

### 8.2 排版规范

| 元素 | 字体 | 大小 |
|------|------|------|
| 正文 | Geist Sans | 16px (base) |
| 代码 | Geist Mono | 14px |
| H1 | Geist Sans Bold | 2.25rem |
| H2 | Geist Sans Semibold | 1.875rem |
| H3 | Geist Sans Semibold | 1.5rem |

MDX 内容排版使用 Tailwind Typography (`@tailwindcss/typography`) 的 `prose` 类。

### 8.3 响应式断点

沿用 Tailwind 默认断点：

| 断点 | 像素 | 布局 |
|------|------|------|
| `sm` | 640px | 单栏 |
| `md` | 768px | 双栏 |
| `lg` | 1024px | 三栏（博客列表） |
| `xl` | 1280px | 最大内容宽度 |

---

## 九、内容策略建议

### 9.1 文章分类体系

基于你的技术栈和 2025 年目标，建议的分类：

| 分类 | 内容方向 |
|------|---------|
| **Frontend** | Next.js、React、TypeScript、CSS/Tailwind |
| **Backend** | Node.js、PostgreSQL、API 设计 |
| **DevOps** | Docker、CI/CD、部署实践 |
| **Open Source** | 开源项目介绍与心得 |
| **Thoughts** | 技术思考、职业发展、学习方法 |

### 9.2 项目展示

建议将以下 GitHub 项目纳入 Projects 页面：

- **lumi-draw** — Python 项目 (已有 2 stars)
- **deep-search** — Python 搜索项目
- **finn-dsys** — 本博客项目本身（开源博客代码是技术博客的常见做法）

---

## 十、部署架构

```
                     ┌─────────────────┐
                     │   GitHub Repo   │
                     │   (finn-dsys)   │
                     └────────┬────────┘
                              │ push to main
                              ▼
                     ┌─────────────────┐
                     │ GitHub Actions  │
                     │   CI/CD        │
                     └────────┬────────┘
                              │ build & push image
                              ▼
                     ┌─────────────────┐
                     │  Container      │
                     │  Registry       │
                     │  (GHCR)        │
                     └────────┬────────┘
                              │ pull & deploy
                              ▼
              ┌───────────────────────────────┐
              │         Server                │
              │  ┌─────────┐  ┌────────────┐  │
              │  │  Blog   │  │   Umami    │  │
              │  │ :8200   │  │   :3001    │  │
              │  └─────────┘  └─────┬──────┘  │
              │                     │         │
              │              ┌──────┴──────┐  │
              │              │  PostgreSQL │  │
              │              │   :5432     │  │
              │              └─────────────┘  │
              └───────────────────────────────┘
```

---

## 附录 A：参考资源

### 优秀技术博客

| 博客 | 技术栈 | 亮点 |
|------|--------|------|
| [overreacted.io](https://overreacted.io) | Tailwind, RSS/Atom | 极简、内容至上 |
| [joshwcomeau.com](https://www.joshwcomeau.com) | Next.js 15, MDX, Sandpack | 交互式教学、代码演练场 |
| [leerob.com](https://leerob.com) | Next.js, shadcn/ui, Postgres | 现代简洁，技术栈一致 |
| [taniarascia.com](https://www.taniarascia.com) | Gatsby, React | 分类体系完善 |

### 技术文档

- [Next.js App Router 文档](https://nextjs.org/docs)
- [Velite 文档](https://velite.js.org)
- [rehype-pretty-code](https://rehype-pretty.pages.dev)
- [Giscus](https://giscus.app)
- [Pagefind](https://pagefind.app)
- [Umami](https://umami.is)
- [shadcn/ui](https://ui.shadcn.com)

---

*本文档将随项目推进持续更新。*
