# Finn Days 架构与分阶段方案 Review（Codex）

审阅时间：2026-03-10  
审阅范围：
- `docs/00-architecture/overview.md`
- `docs/01-phase1-mvp/*.md`
- `docs/02-phase2-enhancement/*.md`
- `docs/03-phase3-seo-infra/*.md`
- `docs/04-phase4-advanced/*.md`
- `docs/README.md`

## 总结结论

整体方向正确（技术栈、阶段拆分、内容驱动架构都合理），但当前文档集存在**多处“可执行性冲突”**：文档导航失效、核心数据模型不一致、同一技术点写法冲突、Phase 3 范围漂移。  
在进入开发前，建议先完成一次“文档基线清理”，否则后续实现会频繁返工。

---

## P0（阻塞级）问题

### 1) 文档导航失效，README 与实际文件不一致

- 证据：`docs/README.md:84-132` 大量链接指向不存在文件（如 `velite-setup.md`、`command-palette.md`、`tech-blogs-research.md` 等）。
- 影响：开发者按索引无法打开正确文档，协作和评审链路中断。
- 建议：
  - 以当前真实文件名（带序号）统一重写 README 索引。
  - 增加一个 CI 检查：扫描 Markdown 相对链接是否存在。

### 2) 核心内容模型与代码组织约定冲突（`draft`/`published`、`content.ts`/`posts.ts`、Velite/Contentlayer 混用）

- 证据：
  - `docs/01-phase1-mvp/01-velite-content-system.md:130` 使用 `draft` 字段；
  - `docs/02-phase2-enhancement/07-series-navigation.md:59,111` 改为 `published`；
  - `docs/01-phase1-mvp/01-velite-content-system.md:441` 约定 `src/lib/content.ts`；
  - `docs/02-phase2-enhancement/07-series-navigation.md:81` 改为 `src/lib/posts.ts`；
  - `docs/04-phase4-advanced/04-notes-system.md:137,196` 与 `docs/04-phase4-advanced/06-view-transitions.md:475` 重新引用 `contentlayer/generated`。
- 影响：实现方无法确定唯一数据契约，容易出现重复实现、类型漂移、筛选逻辑错误。
- 建议：
  - 定义唯一内容契约：统一为 Velite + `draft`（或统一为 `published`，二选一）。
  - 统一查询入口（建议 `src/lib/content.ts` 单入口）。
  - 全文清理 Contentlayer 残留示例，避免混用。

### 3) Next.js 路由参数写法不一致（同步/异步混写）

- 证据：
  - 异步写法：`docs/01-phase1-mvp/03-blog-list-page.md:394-401`（`searchParams: Promise<...>`）
  - 同步写法：`docs/00-architecture/overview.md:481-483`、`docs/02-phase2-enhancement/01-comment-system.md:218`、`docs/04-phase4-advanced/02-mdx-components.md:81-82`
- 影响：团队按不同文档实现会出现类型冲突和升级风险。
- 建议：
  - 增加“Next.js 16 参数规范”单页（只保留一种写法）。
  - 全文档统一替换示例签名。

### 4) Phase 3 范围定义前后冲突（是否包含 Admin）

- 证据：
  - 架构总览 Phase 3 任务不含 Admin：`docs/00-architecture/overview.md:1200-1209`
  - 但 README 将 Admin Dashboard 归入 Phase 3：`docs/README.md:114`
  - 且依赖矩阵写“Phase 3 无新 npm 包”：`docs/00-architecture/overview.md:1303-1307`
  - 同时 Admin 文档要求新增 `next-auth@beta/recharts/monaco`：`docs/03-phase3-seo-infra/07-admin-dashboard.md:2306-2310,2322-2328`
- 影响：排期与资源估算失真，Phase 3 交付边界不清晰。
- 建议：
  - 明确决策：Admin 要么移出主线路（Phase 5/独立里程碑），要么正式纳入 Phase 3 并重写依赖/工期/风险评估。

---

## P1（高优先级）问题

### 5) i18n 放在 Phase 4，但设计是全局路由重构，返工成本高

- 证据：
  - i18n 位于 Phase 4：`docs/00-architecture/overview.md:1223`
  - 同时要求把 `app` 结构整体迁移到 `[locale]`：`docs/04-phase4-advanced/05-i18n.md:251-267`
