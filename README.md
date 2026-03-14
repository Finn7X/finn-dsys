# Finn Days

个人技术博客，基于 Next.js 构建，原生支持中英双语。

**在线访问：** [finn7x.com](https://finn7x.com)

---

## 技术栈

| 层 | 技术 |
|---|------|
| 框架 | Next.js 16 (App Router) + React 19 + TypeScript |
| 样式 | Tailwind CSS 4 + CSS 变量主题系统 |
| 内容 | Velite + MDX（文件驱动，零数据库）|
| 字体 | Newsreader（衬线标题）+ Noto Serif SC（中文标题）+ JetBrains Mono（代码）|
| 代码高亮 | Shiki + rehype-pretty-code（双主题、行高亮、文件名标签）|
| 国际化 | next-intl（路由级双语，`/` = 中文，`/en` = English）|
| 搜索 | Command Palette (cmdk) |
| 评论 | Giscus (GitHub Discussions) |
| 订阅 | Buttondown Newsletter |
| 分析 | Umami（自托管，隐私友好）|
| 部署 | Docker (node:22-alpine) + GitHub Actions CI/CD |

## 功能

- **双语内容** — 中英文独立写作，非翻译；通过 `translationSlug` 关联对应版本
- **博客系统** — 索引式列表、标签筛选、系列文章导航、阅读时间估算
- **笔记系统** — 短篇技术备忘，按日期分组的时间流
- **项目展示** — 编辑化列表，GitHub/Demo 链接
- **文章排版** — 660px 窄幅阅读区、代码块外扩 740px、衬线标题、1.8 行高
- **MDX 组件** — Callout（三档语义）、Tabs、Steps、Accordion、FileTree、LinkCard、CodePlayground
- **暗色模式** — 蓝调深色背景、三阶层级递进、暖白文字
- **SEO** — Open Graph、JSON-LD 结构化数据、动态 OG 图片、Sitemap、RSS/Atom
- **性能** — standalone 输出、AVIF/WebP 图片、View Transitions

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（Velite watch + Next.js Turbopack）
npm run dev

# 构建生产版本
npm run build

# 启动生产服务（端口 8200）
npm run start
```

## 项目结构

```
├── content/              # MDX 内容
│   ├── blog/             # 博客文章（*.mdx）
│   ├── notes/            # 技术笔记
│   └── projects/         # 项目描述
├── messages/             # i18n 翻译文件（zh.json / en.json）
├── src/
│   ├── app/[locale]/     # 页面路由（首页/博客/笔记/项目/标签/关于）
│   ├── components/       # React 组件
│   │   ├── layout/       #   导航栏、页脚、主题切换、语言切换
│   │   ├── mdx/          #   MDX 自定义组件（Callout, Tabs, Steps...）
│   │   ├── blog/         #   博客相关（阅读进度、分享、作者卡片）
│   │   └── ui/           #   基础 UI（shadcn/ui）
│   ├── config/           # 站点配置（site.ts, about.ts）
│   ├── lib/              # 工具函数（内容查询、Feed生成、SEO）
│   └── i18n/             # 国际化配置
├── Dockerfile            # 多阶段 Docker 构建
├── docker-compose.yml    # Blog + Umami + PostgreSQL
└── .github/workflows/    # CI（lint/typecheck）+ CD（Docker 部署）
```

## 写文章

在 `content/blog/` 下创建 `.mdx` 文件：

```yaml
---
title: "文章标题"
description: "简短描述"
date: "2026-03-15"
tags: ["React", "Next.js"]
locale: zh                    # zh 或 en
translationSlug: my-post      # 关联另一语言版本（可选）
draft: false
---

正文内容，支持所有 MDX 组件...
```

笔记放在 `content/notes/`，项目放在 `content/projects/`，格式类似。

## 部署

```bash
# Docker 构建并启动
docker compose up -d

# 或使用 GitHub Actions 自动部署（推送 v* 标签触发）
git tag v1.0.0 && git push --tags
```

环境变量参见 `.env.example`。

## 许可

MIT

---

[English version](./README.en.md)
