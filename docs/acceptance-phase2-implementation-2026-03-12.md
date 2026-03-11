# Finn Days Phase 1-2 验收报告

- 验收日期: 2026-03-12
- 验收范围:
  - 架构总览: `docs/00-architecture/overview.md`
  - 阶段 2 文档: `docs/02-phase2-enhancement/*.md`
  - 当前代码实现与本地运行结果
- 验收方式:
  - 静态检查: `npm run lint`
  - 生产构建: `npm run build`
  - 本地运行: `npm run start` (`http://localhost:8200`)
  - 路由/产物探测: `curl`
  - 端到端检查: Playwright CLI

## 总结结论

当前版本**不建议作为 Phase 1-2 完成态验收通过**。

原因不是单点问题，而是存在几项直接影响阶段目标的未闭环问题:

1. 全文搜索前端已接入，但实际不可用。
2. 评论系统 UI 已接入，但 Giscus 未完成有效配置，前台直接报错。
3. 双语架构未闭环，文章详情页从中文切到英文会进入 404。
4. 文章详情页存在运行时 React 控制台错误。
5. `lint` 不通过，说明当前实现还没达到稳定可交付状态。

## 验收矩阵

| 项目 | 目标 | 结果 | 说明 |
|---|---|---|---|
| 基础路由 | 首页/博客/标签/About/Projects 可访问 | 部分通过 | 中文主链路可访问；英文文章详情缺失 |
| 双语路由 | `zh` / `en` 都可用 | 未通过 | `/en/blog/hello-world` 为 404 |
| 搜索 | 可搜索文章并返回结果 | 未通过 | 搜索 `React` / `Hello` 均无结果 |
| 阅读进度条 | 文章页顶部滚动进度可更新 | 通过 | 从 `0` 滚到文末变为 `100` |
| 社交分享 | Twitter / LinkedIn / 复制链接 | 部分通过 | Twitter 新标签页正常；复制链接状态正常 |
| 作者卡片 | 文章页底部展示作者信息 | 通过 | 头像、简介、社交链接均渲染 |
| Newsletter | 表单提交流程可用 | 部分通过 | 表单工作，但当前环境缺少 `BUTTONDOWN_API_KEY` |
| 评论系统 | 文章页评论可用 | 未通过 | 前台显示 Giscus 安装/配置错误 |
| 系列文章导航 | 文章页展示系列导航 | 未验证 | 当前内容没有 series 数据，无法实际覆盖 |
| RSS / Atom | 订阅源可访问 | 通过 | `/feed.xml`、`/atom.xml` 返回 200 |
| 构建 | 生产构建可完成 | 通过 | `next build` 与 pagefind 构建完成 |
| 代码规范 | `lint` 通过 | 未通过 | 3 个错误，1 个 warning |

## 关键未通过项

### 1. 全文搜索未真正生效

- 现象:
  - 浏览器端打开搜索弹窗，输入 `React`、`Hello`，结果均为“未找到相关文章”。
  - `npm run build` 时 Pagefind 日志显示仅索引了 **1 page / 4 words**。
  - `.next/server/app` 下只有 `_global-error.html` 和 `_not-found.html` 两个 HTML 文件，被拿来作为 `pagefind --site` 输入明显不对。
- 影响:
  - 阶段 2 的“搜索功能”目标未达成。
- 证据:
  - `package.json:7` 使用 `pagefind --site .next/server/app --output-path public/_pagefind`
  - `src/lib/pagefind.ts:27-52` 前端搜索封装已接入，但依赖的索引内容实际无效
  - 构建时发现 `.next/server/app` 仅有错误页 HTML
- 判断:
  - 这是**功能未完成**，不是单纯的 UI 小问题。

### 2. 评论系统前台报错

- 现象:
  - 文章页滚动到评论区后，Giscus iframe 显示: `错误：giscus is not installed on this repository`
  - 控制台出现 403 和 Giscus 配置错误日志。
- 影响:
  - 阶段 2 的评论系统未达到可用状态。
- 证据:
  - `src/config/site.ts:19-29` 中 `repoId` / `categoryId` 仍是占位值
  - `src/components/blog/comments.tsx:40-53` 会直接使用这些配置渲染 Giscus
- 判断:
  - 这是**配置未完成**导致的前台故障。

### 3. 双语文章详情链路未闭环

- 现象:
  - `/blog/hello-world` 可访问，但 `/en/blog/hello-world` 返回 404。
  - 在中文文章详情页点击语言切换按钮，会被带到 `http://localhost:8200/en/blog/hello-world`，页面标题变为 `Not Found | Finn Days`。
- 影响:
  - 与架构文档中“原生双语、一等公民”的目标不符。
  - 用户路径中存在明显断链。
- 证据:
  - `src/components/layout/language-switcher.tsx:20-21` 直接对当前 pathname 做 locale 替换，没有判断目标语种内容是否存在
  - `src/app/[locale]/blog/[slug]/page.tsx:16-21` 的静态参数完全依赖现有内容
  - 当前仅存在 `content/blog/hello-world.mdx:1-9`，且 `locale: zh`
- 判断:
  - 这是**架构目标未落地**和**切换逻辑缺少兜底**的组合问题。

### 4. 文章详情页存在运行时 React 错误

- 现象:
  - 打开文章页后，控制台立即出现 `Minified React error #418`。
  - 该错误在首页未复现，主要出现在文章详情页。
- 影响:
  - 说明页面存在水合或运行时一致性问题，生产稳定性不足。
