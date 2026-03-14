# Finn Days Phase 4 验收报告

日期: 2026-03-13

## 结论

本轮 **未通过**。

Phase 4 的主体功能已经落地了一部分，但当前存在 2 类不能忽略的问题：

- 生产链路在本机无法完成构建/启动，当前不能以“可交付”状态验收
- 多语言与 Phase 4 新功能之间存在明显断层，尤其是命令面板和 Notes 系统

结合代码审查与本轮实际命令执行结果，当前更适合进入一轮针对性整改，而不是直接记为通过。

## 验收依据

本轮依据以下文档核对：

- `docs/00-architecture/overview.md`
- `docs/04-phase4-advanced/01-command-palette.md`
- `docs/04-phase4-advanced/02-mdx-components.md`
- `docs/04-phase4-advanced/03-code-playground.md`
- `docs/04-phase4-advanced/04-notes-system.md`
- `docs/04-phase4-advanced/05-i18n.md`
- `docs/04-phase4-advanced/06-view-transitions.md`

## 本轮执行内容

已完成：

- `npm run lint`
- `npm run build`
- `npm start`
- 临时副本对照实验：移除 `next.config.ts` 中的 `experimental.viewTransition` 后再次执行 `npm run build`
- `npx tsc --noEmit`
- 对 Phase 4 相关代码进行逐项审查

结果摘要：

- `npm run lint` 通过
- `npm run build` 在 `velite` 完成后直接触发 `Bus error (core dumped)`
- `npm start` 输出 Next.js 启动横幅后同样触发 `Bus error (core dumped)`
- 临时副本移除 `viewTransition` 配置后，`npm run build` 仍然复现同样的 `Bus error`
- `npx tsc --noEmit` 失败：`.next/types/validator.ts` 仍引用不存在的 `src/app/page.js`

判断：

- 当前无法完成生产态页面级验收
- `viewTransition` 不是目前已知的唯一触发点
- 生产链路阻塞更像是当前仓库状态与本机 Next 运行环境的组合问题，仍需继续定位

## 阻塞项

### 1. 生产构建与生产启动均不可用

严重级别：阻塞

证据：

- `npm run build` 结果：`[VELITE] build finished ...` 后立即 `Bus error (core dumped)`
- `npm start` 结果：Next.js 打印 `http://localhost:8200` 后立即 `Bus error (core dumped)`
- 在临时副本中去掉 `experimental.viewTransition` 后，构建仍然崩溃

影响：

- 无法完成生产态验收
- 无法确认 Phase 4 交付是否具备可部署性

备注：

- 当前证据不足以把问题单独归因到某一个 Phase 4 文件
- 但就验收结果而言，这已经足够构成不通过

### 2. 命令面板没有遵守 locale 路由与内容隔离

严重级别：高

证据：

- `src/components/search/command-palette.tsx:4` 使用的是 `next/navigation` 的 `useRouter`
- `src/components/search/command-palette.tsx:86`
- `src/components/search/command-palette.tsx:94`
- `src/components/search/command-palette.tsx:102`
- `src/components/search/command-palette.tsx:110`
- `src/components/search/command-palette.tsx:118`
- `src/components/search/command-palette.tsx:138`

以上跳转全部写死为根路径，如 `/blog`、`/notes`、`/blog/${slug}`，不会保留当前 locale。

同时：

- `src/components/layout/navbar.tsx:11-12` 调用 `getSearchableContent()` 时没有传入 locale
- `src/lib/search.ts:11-18` 本身支持传 locale，但这里没有使用

影响：

- 在 `/en` 页面中打开命令面板，导航命令会回到默认语言路径
- 英文页面的命令面板会混入所有语言的文章结果
- 这与 `docs/04-phase4-advanced/05-i18n.md` 中“内容（文章/笔记）”和“URL 路由”均需支持双语的要求不一致

整改优先级：

- P0

### 3. Notes 系统没有完成 locale 闭环

严重级别：高

证据：

- `src/app/[locale]/notes/page.tsx:45-46` 不区分 locale，直接加载全部 notes
- `src/components/notes/note-card.tsx:37-40` 日期格式硬编码为 `zh-CN`
- `src/components/notes/note-card.tsx:57` permalink 硬编码为 `/notes#...`
- `velite.config.ts:77-92` 的 `Note` schema 没有 `locale` / `translationSlug` 等多语言字段

