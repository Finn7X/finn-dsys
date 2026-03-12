# Finn Days Phase 3 验收报告

日期: 2026-03-12

## 结论

本轮 **不通过** Phase 3 验收。

阻塞原因不在基础可运行性，而在于 Phase 3 的核心目标是 SEO、分析、CI/CD、性能和基础设施；当前版本虽然已经能正常构建、运行和完成部分前台交互，但仍存在多项会直接影响搜索引擎索引、社交分享、英文页面元数据一致性和分析系统可验收性的缺口。

## 验收范围

本次主要依据以下文档进行核对：

- [docs/00-architecture/overview.md](/Users/xujifeng/lab/front/finn-days/docs/00-architecture/overview.md)
- [docs/03-phase3-seo-infra/01-seo-optimization.md](/Users/xujifeng/lab/front/finn-days/docs/03-phase3-seo-infra/01-seo-optimization.md)
- [docs/03-phase3-seo-infra/02-og-image-generation.md](/Users/xujifeng/lab/front/finn-days/docs/03-phase3-seo-infra/02-og-image-generation.md)
- [docs/03-phase3-seo-infra/03-analytics.md](/Users/xujifeng/lab/front/finn-days/docs/03-phase3-seo-infra/03-analytics.md)
- [docs/03-phase3-seo-infra/04-cicd-pipeline.md](/Users/xujifeng/lab/front/finn-days/docs/03-phase3-seo-infra/04-cicd-pipeline.md)
- [docs/03-phase3-seo-infra/05-performance.md](/Users/xujifeng/lab/front/finn-days/docs/03-phase3-seo-infra/05-performance.md)
- [docs/03-phase3-seo-infra/06-docker-compose.md](/Users/xujifeng/lab/front/finn-days/docs/03-phase3-seo-infra/06-docker-compose.md)

范围说明：

