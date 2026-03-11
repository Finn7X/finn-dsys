# Finn Days Phase 1-2 验收报告 Round 3

- 验收日期: 2026-03-12
- 本轮目标:
  - 复测上一轮剩余问题
  - 重点检查评论系统是否真正从占位态进入可用接入态
  - 复测英文 UI 文案、Feed 状态与整体稳定性
- 验收方式:
  - `npm run lint`
  - `npm run build`
  - `./node_modules/.bin/next start -p 8202`
  - `curl` 路由 / Feed 探测
  - Playwright CLI 端到端验证

## 本轮结论

本轮结果为: **通过，但保留少量残余风险**。

相较上一轮，之前“有条件通过”的核心保留项已经明显收敛:

- 评论区不再是占位文案，而是已经渲染真实 `giscus-widget`
- 英文界面的搜索、分享、Newsletter、评论标题等 UI 文案已切换到英文
- 搜索、双语 fallback、系列导航、阅读进度条、分享、静态检查、构建都保持正常

当前仍有 2 类非阻塞残余项:

1. `feed.xml` / `atom.xml` 仍然不是双语完成态
2. Giscus 在“尚无 discussion”的文章页会产生 404 + warning 日志，虽更像首次评论前的正常行为，但本轮未做 GitHub 登录后的真实发评验证

因此，这轮结论不再是“有条件通过”，而是可以判定 **Phase 1-2 主体目标已达到可接受完成状态**，同时建议把上述残余项记录为后续优化或人工联调项。

## 验收摘要

| 项目 | 结果 | 说明 |
|---|---|---|
| `lint` | 通过 | 0 error / 0 warning |
| `build` | 通过 | 仅保留 Next.js `middleware` 弃用 warning |
| 核心路由 | 通过 | 中英文页面与文章详情均返回 200 |
| 搜索 | 通过 | 英文界面文案正确，输入 `React` 可返回结果并跳转 |
| 英文 UI 文案 | 通过 | 搜索、分享、评论、Newsletter 已本地化 |
| 双语 fallback | 通过 | `/en/blog/...` 可访问并显示英文 fallback 提示 |
| 系列导航 | 通过 | `/en/blog/nextjs-guide-part1/2` 间跳转正常 |
| 阅读进度条 | 通过 | 中英文文章页均正常 |
| 评论系统接入 | 通过 | 已渲染 `giscus-widget`，不再是占位态 |
| Feed | 部分通过 | 可访问，但仍为中文 feed 语义 |

## 本轮已确认通过项

### 1. 静态检查与构建

- `npm run lint` 通过
- `npm run build` 通过
- 构建输出正常，仅保留框架级 warning:
  - `middleware` 约定已弃用，后续应迁移到 `proxy`

### 2. 路由与页面访问

本轮实测以下路由均返回 `200`:

- `/`
- `/en`
- `/blog`
- `/en/blog`
- `/about`
- `/en/about`
- `/projects`
- `/en/projects`
- `/tags`
- `/en/tags`
- `/blog/hello-world`
- `/en/blog/hello-world`
- `/blog/nextjs-guide-part1`
- `/blog/nextjs-guide-part2`
- `/en/blog/nextjs-guide-part1`
- `/en/blog/nextjs-guide-part2`
- `/feed.xml`
- `/atom.xml`

### 3. 搜索功能

- 英文首页顶部按钮文案已为 `Search Articles`
- 搜索弹窗标题、描述、输入框占位符、键盘提示均已切换为英文
- 输入 `React` 后可返回 3 条结果
- 点击结果后可正确跳转到对应文章页

验证依据:

- [src/components/search/search-dialog.tsx](/Users/xujifeng/lab/front/finn-days/src/components/search/search-dialog.tsx)
- [messages/en.json](/Users/xujifeng/lab/front/finn-days/messages/en.json)
- Playwright 回归结果

### 4. 英文界面文案本地化

上一轮报告中提到的中英文混杂 UI，本轮已基本修复。英文 fallback 文章页实测显示:

- 搜索按钮: `Search Articles`
- 分享区标签: `Share:`
- 评论标题: `Comments`
- Newsletter 标题: `Subscribe to Newsletter`
- 阅读进度: `Reading progress`
- 系列导航标签: `Series`
- fallback 提示: `This article is not available in English, showing 中文 version.`

对应实现:

- [src/components/search/search-dialog.tsx](/Users/xujifeng/lab/front/finn-days/src/components/search/search-dialog.tsx)
- [src/components/blog/share-buttons.tsx](/Users/xujifeng/lab/front/finn-days/src/components/blog/share-buttons.tsx)
- [src/components/common/newsletter.tsx](/Users/xujifeng/lab/front/finn-days/src/components/common/newsletter.tsx)
- [src/components/blog/comments.tsx](/Users/xujifeng/lab/front/finn-days/src/components/blog/comments.tsx)
- [src/app/[locale]/blog/[slug]/page.tsx](/Users/xujifeng/lab/front/finn-days/src/app/[locale]/blog/[slug]/page.tsx)
- [messages/en.json](/Users/xujifeng/lab/front/finn-days/messages/en.json)