影响：

- `/en/notes` 只能复用同一批 notes 内容，而不是 locale-aware 的 notes 列表
- 英文 notes 页的单条笔记元信息仍输出中文日期格式
- 英文 notes 页点击 `#` permalink 会回到默认语言路径

与文档的偏差：

- `docs/04-phase4-advanced/05-i18n.md` 明确把“文章/笔记”的内容层国际化纳入范围
- `docs/00-architecture/overview.md` 明确把 `/notes` / `/en/notes` 作为双语页面

整改优先级：

- P0

## 主要缺口

### 1. MDX CodeBlock 增强没有按文档实现

严重级别：中

文档期望：

- `docs/04-phase4-advanced/02-mdx-components.md` 要求存在 `src/components/mdx/code-block.tsx`
- 需要支持文件名标签、复制按钮、行高亮

实际情况：

- 仓库中不存在 `src/components/mdx/code-block.tsx`
- `src/components/mdx/index.tsx:15-34` 没有注册 `CodeBlock`
- `src/components/mdx-content.tsx:69-90` 只是在默认 `pre` 渲染上加了复制按钮，没有文件名栏，也没有行高亮接线

判断：

- MDX 组件库并未完整达到文档定义的 Phase 4 交付面

整改优先级：

- P1

### 2. CodePlayground 的 CodeSandbox 导出实现与文档不一致

严重级别：中

文档期望：

- `docs/04-phase4-advanced/03-code-playground.md` 要求使用 CodeSandbox Define API 的 `getParameters`

实际情况：

- `src/components/mdx/code-playground-impl.tsx:152-165` 直接执行 `btoa(JSON.stringify({ files }))`
- `src/components/mdx/code-playground-impl.tsx:154-160` 中构造的 `URLSearchParams` 实际没有被使用

判断：

- 当前实现与文档方案不一致
- 该按钮大概率无法稳定生成有效的 CodeSandbox 沙箱

整改优先级：

- P1

### 3. View Transitions 只完成了基础淡入淡出，未完成共享元素过渡

严重级别：中

已完成部分：

- `next.config.ts:11-13` 开启了 `experimental.viewTransition`
- `src/app/globals.css:125-168` 已实现页面级淡入淡出、header 固定与 reduced-motion 降级
- `src/components/layout/navbar.tsx:15-18` 已给 header 设置 `viewTransitionName`

缺失部分：

- `src/components/post-card.tsx` 中没有文章标题/封面的 `viewTransitionName`
- `src/components/post-header.tsx` 中也没有对应共享元素标记
- `src/app/globals.css` 中没有文档示例里的 `post-title-*` / `post-cover-*` 共享元素规则

判断：

- 目前只达到了 `docs/04-phase4-advanced/06-view-transitions.md` 中的基础 P0 水平
- 文档中的列表到详情页共享元素过渡尚未落地

整改优先级：

- P2

## 已通过项

以下能力本轮可以确认已接入：

- 命令面板组件已创建并挂载到导航栏
- Notes 页面、metadata 与 alternates 已建立
- MDX 组件注册表已包含 `Callout`、`Tabs`、`Steps`、`Accordion`、`FileTree`、`LinkCard`、`YouTube`、`Tweet`、`CodePlayground`
- `CodePlayground` 已做 `dynamic + ssr: false` 懒加载
- `CodePlayground` 已做基于 `IntersectionObserver` 的延迟挂载
- 全局 View Transition 基础动画、header 固定与 reduced-motion 降级已接入
- `npm run lint` 通过

## 建议整改顺序

1. 先定位并修复生产链路的 `Bus error`
2. 修复命令面板的 locale 感知：路由跳转、搜索数据源、结果 URL
3. 修复 Notes 的 locale 感知：schema、列表过滤、日期格式、permalink
4. 补齐 MDX CodeBlock 增强
5. 修复 CodeSandbox 导出逻辑
6. 最后补 View Transition 的共享元素过渡

## 最终判定

**Phase 4 当前未通过。**

建议在完成上述 P0/P1 问题整改后，重新执行一轮生产态构建、启动和页面级回归，再决定是否转为通过。