- [docs/00-architecture/overview.md#L1245](/Users/xujifeng/lab/front/finn-days/docs/00-architecture/overview.md#L1245) 明确将 Admin Dashboard 归入 Phase 4。
- [docs/03-phase3-seo-infra/07-admin-dashboard.md](/Users/xujifeng/lab/front/finn-days/docs/03-phase3-seo-infra/07-admin-dashboard.md) 虽然放在 `03-phase3-seo-infra` 目录下，但标题也写的是 “Phase 4: 进阶功能”。
- 因此本次 **不将 `/admin` 未实现计入 Phase 3 阻塞项**，但仍记录为文档归档层面的范围歧义。

## 执行内容

已完成：

- 文档与代码逐项对照
- `npm run lint`
- `npm run build`
- 本地启动最新构建产物并在 `http://localhost:8200` 验证
- `curl` 路由、`robots.txt`、`sitemap.xml`、`feed.xml`、`atom.xml`、OG 图片与 HTML `head` 检查
- Playwright 真实浏览器验收：文章页、搜索弹层、搜索结果、控制台 warning/error
- `docker compose config` 静态校验

受环境限制未完成：

- 未能启动 Docker daemon，因此没有完成 `docker compose up` 的整栈验收
- 未完成 Lighthouse 分数型验收；仓库当前也未见 Lighthouse CI 落地

## 通过项

- `npm run lint` 通过
- `npm run build` 通过
- 站点主路由可访问：`/`、`/en`、`/blog`、`/en/blog`、`/about`、`/en/about`、`/projects`、`/en/projects`、`/tags`、`/en/tags`、`/blog/hello-world`、`/en/blog/hello-world`、`/feed.xml`、`/atom.xml`、`/robots.txt`、`/sitemap.xml`
- 文章页动态 OG 图片可访问：`/blog/hello-world/opengraph-image`、`/en/blog/hello-world/opengraph-image` 返回 `200`
- 文章页已输出 JSON-LD：`BlogPosting` 与 `BreadcrumbList`
- 搜索前台可正常打开、输入关键词并返回结果
- Playwright 浏览器控制台未发现 error / warning
- CI/CD 工作流文件与 Docker Compose 文件已存在，`docker compose config` 可解析

## 未通过项

### 1. 默认 OG 图片链路未闭合，非文章页缺少 `og:image` / `twitter:image`

严重级别：高

问题：

- `http://localhost:8200/opengraph-image` 实测返回 `404`
- 首页、博客列表页、英文首页、英文博客列表页的 HTML `head` 中都没有默认 `og:image` / `twitter:image`
- 这意味着非文章页的社交分享预览并未达到文档要求

代码位置：

- [src/app/opengraph-image.tsx](/Users/xujifeng/lab/front/finn-days/src/app/opengraph-image.tsx)
- [src/middleware.ts#L6](/Users/xujifeng/lab/front/finn-days/src/middleware.ts#L6)
- [src/app/[locale]/layout.tsx#L34](/Users/xujifeng/lab/front/finn-days/src/app/[locale]/layout.tsx#L34)

判断：

- 根因之一是 [src/middleware.ts#L7](/Users/xujifeng/lab/front/finn-days/src/middleware.ts#L7) 的 matcher 会匹配 `/opengraph-image`，从而把它改写到 locale 路径，导致根级元数据图片路由不可达。
- 根因之二是 [src/app/[locale]/layout.tsx#L34](/Users/xujifeng/lab/front/finn-days/src/app/[locale]/layout.tsx#L34) 和 [src/app/[locale]/layout.tsx#L43](/Users/xujifeng/lab/front/finn-days/src/app/[locale]/layout.tsx#L43) 并未配置默认 `images`。

### 2. 页面缺少 canonical，SEO 元标签不完整

严重级别：高

问题：

- 首页、博客列表页、文章页均未输出 `<link rel="canonical">`
- 这与 Phase 3 文档中对 canonical URL 的要求不一致

代码位置：

- [src/app/[locale]/layout.tsx#L60](/Users/xujifeng/lab/front/finn-days/src/app/[locale]/layout.tsx#L60)
- [src/app/[locale]/blog/page.tsx#L12](/Users/xujifeng/lab/front/finn-days/src/app/[locale]/blog/page.tsx#L12)
- [src/app/[locale]/blog/[slug]/page.tsx#L27](/Users/xujifeng/lab/front/finn-days/src/app/[locale]/blog/[slug]/page.tsx#L27)

判断：

- 现有 metadata 仅配置了 feed 类型 `alternates`，没有为页面级路由补 canonical。
- 这会让多语言页面、fallback 页面和同内容多 URL 页面在索引上更容易出现歧义。

### 3. 英文页面的 Open Graph locale 和基础 metadata 仍然是中文站点基线

严重级别：高

问题：

- `http://localhost:8200/en` 和 `http://localhost:8200/en/blog` 实测都输出 `og:locale=zh_CN`
- 英文页面复用了中文站点的 Open Graph locale 和通用 SEO 元信息

代码位置：

- [src/app/[locale]/layout.tsx#L24](/Users/xujifeng/lab/front/finn-days/src/app/[locale]/layout.tsx#L24)
- [src/app/[locale]/layout.tsx#L36](/Users/xujifeng/lab/front/finn-days/src/app/[locale]/layout.tsx#L36)

判断：

- 当前 `metadata` 是静态对象，不随 `locale` 变化。
- 这会导致英文页面的元数据对搜索引擎和社交平台并不准确，Phase 3 的多语言 SEO 目标未达成。

### 4. Sitemap 与当前公开 URL 集不一致，且没有 hreflang alternates

严重级别：高

问题：

- `sitemap.xml` 当前只包含源语言文章 URL，不包含可访问的英文 fallback 文章 URL
- 例如 `/en/blog/hello-world` 返回 `200`，响应头也暴露了 `hreflang="en"` 的 alternate，但 `sitemap.xml` 中没有该 URL
- `sitemap.xml` 也未输出多语言 alternates / hreflang 信息

代码位置：

- [src/app/sitemap.ts#L28](/Users/xujifeng/lab/front/finn-days/src/app/sitemap.ts#L28)
- [src/app/sitemap.ts#L40](/Users/xujifeng/lab/front/finn-days/src/app/sitemap.ts#L40)

判断：

- 当前 sitemap 仅基于内容源 locale 生成 URL，未覆盖当前真正公开且可索引的 fallback 路径。
- 如果 fallback URL 需要公开索引，sitemap 不完整；如果 fallback URL 不应索引，则页面应该配合 canonical / noindex，而当前也没有。

### 5. Umami 分析链路未形成可验收状态

严重级别：中

问题：

- 本地运行实例未注入 Umami 脚本
- `docker compose config` 明确提示 `UMAMI_APP_SECRET`、`UMAMI_DB_PASSWORD`、`NEXT_PUBLIC_UMAMI_URL`、`NEXT_PUBLIC_UMAMI_ID` 均为空
- 因此本轮无法完成页面访问上报、自定义事件和 Umami 面板联调验收

代码位置：

- [src/components/common/analytics.tsx#L5](/Users/xujifeng/lab/front/finn-days/src/components/common/analytics.tsx#L5)
- [src/lib/analytics.ts#L13](/Users/xujifeng/lab/front/finn-days/src/lib/analytics.ts#L13)
- [src/lib/analytics.ts#L17](/Users/xujifeng/lab/front/finn-days/src/lib/analytics.ts#L17)
- [.env.example](/Users/xujifeng/lab/front/finn-days/.env.example)

判断：

- 当前实现是“有条件接入”，不是“已完成可验收的分析系统”。
- 另外 `trackSearch`、`trackNewsletterSubscribe` 已定义但本轮代码检索未发现实际接入点，仅 `read_complete` 事件被接线。

### 6. 性能目标缺少对应的自动化实现和量化结果

严重级别：中

问题：

- 文档中要求 Lighthouse 90+、Web Vitals、性能优化闭环
- 当前仓库未见 Lighthouse CI、Web Vitals 上报或 bundle 分析接入
- 本地也无法从现有仓库产物中直接得出 “Performance 90+ / SEO 100” 的量化结论

代码位置：

- [.github/workflows/deploy.yml#L1](/Users/xujifeng/lab/front/finn-days/.github/workflows/deploy.yml#L1)
- [package.json](/Users/xujifeng/lab/front/finn-days/package.json)

判断：

- 当前 CI 只覆盖 `lint`、`tsc`、Docker build/push、SSH deploy。
- Phase 3 的性能目标目前更像设计文档目标，而不是已落地的验收项。

## 其他观察

### 1. `npm run start` 与 `output: "standalone"` 组合会出现启动 warning

现象：

- 本地 `npm run start` 时 Next.js 输出：
  `next start does not work with output: standalone configuration. Use node .next/standalone/server.js instead.`

判断：

- 这不是生产阻塞，因为 [Dockerfile](/Users/xujifeng/lab/front/finn-days/Dockerfile) 使用的是 `node server.js`。
- 但本地脚本层面最好统一，避免后续验收和运维认知混乱。

### 2. `/admin` 与 `/admin/dashboard` 当前均为 404

现象：

- 本轮 HTTP 探测中 `/admin`、`/admin/dashboard` 均返回 `404`

判断：

- 按架构总览，这属于 Phase 4 项，不计入本轮失败项。
- 但建议整理文档目录，避免后续阶段误判范围。

## 建议优先级

建议 ClaudeCode 按以下顺序修复：

1. 修复默认 OG 图片链路：先让 `/opengraph-image` 可访问，再补非文章页 `og:image` / `twitter:image`
2. 为首页、列表页、详情页补 canonical，并明确 fallback 页的 canonical / index 策略
3. 将 locale 相关 metadata 改为按 `locale` 动态生成，至少修正英文页的 `og:locale`、title、description、url
4. 统一 sitemap、页面 canonical、hreflang、fallback 可索引策略
5. 补齐 Umami 的可验收环境变量与事件接线，至少把 pageview + `search` + `newsletter_subscribe` 跑通
6. 再补 Lighthouse / Web Vitals / 性能验收自动化

## 最终判定

**Phase 3 当前不通过。**

核心原因：

- SEO 元标签链路未闭合
- 默认 OG 图片和 canonical 未完成
- 英文页面 metadata 不准确
- sitemap 与公开 URL 集不一致
- 分析与性能目标尚未进入可验收状态