- 证据:
  - 浏览器控制台在文章详情页稳定复现。
  - 文章页包含多个仅在详情页存在的客户端组件: `ReadingProgress`、`Comments`、`Toc` 等。
  - 当前布局结构为 `src/app/layout.tsx:3-8` 返回 `children`，而 `src/app/[locale]/layout.tsx:57-72` 才输出 `<html><body>`，需要重点排查。
- 判断:
  - 这是**必须解决的运行时错误**，优先级高。

### 5. lint 不通过

- 现象:
  - `npm run lint` 失败，包含 3 个 error、1 个 warning。
- 具体项:
  - `src/components/blog/comments.tsx:14-16`
    - `setMounted(true)` 触发 `react-hooks/set-state-in-effect`
  - `src/components/blog/reading-progress.tsx:27-38`
    - `updateProgress()` 触发 `react-hooks/set-state-in-effect`
  - `src/components/search/search-dialog.tsx:62-91`
    - `navigateToResult` 在声明前被 `useCallback` 闭包引用
    - 同时缺少依赖 warning
- 影响:
  - 说明当前代码仍有明确静态质量缺口。
- 判断:
  - 这是**交付阻塞项**。

## 中风险问题

### 6. SearchDialog 可访问性未完成

- 现象:
  - 打开搜索弹窗时，控制台 warning: `Missing Description or aria-describedby for DialogContent`
- 证据:
  - `src/components/search/search-dialog.tsx:112-116` 只有 `DialogTitle`，没有 `DialogDescription`
- 影响:
  - 可访问性不完整。

### 7. SeriesNav 的 locale 链接不安全

- 现象:
  - 组件内部使用 `next/link`，并手写 `/blog/${slug}`。
- 风险:
  - 一旦系列文章在英文路由下启用，可能跳回无 locale 路径，或依赖中间件做隐式修正。
- 证据:
  - `src/components/blog/series-nav.tsx:91-93`
  - `src/components/blog/series-nav.tsx:116`
  - `src/components/blog/series-nav.tsx:135`
- 影响:
  - 当前因无 series 内容未暴露，但后续很容易变成真实 bug。

### 8. Feed 仍是单一语言输出

- 现象:
  - `feed.xml` / `atom.xml` 当前只输出中文文章，且 feed 语言被写死为 `zh-CN`。
- 证据:
  - `src/lib/feed.ts:5-17`
  - `src/lib/feed.ts:29-49`
- 影响:
  - 与架构文档的双语方向不完全一致。
- 判断:
  - 这更像**阶段完成度不足**，不是当前最优先故障，但应列入修复范围。

### 9. middleware 已出现框架弃用警告

- 现象:
  - 构建时 Next.js 16 提示 `middleware` 约定已弃用，建议迁移到 `proxy`。
- 证据:
  - `src/middleware.ts:1-8`
- 影响:
  - 当前不阻塞运行，但会带来后续升级成本。

## 已通过项

### 1. 基础运行与主要页面

- `/`、`/en`、`/blog`、`/en/blog`、`/about`、`/en/about`、`/projects`、`/en/projects`、`/tags`、`/en/tags` 均返回 `200`
- `npm run build` 可完成
- `npm run start` 可在 `8200` 端口启动

### 2. 阅读进度条

- 初始 `aria-valuenow = 0`
- 滚到文末后 `aria-valuenow = 100`
- 行为与阶段 2 文档预期一致

### 3. 社交分享中的部分能力

- Twitter 分享按钮会打开新标签页，URL 拼接正确
- 复制链接按钮点击后状态切换为“已复制”

### 4. 作者卡片

- 头像、姓名、简介、GitHub / Twitter / Email 链接都正常渲染

### 5. Newsletter 失败兜底

- 在缺少 `BUTTONDOWN_API_KEY` 的环境中，表单不会崩溃
- 前台会展示“订阅服务暂时不可用，请稍后再试”
- 说明错误分支处理是有效的

### 6. 移动端导航与主题切换

- 移动端菜单可以展开/收起
- 主题切换可以把 `document.documentElement.className` 与 `localStorage.theme` 从 `light` 切到 `dark`

## 未覆盖 / 受限项

### 1. 系列文章导航

- 当前内容中没有 `series` frontmatter，无法做真实端到端验收
- 只能基于代码判断存在潜在 locale 风险

### 2. Newsletter 成功链路

- 当前环境缺少 `BUTTONDOWN_API_KEY`
- 只能验证失败兜底，不能验证真实订阅成功

### 3. 评论发布链路

- Giscus 配置未完成，无法验证登录、发表评论、主题同步等完整流程

## 建议修复顺序

1. 先修复文章页 React 运行时错误与 `lint` 错误，恢复基础稳定性。
2. 修复双语文章详情链路:
   - 补英文内容，或
   - 让语言切换在缺少翻译时回退到可访问页面，而不是硬跳 404。
3. 重做 Pagefind 索引生成路径，确保文章页能被真正索引，然后回归测试搜索。
4. 完成 Giscus 仓库与分类配置，消除前台 403 和错误 iframe。
5. 给搜索弹窗补 `DialogDescription`，完成可访问性细节。
6. 修正 `SeriesNav` 的 locale 跳转方式。
7. 视路线图决定是否把 feed 拆成多语言输出。
8. 最后处理 `middleware -> proxy` 迁移。

## 最终结论

本次验收结果为: **未通过**。

当前实现已经具备 Phase 1-2 的主体骨架，且部分功能已可用，但搜索、评论、双语文章详情、运行时稳定性这四项仍然不足以支撑“阶段完成”结论。建议以上述修复顺序处理后，再进行一次完整回归验收。
