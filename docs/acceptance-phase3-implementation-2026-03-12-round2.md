# Finn Days Phase 3 验收报告（Round 2）

日期: 2026-03-12

## 结论

本轮 **不通过** Phase 3 验收。

与上一轮相比，默认 OG 图片、canonical、`og:locale`、`sitemap.xml` 多语言 alternates、搜索交互和前台运行时稳定性都已有明显改进；但 Phase 3 的核心目标是 SEO 与基础设施闭环，而当前静态页面的 metadata 仍然没有真正做到“页面级 + 语言级”正确输出，这一项仍足以阻塞验收。

## 验收依据

本次主要依据以下文档核对：

- `docs/00-architecture/overview.md`
- `docs/03-phase3-seo-infra/01-seo-optimization.md`
- `docs/03-phase3-seo-infra/02-og-image-generation.md`
- `docs/03-phase3-seo-infra/03-analytics.md`
- `docs/03-phase3-seo-infra/05-performance.md`
- `docs/03-phase3-seo-infra/06-docker-compose.md`

## 本轮执行内容

已完成：

- `npm run lint`
- `npm run build`
- 启动最新构建产物并在 `http://localhost:8200` 回归
- `curl` 检查首页、列表页、详情页、`opengraph-image`、`sitemap.xml`、`robots.txt`、`feed.xml`、`atom.xml`
- Playwright 真实浏览器回归：文章页加载、搜索弹层、搜索结果、控制台 warning/error
- `docker compose config`

受环境限制未完成：

- Docker daemon 当前不可用，无法执行 `docker compose up` 整栈联调
- 未完成 Lighthouse / Core Web Vitals 的量化验收

## 通过项

- `npm run lint` 通过
- `npm run build` 通过
- 根级与 locale 级 OG 图片路由可访问：
  - `/opengraph-image` `200`
  - `/en/opengraph-image` `200`
  - `/blog/hello-world/opengraph-image` `200`
  - `/en/blog/hello-world/opengraph-image` `200`
- 首页与英文首页已输出正确 canonical、`og:locale`、`og:image`、`twitter:image`
- `sitemap.xml` 已包含 `xmlns:xhtml` 和多语言 alternates，中文/英文 URL 集基本一致
- 文章详情页 metadata 正常：
  - canonical 存在
  - `og:url` 指向文章 permalink
  - 文章级 OG 图片存在
  - JSON-LD 正常输出
- `robots.txt`、`feed.xml`、`atom.xml` 均返回 `200`
- Playwright 回归中，文章页搜索弹层可正常打开并搜索 `React`
- 浏览器控制台未发现 error / warning
- `docker compose config` 可解析

## 未通过项

### 1. 静态页面 metadata 仍在复用站点默认值，SEO 没有真正闭合

严重级别：高

问题表现：

- `/blog` 的 canonical 已是 `https://finn7x.com/blog`，但实际输出的 `og:url` 仍是 `https://finn7x.com`
- `/en/blog` 的 canonical 已是 `https://finn7x.com/en/blog`，但实际输出的 `og:url` 仍是 `https://finn7x.com/en`
- `/about`、`/projects`、`/tags` 也存在同样问题，canonical 已切到页面级，但 `og:url` 仍停留在对应 locale 首页
- `/blog`、`/about`、`/projects`、`/tags` 的 `og:title` 仍是 `Finn Days`，`og:description` 仍是全站默认描述，而不是页面自身语义

实测证据：

- `/blog`
  - `<link rel="canonical" href="https://finn7x.com/blog">`
  - `<meta property="og:url" content="https://finn7x.com">`
  - `<meta property="og:title" content="Finn Days">`
- `/en/blog`
  - `<link rel="canonical" href="https://finn7x.com/en/blog">`
  - `<meta property="og:url" content="https://finn7x.com/en">`
  - `<meta property="og:title" content="Finn Days">`
- `/about`
  - `<link rel="canonical" href="https://finn7x.com/about">`
  - `<meta property="og:url" content="https://finn7x.com">`

代码位置：