- 影响：会反向影响前 1-3 阶段所有路由、SEO、Sitemap、Feed、内部链接。
- 建议：
  - 若确定要做多语言，应前置到 Phase 1/2 设计层，至少先冻结 URL 与内容模型。

### 6) 项目命名与镜像命名不一致（`finn-days` vs `finn-dsys`）

- 证据：
  - 包名：`package.json:2` 为 `finn-days`
  - 目标目录写 `finn-dsys/`：`docs/00-architecture/overview.md:198`
  - CI/CD 与 Compose 多处使用 `ghcr.io/finn7x/finn-dsys`：`docs/03-phase3-seo-infra/04-cicd-pipeline.md:295-297,314`
- 影响：部署文档执行时容易拉错镜像/配置错仓库。
- 建议：统一仓库名、镜像名、目录名三者；在文档开头声明 canonical 名称。

### 7) 主题持久化描述有误导

- 证据：
  - 架构文档写 next-themes 为 Cookie 持久化：`docs/00-architecture/overview.md:616`
  - 主题文档又说明默认是 localStorage，但“cookie 配置”示例仅设置 `storageKey`：`docs/01-phase1-mvp/06-theme-switching.md:479-489`
- 影响：会让实现方误以为已具备服务端可读主题状态。
- 建议：明确“默认 localStorage；若要 SSR 可读需额外自定义 cookie 方案”。

### 8) 站点配置文件路径不统一（`src/config/site.ts` vs `src/lib/constants.ts`）

- 证据：
  - Phase 1 使用 `src/config/site.ts`：`docs/01-phase1-mvp/02-layout-components.md:82`
  - Phase 2/3 多文档改用 `src/lib/constants.ts`：`docs/02-phase2-enhancement/01-comment-system.md:98`、`docs/03-phase3-seo-infra/01-seo-optimization.md:171`
- 影响：同一常量在不同位置重复定义，后期维护成本高。
- 建议：统一一个配置入口（建议 `src/config/site.ts` + 细分子模块）。

---

## P2（中优先级）问题

### 9) 依赖安装命令与依赖类型表格不一致

- 证据：`docs/00-architecture/overview.md:1273` 将 `@tailwindcss/typography` 放在“生产依赖安装”，但表格 `1286` 标注为 `dev`。
- 建议：统一为 `npm i -D @tailwindcss/typography`（若按你当前规范确认为 dev）。

### 10) 部分静态资源路径示例与现状不匹配

- 证据：SEO 文档图标路径为 `/favicon/favicon.svg`：`docs/03-phase3-seo-infra/01-seo-optimization.md:152-153`；当前仓库已有 `public/favicon.svg`。
- 建议：统一路径约定，避免上线后 404。

---

## 分阶段审阅建议（执行视角）

### Phase 1（MVP）

- 优点：内容系统、路由、主题、RSS 拆分合理，具备可交付路径。
- 必修订：先锁定内容模型字段（`draft`/`published`）和配置文件位置，再推进页面实现。

### Phase 2（体验增强）

- 优点：功能集合对博客价值高（评论、搜索、分享、作者卡片）。
- 必修订：统一 `params/searchParams` 写法；统一对 `content.ts` 的数据访问方式。

### Phase 3（SEO/Infra）

- 优点：SEO + CI/CD + Compose 组合完整。
- 必修订：先明确是否包含 Admin Dashboard；若包含，需重做依赖矩阵、风险评估和里程碑定义。

### Phase 4（进阶）

- 优点：Cmd+K、MDX 组件、Sandpack、i18n、Transitions 有明显差异化价值。
- 必修订：清理 Contentlayer 示例；将 i18n 对前序阶段的影响前置建模。

---

## 建议的修订顺序（建议先做文档再做开发）

1. 修复 `docs/README.md` 所有失效链接。  
2. 发布“单一数据契约”文档（字段、路径、查询入口、类型来源）。  
3. 全文统一 Next.js 参数签名与示例代码风格。  
4. 重新定义 Phase 3 范围（是否含 Admin）并同步路线图与依赖矩阵。  
5. 统一命名（项目名/仓库名/镜像名/域名）与环境变量模板。  
6. 对 i18n 迁移做影响清单（路由、SEO、Sitemap、Feed、内部链接、分析上报）。

