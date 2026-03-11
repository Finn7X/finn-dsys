# Phase 1 实现复验报告（Round 2，2026-03-11）

## 1. 复验范围
- 基准文档：`docs/superpowers/plans/2026-03-10-phase1-mvp.md`
- 上轮验收：`docs/acceptance-phase1-implementation-2026-03-10.md`
- 目标：验证上轮阻断问题是否已修复，并重新给出可发布结论

## 2. 复验环境
- 时间：2026-03-11 17:55 CST
- 目录：`/Users/xujifeng/lab/front/finn-days`
- 代码状态：工作区存在未提交改动（按当前实际文件复验）

## 3. 实测命令与结果

### 3.1 质量与构建
1. `npm run lint`
- 结果：通过

2. `npm run build`
- 结果：通过
- 备注：仍有 Next.js 警告，`middleware` 约定已 deprecated（建议迁移 `proxy`）

### 3.2 运行时冒烟（`npx next start -p 8300`）
- `/` -> 200
- `/en` -> 200
- `/blog` -> 200
- `/en/blog` -> 200
- `/blog/hello-world` -> 200
- `/en/blog/hello-world` -> 404（当前无英文文章内容，符合现状）
- `/tags` -> 200
- `/tags/next-js` -> 200
- `/en/tags/next-js` -> 200
- `/tags/react` -> 200
- `/tags/React` -> 200
- `/tags/Next.js` -> 404（旧式 URL，不再是 canonical）
- `/about` -> 200
- `/en/about` -> 200
- `/projects` -> 200
- `/en/projects` -> 200
- `/feed.xml` -> 200
- `/atom.xml` -> 200
- `/favicon.svg` -> 200
- `/favicon/favicon.svg` -> 404（旧路径）

## 4. 上轮问题复验结论

| 上轮问题 | 本轮状态 | 证据 |
|---|---|---|
| 标签 `Next.js` 路由失效（P0） | 已修复（采用 slug） | `src/app/[locale]/tags/page.tsx:60`、`src/app/[locale]/tags/[tag]/page.tsx:13-15`、`src/components/post-header.tsx:62`；`/tags/next-js` 返回 200 |
| favicon/feed 图标路径错误（P0） | 已修复 | `src/app/[locale]/layout.tsx:28`、`src/components/layout/navbar.tsx:16`、`src/lib/feed.ts:14-15`；`/favicon.svg`、feed/atom icon 链接正常 |
| lint 流水线不可用（P1） | 已修复 | `package.json:9` 改为 `eslint .`，`eslint.config.mjs:1-10`；`npm run lint` 通过 |
| locale 泄漏（P1） | 已修复 | `navbar/footer/pagination` 使用 i18n Link：`src/components/layout/navbar.tsx:2`、`src/components/layout/footer.tsx:1`、`src/components/pagination.tsx:1`；`/en/blog` 页面链接保持 `/en/*` |
| 代码复制按钮未生效（P1） | 已修复 | `src/components/mdx-content.tsx:7-16,68-80`；文章页 HTML 已渲染 `aria-label="Copy code"` 按钮 |

## 5. 遗留问题（非阻断）

## P2
1. 英文页面仍包含中文内容数据（内容层 i18n 不完整）
- 现象：`/en/about`、`/en/projects` 仍出现中文段落/描述。
- 代码定位：
  - `src/config/about.ts:6-7,24,30`
  - `content/projects/finn-days-blog.mdx:3,12-22`

2. 首页近期文章日期格式仍硬编码 `zh-CN`
- 代码定位：`src/app/[locale]/page.tsx:91-95`
- 影响：若未来英文首页有文章，日期将以中文地区格式展示。

## P3
1. `middleware` 约定弃用告警仍在
- 代码定位：`src/middleware.ts:1-7`
- 影响：当前不影响功能，但建议后续迁移到 `proxy` 约定。

2. 旧路径兼容未处理
- `old tag url`: `/tags/Next.js` -> 404
- `old icon url`: `/favicon/favicon.svg` -> 404
- 说明：当前 canonical 已统一为新路径，若有外部旧链接可考虑做 301/重定向。

## 6. 复验结论
- 结论：**条件通过（Pass with minor issues）**。
- 说明：上轮所有阻断项（P0/P1）已修复，构建与核心功能通过实测；当前剩余问题主要为内容本地化完整性和技术债，不阻断 Phase 1 验收通过。

## 7. 建议后续动作
1. 若要达到“完整双语内容”标准，补齐 `about/projects` 的英文内容源。
2. 将首页日期格式改为按 locale 动态格式化（与 `post-card/post-header` 做法一致）。
3. 评估是否为旧 URL 增加重定向策略。
4. 规划 `middleware -> proxy` 迁移窗口，提前消除升级风险。
