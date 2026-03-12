# Finn Days Phase 3 验收报告（Round 3）

日期: 2026-03-12

## 结论

本轮 **仍不通过** Phase 3 验收。

这次修复已经解决了上一轮报告里的两项核心问题：

- 静态页面的 `og:url` / `og:title` / `description` 已变成页面级输出
- 中文静态页面的 title / description 已完成本地化

但新的实现方式又引入了新的 metadata 回归：页面级 `openGraph` 配置覆盖了 layout 层的默认 Open Graph 字段，导致 `og:locale` 在所有页面中消失，同时静态页面丢失了默认 `og:image` / `twitter:image`。这会直接影响 Phase 3 的 SEO 与社交分享目标，因此本轮仍不能记为通过。

## 验收范围与执行内容

本轮继续依据以下文档进行验收：

- `docs/00-architecture/overview.md`
- `docs/03-phase3-seo-infra/01-seo-optimization.md`
- `docs/03-phase3-seo-infra/02-og-image-generation.md`
- `docs/03-phase3-seo-infra/03-analytics.md`
- `docs/03-phase3-seo-infra/05-performance.md`
- `docs/03-phase3-seo-infra/06-docker-compose.md`

本轮实际执行：

- `npm run lint`
- `npm run build`
- 使用最新构建产物重启 `http://localhost:8200`
- `curl` 检查首页、静态页、文章页的 HTML `head`
- `curl` 检查 `opengraph-image`、`sitemap.xml`、`robots.txt`、`feed.xml`、`atom.xml`
- Playwright 真实浏览器回归：文章页、搜索弹层、搜索结果、控制台
- `docker compose config`
- `docker info`

## 通过项

- `npm run lint` 通过
- `npm run build` 通过
- 根级和文章级 OG 图片路由正常：
  - `/opengraph-image` `200`
  - `/en/opengraph-image` `200`
  - `/blog/hello-world/opengraph-image` `200`
  - `/en/blog/hello-world/opengraph-image` `200`
- `sitemap.xml` 仍包含多语言 alternates / hreflang
- `robots.txt`、`feed.xml`、`atom.xml` 均返回 `200`
- 浏览器端搜索可正常打开并检索 `React`
- Playwright 控制台无 error / warning
- 上一轮指出的页面级 metadata 问题已部分修复：
  - `/blog` 现在输出 `title=博客 | Finn Days`
  - `/blog` 现在输出 `description=技术博客，分享 Web 开发、React、Next.js 等技术文章`
  - `/blog` 现在输出 `og:url=https://finn7x.com/blog`
  - `/about`、`/projects`、`/tags` 及其英文页也已同步修正
- `docker compose config` 可解析

## 未通过项

### 1. `og:locale` 在所有页面中消失，回归了上一轮已修复问题

严重级别：高

实测结果：

- `/` 未输出 `<meta property="og:locale" ...>`
- `/en` 未输出 `<meta property="og:locale" ...>`
- `/blog`、`/en/blog` 未输出 `og:locale`
- `/about`、`/en/about` 未输出 `og:locale`
- `/blog/hello-world`、`/en/blog/hello-world` 也未输出 `og:locale`

代码位置：

- `src/app/[locale]/layout.tsx:50-55`
- `src/app/[locale]/page.tsx:21-27`
- `src/app/[locale]/blog/page.tsx:25-32`
- `src/app/[locale]/about/page.tsx:22-29`
- `src/app/[locale]/projects/page.tsx:20-27`
- `src/app/[locale]/tags/page.tsx:21-28`
- `src/app/[locale]/blog/[slug]/page.tsx:36-47`

判断：

- layout 中虽然仍定义了 `openGraph.locale` 和 `alternateLocale`
- 但页面级 `generateMetadata()` 重新返回 `openGraph` 对象后，最终 HTML 中没有保留这些字段
- 结果是上一轮“英文页 `og:locale` 错误”这个问题虽然不再输出错误值，但变成了“根本不输出”

### 2. 静态页面丢失默认 `og:image` / `twitter:image`

严重级别：高

实测结果：

- `/blog` 输出了 `og:title`、`og:description`、`og:url`，但没有 `og:image`
- `/en/blog` 同样没有 `og:image`
- `/about`、`/projects`、`/tags` 及其英文页同样没有 `og:image`
- 上述页面的 `twitter:image` 也同时缺失
- 文章页仍有 `og:image` / `twitter:image`，首页也仍有默认图

代码位置：

- `src/app/[locale]/layout.tsx:50-55`
- `src/app/[locale]/blog/page.tsx:25-32`
- `src/app/[locale]/about/page.tsx:22-29`
- `src/app/[locale]/projects/page.tsx:20-27`
- `src/app/[locale]/tags/page.tsx:21-28`

判断：

- 当前静态页面的 `openGraph` 只设置了 `title`、`description`、`url`
- 默认 OG 图链路没有正确继承到这些页面的最终 metadata 中
- 这会让 `/blog`、`/about`、`/projects`、`/tags` 等关键页面在社交分享时缺少预览图，不符合 Phase 3 文档目标

## 已修复并确认通过的上一轮问题

- `/blog`、`/about`、`/projects`、`/tags` 的 `og:url` 已从首页 URL 修正为页面 URL
- 中文静态页面 title 已本地化：
  - `/blog` -> `博客 | Finn Days`
  - `/about` -> `关于 | Finn Days`
  - `/projects` -> `项目 | Finn Days`
  - `/tags` -> `标签 | Finn Days`
- 中文静态页面 `description` 已本地化

## 残余风险

### 1. Umami 代码已接入，但当前环境仍无法做整链路联调

现状：

- `docker compose config` 仍显示 `NEXT_PUBLIC_UMAMI_URL`、`NEXT_PUBLIC_UMAMI_ID`、`UMAMI_DB_PASSWORD`、`UMAMI_APP_SECRET` 为空
- 当前只能确认代码接线存在，不能确认 pageview / event / dashboard 的真实联通性

### 2. Docker daemon 仍不可用

现状：

- `docker info` 当前仍返回：`Cannot connect to the Docker daemon`

影响：

- 无法执行 `docker compose up` 整栈验收
- 无法基于容器环境完成 Umami / PostgreSQL 联调

### 3. 性能目标仍无量化结果

现状：

- 本轮仍未见 Lighthouse CI 或 Web Vitals 报表

影响：

- 不能确认是否达到文档中的性能量化目标

## 建议修复顺序

1. 先修 metadata 合并策略，确保页面级 `openGraph` 不会丢掉 `og:locale`、`alternateLocale` 和默认图片
2. 优先保证静态页 `/blog`、`/about`、`/projects`、`/tags` 的 `og:image` / `twitter:image` 恢复
3. 修复后重新回归：
   - `og:locale`
   - `og:image`
   - `twitter:image`
   - `og:url`
   - 本地化 title / description
4. 有条件时再补 Umami 环境变量与 Docker 整栈联调
5. 最后补 Lighthouse / Web Vitals 量化验收

## 最终判定

**Phase 3 本轮仍不通过。**

这轮不是“旧问题没修”，而是“修复方式引入了新的 metadata 覆盖回归”。在 Phase 3 这个以 SEO 和分享链路为核心的阶段里，这类回归仍属于阻塞项。
