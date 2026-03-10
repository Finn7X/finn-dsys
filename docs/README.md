# Finn Days -- 项目文档中心

> **Finn Days** 是一个基于 Next.js 16 + TypeScript + Tailwind CSS 构建的现代化个人技术博客。
> 本文档中心是所有项目文档的入口索引，帮助开发者快速了解项目全貌、找到所需文档。

---

## 项目概览

| 属性 | 值 |
|------|-----|
| **项目名称** | Finn Days |
| **定位** | 个人技术博客 -- 内容至上、体验优雅、长期可维护 |
| **核心技术栈** | Next.js 16.1.6 (App Router) / TypeScript / Tailwind CSS 4.2.1 / shadcn/ui |
| **部署方式** | Docker (node:22-alpine)，端口 8200 |
| **作者** | Finn7X ([xujifennng@gmail.com](mailto:xujifennng@gmail.com)) |
| **GitHub** | [https://github.com/Finn7X](https://github.com/Finn7X) |

---

## 文档目录结构

```
docs/
├── README.md                          # 本文件 -- 文档导航索引
│
├── 00-architecture/                   # 架构设计
│   └── overview.md                    # 整体架构方案（技术栈、目录结构、数据流、部署架构等）
│
├── 01-phase1-mvp/                     # Phase 1: 核心内容系统 (MVP)
│   ├── velite-setup.md                # Velite 内容管理系统集成指南
│   ├── layout-extraction.md           # 公共布局抽取（Navbar/Footer/ThemeToggle）
│   ├── blog-pages.md                  # 博客列表页与详情页实现
│   ├── tag-system.md                  # 标签系统设计与实现
│   ├── theme-switching.md             # 暗色/亮色主题切换
│   ├── about-projects.md              # About 页与 Projects 页
│   └── rss-feed.md                    # RSS/Atom 订阅功能
│
├── 02-phase2-enhancement/             # Phase 2: 体验增强
│   ├── giscus-comments.md             # Giscus 评论系统集成
│   ├── pagefind-search.md             # Pagefind 全文搜索
│   ├── reading-progress.md            # 阅读进度条
│   ├── social-sharing.md              # 社交分享功能
│   ├── author-card.md                 # 作者卡片组件
│   ├── newsletter.md                  # Newsletter 邮件订阅
│   └── series-navigation.md           # 系列文章导航
│
├── 03-phase3-seo-infra/               # Phase 3: SEO 与基础设施
│   ├── seo-optimization.md            # SEO 优化方案（Meta/OG/JSON-LD/Sitemap）
│   ├── og-image-generation.md         # 动态 OG 图片生成
│   ├── umami-analytics.md             # Umami 分析部署
│   ├── ci-cd-pipeline.md              # GitHub Actions CI/CD
│   ├── performance.md                 # 性能优化策略
│   ├── docker-compose.md              # Docker Compose 编排
│   └── admin-dashboard.md             # 后台管理系统（Dashboard + 文章管理）
│
├── 04-phase4-advanced/                # Phase 4: 进阶功能
│   ├── command-palette.md             # 命令面板 (Cmd+K)
│   ├── mdx-components.md              # 自定义 MDX 组件库
│   ├── sandpack-playground.md         # Sandpack 代码演练场
│   ├── notes-system.md                # 短笔记系统
│   ├── i18n.md                        # 国际化方案
│   └── view-transitions.md            # View Transitions 动画
│
└── 05-references/                     # 参考资料
    ├── tech-blogs-research.md         # 优秀技术博客调研
    └── dependency-matrix.md           # 完整依赖矩阵
```

---

## 文档索引

### 架构设计

| 文档 | 路径 | 说明 |
|------|------|------|
| **整体架构方案** | [00-architecture/overview.md](./00-architecture/overview.md) | 项目核心文档。包含技术架构图、技术选型理由、目录结构、数据流、路由设计、组件分层、样式体系、部署拓扑、开发规范、四阶段路线图及性能目标 |

### Phase 1: 核心内容系统 (MVP)

| 文档 | 路径 | 说明 |
|------|------|------|
| Velite 集成 | [01-phase1-mvp/velite-setup.md](./01-phase1-mvp/velite-setup.md) | Velite 安装配置、Schema 定义、内容查询 API |
| 布局抽取 | [01-phase1-mvp/layout-extraction.md](./01-phase1-mvp/layout-extraction.md) | 从 page.tsx 抽取 Navbar/Footer 至独立组件 |
| 博客页面 | [01-phase1-mvp/blog-pages.md](./01-phase1-mvp/blog-pages.md) | 列表页分页、详情页 MDX 渲染、代码高亮、TOC |
| 标签系统 | [01-phase1-mvp/tag-system.md](./01-phase1-mvp/tag-system.md) | 标签索引页与标签筛选页 |
| 主题切换 | [01-phase1-mvp/theme-switching.md](./01-phase1-mvp/theme-switching.md) | next-themes 集成与 CSS 变量适配 |
| About/Projects | [01-phase1-mvp/about-projects.md](./01-phase1-mvp/about-projects.md) | About 页面与项目展示页 |
| RSS 订阅 | [01-phase1-mvp/rss-feed.md](./01-phase1-mvp/rss-feed.md) | RSS 2.0 / Atom Feed 生成 |

### Phase 2: 体验增强

| 文档 | 路径 | 说明 |
|------|------|------|
| 评论系统 | [02-phase2-enhancement/giscus-comments.md](./02-phase2-enhancement/giscus-comments.md) | Giscus 集成、主题同步、懒加载 |
| 全文搜索 | [02-phase2-enhancement/pagefind-search.md](./02-phase2-enhancement/pagefind-search.md) | Pagefind 索引构建与搜索 UI |
| 阅读进度条 | [02-phase2-enhancement/reading-progress.md](./02-phase2-enhancement/reading-progress.md) | 滚动感知的顶部进度条 |
| 社交分享 | [02-phase2-enhancement/social-sharing.md](./02-phase2-enhancement/social-sharing.md) | Twitter/LinkedIn 分享与链接复制 |
| 作者卡片 | [02-phase2-enhancement/author-card.md](./02-phase2-enhancement/author-card.md) | 文章底部作者信息展示 |
| Newsletter | [02-phase2-enhancement/newsletter.md](./02-phase2-enhancement/newsletter.md) | Buttondown 邮件订阅集成 |
| 系列导航 | [02-phase2-enhancement/series-navigation.md](./02-phase2-enhancement/series-navigation.md) | 系列文章的关联导航 |

### Phase 3: SEO 与基础设施

| 文档 | 路径 | 说明 |
|------|------|------|
| SEO 优化 | [03-phase3-seo-infra/seo-optimization.md](./03-phase3-seo-infra/seo-optimization.md) | Meta 标签、OG、JSON-LD、Sitemap、Robots |
| OG 图片生成 | [03-phase3-seo-infra/og-image-generation.md](./03-phase3-seo-infra/og-image-generation.md) | 动态生成品牌化社交预览图 |
| Umami 分析 | [03-phase3-seo-infra/umami-analytics.md](./03-phase3-seo-infra/umami-analytics.md) | Umami 自部署与 Docker Compose 配置 |
| CI/CD | [03-phase3-seo-infra/ci-cd-pipeline.md](./03-phase3-seo-infra/ci-cd-pipeline.md) | GitHub Actions 自动构建与部署 |
| 性能优化 | [03-phase3-seo-infra/performance.md](./03-phase3-seo-infra/performance.md) | Lighthouse 90+ 达成策略 |
| Docker Compose | [03-phase3-seo-infra/docker-compose.md](./03-phase3-seo-infra/docker-compose.md) | 多服务编排方案 |
| 后台管理系统 | [03-phase3-seo-infra/admin-dashboard.md](./03-phase3-seo-infra/admin-dashboard.md) | Dashboard 仪表盘、文章管理、Auth.js 认证、Umami API 集成 |

### Phase 4: 进阶功能

| 文档 | 路径 | 说明 |
|------|------|------|
| 命令面板 | [04-phase4-advanced/command-palette.md](./04-phase4-advanced/command-palette.md) | Cmd+K 全局导航与搜索 |
| MDX 组件库 | [04-phase4-advanced/mdx-components.md](./04-phase4-advanced/mdx-components.md) | Callout/Tabs/Steps/FileTree 等自定义组件 |
| 代码演练场 | [04-phase4-advanced/sandpack-playground.md](./04-phase4-advanced/sandpack-playground.md) | Sandpack 实时代码编辑与预览 |
| 短笔记系统 | [04-phase4-advanced/notes-system.md](./04-phase4-advanced/notes-system.md) | TIL/Notes 轻量内容形式 |
| 国际化 | [04-phase4-advanced/i18n.md](./04-phase4-advanced/i18n.md) | 中英双语支持方案 |
| View Transitions | [04-phase4-advanced/view-transitions.md](./04-phase4-advanced/view-transitions.md) | 页面间平滑过渡动画 |

### 参考资料

| 文档 | 路径 | 说明 |
|------|------|------|
| 博客调研 | [05-references/tech-blogs-research.md](./05-references/tech-blogs-research.md) | 业界优秀技术博客的设计分析 |
| 依赖矩阵 | [05-references/dependency-matrix.md](./05-references/dependency-matrix.md) | 各阶段依赖包清单与版本 |

---

## 开发阶段总览

```
Phase 1 (MVP)                Phase 2 (体验增强)         Phase 3 (SEO/基础设施)     Phase 4 (进阶)
━━━━━━━━━━━━━━━━━━━━         ━━━━━━━━━━━━━━━━━━         ━━━━━━━━━━━━━━━━━━━━       ━━━━━━━━━━━━━━━

[Velite 内容系统]             [Giscus 评论]              [SEO 优化]                 [命令面板 Cmd+K]
[布局组件抽取]                [Pagefind 搜索]            [OG 图片生成]              [MDX 组件库]
[博客列表/详情页]             [阅读进度条]               [Umami 分析]               [Sandpack 演练场]
[标签系统]                    [社交分享]                 [CI/CD 流水线]             [短笔记系统]
[主题切换]                    [作者卡片]                 [性能优化]                 [i18n 国际化]
[About/Projects 页]           [Newsletter]               [Docker Compose]           [View Transitions]
[RSS 订阅]                    [系列文章导航]             [后台管理系统]

        ──────────────>             ──────────────>             ──────────────>
         依赖 Phase 1               依赖 Phase 1               依赖 Phase 1~2
```

### 各阶段状态

| 阶段 | 状态 | 核心目标 |
|------|------|---------|
| **基础框架** | 已完成 | 项目脚手架、首页、导航栏、Docker |
| **Phase 1** | 待开发 | 能发布和展示博客文章的最小可用版本 |
| **Phase 2** | 待开发 | 提升阅读体验与用户互动性 |
| **Phase 3** | 待开发 | 搜索引擎优化与运维基础设施 |
| **Phase 4** | 待开发 | 差异化特色功能，打造竞争力 |

---

## 快速导航

### 我想了解...

- **项目整体设计** --> [00-architecture/overview.md](./00-architecture/overview.md)
- **当前技术栈与版本** --> [00-architecture/overview.md#完整技术栈清单](./00-architecture/overview.md#完整技术栈清单)
- **目录结构规划** --> [00-architecture/overview.md#目标目录结构](./00-architecture/overview.md#目标目录结构)
- **如何开始 Phase 1 开发** --> [01-phase1-mvp/](./01-phase1-mvp/)
- **部署方案** --> [00-architecture/overview.md#部署架构](./00-architecture/overview.md#部署架构)
- **开发规范与约定** --> [00-architecture/overview.md#开发规范](./00-architecture/overview.md#开发规范)
- **依赖包清单** --> [00-architecture/overview.md#依赖管理策略](./00-architecture/overview.md#依赖管理策略)

### 关键文件快速定位

| 文件 | 路径 | 说明 |
|------|------|------|
| 首页 | `src/app/page.tsx` | 当前包含完整首页（Hero/文章列表/技能/页脚） |
| 根布局 | `src/app/layout.tsx` | Geist 字体加载、全局元数据 |
| 全局样式 | `src/app/globals.css` | CSS 变量体系（亮色/暗色） |
| shadcn 配置 | `components.json` | shadcn/ui 组件配置（new-york 风格） |
| Docker | `Dockerfile` | 多阶段构建（builder + runner） |
| 工具函数 | `src/lib/utils.ts` | cn() 类名合并工具 |
| 开发文档 | `DEVELOPMENT.md` | 详细的功能规划与技术选型（本文档的上游） |

---

*本文档随项目推进持续更新。最后更新：2026-03-09*
