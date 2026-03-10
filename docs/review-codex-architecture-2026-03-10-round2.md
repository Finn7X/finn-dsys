# Finn Days 架构与分阶段方案二次评审（Codex）

评审时间：2026-03-10  
评审范围：`docs/00-architecture`、`docs/01-phase1-mvp`、`docs/02-phase2-enhancement`、`docs/03-phase3-seo-infra`、`docs/04-phase4-advanced`、`docs/README.md`

## 总体结论

本轮文档质量相比上次有明显提升，尤其是：
- `docs/README.md` 链接索引已基本修复。
- 目标约定已明确写出（Velite、`draft`、`src/lib/content.ts`、`src/config/site.ts`、异步 `params`）。
- i18n 前置到 Phase 1 的方向已在总览层面体现。

但目前仍存在**约定与示例代码不一致**的问题，导致方案“可读但不可直接执行”。建议在进入开发前做一次全量一致性清理。

---

## P0（阻塞级）问题

### 1) 全局约定已声明，但多处示例仍违背约定（`src/config/site.ts` vs `@/lib/constants`）

- 约定声明：`docs/README.md:201`（统一使用 `src/config/site.ts`）
- 仍在使用 `@/lib/constants` 的示例：
  - `docs/02-phase2-enhancement/01-comment-system.md:138`
  - `docs/02-phase2-enhancement/05-author-card.md:59`
  - `docs/02-phase2-enhancement/04-social-sharing.md:320`
  - `docs/03-phase3-seo-infra/01-seo-optimization.md:228`
  - `docs/00-architecture/overview.md:1048`
- 影响：实现时会出现导入路径冲突/重复配置文件，违背“唯一配置入口”的设计目标。
- 建议：全量替换为 `@/config/site`（或最终统一路径），并在 CI 增加文档 lint 规则。

### 2) 路由参数“异步规范”未落地到全部文档

- 规范声明：
  - `docs/README.md:202`
  - `docs/00-architecture/overview.md:487`
- 仍为同步写法的示例：
  - `docs/02-phase2-enhancement/01-comment-system.md:218`
  - `docs/02-phase2-enhancement/03-reading-progress.md:209`
  - `docs/02-phase2-enhancement/04-social-sharing.md:322`
  - `docs/02-phase2-enhancement/05-author-card.md:233`
  - `docs/02-phase2-enhancement/07-series-navigation.md:343`
  - `docs/04-phase4-advanced/02-mdx-components.md:81`
  - `docs/04-phase4-advanced/06-view-transitions.md:178,516`
- 影响：团队会按不同范式实现，导致类型签名和代码模板不一致。
- 建议：统一替换为 `params: Promise<...>` + `const {...} = await params`。

### 3) `draft`/`published` 字段仍有关键冲突

- 约定声明：`docs/README.md:199`（统一 `draft`）
- 冲突示例：
  - `docs/02-phase2-enhancement/07-series-navigation.md:111` 仍用 `post.published`
  - `docs/03-phase3-seo-infra/07-admin-dashboard.md:1834` 默认 frontmatter 使用 `published: false`
  - `docs/03-phase3-seo-infra/07-admin-dashboard.md:2273` 继续将草稿定义为 `published: false`
- 影响：内容筛选逻辑与 Velite Schema 约定冲突，后台生成内容可能不被前台查询逻辑识别。
- 建议：统一为 `draft`；若后台必须用 `published`，需明确双向映射规则并写入架构基线。

---

## P1（高优先级）问题

### 4) 站点主域名在文档中存在三套写法

- `https://finn.days.dev`：`docs/01-phase1-mvp/02-layout-components.md:92`
- `https://finndays.com`：`docs/02-phase2-enhancement/01-comment-system.md:106`
- `https://finn-days.com`：`docs/03-phase3-seo-infra/01-seo-optimization.md:66`
- 影响：SEO canonical、分享链接、Feed、回调地址会出现不可预期差异。
- 建议：统一一个 canonical 域名；所有示例通过 `siteConfig.url` 拼接，不直接硬编码。

### 5) Admin 所属阶段仍有表述冲突

- README 标注“Phase 4 实施”：`docs/README.md:58,129,161`
- Admin 文档头部仍标注 Phase 3：`docs/03-phase3-seo-infra/07-admin-dashboard.md:3`
- 影响：排期和阶段验收边界不清晰。
- 建议：统一文案（建议全部改为 Phase 4），并考虑将文件迁移到 `docs/04-phase4-advanced/`。

### 6) 阶段依赖清单与 Admin 文档依赖不一致

- 总览 Phase 4 依赖：`docs/00-architecture/overview.md:1348-1356`（`next-auth@beta`, `recharts`）
- Admin 文档还要求：`@auth/core`, `@monaco-editor/react`, `monaco-editor`（`docs/03-phase3-seo-infra/07-admin-dashboard.md:2307-2310,2328`）
- 影响：按总览执行安装会缺包，实际实现中断。
- 建议：把 Admin 必需依赖完整回填到总览依赖矩阵，或标注 Monaco 为可选能力。

### 7) `notes` 文档示例变量名与导入不一致（会直接报错）

- `docs/04-phase4-advanced/04-notes-system.md:341` 导入 `notes`，但 `:344` 使用 `allNotes`
- `docs/04-phase4-advanced/04-notes-system.md:390` 导入 `{ posts, notes }`，但 `:394,401` 使用 `allPosts/allNotes`
- 影响：示例代码不可直接运行。
- 建议：统一变量名（`posts/notes` 或 `allPosts/allNotes` 二选一）。

---

## P2（中优先级）问题

### 8) SEO 图标路径与当前仓库资源不匹配

- 文档写法：`docs/03-phase3-seo-infra/01-seo-optimization.md:152-153` 使用 `/favicon/favicon.svg`
- 当前仓库已有资源：`public/favicon.svg`（无 `public/favicon/` 子目录）
- 影响：按文档实现会产生 404。
- 建议：统一为与仓库结构一致的路径，或补齐对应资源目录。

### 9) 搜索文档过渡方案仍引用非统一数据入口

- `docs/02-phase2-enhancement/02-search.md:498` 使用 `@/lib/velite` + `allPosts`
- 与“唯一查询入口 `src/lib/content.ts`”约定不一致（`docs/README.md:200`）
- 建议：改为基于 `src/lib/content.ts` 的最简过渡实现。

### 10) 单个文档示例引用了当前不存在的静态资源

- `docs/01-phase1-mvp/01-velite-content-system.md:690` 使用 `/images/blog/screenshot.png`
- 当前 `public/` 下未见该资源
- 建议：补图或显式标注“示例占位路径”。

---

## 建议的下一步（最小闭环）

1. 先做一次“文档一致性扫尾”PR：
   - 清理 `@/lib/constants`、同步 `params` 写法、统一 `draft` 字段。
2. 再做一次“配置规范锁定”PR：
   - 固定 canonical 域名与 `siteConfig.url`，清理硬编码 URL。
3. 最后再进入实现：
   - 先按 Phase 1 打通最小链路，避免被 Phase 4 Admin 依赖拖慢。

