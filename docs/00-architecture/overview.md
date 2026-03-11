# Finn Days -- 整体架构方案

> 本文档是 Finn Days 博客项目的核心架构设计文档，涵盖技术选型、系统架构、数据流、组件分层、部署方案与开发规范。
> 所有后续阶段文档均以本文档为基础。

---

## 目录

1. [项目愿景与定位](#1-项目愿景与定位)
2. [整体技术架构图](#2-整体技术架构图)
3. [完整技术栈清单](#3-完整技术栈清单)
4. [目标目录结构](#4-目标目录结构)
5. [数据流架构](#5-数据流架构)
6. [路由设计方案](#6-路由设计方案)
7. [组件架构分层](#7-组件架构分层)
8. [状态管理策略](#8-状态管理策略)
9. [样式架构](#9-样式架构)
10. [部署架构](#10-部署架构)
11. [开发规范](#11-开发规范)
12. [四阶段开发路线图](#12-四阶段开发路线图)
13. [依赖管理策略](#13-依赖管理策略)
14. [性能目标与指标](#14-性能目标与指标)

---

## 1. 项目愿景与定位

### 1.1 愿景

Finn Days 是一个面向全球开发者的个人技术博客平台，原生支持中文和英文两种语言，用于发布技术实践分享、记录开发心得、展示个人项目。目标是打造一个**内容至上、体验优雅、长期可维护**的现代化技术博客。

### 1.2 核心价值主张

| 维度 | 目标 |
|------|------|
| **内容** | 高质量技术文章，注重实践性与深度 |
| **体验** | 极致阅读体验，交互式代码演示，零干扰 |
| **工程** | 类型安全、可维护、高性能、自动化部署 |
| **隐私** | 无追踪、无广告、自控数据，尊重读者隐私 |

### 1.3 定位与受众

- **内容方向**: 前端/全栈开发实践、Next.js/React 生态、DevOps 实践、开源项目分享
- **目标受众**: 全球开发者社区（原生支持中文 / English 双语）
- **差异化**: 注重交互体验与代码演示质量，追求极致的阅读体验，原生国际化支持

### 1.4 设计理念参考

| 博客 | 理念 | 借鉴点 |
|------|------|--------|
| overreacted.io (Dan Abramov) | 极简主义，内容至上 | 纯净的阅读体验，零干扰 |
| joshwcomeau.com (Josh Comeau) | 交互优先，视觉教学 | 自定义 MDX 组件、代码演练场 |
| leerob.com (Lee Robinson) | 现代简洁，工程优雅 | Next.js + shadcn/ui 技术栈一致 |
| taniarascia.com (Tania Rascia) | 独立纯粹，无广告无追踪 | 内容分类体系（Blog/Notes/Deep Dives） |

---

## 2. 整体技术架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              用户浏览器                                      │
│                                                                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐ │
│  │  首页     │  │  博客列表  │  │  文章详情  │  │  标签/搜索 │  │  About   │ │
│  │  /        │  │  /blog    │  │/blog/[slug]│  │ /tags     │  │ /about   │ │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘  └──────────┘ │
│       ▲              ▲              ▲              ▲              ▲        │
└───────┼──────────────┼──────────────┼──────────────┼──────────────┼────────┘
        │              │              │              │              │
        └──────────────┴──────────────┴──────────────┴──────────────┘
                                      │
                             ┌────────┴────────┐
                             │   Next.js 16    │
                             │   App Router    │
                             │  (React 19 RSC) │
                             └────────┬────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
              ┌─────┴─────┐   ┌──────┴──────┐   ┌─────┴─────┐
              │   Velite   │   │  shadcn/ui  │   │ Tailwind  │
              │  内容层     │   │  组件层      │   │  CSS 4    │
              │            │   │  Radix UI   │   │  样式层    │
              └─────┬─────┘   └─────────────┘   └───────────┘
                    │
              ┌─────┴─────┐
              │   MDX     │
              │  内容文件   │
              │ (content/) │
              └─────┬─────┘
                    │
         ┌──────────┼──────────┐
         │          │          │
    ┌────┴────┐ ┌───┴───┐ ┌───┴────┐
    │  Shiki  │ │rehype │ │ remark │
    │ 代码高亮 │ │pretty │ │  GFM   │
    └─────────┘ │ code  │ └────────┘
                └───────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                             外部服务集成                                      │
│                                                                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│  │  Giscus   │  │ Pagefind  │  │  Umami    │  │Buttondown │               │
│  │  评论系统  │  │  全文搜索  │  │  数据分析  │  │ Newsletter│               │
│  │ (GitHub   │  │ (客户端   │  │ (自部署   │  │ (邮件订阅) │               │
│  │  Discuss) │  │  静态索引) │  │  Docker)  │  │           │               │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              CI/CD 与部署                                    │
│                                                                             │
│  GitHub Repo ──> GitHub Actions ──> Docker Image ──> GHCR ──> Server       │
│                  (lint/build/push)                            (Docker       │
│                                                               Compose)     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 架构决策要点

| 决策 | 选择 | 理由 |
|------|------|------|
| 渲染模式 | SSG 为主 + SSR 按需 | 博客内容静态化，构建时预渲染，极致性能 |
| 内容管理 | 文件系统 (MDX) | 无需数据库，Git 版本控制，开发者友好 |
| 组件体系 | shadcn/ui (拷贝式) | 完全可控，按需引入，无黑盒依赖 |
| 样式方案 | Tailwind CSS 4 + CSS 变量 | 原子化高效开发，变量驱动主题切换 |
| 部署方式 | Docker 容器化 | 环境一致性，易于 CI/CD 集成 |

---

## 3. 完整技术栈清单

### 3.1 当前已安装 (基础框架)

| 类别 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **框架** | Next.js | 16.1.6 | React 全栈框架，App Router |
| **语言** | TypeScript | 5.x | 类型安全 |
| **UI 运行时** | React | 19.2.4 | UI 渲染引擎 |
| **样式** | Tailwind CSS | 4.2.1 | 原子化 CSS 框架 |
| **CSS 处理** | PostCSS | 8.5.8 | CSS 转换管道 |
| **CSS 动画** | tw-animate-css | 1.0.0 | Tailwind 动画预设 |
| **组件基础** | Radix UI (react-slot) | 1.2.4 | 无样式可访问性原语 |
| **组件变体** | class-variance-authority | 0.7.1 | 组件变体管理 (CVA) |
| **类名工具** | clsx + tailwind-merge | 2.1.1 / 3.5.0 | 条件类名合并与冲突解决 |
| **图标** | Lucide React | 0.577.0 | SVG 图标库 |
| **图标 (Radix)** | @radix-ui/react-icons | 1.3.2 | Radix 图标集 |
| **字体** | Geist Sans / Geist Mono | next/font | 正文与代码字体 |
| **代码检查** | ESLint | 9.x | 代码质量检查 |
| **ESLint 配置** | eslint-config-next | 16.1.6 | Next.js 官方 ESLint 规则 |
| **容器** | Docker (node:22-alpine) | -- | 生产部署环境 |

### 3.2 计划引入 (按阶段)

#### Phase 1 -- 核心内容系统

| 包名 | 用途 | 选型理由 |
|------|------|---------|
| `velite` | MDX 内容处理与类型安全数据层 | 基于 Zod schema 校验，Contentlayer 的现代替代 |
| `shiki` | 代码语法高亮引擎 | VS Code 同款 TextMate 引擎，构建时静态渲染 |
| `rehype-pretty-code` | 代码块增强 (行号/高亮/文件名) | 与 Shiki 深度集成，零客户端 JS |
| `next-themes` | 暗色/亮色主题管理 | SSR 感知无闪烁切换，App Router 原生支持 |
| `feed` | RSS 2.0 / Atom Feed 生成 | 轻量纯函数式 API，无运行时依赖 |
| `@tailwindcss/typography` | MDX 内容排版 (prose 类) | 开箱即用的长文排版，适配暗色模式 |
| `next-intl` | 国际化 (i18n) | App Router 原生支持，类型安全的翻译键，前置集成避免后期路由重构 |

#### Phase 2 -- 体验增强

| 包名 | 用途 | 选型理由 |
|------|------|---------|
| `@giscus/react` | 评论系统 React 组件 | 基于 GitHub Discussions，免费无追踪 |
| `pagefind` (devDep) | 全文搜索引擎 | 构建后生成静态索引，CJK 支持好，< 300KB |

#### Phase 3 -- SEO 与基础设施

| 包名 | 用途 | 选型理由 |
|------|------|---------|
| (Next.js 内置) | Metadata API / Sitemap / Robots | 框架原生支持，零额外依赖 |
| (Next.js 内置) | OG Image 生成 (Satori) | 基于 JSX 的动态图片生成 |

#### Phase 4 -- 进阶功能

| 包名 | 用途 | 选型理由 |
|------|------|---------|
| `cmdk` | 命令面板 (Cmd+K) | pacocoursey 出品，与 Radix UI 一致的设计哲学 |
| `@codesandbox/sandpack-react` | 交互式代码演练场 | CodeSandbox 官方，支持实时编辑与预览 |

---

## 4. 目标目录结构

以下是项目四阶段全部完成后的目标目录结构，带有详细注释。

```
finn-days/
│
├── content/                            # [Phase 1] 内容目录 (MDX 文件)
│   │                                   # 由 Velite 在构建时读取并转换为类型安全的数据
│   ├── posts/                          # 博客文章 (按语言后缀区分)
│   │   ├── getting-started-with-nextjs.zh.mdx
│   │   ├── getting-started-with-nextjs.en.mdx
│   │   ├── tailwind-css-best-practices.zh.mdx
│   │   └── ...
│   ├── projects/                       # 项目介绍
│   │   ├── lumi-draw.mdx
│   │   ├── deep-search.mdx
│   │   └── ...
│   └── notes/                          # [Phase 4] 短笔记 (TIL)
│       ├── til-css-grid.mdx
│       └── ...
│
├── messages/                           # [Phase 1] i18n 翻译文件
│   ├── zh.json                        # 中文 UI 字符串
│   └── en.json                        # 英文 UI 字符串
│
├── src/                                # 源码根目录
│   │
│   ├── i18n/                           # [Phase 1] 国际化配置
│   │   ├── routing.ts                 # 路由配置 (locales, defaultLocale)
│   │   └── request.ts                 # 请求级 locale 解析
│   │
│   ├── middleware.ts                   # [Phase 1] next-intl 语言检测中间件
│   │
│   ├── app/                            # Next.js App Router 页面路由
│   │   ├── layout.tsx                  # 全局最小化布局 (html + body)
│   │   ├── globals.css                 # 全局样式: CSS 变量体系 + Tailwind 导入
│   │   │
│   │   ├── [locale]/                   # [Phase 1] 语言动态段 (zh / en)
│   │   │   ├── layout.tsx              # 语言根布局: NextIntlClientProvider + Navbar + Footer
│   │   │   ├── page.tsx                # 首页: Hero + 最近文章 + 技能展示
│   │   │   ├── not-found.tsx           # 自定义 404 页面
│   │   │   │
│   │   │   ├── blog/                   # [Phase 1] 博客模块
│   │   │   │   ├── page.tsx            # 博客列表页: 分页 + 标签筛选 + PostCard 网格
│   │   │   │   └── [slug]/             # 动态路由: 文章详情
│   │   │   │       ├── page.tsx        # 文章详情页: MDX 渲染 + TOC + 评论
│   │   │   │       └── opengraph-image.tsx # [Phase 3] 动态 OG 图片生成
│   │   │   │
│   │   │   ├── projects/               # [Phase 1] 项目展示
│   │   │   │   └── page.tsx            # 项目卡片网格
│   │   │   │
│   │   │   ├── about/                  # [Phase 1] 关于页面
│   │   │   │   └── page.tsx            # 个人介绍 + 技术栈 + 社交链接
│   │   │   │
│   │   │   ├── tags/                   # [Phase 1] 标签系统
│   │   │   │   ├── page.tsx            # 标签索引: 所有标签 + 文章数量
│   │   │   │   └── [tag]/              # 动态路由: 按标签筛选
│   │   │   │       └── page.tsx        # 标签筛选列表
│   │   │   │
│   │   │   └── notes/                  # [Phase 4] 短笔记
│   │   │       └── page.tsx            # 笔记时间线展示
│   │   │
│   │   ├── sitemap.ts                  # [Phase 3] 动态 Sitemap 生成 (含多语言)
│   │   ├── robots.ts                   # [Phase 3] Robots.txt 配置
│   │   │
│   │   └── feed.xml/                   # [Phase 1] RSS Feed
│   │       └── route.ts               # Route Handler: 按语言生成 RSS 2.0 XML
│   │
│   ├── components/                     # 组件目录 (分层架构)
│   │   │
│   │   ├── ui/                         # [Layer 1] UI 基础层 -- shadcn/ui 组件
│   │   │   ├── button.tsx              # 按钮 (已有)
│   │   │   ├── card.tsx                # 卡片 (已有)
│   │   │   ├── badge.tsx               # [Phase 1] 标签徽章
│   │   │   ├── dialog.tsx              # [Phase 2] 弹窗 (搜索用)
│   │   │   ├── separator.tsx           # [Phase 1] 分隔线
│   │   │   ├── scroll-area.tsx         # [Phase 1] 滚动区域 (TOC 用)
│   │   │   ├── tooltip.tsx             # [Phase 1] 工具提示
│   │   │   └── ...                     # 按需从 shadcn/ui 添加
│   │   │
│   │   ├── layout/                     # [Layer 2] 布局层 -- 页面骨架组件
│   │   │   ├── navbar.tsx              # [Phase 1] 导航栏 (从 page.tsx 抽取)
│   │   │   ├── footer.tsx              # [Phase 1] 页脚 (从 page.tsx 抽取)
│   │   │   ├── theme-toggle.tsx        # [Phase 1] 主题切换按钮 (Sun/Moon 图标)
│   │   │   └── mobile-nav.tsx          # [Phase 1] 移动端导航 (Sheet 侧边栏)
│   │   │
│   │   ├── blog/                       # [Layer 3] 业务层 -- 博客领域组件
│   │   │   ├── post-card.tsx           # [Phase 1] 文章卡片 (列表页使用)
│   │   │   ├── post-header.tsx         # [Phase 1] 文章头部 (标题/日期/标签/阅读时长)
│   │   │   ├── toc.tsx                 # [Phase 1] 目录导航 (滚动高亮当前标题)
│   │   │   ├── reading-progress.tsx    # [Phase 2] 阅读进度条 (页面顶部)
│   │   │   ├── share-buttons.tsx       # [Phase 2] 社交分享按钮
│   │   │   ├── author-card.tsx         # [Phase 2] 作者卡片 (文章底部)
│   │   │   ├── post-navigation.tsx     # [Phase 1] 上一篇/下一篇导航
│   │   │   ├── series-nav.tsx          # [Phase 2] 系列文章导航面板
│   │   │   └── comments.tsx            # [Phase 2] Giscus 评论区
│   │   │
│   │   ├── mdx/                        # [Layer 4] MDX 层 -- 自定义 MDX 组件
│   │   │   ├── callout.tsx             # [Phase 4] 提示框 (info/warning/success/error)
│   │   │   ├── code-block.tsx          # [Phase 1] 代码块 (含复制按钮 + Shiki 集成)
│   │   │   ├── code-playground.tsx     # [Phase 4] Sandpack 代码演练场
│   │   │   ├── tabs.tsx                # [Phase 4] 多标签代码对比
│   │   │   ├── steps.tsx               # [Phase 4] 步骤式教程
│   │   │   ├── accordion.tsx           # [Phase 4] 可折叠内容
│   │   │   ├── file-tree.tsx           # [Phase 4] 目录结构展示
│   │   │   ├── link-card.tsx           # [Phase 4] 外部链接卡片预览
│   │   │   └── index.tsx               # [Phase 1] MDX 组件注册表 (统一导出)
│   │   │
│   │   ├── search/                     # 搜索相关组件
│   │   │   ├── search-dialog.tsx       # [Phase 2] Pagefind 搜索弹窗
│   │   │   └── command-palette.tsx     # [Phase 4] Cmd+K 命令面板
│   │   │
│   │   └── common/                     # 通用业务组件
│   │       ├── newsletter.tsx          # [Phase 2] Newsletter 邮件订阅表单
│   │       └── seo.tsx                 # [Phase 3] JSON-LD 结构化数据
│   │
│   ├── lib/                            # 工具库与业务逻辑
│   │   ├── utils.ts                    # 通用工具 (cn 函数，已有)
│   │   ├── content.ts                  # [Phase 1] 内容查询工具
│   │   │                               #   - getAllPosts() / getPostBySlug()
│   │   │                               #   - getAllTags() / getPostsByTag()
│   │   │                               #   - getAllProjects()
│   │   │                               #   - getAdjacentPosts() (上/下篇)
│   │   └── constants.ts               # [Phase 1] 站点常量
│   │                                   #   - SITE_NAME, SITE_URL, AUTHOR
│   │                                   #   - SOCIAL_LINKS, NAV_ITEMS
│   │                                   #   - POSTS_PER_PAGE
│   │
│   └── styles/
│       └── mdx.css                     # [Phase 1] MDX 内容专用样式
│                                       #   - prose 排版微调
│                                       #   - 代码块样式覆盖
│                                       #   - 暗色模式适配
│
├── public/                             # 静态资源 (直接伺服)
│   ├── favicon.svg                     # 博客 Logo (矢量格式)
│   ├── favicon.ico                     # 兼容格式
│   ├── og-default.png                  # [Phase 3] 默认社交预览图
│   └── images/                         # [Phase 1] 公共图片资源
│       └── ...
│
├── velite.config.ts                    # [Phase 1] Velite 内容层配置
│                                       #   - Post/Project/Note Schema 定义
│                                       #   - MDX 插件链配置 (remark/rehype)
│
├── next.config.ts                      # Next.js 配置 (已有)
├── tsconfig.json                       # TypeScript 配置 (已有)
├── package.json                        # 依赖管理 (已有)
├── postcss.config.mjs                  # PostCSS 配置 (已有)
├── eslint.config.mjs                   # ESLint 配置 (已有)
├── components.json                     # shadcn/ui 配置 (已有, new-york 风格)
├── Dockerfile                          # Docker 多阶段构建 (已有)
├── .dockerignore                       # Docker 忽略文件 (已有)
│
├── docker-compose.yml                  # [Phase 3] Docker Compose 编排
│                                       #   - blog 服务 (:8200)
│                                       #   - umami 分析 (:3001)
│                                       #   - PostgreSQL 数据库 (:5432)
│
├── .github/                            # [Phase 3] GitHub 配置
│   └── workflows/
│       └── deploy.yml                  # CI/CD: lint -> build -> push -> deploy
│
├── docs/                              # 项目文档
│   ├── README.md                      # 文档索引
│   └── 00-architecture/
│       └── overview.md                # 本文档
│
├── DEVELOPMENT.md                     # 开发参考文档 (已有)
└── README.md                          # 项目 README (已有)
```

---

## 5. 数据流架构

### 5.1 内容处理管线 (Build-time)

从 MDX 文件编写到最终页面渲染的完整流程:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        构建时 (Build-time) 数据流                        │
└─────────────────────────────────────────────────────────────────────────┘

  [1] 编写阶段                [2] 构建阶段                [3] 输出阶段
  ═══════════                ═══════════                ═══════════

  content/posts/             velite.config.ts            .velite/
  ┌──────────────┐           ┌──────────────┐           ┌──────────────┐
  │ hello.mdx    │           │  Velite       │           │ posts.json   │
  │              │           │  构建引擎      │           │              │
  │ ---          │──────────>│              │──────────>│ [{           │
  │ title: ...   │           │ 1. 读取 MDX  │           │   title,     │
  │ tags: [...]  │           │ 2. Zod 校验  │           │   slug,      │
  │ ---          │           │ 3. 转换内容  │           │   content,   │
  │              │           │ 4. 生成类型  │           │   tags,      │
  │ # 正文       │           │              │           │   metadata   │
  │ MDX 内容...  │           └──────┬───────┘           │ }, ...]      │
  └──────────────┘                  │                   └──────┬───────┘
                                    │                          │
                              ┌─────┴─────┐                    │
                              │  插件链    │                    │
                              │           │                    │
                              │ remark:   │                    ▼
                              │  - GFM    │           src/lib/content.ts
                              │  - Math   │           ┌──────────────┐
                              │           │           │ 内容查询 API  │
                              │ rehype:   │           │              │
                              │  - Shiki  │           │getAllPosts()  │
                              │  - pretty │           │getBySlug()   │
                              │    code   │           │getByTag()    │
                              │  - slug   │           │getAllTags()   │
                              └───────────┘           └──────┬───────┘
                                                             │
                                                             ▼
                                                      页面组件调用
```

### 5.2 页面渲染流程 (Runtime)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        运行时 (Runtime) 数据流                           │
└─────────────────────────────────────────────────────────────────────────┘

  用户请求 /blog/hello-world
          │
          ▼
  ┌───────────────┐     ┌──────────────────┐     ┌──────────────────┐
  │ Next.js       │     │ [slug]/page.tsx   │     │ content.ts       │
  │ Router        │────>│ (Server Component)│────>│ getPostBySlug()  │
  │               │     │                  │     │                  │
  │ 匹配路由:     │     │ generateStatic   │     │ 从 .velite/      │
  │ /blog/[slug]  │     │ Params() 预生成  │     │ posts.json 读取  │
  └───────────────┘     └────────┬─────────┘     └──────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
            ┌────────────┐ ┌─────────┐ ┌──────────────┐
            │ PostHeader │ │  MDX    │ │  Sidebar     │
            │ (Server)   │ │ Content │ │  (TOC)       │
            │            │ │ (Server)│ │  (Client)    │
            │ - 标题     │ │         │ │              │
            │ - 日期     │ │ - 正文  │ │ - 标题提取   │
            │ - 标签     │ │ - 代码  │ │ - Intersection│
            │ - 阅读时长 │ │ - 图片  │ │   Observer   │
            └────────────┘ └─────────┘ │ - 滚动高亮   │
                                       └──────────────┘
                    │            │            │
                    ▼            ▼            ▼
            ┌─────────────────────────────────────┐
            │          完整 HTML 页面              │
            │    (SSG 预渲染 / 边缘缓存)           │
            └─────────────────────────────────────┘
```

### 5.3 数据流关键原则

| 原则 | 说明 |
|------|------|
| **构建时处理** | 所有 MDX 解析、代码高亮均在 `next build` 阶段完成，零运行时开销 |
| **类型安全** | Velite 通过 Zod Schema 生成 TypeScript 类型，编辑器全程类型提示 |
| **Server Components 优先** | 页面组件默认为 Server Component，仅交互部分 (TOC/评论/搜索) 使用 Client Component |
| **静态生成** | 博客文章使用 `generateStaticParams()` 在构建时预生成所有路由 |
| **增量更新** | 新增文章仅需重新构建，无需数据库迁移 |

---

## 6. 路由设计方案

### 6.1 路由表

> **国际化路由策略**: 采用 `localePrefix: "as-needed"`，默认语言（中文）URL 不含前缀，英文 URL 以 `/en` 为前缀。

| 路由 | 类型 | 渲染方式 | 所属阶段 | 说明 |
|------|------|---------|---------|------|
| `/` (`/zh` 重定向到 `/`) | 页面 | SSG | Phase 1 | 中文首页 |
| `/en` | 页面 | SSG | Phase 1 | 英文首页 |
| `/blog` / `/en/blog` | 页面 | SSG | Phase 1 | 博客列表 (分页 + 标签筛选) |
| `/blog/[slug]` / `/en/blog/[slug]` | 动态页面 | SSG | Phase 1 | 文章详情 (MDX 渲染) |
| `/projects` / `/en/projects` | 页面 | SSG | Phase 1 | 项目展示 |
| `/about` / `/en/about` | 页面 | SSG | Phase 1 | 关于我 |
| `/tags` / `/en/tags` | 页面 | SSG | Phase 1 | 标签索引 |
| `/tags/[tag]` / `/en/tags/[tag]` | 动态页面 | SSG | Phase 1 | 按标签筛选文章 |
| `/notes` / `/en/notes` | 页面 | SSG | Phase 4 | 短笔记列表 |
| `/feed.xml` | Route Handler | 静态 | Phase 1 | RSS 2.0 Feed (含语言参数) |
| `/sitemap.xml` | 元数据文件 | 静态 | Phase 3 | Sitemap (含 hreflang) |
| `/robots.txt` | 元数据文件 | 静态 | Phase 3 | Robots.txt |

### 6.2 动态路由参数生成策略

> **规范**: Next.js 16 中 `params` 和 `searchParams` 均为 `Promise`，必须使用 `await` 解构。全文档统一使用异步写法。

```typescript
// src/app/[locale]/blog/[slug]/page.tsx

// 构建时预生成所有 locale + slug 组合
export async function generateStaticParams() {
  const posts = getAllPosts()  // 从 Velite 数据获取
  return posts.map((post) => ({
    locale: post.locale,
    slug: post.slug,
  }))
}

// 动态生成每篇文章的 Metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const post = getPostBySlug(slug, locale)
  return {
    title: post.title,
    description: post.description,
    openGraph: { ... },
  }
}
```

### 6.3 路由分组与布局策略

```
src/app/
├── layout.tsx              # 全局最小化布局: <html> + <body> + 字体加载
├── globals.css
│
├── [locale]/               # 语言动态段 (zh / en)
│   ├── layout.tsx          # 语言根布局: NextIntlClientProvider + ThemeProvider + Navbar + Footer
│   ├── page.tsx            # 首页
│   │
│   ├── (main)/             # 可选路由分组: 统一的内容区布局
│   │   ├── layout.tsx      # 内容区布局: 最大宽度容器 + 侧边栏槽位
│   │   ├── blog/
│   │   ├── projects/
│   │   ├── about/
│   │   └── tags/
│   └── ...
│
└── feed.xml/               # RSS Feed (不受 locale 路由管控)
    └── route.ts
```

> **注意**: 路由分组 `(main)` 为可选方案。`[locale]` 段是必须的，用于 next-intl 语言路由。

---

## 7. 组件架构分层

### 7.1 四层组件架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Layer 4: MDX 组件层                                                │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Callout  │  CodePlayground  │  Tabs  │  Steps  │  FileTree  │  │
│  │                                                               │  │
│  │  仅在 MDX 内容中使用，通过 mdx/index.tsx 注册                    │  │
│  │  特点: 内容表达专用，不影响页面结构                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│       │ 依赖                                                        │
│       ▼                                                             │
│  Layer 3: 业务组件层                                                │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  PostCard  │  PostHeader  │  TOC  │  Comments  │  AuthorCard  │  │
│  │  SearchDialog  │  Newsletter  │  ShareButtons  │  SeriesNav   │  │
│  │                                                               │  │
│  │  领域特定组件，包含博客业务逻辑                                   │  │
│  │  特点: 组合 UI 层组件，绑定数据模型                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│       │ 依赖                                                        │
│       ▼                                                             │
│  Layer 2: 布局组件层                                                │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Navbar  │  Footer  │  ThemeToggle  │  MobileNav              │  │
│  │                                                               │  │
│  │  页面骨架组件，定义全局视觉结构                                   │  │
│  │  特点: 全站复用，在 layout.tsx 中引用                             │  │
│  └───────────────────────────────────────────────────────────────┘  │
│       │ 依赖                                                        │
│       ▼                                                             │
│  Layer 1: UI 基础层 (shadcn/ui)                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Button  │  Card  │  Badge  │  Dialog  │  Separator  │  ...   │  │
│  │                                                               │  │
│  │  无业务逻辑的纯 UI 原语，基于 Radix UI 构建                      │  │
│  │  特点: 拷贝至项目中完全可控，通过 CVA 管理变体                     │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.2 各层职责与规则

| 层级 | 目录 | 职责 | 导入规则 | Server/Client |
|------|------|------|---------|---------------|
| **Layer 1** UI 层 | `components/ui/` | 无业务逻辑的可复用 UI 原语 | 仅依赖 `lib/utils.ts` 和 Radix | 默认 Server |
| **Layer 2** 布局层 | `components/layout/` | 页面骨架 (导航/页脚/主题切换) | 可依赖 Layer 1 | 按需 Client |
| **Layer 3** 业务层 | `components/blog/` `search/` `common/` | 博客领域组件，包含数据绑定和交互逻辑 | 可依赖 Layer 1 + 2 | 按需 Client |
| **Layer 4** MDX 层 | `components/mdx/` | MDX 内容中使用的自定义组件 | 可依赖 Layer 1 | 多为 Client |

### 7.3 Server / Client Component 划分

```
Server Components (默认)              Client Components ('use client')
━━━━━━━━━━━━━━━━━━━━━━━              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

page.tsx (所有页面)                    ThemeToggle (主题状态)
layout.tsx                            MobileNav (菜单状态)
PostCard                              TOC (Intersection Observer)
PostHeader                            ReadingProgress (scroll 事件)
Footer                                Comments (Giscus 交互)
Navbar (静态部分)                      SearchDialog (输入状态)
AuthorCard                            CommandPalette (键盘事件)
MDX 内容渲染                          Newsletter (表单状态)
                                      CodePlayground (Sandpack)
                                      ShareButtons (复制剪贴板)
                                      CopyButton (代码复制)
```

**原则**: 默认使用 Server Component，仅在需要以下能力时标记 `'use client'`:
- 浏览器 API (Intersection Observer, scroll, clipboard)
- React 状态 (useState, useReducer)
- 事件处理 (onClick, onChange, onKeyDown)
- 第三方客户端库 (Giscus, Sandpack, Pagefind)

---

## 8. 状态管理策略

### 8.1 总体原则

Finn Days 作为内容型静态站点，**不引入全局状态管理库** (如 Redux, Zustand)。所有状态通过以下方式管理:

```
┌──────────────────────────────────────────────────────┐
│                  状态管理分层                          │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │  URL 状态 (Server)                              │ │
│  │  • 当前页面路由: /blog/[slug]                    │ │
│  │  • 标签筛选: /tags/[tag]                        │ │
│  │  • 分页: /blog?page=2                           │ │
│  │  • 管理方式: Next.js App Router + searchParams   │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │  主题状态 (Client, 持久化)                       │ │
│  │  • 暗色/亮色/系统                                │ │
│  │  • 管理方式: next-themes (localStorage 持久化)   │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │  组件局部状态 (Client)                           │ │
│  │  • 移动端菜单开关: useState                      │ │
│  │  • 搜索框开关: useState                          │ │
│  │  • TOC 当前高亮: useState + IntersectionObserver │ │
│  │  • 阅读进度: useState + scroll event            │ │
│  │  • 代码复制反馈: useState + setTimeout           │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │  内容数据 (Build-time, 只读)                     │ │
│  │  • 文章列表、标签集合、项目列表                    │ │
│  │  • 管理方式: Velite 构建输出 -> content.ts 查询   │ │
│  │  • 在 Server Component 中直接 import 使用        │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### 8.2 为什么不需要全局状态

| 常见需求 | 解决方案 | 是否需要全局状态 |
|---------|---------|---------------|
| 文章数据 | Velite 构建输出 + Server Component 直接 import | 否 |
| 主题切换 | next-themes (内置 Context Provider) | 否 (已封装) |
| 路由状态 | URL / searchParams | 否 |
| 搜索 | Pagefind 客户端引擎，Dialog 组件内部状态 | 否 |
| 评论 | Giscus iframe，独立运行 | 否 |
| 用户偏好 | Cookie / localStorage | 否 |

---

## 9. 样式架构

### 9.1 CSS 变量体系

当前 `globals.css` 已建立了完整的语义化 CSS 变量体系 (由 shadcn/ui 生成)。这套变量是全站样式的基础:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CSS 变量层次结构                               │
│                                                                     │
│  Tailwind CSS 4 @theme    ──>   CSS 自定义属性    ──>   组件引用     │
│                                                                     │
│  @theme inline {                :root {                             │
│    --color-background:            --background: 0 0% 100%;          │
│      hsl(var(--background));      --foreground: 0 0% 3.9%;          │
│    --color-primary:               --primary: 0 0% 9%;               │
│      hsl(var(--primary));         --card: 0 0% 100%;                │
│    ...                            ...                               │
│  }                              }                                   │
│                                                                     │
│                                 .dark {                              │
│                                   --background: 0 0% 3.9%;          │
│                                   --foreground: 0 0% 98%;           │
│                                   --primary: 0 0% 98%;              │
│                                   ...                               │
│                                 }                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### 9.2 完整设计 Token

#### 颜色 Token

| Token | 用途 | 亮色模式值 | 暗色模式值 |
|-------|------|-----------|-----------|
| `--background` | 页面背景 | `0 0% 100%` (白色) | `0 0% 3.9%` (近黑) |
| `--foreground` | 主文本色 | `0 0% 3.9%` | `0 0% 98%` |
| `--primary` | 主色调/CTA | `0 0% 9%` | `0 0% 98%` |
| `--secondary` | 次要操作 | `0 0% 96.1%` | `0 0% 14.9%` |
| `--muted` | 低强调背景 | `0 0% 96.1%` | `0 0% 14.9%` |
| `--muted-foreground` | 低强调文本 | `0 0% 45.1%` | `0 0% 63.9%` |
| `--accent` | 强调色 | `0 0% 96.1%` | `0 0% 14.9%` |
| `--destructive` | 错误/警告 | `0 84.2% 60.2%` | `0 62.8% 30.6%` |
| `--border` | 边框 | `0 0% 89.8%` | `0 0% 14.9%` |
| `--input` | 输入框边框 | `0 0% 89.8%` | `0 0% 14.9%` |
| `--ring` | 焦点环 | `0 0% 3.9%` | `0 0% 83.1%` |
| `--chart-1~5` | 图表色板 | 暖色系列 | 冷色系列 |

#### 品牌渐变色

```css
/* Hero 标题渐变 */
bg-gradient-to-r from-purple-600 to-blue-600
```

#### 圆角 Token

| Token | 值 |
|-------|-----|
| `--radius` | `0.5rem` (基准值) |
| `--radius-sm` | `calc(var(--radius) - 4px)` |
| `--radius-md` | `calc(var(--radius) - 2px)` |
| `--radius-lg` | `var(--radius)` |
| `--radius-xl` | `calc(var(--radius) + 4px)` |

### 9.3 Tailwind CSS 4 配置

项目使用 Tailwind CSS 4 的新配置方式 -- 通过 `@theme` 指令在 CSS 文件中定义设计系统，不再依赖 `tailwind.config.ts`:

```css
/* globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));  /* 暗色模式变体: class 策略 */

@theme inline {
  --color-background: hsl(var(--background));
  --color-primary: hsl(var(--primary));
  /* ... 所有语义色映射 */
}
```

**关键配置点**:
- 暗色模式采用 `class` 策略 (`.dark` 类切换)，与 `next-themes` 配合
- 使用 `@theme inline` 将 CSS 变量映射到 Tailwind 颜色工具类
- 通过 `@custom-variant` 定义暗色模式变体选择器

### 9.4 shadcn/ui 样式配置

```json
{
  "style": "new-york",        // new-york 风格 (更紧凑)
  "tailwind": {
    "css": "src/app/globals.css",
    "baseColor": "neutral",    // 中性灰色基调
    "cssVariables": true       // 使用 CSS 变量 (非直接 Tailwind 色值)
  },
  "iconLibrary": "lucide"      // Lucide 图标库
}
```

### 9.5 样式文件组织

```
src/app/globals.css             # 全局样式入口
                                # - Tailwind 导入 (@import "tailwindcss")
                                # - 动画库导入 (@import "tw-animate-css")
                                # - @theme 设计 Token 定义
                                # - :root / .dark CSS 变量
                                # - @layer base 全局基础样式

src/styles/mdx.css              # [Phase 1] MDX 内容排版专用
                                # - @tailwindcss/typography prose 微调
                                # - 代码块容器样式
                                # - 表格/图片响应式处理
                                # - 暗色模式排版适配
```

### 9.6 排版规范

| 元素 | 字体 | 大小 | 行高 |
|------|------|------|------|
| 正文 | Geist Sans (`--font-geist-sans`) | 16px (1rem) | 1.75 |
| 代码 | Geist Mono (`--font-geist-mono`) | 14px (0.875rem) | 1.7 |
| H1 | Geist Sans Bold | 2.25rem (36px) | 1.2 |
| H2 | Geist Sans Semibold | 1.875rem (30px) | 1.3 |
| H3 | Geist Sans Semibold | 1.5rem (24px) | 1.4 |
| 小字 / 日期 | Geist Sans | 0.875rem (14px) | 1.5 |

字体通过 `next/font` 加载，定义为 CSS 变量后在 `<body>` 上应用:

```tsx
// layout.tsx (当前实现)
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
```

### 9.7 响应式断点

沿用 Tailwind CSS 默认断点:

| 断点 | 最小宽度 | 典型设备 | 博客布局 |
|------|---------|---------|---------|
| 默认 | 0px | 手机竖屏 | 单栏，汉堡菜单 |
| `sm` | 640px | 手机横屏 | 单栏 |
| `md` | 768px | 平板 | 双栏博客列表，桌面导航 |
| `lg` | 1024px | 笔记本 | 三栏博客列表，侧边 TOC |
| `xl` | 1280px | 桌面 | 最大内容宽度 (max-w-4xl) |

---

## 10. 部署架构

### 10.1 完整部署拓扑图

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           开发者工作流                                     │
│                                                                          │
│  本地开发                        版本控制                                  │
│  ┌──────────┐                   ┌──────────────┐                         │
│  │ npm run  │   git push        │   GitHub     │                         │
│  │  dev     │──────────────────>│   Repo       │                         │
│  │ :3000    │                   │  (finn-days) │                         │
│  └──────────┘                   └──────┬───────┘                         │
│                                        │                                 │
└────────────────────────────────────────┼─────────────────────────────────┘
                                         │ push to main (触发)
                                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         GitHub Actions CI/CD                             │
│                                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐           │
│  │  Step 1  │    │  Step 2  │    │  Step 3  │    │  Step 4  │           │
│  │          │    │          │    │          │    │          │           │
│  │  Lint    │───>│  Build   │───>│  Docker  │───>│  Push    │           │
│  │  Type    │    │  Next.js │    │  Build   │    │  Image   │           │
│  │  Check   │    │          │    │  Image   │    │  to GHCR │           │
│  └──────────┘    └──────────┘    └──────────┘    └────┬─────┘           │
│                                                       │                 │
└───────────────────────────────────────────────────────┼─────────────────┘
                                                        │
                                                        │ 推送镜像
                                                        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          容器镜像仓库                                      │
│                                                                          │
│  ┌─────────────────────────────────────────────┐                         │
│  │  GitHub Container Registry (ghcr.io)        │                         │
│  │  ghcr.io/finn7x/finn-days:latest            │                         │
│  └──────────────────────┬──────────────────────┘                         │
│                         │                                                │
└─────────────────────────┼────────────────────────────────────────────────┘
                          │ pull image (Watchtower 自动 / SSH 手动)
                          ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          生产服务器                                        │
│                                                                          │
│  Docker Compose 编排                                                      │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │                                                              │        │
│  │  ┌──────────────────┐                                        │        │
│  │  │   Finn Days      │                                        │        │
│  │  │   Blog 服务      │         ┌──────────────────┐           │        │
│  │  │                  │         │   Umami          │           │        │
│  │  │  node:22-alpine  │         │   分析服务        │           │        │
│  │  │  Port: 8200      │         │                  │           │        │
│  │  │                  │         │  Port: 3001      │           │        │
│  │  │  next start      │         │                  │           │        │
│  │  │  -p 8200         │         │  ghcr.io/umami   │           │        │
│  │  └──────────────────┘         └────────┬─────────┘           │        │
│  │                                        │                     │        │
│  │                                ┌───────┴────────┐            │        │
│  │                                │  PostgreSQL    │            │        │
│  │                                │  数据库         │            │        │
│  │                                │                │            │        │
│  │                                │  postgres:16   │            │        │
│  │                                │  -alpine       │            │        │
│  │                                │  Port: 5432    │            │        │
│  │                                │                │            │        │
│  │                                │  Volume:       │            │        │
│  │                                │  umami-data    │            │        │
│  │                                └────────────────┘            │        │
│  │                                                              │        │
│  └──────────────────────────────────────────────────────────────┘        │
│                                                                          │
│  ┌──────────────────────────────────────────┐                            │
│  │  Reverse Proxy (Nginx / Caddy)          │                            │
│  │                                          │                            │
│  │  blog.finn7x.com  ──>  localhost:8200  │                            │
│  │  umami.finn7x.com ──>  localhost:3001  │                            │
│  │                                          │                            │
│  │  + SSL/TLS (Let's Encrypt)              │                            │
│  └──────────────────────────────────────────┘                            │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Docker 构建策略 (当前)

当前 Dockerfile 采用多阶段构建:

```
阶段 1: builder (node:22-alpine)
├── 安装所有依赖 (npm install)
├── 复制源码
└── 构建 Next.js (npm run build)

阶段 2: runner (node:22-alpine)
├── 仅复制生产文件 (.next, public, package.json, node_modules)
├── 设置 NODE_ENV=production
├── 暴露端口 8200
└── 启动: npm start
```

### 10.3 Docker Compose 规划 (Phase 3)

```yaml
# docker-compose.yml (目标)
services:
  blog:
    build: .
    ports:
      - "8200:8200"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    ports:
      - "3001:3000"
    environment:
      DATABASE_URL: postgresql://umami:${UMAMI_DB_PASSWORD}@db:5432/umami
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes:
      - umami-data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: umami
      POSTGRES_USER: umami
      POSTGRES_PASSWORD: ${UMAMI_DB_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U umami"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  umami-data:
```

---

## 11. 开发规范

### 11.1 命名约定

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| **文件名 (组件)** | kebab-case | `post-card.tsx`, `theme-toggle.tsx` |
| **文件名 (工具)** | kebab-case | `utils.ts`, `content.ts` |
| **文件名 (页面)** | Next.js 约定 | `page.tsx`, `layout.tsx`, `not-found.tsx` |
| **组件名** | PascalCase | `PostCard`, `ThemeToggle` |
| **函数名** | camelCase | `getAllPosts()`, `getPostBySlug()` |
| **常量名** | UPPER_SNAKE_CASE | `SITE_NAME`, `POSTS_PER_PAGE` |
| **CSS 变量** | kebab-case | `--background`, `--primary-foreground` |
| **MDX 文件** | kebab-case | `getting-started-with-nextjs.mdx` |
| **Git 分支** | kebab-case, 含类型前缀 | `feat/velite-setup`, `fix/mobile-nav` |
| **路由参数** | camelCase (单数) | `[slug]`, `[tag]` |

### 11.2 文件组织规则

1. **组件文件结构**: 每个组件一个文件，导出默认组件和相关类型
2. **就近原则**: 组件专用的类型/工具放在同一目录下
3. **禁止跨层依赖**: Layer 1 不得 import Layer 3 的组件
4. **路径别名**: 始终使用 `@/` 前缀导入 (已在 tsconfig 中配置 `@/* -> ./src/*`)

```typescript
// 正确
import { Button } from "@/components/ui/button"
import { PostCard } from "@/components/blog/post-card"
import { cn } from "@/lib/utils"

// 错误
import { Button } from "../../components/ui/button"  // 禁止相对路径
import { PostCard } from "@/components/blog/post-card"  // 从 UI 层 import
```

### 11.3 代码风格

| 规则 | 约定 |
|------|------|
| **格式化** | 遵循 ESLint (next/core-web-vitals + next/typescript) |
| **引号** | 双引号 (组件属性) / 单引号 (JS 字符串) -- 遵循现有代码风格 |
| **分号** | 不强制 (遵循 shadcn/ui 默认无分号风格) |
| **缩进** | 4 空格 (遵循当前 page.tsx 的缩进风格) |
| **导入排序** | React -> Next.js -> 第三方 -> 内部模块 -> 类型 |
| **类型** | 优先 `interface`，联合类型用 `type` |
| **注释语言** | 代码注释用中文或英文均可，保持单文件内一致 |

### 11.4 导入排序约定

```typescript
// 1. React / Next.js 内置
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// 2. 第三方库
import { motion } from 'framer-motion'

// 3. 内部组件 (按层级从低到高)
import { Button } from '@/components/ui/button'
import { PostCard } from '@/components/blog/post-card'

// 4. 工具函数 / 常量
import { cn } from '@/lib/utils'
import { siteConfig } from '@/config/site'

// 5. 类型
import type { Post } from '@/types'
```

### 11.5 组件编写模板

```typescript
// src/components/blog/post-card.tsx

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PostCardProps {
    title: string
    description: string
    date: string
    tags: string[]
    slug: string
    readingTime: number
    className?: string
}

export function PostCard({
    title,
    description,
    date,
    tags,
    slug,
    readingTime,
    className,
}: PostCardProps) {
    return (
        <Card className={cn("hover:shadow-lg transition-shadow", className)}>
            <CardContent className="pt-6">
                {/* 组件内容 */}
            </CardContent>
        </Card>
    )
}
```

### 11.6 Git Commit 规范

采用 Conventional Commits 格式:

```
<type>(<scope>): <subject>

<body>        // 可选
<footer>      // 可选
```

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(blog): 添加文章列表页分页功能` |
| `fix` | 修复 | `fix(nav): 修复移动端菜单关闭问题` |
| `refactor` | 重构 | `refactor(layout): 抽取 Navbar 为独立组件` |
| `style` | 样式调整 | `style(card): 调整文章卡片间距` |
| `docs` | 文档 | `docs: 更新架构设计文档` |
| `chore` | 构建/工具 | `chore: 升级 Next.js 至 16.2.0` |
| `perf` | 性能 | `perf(image): 添加图片懒加载` |

---

## 12. 四阶段开发路线图

### 12.1 阶段依赖关系

```
                          ┌──────────────────────┐
                          │     基础框架 (已完成)   │
                          │                      │
                          │ Next.js + shadcn/ui   │
                          │ 首页 + 导航 + Docker  │
                          └──────────┬───────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
        ┌───────────────┐  ┌──────────────┐  ┌──────────────┐
        │   Phase 1     │  │  Phase 1     │  │  Phase 1     │
        │   (内容系统)   │  │  (页面路由)   │  │  (主题/RSS)  │
        │               │  │              │  │              │
        │ Velite 集成   │  │ 布局抽取     │  │ next-themes  │
        │ Schema 定义   │  │ Blog 页面    │  │ RSS Feed    │
        │ 内容查询 API  │  │ Tags 页面    │  │              │
        │               │  │ About/Proj   │  │              │
        └───────┬───────┘  └──────┬───────┘  └──────┬───────┘
                │                 │                  │
                └─────────────────┼──────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
        ┌───────────────┐ ┌────────────┐ ┌────────────┐
        │   Phase 2     │ │  Phase 2   │ │  Phase 2   │
        │   (评论/搜索)  │ │  (阅读体验) │ │  (互动)    │
        │               │ │            │ │            │
        │ Giscus 评论   │ │ 进度条     │ │ 分享按钮   │
        │ Pagefind 搜索 │ │ 系列导航   │ │ 作者卡片   │
        │               │ │            │ │ Newsletter │
        └───────┬───────┘ └─────┬──────┘ └─────┬──────┘
                │               │               │
                └───────────────┼───────────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                    ▼           ▼           ▼
        ┌───────────────┐ ┌──────────┐ ┌──────────┐
        │   Phase 3     │ │ Phase 3  │ │ Phase 3  │
        │   (SEO)       │ │ (分析)   │ │ (CI/CD)  │
        │               │ │          │ │          │
        │ Meta/OG/LD   │ │ Umami    │ │ Actions  │
        │ Sitemap      │ │ Docker   │ │ 自动部署  │
        │ OG Image     │ │ Compose  │ │ 性能优化  │
        └───────┬───────┘ └────┬─────┘ └────┬─────┘
                │              │             │
                └──────────────┼─────────────┘
                               │
                    ┌──────────┼──────────┐
                    │          │          │
                    ▼          ▼          ▼
        ┌───────────────┐ ┌────────┐ ┌──────────┐
        │   Phase 4     │ │Phase 4 │ │ Phase 4  │
        │   (MDX 增强)   │ │(Cmd+K) │ │ (其他)   │
        │               │ │        │ │          │
        │ Callout/Tabs  │ │命令面板 │ │ Notes   │
        │ Sandpack      │ │        │ │ View    │
        │ FileTree      │ │        │ │ Transit │
        │               │ │        │ │ Admin   │
        └───────────────┘ └────────┘ └──────────┘
```

### 12.2 Phase 1: 核心内容系统 (MVP)

> **目标**: 能够发布和展示博客文章的最小可用版本，原生支持中英双语

| # | 任务 | 预计工作量 | 前置依赖 | 产出 |
|---|------|-----------|---------|------|
| 1.1 | 集成 Velite 内容层 | 中 | 无 | `velite.config.ts` |
| 1.2 | 定义 Post/Project Schema (含 `locale` 字段) | 小 | 1.1 | Zod Schema + TypeScript 类型 |
| 1.3 | 创建内容查询 API (按语言筛选) | 中 | 1.2 | `src/lib/content.ts` (唯一查询入口) |
| 1.4 | 集成 next-intl 国际化基础 | 中 | 无 | `src/i18n/`, `messages/`, `middleware.ts` |
| 1.5 | 建立 `[locale]` 路由结构 | 中 | 1.4 | `app/[locale]/layout.tsx` |
| 1.6 | 抽取 Navbar 组件 (含 LanguageSwitcher) | 小 | 1.4, 1.5 | `components/layout/navbar.tsx` |
| 1.7 | 抽取 Footer 组件 | 小 | 无 | `components/layout/footer.tsx` |
| 1.8 | 重构 page.tsx (首页) | 中 | 1.3, 1.5 | 从 Velite 读取真实数据，支持双语 |
| 1.9 | 博客列表页 | 中 | 1.3 | `app/[locale]/blog/page.tsx`, `PostCard` |
| 1.10 | 文章详情页 | 大 | 1.3 | `app/[locale]/blog/[slug]/page.tsx` |
| 1.11 | Shiki 代码高亮集成 | 中 | 1.10 | rehype-pretty-code 配置 |
| 1.12 | TOC 目录导航 | 中 | 1.10 | `components/blog/toc.tsx` |
| 1.13 | 标签系统 | 中 | 1.3 | `app/[locale]/tags/`, Badge 组件 |
| 1.14 | 暗色/亮色主题 | 中 | 1.5 | next-themes + ThemeToggle |
| 1.15 | About 页面 | 小 | 1.5 | `app/[locale]/about/page.tsx` |
| 1.16 | Projects 页面 | 小 | 1.3, 1.5 | `app/[locale]/projects/page.tsx` |
| 1.17 | RSS Feed | 小 | 1.3 | `app/feed.xml/route.ts` |
| 1.18 | 撰写首批文章 (中英文各 1-2 篇) | 中 | 1.10 | MDX 文章 |

**里程碑**: 博客可上线，支持中英双语、文章发布、代码高亮、标签分类、主题切换、RSS 订阅

### 12.3 Phase 2: 体验增强

> **目标**: 提升阅读体验与用户互动性

| # | 任务 | 预计工作量 | 前置依赖 | 产出 |
|---|------|-----------|---------|------|
| 2.1 | Giscus 评论系统 | 小 | Phase 1 | `components/blog/comments.tsx` |
| 2.2 | 客户端搜索 | 中 | Phase 1 | `components/search/search-dialog.tsx`, `lib/pagefind.ts` |
| 2.3 | 阅读进度条 | 小 | Phase 1 | `components/blog/reading-progress.tsx` |
| 2.4 | 社交分享按钮 | 小 | Phase 1 | `components/blog/share-buttons.tsx` |
| 2.5 | 作者卡片 | 小 | Phase 1 | `components/blog/author-card.tsx` |
| 2.6 | Newsletter 订阅 | 中 | Phase 1 | `components/common/newsletter.tsx` |
| 2.7 | 系列文章导航 | 中 | Phase 1 | `components/blog/series-nav.tsx` |

**里程碑**: 完整的博客阅读体验，包含互动功能

### 12.4 Phase 3: SEO 与基础设施

> **目标**: 搜索引擎优化与运维自动化

| # | 任务 | 预计工作量 | 前置依赖 | 产出 |
|---|------|-----------|---------|------|
| 3.1 | SEO 元标签优化 | 中 | Phase 1 | generateMetadata 完善 |
| 3.2 | JSON-LD 结构化数据 | 小 | 3.1 | `components/common/seo.tsx` |
| 3.3 | Sitemap / Robots | 小 | Phase 1 | `app/sitemap.ts`, `app/robots.ts` |
| 3.4 | 动态 OG 图片 | 中 | 3.1 | `opengraph-image.tsx` |
| 3.5 | Umami 分析部署 | 中 | 无 | Docker Compose + 追踪脚本 |
| 3.6 | GitHub Actions CI/CD | 中 | 无 | `.github/workflows/deploy.yml` |
| 3.7 | 性能优化 | 中 | Phase 1 | Lighthouse 90+ |
| 3.8 | Docker Compose 编排 | 小 | 3.5 | `docker-compose.yml` |

**里程碑**: 搜索引擎友好，自动化部署，数据分析就位

### 12.5 Phase 4: 进阶功能

> **目标**: 差异化特色功能与管理后台

| # | 任务 | 预计工作量 | 前置依赖 | 产出 |
|---|------|-----------|---------|------|
| 4.1 | 命令面板 (Cmd+K) | 中 | Phase 2 (搜索) | `components/search/command-palette.tsx` |
| 4.2 | MDX 组件库 | 大 | Phase 1 | `components/mdx/*.tsx` |
| 4.3 | Sandpack 代码演练场 | 大 | 4.2 | `components/mdx/code-playground.tsx` |
| 4.4 | 短笔记系统 | 中 | Phase 1 | `content/notes/`, `app/[locale]/notes/` |
| 4.5 | View Transitions | 小 | Phase 1 | CSS + JS API 集成 |
| 4.6 | 后台管理系统 (Admin Dashboard) | 大 | Phase 3 | `next-auth` + `recharts` + 管理页面 |

**里程碑**: 差异化功能完成，博客具备独特竞争力

---

## 13. 依赖管理策略

### 13.1 依赖引入原则

1. **按需引入**: 仅在进入对应阶段时安装依赖，避免前期过度安装
2. **轻量优先**: 优先选择包体积小、零依赖的库
3. **活跃维护**: 只选择有活跃维护的包，避免停维风险 (如 Contentlayer)
4. **框架一致**: 优先使用与 Next.js / Radix UI / Tailwind 生态兼容的库

### 13.2 各阶段完整包清单

#### 当前已安装

```
生产依赖 (dependencies):
├── next@16.1.6
├── react@19.2.4
├── react-dom@19.2.4
├── @radix-ui/react-icons@1.3.2
├── @radix-ui/react-slot@1.2.4
├── class-variance-authority@0.7.1
├── clsx@2.1.1
├── lucide-react@0.577.0
├── tailwind-merge@3.5.0
└── tw-animate-css@1.0.0

开发依赖 (devDependencies):
├── @eslint/eslintrc@3.3.5
├── @tailwindcss/postcss@4.2.1
├── @types/node@22.x
├── @types/react@19.x
├── @types/react-dom@19.x
├── eslint@9.x
├── eslint-config-next@16.1.6
├── postcss@8.5.8
├── tailwindcss@4.2.1
└── typescript@5.x
```

#### Phase 1 新增

```bash
# 生产依赖
npm install velite shiki rehype-pretty-code next-themes feed next-intl

# 可能的额外 remark/rehype 插件
npm install remark-gfm rehype-slug rehype-autolink-headings

# 开发依赖
npm install -D @tailwindcss/typography
```

| 包 | 估计体积 | 类型 |
|----|---------|------|
| velite | ~200KB | prod |
| shiki | ~1.5MB (含语法/主题文件) | prod |
| rehype-pretty-code | ~30KB | prod |
| next-themes | ~10KB | prod |
| feed | ~25KB | prod |
| next-intl | ~30KB | prod |
| @tailwindcss/typography | ~15KB | dev |
| remark-gfm | ~20KB | prod |
| rehype-slug | ~5KB | prod |
| rehype-autolink-headings | ~10KB | prod |

#### Phase 2 新增

```bash
npm install @giscus/react
```

| 包 | 估计体积 | 类型 |
|----|---------|------|
| @giscus/react | ~5KB | prod |

> **注意**：搜索功能采用了客户端数组过滤方案（利用 Velite 已有数据），而非最初规划的 Pagefind，因此无需安装 `pagefind` 依赖。如果未来文章数量增长到数百篇，可再考虑迁移到 Pagefind。

#### Phase 3 新增

```
无新 npm 包 -- 全部使用 Next.js 内置功能 + Docker 镜像
```

#### Phase 4 新增

```bash
npm install cmdk @codesandbox/sandpack-react next-auth@beta recharts @monaco-editor/react
```

| 包 | 估计体积 | 类型 |
|----|---------|------|
| cmdk | ~15KB | prod |
| @codesandbox/sandpack-react | ~500KB | prod |
| next-auth@beta | ~100KB | prod |
| recharts | ~400KB | prod |
| @monaco-editor/react | ~15KB (加载器，Monaco 核心 CDN 按需加载) | prod |

### 13.3 依赖更新策略

- **安全补丁**: 立即更新 (npm audit fix)
- **次要版本**: 每月检查一次 (npm outdated)
- **主要版本**: 评估破坏性变更后手动升级
- **锁文件**: 始终提交 `package-lock.json` 确保构建一致性

---

## 14. 性能目标与指标

### 14.1 Lighthouse 目标分数

| 指标 | 目标 | 当前基准 |
|------|------|---------|
| **Performance** | >= 95 | 待测 |
| **Accessibility** | >= 95 | 待测 |
| **Best Practices** | >= 95 | 待测 |
| **SEO** | >= 95 | 待测 |

### 14.2 Core Web Vitals 目标

| 指标 | 目标 | 说明 |
|------|------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 最大内容元素渲染时间 |
| **FID** (First Input Delay) / **INP** (Interaction to Next Paint) | < 100ms | 交互响应延迟 |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 累计布局偏移 |
| **TTFB** (Time to First Byte) | < 800ms | 首字节时间 |
| **FCP** (First Contentful Paint) | < 1.8s | 首次内容渲染 |

### 14.3 性能优化策略

| 策略 | 实现方式 | 阶段 |
|------|---------|------|
| **静态生成** | SSG + `generateStaticParams()` | Phase 1 |
| **字体优化** | `next/font` 自托管 (避免 FOUT/FOIT) | 已实现 |
| **图片优化** | `next/image` (WebP/AVIF, 懒加载, 响应式) | Phase 1 |
| **代码分割** | 动态导入 `next/dynamic` (Giscus, Sandpack 等重组件) | Phase 2 |
| **JS 最小化** | Server Components 默认，减少客户端 JS | Phase 1 |
| **CSS 最小化** | Tailwind CSS 自动 purge 未用类 | 已实现 |
| **缓存策略** | 静态资源 immutable 缓存，页面 ISR | Phase 3 |
| **预加载** | `<Link prefetch>` 预加载可见链接 | Phase 1 |
| **搜索轻量化** | 客户端内存过滤，无额外索引加载 | Phase 2 |
| **评论懒加载** | Giscus iframe 延迟加载 (IntersectionObserver) | Phase 2 |

### 14.4 性能预算

| 资源类型 | 预算 (gzip) |
|---------|-------------|
| 首页 HTML + JS | < 100KB |
| 文章页 HTML + JS | < 150KB |
| 首屏 CSS | < 30KB |
| 字体文件 | < 100KB (Geist Sans + Mono) |
| 首页总传输大小 | < 300KB |
| 文章页总传输大小 | < 500KB (含代码高亮主题) |

### 14.5 监控方式

| 工具 | 用途 | 阶段 |
|------|------|------|
| Chrome DevTools Lighthouse | 开发时性能审计 | 持续 |
| Umami | 真实用户访问数据 | Phase 3 |
| GitHub Actions | 自动化 Lighthouse CI | Phase 3 |
| Web Vitals (next/web-vitals) | Core Web Vitals 上报 | Phase 3 |

---

*本文档是 Finn Days 项目的架构基线，所有后续开发应遵循本文档的设计决策。如需修改架构决策，应先更新本文档并记录变更原因。*

*最后更新: 2026-03-12*
