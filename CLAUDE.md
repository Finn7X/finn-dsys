# Finn Days 博客 — Agent 开发指南

## 项目概况

Next.js 16 个人博客，TypeScript + Tailwind CSS + Velite (MDX 内容管理)。
线上地址：https://finn7x.com，部署在 `/home/finn-dsys/`，通过 Docker + Nginx 反代运行。

## CI/CD 流水线

两条 GitHub Actions workflow，触发方式不同：

### 普通 push → 仅 CI 验证（不部署）

```
git push origin main
```

触发 `.github/workflows/ci.yml`：lint → velite 类型生成 → tsc type-check → next build。
失败会发邮件通知，不影响线上环境。

### 带 Tag push → 自动部署线上

```
git tag v<版本号>
git push origin v<版本号>
```

触发 `.github/workflows/deploy.yml`：CI 验证 → Docker 构建 → 推送 GHCR → SSH 部署服务器。
Tag 必须以 `v` 开头，使用语义化版本（如 `v0.2.0`、`v1.0.0`）。

### 发布操作示例

```bash
# 1. 提交代码并推送（仅触发 CI 验证）
git add <files>
git commit -m "feat: 新增文章分类功能"
git push origin main

# 2. 确认 CI 通过后，打标签发布（触发部署）
git tag v0.3.0
git push origin v0.3.0
```

## 提交规范

使用 Conventional Commits 格式：

```
<type>: <简要描述>
```

| type     | 用途           |
| -------- | -------------- |
| feat     | 新功能         |
| fix      | 修复 bug       |
| docs     | 文档变更       |
| style    | 样式调整       |
| refactor | 重构           |
| ci       | CI/CD 配置变更 |
| chore    | 杂项           |

## 构建注意事项

- 运行 `tsc --noEmit` 前必须先执行 `npx velite` 生成 `.velite/` 类型定义目录，否则 `#site/content` 模块找不到
- `.velite/` 已 gitignore，每次 CI 和本地检查都需要重新生成
- 本地完整构建：`npm run build`（内部已包含 `velite && next build`）

## 服务器环境

- 项目路径：`/home/finn-dsys/`
- Docker Compose 管理三个服务：`finn-blog`（博客）、`finn-days-umami`（分析）、`finn-days-db`（PostgreSQL）
- Nginx 反代：`finn7x.com → 127.0.0.1:7900`，博客容器内部端口 8200
- 环境变量：`/home/finn-dsys/.env`（已 gitignore）
- 服务器有代理配置，git push 遇到 TLS 错误时用 `https_proxy="" git push` 绕过

## 手动部署（不经过 CI）

```bash
cd /home/finn-dsys
docker compose build blog
docker compose up -d blog --force-recreate
```

## 回滚

```bash
cd /home/finn-dsys
docker pull ghcr.io/finn7x/finn-dsys:sha-<commit短hash>
docker compose up -d blog --force-recreate --no-build
```
