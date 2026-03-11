# Phase 1 实现验收报告（2026-03-10）

## 1. 验收范围
- 对照文档：`docs/superpowers/plans/2026-03-10-phase1-mvp.md`
- 验收对象：当前 `main` 分支 Phase 1 实现与提交（最近提交到 `feat: 实现 RSS 2.0 和 Atom 订阅 Feed`）
- 验收目标：确认完成度、质量风险、可运行性与可发布性

## 2. 验收环境
- 时间：2026-03-10 23:37 CST
- 目录：`/Users/xujifeng/lab/front/finn-days`
- Node/依赖：基于仓库当前 `package.json` 安装状态
- 说明：本次执行了真实构建与 HTTP 冒烟测试

## 3. 执行记录（实际命令）

### 3.1 代码质量/构建
1. `npm run lint`
- 结果：失败
- 输出：`Invalid project directory provided, no such directory: .../lint`

2. `npx eslint .`
- 结果：失败
- 输出：`TypeError: Converting circular structure to JSON`

3. `npm run build`
- 结果：成功
- 关键信息：`velite && next build` 完成；静态路由生成正常
- 警告：`middleware` 文件约定已被 Next.js 标记为 deprecated（建议迁移到 `proxy`）

### 3.2 运行时冒烟（基于 `npx next start -p 8300`）
- `/` -> 200
- `/en` -> 200
- `/blog` -> 200
- `/en/blog` -> 200
- `/blog/hello-world` -> 200
- `/en/blog/hello-world` -> 404（当前仅有 `zh` 示例文章）
- `/tags` -> 200
- `/tags/React` -> 200
- `/tags/Tailwind%20CSS` -> 200
- `/tags/Next.js` -> 404
- `/about` -> 200
- `/en/about` -> 200
- `/projects` -> 200
- `/en/projects` -> 200
- `/feed.xml` -> 200
- `/atom.xml` -> 200
- `/favicon.svg` -> 200
- `/favicon/favicon.svg` -> 404

## 4. 完成度评估（按 Task）

| Task | 结论 | 说明 |
|---|---|---|
| Task 1 依赖安装 + 站点配置 | 通过 | 依赖与 `siteConfig` 已落地 |
| Task 2 Velite 内容系统 | 基本通过 | 内容系统可用；但方案要求的 `next.config.ts` Velite 插件集成未体现（目前依赖脚本 `velite && next build`） |
| Task 3 i18n 路由基础 | 通过 | `next-intl` 路由与 middleware 可工作 |
| Task 4 布局组件 + 主题 | 部分通过 | 组件齐全；但存在 locale 丢失与 favicon 路径问题 |
| Task 5 博客列表页 | 基本通过 | 列表/筛选/分页存在；分页链接实现存在 locale 风险 |
| Task 6 文章详情页 | 部分通过 | 页面可渲染；复制按钮功能未生效，且有多处硬编码文案 |
| Task 7 标签系统 | 部分通过 | 标签页可用；带 `.` 的标签路由失败（严重） |
| Task 8 About 页面 | 通过 | 页面与数据结构已实现 |
| Task 9 Projects 页面 | 通过 | 页面与卡片已实现 |
| Task 10 RSS/Atom | 部分通过 | Feed 可访问；icon/logo URL 配置错误 |

## 5. 主要问题清单（按严重级别）

## P0（发布阻断）
1. 标签路由对常见技术标签（含 `.`）失效
- 现象：`/tags/Next.js` 返回 404，而 `/tags/React` 正常。
- 影响：核心标签功能对常见标签不可用。
- 代码定位：
  - `src/middleware.ts:7` 使用 `.*\..*` 排除规则，导致包含 `.` 的路径绕过 locale 路由。
  - `src/app/[locale]/tags/page.tsx:59` 与 `src/components/post-header.tsx:57` 直接使用 `encodeURIComponent(tag)`。
  - `src/lib/tag-utils.ts:1` 已实现 slug 规则，但未被实际使用。

2. favicon/logo 路径错误，前端与 Feed 引用均指向不存在资源
- 现象：`/favicon/favicon.svg` 为 404，实际有效资源为 `/favicon.svg`。
- 影响：站点图标、订阅器图标、品牌展示异常。
- 代码定位：
  - `src/app/[locale]/layout.tsx:17`
  - `src/components/layout/navbar.tsx:16`
  - `src/lib/feed.ts:14-15`

## P1（高优先级）
1. Lint 流水线不可用，无法作为质量门禁
- 现象：`npm run lint` 和 `npx eslint .` 均失败。
- 影响：无法稳定执行静态检查，CI 质量保障缺失。
- 代码定位：`package.json:9`（`"lint": "next lint"`）

2. i18n 场景下存在 locale 泄漏
- 现象：`/en/blog` 页内仍出现指向 `/blog` 的链接；Logo 点击回到 `/`（默认语言）。
- 影响：英文用户在导航过程中可能被切回默认语言。
- 代码定位：
  - `src/components/layout/navbar.tsx:2,14`（使用 `next/link` 且固定 `href="/"`）
  - `src/components/layout/footer.tsx:1,14-17`（使用 `next/link`）
  - `src/components/pagination.tsx:1` + `src/app/[locale]/blog/page.tsx:141`（分页使用 `next/link` + `basePath="/blog"`）

3. 代码块复制按钮功能未真正生效
- 现象：文章页面代码块区域未渲染复制按钮。
- 原因：`MdxContent` 依赖 `pre` 节点 `raw` 属性，但 Velite 产物中无该属性。
- 代码定位：
  - `src/components/mdx-content.tsx:64-71`
  - `src/components/copy-button.tsx:7-23`

## P2（中优先级）
1. 多处文本/日期格式硬编码，影响双语一致性
- 代码定位示例：
  - `src/components/post-card.tsx:54`（固定 `zh-CN`）
  - `src/components/post-header.tsx:29,38`（固定 `zh-CN`）
  - `src/components/project-card.tsx:57,95,107`（固定 `zh-CN`、`Source/Demo`）
  - `src/components/post-nav.tsx:21,36`（固定中文）
  - `src/components/toc.tsx:48`（固定中文“目录”）
  - `src/app/[locale]/blog/[slug]/not-found.tsx:9-15`（固定中文）

2. 页面 `<html lang>` 未随 locale 设置
- 影响：SEO/可访问性语义不完整。
- 代码定位：`src/app/layout.tsx:20`（`<html suppressHydrationWarning>` 无 `lang`）

## P3（低优先级）
1. Next.js 警告提示 middleware 约定后续需迁移
- 现象：构建时提示 `middleware` 约定 deprecated。
- 代码定位：`src/middleware.ts`

## 6. 验收结论
- 结论：**本轮验收不通过（Fail）**。
- 原因：存在 P0 阻断问题（标签路由与 favicon/feed 图标路径错误），以及多个 P1 质量问题（lint 不可用、locale 泄漏、复制按钮失效）。
- 建议：先修复 P0 + P1 后再发起下一轮验收；P2/P3 可并行排期优化。

## 7. 建议修复顺序
1. 修复标签 slug 方案并全链路统一（生成、路由、反查、页面链接、静态参数）。
2. 统一 favicon/logo 资源路径（站点 metadata、Navbar、Feed）。
3. 修复 lint 方案并在 CI 强制执行。
4. 清理 locale 泄漏（统一使用 i18n `Link`，分页与 logo 走 locale-aware 路由）。
5. 修复代码块复制按钮数据来源（从 `children` 解析原始代码或在编译阶段注入 raw）。
6. 清理硬编码文案/日期格式，补齐 locale 文案映射。
