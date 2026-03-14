# Finn Days Phase 4 验收报告（Round 2）

日期: 2026-03-13

## 结论

本轮 **仍未通过**。

与上一轮相比，Phase 4 的大部分功能性整改已经真实落地，尤其是命令面板 locale 修复、Notes locale 支持、CodeSandbox 导出修复以及共享元素过渡接线。

但当前仍有 1 个阻塞项未解决：

- 生产构建和生产启动依然会直接崩溃，无法完成生产态验收

此外还有 1 个实现层残留问题：

- 新增的 `CodeBlock` 组件已经创建，但没有真正接入默认 fenced code block 渲染链路

## 本轮执行内容

已执行：

- `npx velite`
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `npm start`
- 复查 Phase 4 相关源码与 `.velite` 生成结果

结果：

- `npx velite`：通过
- `npm run lint`：通过
- `npx tsc --noEmit`：仍报 `.next/types/validator.ts` 引用不存在的 `src/app/page.js`
- `npm run build`：`velite` 完成后立即 `Bus error (core dumped)`
- `npm start`：Next.js 启动横幅输出后立即 `Bus error (core dumped)`

判断：

- `tsc` 问题仍然更像 `.next` 产物残留，不足以单独定义为 Phase 4 阻塞
- 但 `build` / `start` 双双崩溃，足以继续阻塞验收

## 本轮确认已修复项

### 1. 命令面板 locale 路由与内容隔离已修复

代码证据：

- `src/components/search/command-palette.tsx:4` 已改为使用 `@/i18n/routing` 的 `useRouter`
- `src/components/search/command-palette.tsx:83-143` 命令导航与文章跳转已走 i18n router
- `src/components/layout/navbar.tsx:12-15` 已通过 `getLocale()` 获取 locale，并传入 `getSearchableContent(locale)`
- `src/lib/search.ts:11-18` 支持 locale 过滤

结论：

- 上一轮“命令面板会丢失 locale / 混入所有语言文章”的问题，本轮代码层面已修复

### 2. Notes 系统 locale 支持已修复

代码证据：

- `velite.config.ts:81-94` 的 `Note` schema 已新增 `locale` 与 `translationSlug`
- `src/lib/notes.ts:3-10` 的 `getAllNotes(locale)` 已支持 locale 过滤
- `src/app/[locale]/notes/page.tsx:43-46` 已按 locale 读取 notes
- `src/components/notes/note-card.tsx:16-18` 已做 locale-aware 日期与路径处理
- `src/components/notes/note-card.tsx:60-61` permalink 已根据 locale 输出 `/notes` 或 `/en/notes`

结论：

- 上一轮 Notes 的 locale 断层问题，本轮代码层面已修复

### 3. CodeSandbox 导出接线已修复

代码证据：

- `src/components/mdx/code-playground-impl.tsx:12` 已引入 `UnstyledOpenInCodeSandboxButton`
- `src/components/mdx/code-playground-impl.tsx:163-169` 已直接使用 Sandpack 官方按钮
- 上一轮错误的 `btoa(JSON.stringify({ files }))` 导出逻辑已移除

结论：

- 这一项修复成立

### 4. View Transitions 共享元素接线已补齐

代码证据：

- `src/components/post-card.tsx:42-45` 已给封面设置 `post-cover-{slug}`
- `src/components/post-card.tsx:70-73` 已给标题设置 `post-title-{slug}`
- `src/components/post-header.tsx:28-31` 已给详情页标题设置对应 `viewTransitionName`
- `src/app/[locale]/blog/[slug]/page.tsx:121-128` 已向 `PostHeader` 传入 `slug`
- `src/app/globals.css:161-176` 已补共享元素过渡规则

结论：

- 上一轮缺失的共享元素过渡接线，本轮已补齐

## 仍未通过的原因

### 1. 生产构建与生产启动仍然崩溃

严重级别：阻塞

本轮实测：

- `npm run build` 在 `velite` 完成后直接 `Bus error (core dumped)`
- `npm start` 在打印 `http://localhost:8200` 后直接 `Bus error (core dumped)`

影响：

- 无法完成生产态页面验收
- 无法确认当前修复是否真正达到可部署状态

判断：

- 这不是文档描述层面的偏差，而是交付可用性本身没有闭合
- 在该问题未修复前，本轮不能判定为通过

## 残留问题

### 1. `CodeBlock` 组件已创建，但没有真正接入默认 Markdown 代码块渲染链路

严重级别：中

代码证据：

- `src/components/mdx/code-block.tsx` 已存在
- `src/components/mdx/index.tsx:16-35` 已注册 `CodeBlock`
- 但 `src/components/mdx-content.tsx:69-90` 仍然直接覆盖 `pre`
- 本轮 `rg -n "CodeBlock"` 检查结果显示，仓库中除注册表和组件文件本身外，没有其他实际使用点

结合 `.velite` 生成结果可见：

- 标准 fenced code block 仍编译为 `figure > pre > code`
- 当前默认运行路径仍是 `MdxContent` 的 `pre` 渲染，而不是新增的 `CodeBlock`

判断：

- 从“文件已创建”角度看，这项整改做了一半
- 从“默认 Markdown 代码块是否真的走新组件”角度看，这项整改还没有完全闭合

备注：

- 现有 `src/styles/mdx.css` 已经提供了标题和高亮行样式
- 所以这是“实现未完全按整改说明接线”，不是新的 P0 阻塞项

## 测试覆盖缺口

### 1. 当前仓库仍缺少英文内容样本

本轮检查结果：

- `content/blog` 中显式声明的 `locale` 仍只有 `zh`
- `content/notes` 中没有任何显式英文 note frontmatter
- `.velite/posts.json` 与 `.velite/notes.json` 中未检出 `locale: "en"` 内容

影响：

- 本轮只能确认 locale-aware 代码路径已经接上
- 但无法对英文内容的真实展示、命令面板英文搜索结果、`/en/notes` 的非空场景做内容级回归

判断：

- 这是当前测试样本不足，不单独作为不通过项
- 但建议后续补至少一篇英文 post 和一条英文 note，再做一次浏览器级回归

## 最终判定

**Phase 4 Round 2 仍未通过。**

本轮和上一轮的差别在于：

- 上一轮是“功能实现和生产链路都存在问题”
- 这一轮已经收敛为“多数功能整改已完成，但生产链路仍阻塞，另有一个中等级实现残留问题”

如果下一轮能修复 `npm run build` / `npm start` 的 `Bus error`，并把 `CodeBlock` 真正接入默认代码块渲染链路，再补一组英文内容样本进行页面级回归，Phase 4 才具备转为通过的条件。
