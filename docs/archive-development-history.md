# Finn Days 开发历史归档

> 本文档归档了 2026-03-10 至 2026-03-14 期间全部开发过程文档（原 48 个文件），作为项目知识沉淀。

---

## 技术架构决策

| 决策项 | 选择 | 原因 |
|--------|------|------|
| 框架 | Next.js 16 (App Router) + React 19 | SSG 优先、RSC 支持 |
| 内容系统 | Velite + MDX | 文件驱动、TypeScript 类型安全、Contentlayer 替代 |
| 样式 | Tailwind CSS 4 + CSS 变量 (HSL) | `@theme inline` 暴露 token |
| 组件库 | shadcn/ui + Radix UI | 复制粘贴模式、完全控制 |
| 国际化 | next-intl | 路由级双语（`/` = zh, `/en` = en）|
| 代码高亮 | Shiki + rehype-pretty-code | 双主题、行高亮、文件名标签 |
| 部署 | Docker (node:22-alpine) + GitHub Actions | 端口 8200、standalone 输出 |
| 评论 | Giscus (GitHub Discussions) | 无后端依赖 |
| 搜索 | Command Palette (Radix CommandDialog) | Cmd+K 导航 + 标题搜索 |
| 订阅 | Buttondown API | Server Action 集成 |
| 分析 | Umami (自托管) | 隐私友好 |

---

## Phase 1: MVP（2026-03-10 ~ 03-11）

**构建内容：**
- Velite 内容系统（Post/Note schema，locale + draft 支持）
- i18n 路由中间件（next-intl，zh/en 双路径）
- 核心布局（Navbar / Footer / Logo / 主题切换）
- 博客列表页（分页 + 标签筛选）
- 文章详情页（MDX 渲染、TOC、语法高亮）
- 标签系统（索引页 + 筛选视图）
- About / Projects / RSS+Atom Feed

**遗留问题：** `/tags/Next.js` 因点号匹配 404、favicon 路径错误、i18n locale 泄漏

---

## Phase 2: 功能增强（2026-03-11 ~ 03-12）

**构建内容：**
- Giscus 评论集成
- Pagefind 搜索 + 对话框 UI
- 阅读进度条（IntersectionObserver）
- 社交分享（Twitter/LinkedIn/复制链接）
- 作者卡片（头像 + 社交链接）
- Newsletter 订阅（Buttondown Server Action）
- 系列导航（上一篇/下一篇）

**遗留问题：** 搜索索引只抓到错误页、Giscus 配置占位符未替换、React hydration #418

---

## Phase 3: SEO 与基础设施（2026-03-12）

**构建内容：**
- SEO 元数据（OG tags / JSON-LD 结构化数据）
- 动态 OG 图片生成（Satori/React）
- Umami 分析框架（环境变量门控）
- 动态 XML Sitemap + robots.txt
- GitHub Actions CI/CD（lint → build → Docker push → SSH deploy）
- Docker Compose 本地开发栈

**遗留问题：** 默认 OG 图 404、canonical URL 未实现、英文页面元数据全输出 zh_CN、sitemap 含幽灵 URL

---

## Phase 4: 高级功能（2026-03-13）

**构建内容：**
- Command Palette（Cmd+K 导航搜索）
- MDX 组件库（Callout / Tabs / Steps / Accordion / FileTree / LinkCard / CodePlayground）
- Sandpack 代码沙箱（懒加载 + IntersectionObserver）
- Notes 短笔记系统（时间流列表）
- View Transitions（CSS `::view-transition-*` + reduced-motion 保护）

**遗留问题：** 生产构建 Bus error crash、Command Palette 无 locale 感知、View Transition CSS 通配符在 Turbopack 下解析失败

---

## 设计系统改造（2026-03-14，并行轨道）

**方向：** "AI 生成 shadcn 模板" → "YouMind 审美对齐的技术写作系统"

**已实施：**
- Newsreader 斜体 Logo + Noto Serif SC 中文标题 + JetBrains Mono 代码字体
- 暖白纸张底色 + 蓝调深色暗色模式 + 赤陶色品牌点缀
- 博客列表索引化（日期 + 标题行，按年分组）
- 660px 内容窄幅 + 代码块 740px 外扩
- 导航去毛玻璃去渐变 + Footer 极简化
- Callout 三档语义（note/warning/danger）

**5 轮 commit：** 导航栏/页脚 → 首页 Hero → 内容页面 → 文章排版/MDX → 交互/暗色模式

---

## 架构评审总结（2026-03-10，两轮）

**关键结论：**
- 文档路径不一致（`@/lib/constants` vs `@/config/site`）
- 数据模型字段命名冲突（`draft` vs `published`）
- i18n 应从 Phase 1 前置（已采纳）
- 单一数据源不明确（content.ts / posts.ts / 直接 Velite 导入混用）

---

## 跨阶段未解决的架构张力

1. **Locale 处理不统一** — Phase 1 承诺 i18n 但 Phase 2-4 功能未完全支持
2. **内容模型锁定** — draft/published 字段命名仍在文档和代码间不一致
3. **生产稳定性** — Phase 4 构建崩溃根因未定位
4. **View Transition CSS** — 通配符选择器 `post-title-*` Turbopack 不支持
5. **设计语言执行** — 大量数值偏差待修复（正文 16→17px、H2 24→28px、段落间距 4→24px、代码块边框/背景色 token 错误）

---

*原始文档共 48 个文件（~1.1MB），归档于 2026-03-15。代码即文档，实现细节见 git history。*