### 5. 双语 fallback 与系列导航

- 英文文章详情页已不再 404
- 当英文内容不存在时，页面正常显示 fallback 提示
- 英文 fallback 页中的系列导航仍保留 `/en/blog/...` 路由前缀
- 从 `/en/blog/nextjs-guide-part1` 与 `/en/blog/nextjs-guide-part2` 之间切换正常

相关实现:

- [src/app/[locale]/blog/[slug]/page.tsx](/Users/xujifeng/lab/front/finn-days/src/app/[locale]/blog/[slug]/page.tsx)

### 6. 评论系统接入状态

这是本轮最关键的回归项。

本轮确认结果:

- 评论区不再只是“即将上线”占位文案
- 中文页评论区渲染为:
  - `<giscus-widget ... lang="zh-CN" ...>`
- 英文页评论区渲染为:
  - `<giscus-widget ... lang="en" ...>`

对应实现:

- [src/config/site.ts](/Users/xujifeng/lab/front/finn-days/src/config/site.ts)
- [src/components/blog/comments.tsx](/Users/xujifeng/lab/front/finn-days/src/components/blog/comments.tsx)

判断:

- 这说明评论系统已从“未配置降级态”进入“真实 Giscus 接入态”
- 因此，上一轮报告中“评论系统未实际上线”的阻塞结论本轮可以解除

### 7. 阅读进度条与分享

- 阅读进度条在英文页面上标签已为 `Reading progress`
- 分享区英文文案已正确切换
- `Copy link` 按钮可触发状态变化

相关实现:

- [src/components/blog/share-buttons.tsx](/Users/xujifeng/lab/front/finn-days/src/components/blog/share-buttons.tsx)

## 残余风险与未覆盖项

### 1. Giscus 首次 discussion 创建前会产生 404 / warning

当文章尚无 discussion 时，本轮在评论区加载后观察到:

- 2 条来自 `giscus.app/api/discussions` 的 `404`
- 1 条 warning:
  - `Discussion not found. A new discussion will be created if a comment/reaction is submitted.`

这更像 Giscus 在首次评论前的正常探测行为，而不是配置完全错误，因为:

- 已不再出现上一轮的 `giscus is not installed on this repository`
- 页面中确实渲染了 `giscus-widget`
- warning 明确说明“提交评论/反应后会创建 discussion”

但本轮**没有做 GitHub 登录后的真实发表评论验证**，因此这项应记录为残余风险而不是阻塞缺陷。

涉及实现:

- [src/config/site.ts](/Users/xujifeng/lab/front/finn-days/src/config/site.ts)
- [src/components/blog/comments.tsx](/Users/xujifeng/lab/front/finn-days/src/components/blog/comments.tsx)

### 2. Feed 仍不是双语完成态

本轮 `feed.xml` / `atom.xml` 依然可访问，但仍有明显遗留:

- `language` 仍写死为 `zh`
- 内容条目仍全部是中文内容

对应实现:

- [src/lib/feed.ts](/Users/xujifeng/lab/front/finn-days/src/lib/feed.ts)

影响:

- 不阻塞当前 Phase 1-2 完成判断
- 但与架构文档的双语方向仍不完全一致

### 3. middleware 弃用 warning 仍在

- 构建时仍提示 Next.js 16 后续应从 `middleware` 迁移到 `proxy`

对应实现:

- [src/middleware.ts](/Users/xujifeng/lab/front/finn-days/src/middleware.ts)

影响:

- 当前不阻塞验收
- 仍建议列入后续基建优化

## 与上一轮报告的变化

上一轮的核心保留问题:

1. 评论系统仍是占位降级态
2. 英文界面仍有中文 UI 文案

本轮确认:

- 问题 1 已解决为真实 Giscus 接入态
- 问题 2 已大幅解决，主要 UI 文案均已本地化

本轮没有发现新的阻塞级缺陷。

## 建议后续事项

1. 做一次人工登录态的真实评论发布验证，确认 discussion 自动创建链路可用
2. 决定是否继续推进多语言 Feed，而不是只保留中文 feed
3. 在后续基础设施迭代中处理 `middleware -> proxy`
4. 若未来要实现真正英文内容，而不是 fallback，应继续补齐英文文章源文件

## 最终判断

本轮回归后，Phase 1-2 的主体目标可以判定为**通过**。

主要理由:

- 关键功能主链路完整可用
- 上两轮的阻塞问题已基本清除
- 评论系统已进入真实接入状态，而不再是简单占位
- 英文界面主要 UI 文案已经完成本地化

保留结论:

- **通过，但建议记录 2 个残余风险**:
  - Giscus 首次 discussion 创建前的 404 / warning 仍需登录态人工联调确认
  - Feed 仍未达到双语完成态