- `src/app/[locale]/layout.tsx:39-57`
- `src/app/[locale]/blog/page.tsx:13-29`
- `src/app/[locale]/about/page.tsx:10-26`
- `src/app/[locale]/projects/page.tsx:9-24`
- `src/app/[locale]/tags/page.tsx:10-25`

判断：

- 这些页面现在只补了 `canonical`，但没有补齐页面级 `description`、`openGraph.title`、`openGraph.description`、`openGraph.url`
- 结果是 HTML head 中同时存在“当前页面 canonical”和“首页级 Open Graph 标识”，对搜索引擎和社交分享都不一致
- Phase 3 文档明确要求页面具备完整 SEO metadata；当前只能算“修复了一半”

### 2. 中文静态页面的 SEO 文案仍未本地化

严重级别：中

问题表现：

- 中文页面 `/blog` 的 `<title>` 仍是 `Blog | Finn Days`
- 中文页面 `/about` 的 `<title>` 仍是 `About | Finn Days`
- 中文页面 `/projects`、`/tags` 同样沿用英文标题
- 这些页面的 `<meta name="description">` 仍是英文全站描述：`Exploring technology, sharing knowledge, and documenting my journey in web development`

代码位置：

- `src/app/[locale]/blog/page.tsx:20-28`
- `src/app/[locale]/about/page.tsx:17-25`
- `src/app/[locale]/projects/page.tsx:15-23`
- `src/app/[locale]/tags/page.tsx:16-24`
- `src/app/[locale]/layout.tsx:40-62`

判断：

- 当前实现只做了 locale-aware canonical 和 `og:locale`，没有做 locale-aware 的页面标题和描述
- 这与整体架构文档的双语定位以及 SEO 文档中“页面元数据应与页面语义一致”的要求不符

## 已修复并验证通过的上一轮问题

- 根级 `/opengraph-image` 不再是 `404`
- canonical 已补齐
- 英文页 `og:locale` 已修正为 `en_US`
- `sitemap.xml` 已补多语言 alternates
- 搜索事件与 newsletter 事件已接线：
  - `src/components/search/search-dialog.tsx:47-61`
  - `src/components/common/newsletter.tsx:15-25`
- 搜索真实交互可用，前台控制台无报错

## 残余风险

### 1. Umami 代码已接入，但本地环境仍不是“可联调验收态”

现状：

- `src/components/common/analytics.tsx:5-16` 只有在 `NEXT_PUBLIC_UMAMI_URL` 和 `NEXT_PUBLIC_UMAMI_ID` 存在时才会注入脚本
- 本轮 `docker compose config` 仍显示 `NEXT_PUBLIC_UMAMI_URL`、`NEXT_PUBLIC_UMAMI_ID`、`UMAMI_DB_PASSWORD`、`UMAMI_APP_SECRET` 为空

判断：

- 代码级接线这轮已经成立
- 但在当前本地环境下，仍无法完成 pageview、自定义事件和 Umami 面板的整链路验收
- 该项本轮记为“残余风险”，不单独作为新的阻塞项升级

### 2. 性能目标仍缺少量化结果

现状：

- 文档目标包含 Lighthouse 90+ / SEO 100 / Core Web Vitals
- 本轮没有 Lighthouse CI 报表，也未完成 Web Vitals 实测

判断：

- 当前只能确认代码层面已有部分优化和可构建性
- 还不能确认是否达到文档中的量化性能目标

## 建议修复顺序

1. 先为 `/blog`、`/about`、`/projects`、`/tags` 这些静态页补齐页面级 metadata：`description`、`openGraph.title`、`openGraph.description`、`openGraph.url`
2. 再把中文 locale 的 title / description 本地化，不要继续复用英文默认文案
3. 完成后重新回归 `canonical + og:url + og:title + description` 的一致性
4. 有条件时补一次带 Umami 环境变量的整链路验收
5. 最后补 Lighthouse / Web Vitals 量化结果

## 最终判定

**Phase 3 本轮仍不通过。**

主要原因已经收敛为一个核心问题：静态页面 metadata 还没有完成页面级、语言级闭环。这个问题不影响构建和基础访问，但会直接影响 Phase 3 最核心的 SEO 目标，因此仍需继续修复后再验收。
