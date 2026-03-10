# CI/CD 流水线方案

> Finn Days 博客 - Phase 3: SEO 与基础设施
> 文档版本：v1.0
> 最后更新：2026-03-09

---

## 一、概述

持续集成/持续部署 (CI/CD) 是现代软件工程的核心实践。本文档详细规划 Finn Days 博客基于 GitHub Actions 的自动化流水线，实现从代码提交到线上部署的全自动化流程。

### 目标

- 代码推送到 `main` 分支后自动触发部署
- 自动执行代码检查（lint + type-check）
- 自动构建 Docker 镜像并推送至容器仓库（GHCR）
- 自动部署至生产服务器
- 构建失败时及时通知

### 流水线概览

```
push to main
    │
    ▼
┌─────────────┐
│  Code Check │  lint + type-check
└──────┬──────┘
       │ 通过
       ▼
┌─────────────┐
│ Build Next  │  npm run build
└──────┬──────┘
       │ 通过
       ▼
┌─────────────┐
│ Build Image │  docker build
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Push Image  │  → GHCR (ghcr.io)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Deploy    │  SSH → docker pull + restart
└─────────────┘
```

---

## 二、技术方案

### 2.1 GitHub Actions 基础

GitHub Actions 是 GitHub 内置的 CI/CD 服务，具有以下优势：

- 与 GitHub 仓库深度集成
- 免费额度充足（公开仓库无限制，私有仓库 2000 分钟/月）
- 丰富的社区 Actions 生态
- 支持 Linux/macOS/Windows 运行环境
- 支持 Docker 构建
- 内置 Secrets 管理

### 2.2 容器仓库：GHCR

GitHub Container Registry (GHCR) 是 GitHub 提供的容器镜像仓库服务：

- 与 GitHub 账户集成，无需额外注册
- 公开镜像免费，私有镜像有存储限制
- 地址格式：`ghcr.io/finn7x/finn-days:tag`
- 支持多平台镜像

### 2.3 部署方式：SSH 远程执行

通过 SSH 连接到生产服务器，执行 `docker pull` + `docker compose up -d` 完成部署更新。

---

## 三、实现步骤

### 3.1 完整工作流配置

**文件：`.github/workflows/deploy.yml`**

```yaml
name: Build and Deploy

# 触发条件
on:
  push:
    branches:
      - main
    # 可选：仅在特定路径变更时触发
    # paths-ignore:
    #   - "docs/**"
    #   - "*.md"
    #   - ".gitignore"

  # 支持手动触发
  workflow_dispatch:

# 环境变量
env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

# 权限
permissions:
  contents: read
  packages: write

jobs:
  # ============================================================
  # Job 1: 代码检查
  # ============================================================
  check:
    name: Code Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript type check
        run: npx tsc --noEmit

  # ============================================================
  # Job 2: 构建并推送 Docker 镜像
  # ============================================================
  build-and-push:
    name: Build & Push Docker Image
    runs-on: ubuntu-latest
    needs: check  # 依赖代码检查通过
    outputs:
      image-tag: ${{ steps.meta.outputs.version }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata (tags, labels)
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            # 最新标签
            type=raw,value=latest,enable={{is_default_branch}}
            # Git SHA 短标签
            type=sha,prefix=,format=short
            # 时间戳标签
            type=raw,value={{date 'YYYYMMDD-HHmmss'}}

      - name: Build and push Docker image
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          # 利用 GitHub Actions 缓存加速构建
          cache-from: type=gha
          cache-to: type=gha,mode=max
          # 可选：多平台构建
          # platforms: linux/amd64,linux/arm64

  # ============================================================
  # Job 3: 部署至生产服务器
  # ============================================================
  deploy:
    name: Deploy to Server
    runs-on: ubuntu-latest
    needs: build-and-push  # 依赖镜像推送完成
    environment: production  # 可选：使用 GitHub Environment 保护规则
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          port: ${{ secrets.DEPLOY_PORT || 22 }}
          script: |
            # 进入项目目录
            cd /opt/finn-days

            # 登录 GHCR
            echo "${{ secrets.GHCR_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin

            # 拉取最新镜像
            docker pull ghcr.io/${{ github.repository }}:latest

            # 使用 Docker Compose 重启博客服务
            docker compose up -d blog --force-recreate

            # 清理旧镜像
            docker image prune -f

            # 验证服务状态
            sleep 5
            curl -sf http://localhost:8200 > /dev/null && echo "Deploy successful!" || echo "Deploy may have failed!"

  # ============================================================
  # Job 4: 部署通知（可选）
  # ============================================================
  notify:
    name: Notify
    runs-on: ubuntu-latest
    needs: [check, build-and-push, deploy]
    if: always()
    steps:
      - name: Notify on failure
        if: contains(needs.*.result, 'failure')
        run: |
          echo "::error::Deployment failed! Check the logs for details."
          # 可选：发送通知到 Slack/Telegram/Email
          # curl -X POST "${{ secrets.SLACK_WEBHOOK }}" \
          #   -H "Content-Type: application/json" \
          #   -d '{"text":"Finn Days deployment FAILED for commit ${{ github.sha }}"}'

      - name: Notify on success
        if: "!contains(needs.*.result, 'failure')"
        run: |
          echo "Deployment completed successfully!"
          # 可选：发送成功通知
```

### 3.2 GitHub Secrets 配置

在 GitHub 仓库的 Settings → Secrets and variables → Actions 中配置以下 Secrets：

| Secret 名称 | 说明 | 示例值 |
|-------------|------|--------|
| `DEPLOY_HOST` | 生产服务器 IP 或域名 | `203.0.113.50` |
| `DEPLOY_USER` | SSH 登录用户名 | `deploy` |
| `DEPLOY_KEY` | SSH 私钥 | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `DEPLOY_PORT` | SSH 端口（可选，默认 22） | `22` |
| `GHCR_TOKEN` | GHCR 访问令牌（服务器拉取镜像用） | `ghp_xxxxxxxxxxxx` |

**注意：** `GITHUB_TOKEN` 是 GitHub Actions 内置的，无需手动配置。它具有推送镜像到 GHCR 的权限。

#### 配置 SSH 密钥

```bash
# 在本地生成 SSH 密钥对（用于 CI/CD 部署）
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key

# 将公钥添加到服务器的 authorized_keys
ssh-copy-id -i ~/.ssh/deploy_key.pub deploy@your-server

# 将私钥内容（~/.ssh/deploy_key）配置为 GitHub Secret DEPLOY_KEY
cat ~/.ssh/deploy_key
```

#### 生成 GHCR Token

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 勾选 `read:packages` 权限
3. 生成 Token，配置为 GitHub Secret `GHCR_TOKEN`
4. 在服务器上测试登录：

```bash
echo "YOUR_TOKEN" | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

### 3.3 Docker 镜像标签策略

工作流中使用 `docker/metadata-action` 自动生成多个标签：

| 标签格式 | 示例 | 用途 |
|---------|------|------|
| `latest` | `ghcr.io/finn7x/finn-days:latest` | 始终指向最新构建 |
| `sha-<short>` | `ghcr.io/finn7x/finn-days:sha-a1b2c3d` | 精确到 commit |
| `YYYYMMDD-HHmmss` | `ghcr.io/finn7x/finn-days:20260309-143022` | 按时间回溯 |

**回滚操作：** 如果最新部署有问题，可以使用 SHA 标签快速回滚：

```bash
# 回滚到指定版本
docker pull ghcr.io/finn7x/finn-days:sha-a1b2c3d
docker compose up -d blog --force-recreate
```

### 3.4 服务器端 Docker Compose 配置

在生产服务器上的 `/opt/finn-days/docker-compose.yml` 中，blog 服务使用预构建的镜像而非本地构建：

```yaml
services:
  blog:
    image: ghcr.io/finn7x/finn-days:latest
    container_name: finn-days-blog
    restart: unless-stopped
    ports:
      - "8200:8200"
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_UMAMI_URL: ${NEXT_PUBLIC_UMAMI_URL}
      NEXT_PUBLIC_UMAMI_ID: ${NEXT_PUBLIC_UMAMI_ID}
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8200 || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - finn-days-network
```

---

## 四、构建缓存优化

### 4.1 Docker 层缓存（GitHub Actions Cache）

工作流中已配置 GitHub Actions 缓存作为 Docker 构建缓存后端：

```yaml
- name: Build and push Docker image
  uses: docker/build-push-action@v6
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

这会缓存 Docker 构建的每一层，下次构建时如果 Dockerfile 和文件内容没有变化，直接使用缓存，大幅减少构建时间。

### 4.2 npm 依赖缓存

Node.js 的 `setup-node` Action 内置了 npm 缓存支持：

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: "22"
    cache: "npm"  # 自动缓存 node_modules
```

### 4.3 Dockerfile 优化

优化 Dockerfile 的层结构以最大化缓存命中率：

```dockerfile
# 构建阶段
FROM node:22-alpine AS builder
WORKDIR /app

# 先复制 package 文件（这一层很少变化，缓存命中率高）
COPY package*.json ./
RUN npm ci

# 再复制源代码（这一层经常变化）
COPY . .
RUN npm run build

# 生产阶段
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8200

# 只复制必要文件
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 8200

CMD ["node", "server.js"]
```

**关键优化点：**

1. 使用 `npm ci` 代替 `npm install`：更快、更确定性
2. 分离 `package.json` 复制和源码复制：利用 Docker 层缓存
3. 使用 Next.js standalone 输出模式：减小最终镜像体积

**启用 standalone 模式（`next.config.ts`）：**

```typescript
const nextConfig: NextConfig = {
  output: "standalone",
};
```

---

## 五、可选方案：Watchtower 自动更新

Watchtower 是一个 Docker 容器自动更新工具，可以定期检查镜像更新并自动重启容器。

### 5.1 Watchtower 配置

```yaml
# docker-compose.yml（服务器端）
services:
  watchtower:
    image: containrrr/watchtower
    container_name: watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      # GHCR 认证配置
      - /root/.docker/config.json:/config.json:ro
    environment:
      # 仅监控特定容器
      WATCHTOWER_LABEL_ENABLE: "true"
      # 检查间隔（秒），默认 300
      WATCHTOWER_POLL_INTERVAL: 60
      # 更新后清理旧镜像
      WATCHTOWER_CLEANUP: "true"
      # 更新通知（可选）
      # WATCHTOWER_NOTIFICATION_URL: "slack://hook/xxx"
    networks:
      - finn-days-network

  blog:
    image: ghcr.io/finn7x/finn-days:latest
    labels:
      - "com.centurylinklabs.watchtower.enable=true"
    # ... 其他配置
```

### 5.2 Watchtower vs SSH 部署对比

| 方面 | SSH 部署 | Watchtower |
|------|---------|-----------|
| 部署速度 | 即时（推送后立即部署） | 有轮询延迟（默认 5 分钟） |
| 配置复杂度 | 需要配置 SSH 密钥 | 需要配置 Docker socket 挂载 |
| 可靠性 | 高（主动部署） | 高（自动检测更新） |
| 回滚能力 | 手动指定版本 | 不支持自动回滚 |
| 推荐场景 | 需要精确控制的生产环境 | 个人项目/简单部署 |

**建议：** 初期使用 SSH 部署（可控性强），后期如果觉得流水线维护成本高，可以切换到 Watchtower。

---

## 六、分支保护规则

建议在 GitHub 仓库中配置分支保护规则，提高代码质量保障：

### 6.1 保护 main 分支

在 GitHub → Settings → Branches → Branch protection rules 中配置：

| 规则 | 建议 |
|------|------|
| Require pull request before merging | 可选（个人项目可关闭） |
| Require status checks to pass | 开启，要求 `check` job 通过 |
| Require branches to be up to date | 开启 |
| Include administrators | 可选 |
| Restrict pushes | 可选 |

### 6.2 Status Checks

配置要求以下检查通过才能合并：

```
✓ Code Check (check)
```

---

## 七、失败通知

### 7.1 GitHub 内置通知

GitHub Actions 默认会在工作流失败时发送邮件通知（前提是在 GitHub 设置中开启了通知）。

### 7.2 Slack 通知（可选）

```yaml
- name: Slack Notification
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: "Finn Days deployment failed!"
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 7.3 Telegram 通知（可选）

```yaml
- name: Telegram Notification
  if: failure()
  uses: appleboy/telegram-action@v0.1.1
  with:
    to: ${{ secrets.TELEGRAM_CHAT_ID }}
    token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    message: |
      Finn Days deployment FAILED!
      Commit: ${{ github.sha }}
      Author: ${{ github.actor }}
      Details: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
```

---

## 八、文件清单

| 文件路径 | 说明 |
|---------|------|
| `.github/workflows/deploy.yml` | GitHub Actions 工作流配置 |
| `Dockerfile` | Docker 镜像构建文件 |
| `docker-compose.yml`（服务器端） | 生产环境 Docker Compose |
| `next.config.ts` | Next.js 配置（standalone 输出） |

---

## 九、依赖说明

### GitHub Actions 使用的 Actions

| Action | 版本 | 说明 |
|--------|------|------|
| `actions/checkout` | v4 | 检出代码 |
| `actions/setup-node` | v4 | 设置 Node.js 环境 |
| `docker/setup-buildx-action` | v3 | 设置 Docker Buildx |
| `docker/login-action` | v3 | 登录容器仓库 |
| `docker/metadata-action` | v5 | 生成 Docker 标签和标签 |
| `docker/build-push-action` | v6 | 构建并推送 Docker 镜像 |
| `appleboy/ssh-action` | v1 | SSH 远程执行命令 |

### 服务器端要求

| 要求 | 说明 |
|------|------|
| Docker Engine | 24.0+ |
| Docker Compose | v2.20+ |
| SSH Server | OpenSSH |
| 磁盘空间 | 至少 2GB 可用空间 |

---

## 十、测试要点

### 10.1 工作流语法验证

```bash
# 使用 actionlint 验证工作流语法
# 安装：https://github.com/rhysd/actionlint
actionlint .github/workflows/deploy.yml
```

### 10.2 本地模拟测试

```bash
# 使用 act 在本地模拟运行 GitHub Actions
# 安装：https://github.com/nektos/act
act -j check  # 仅运行 check job
```

### 10.3 部署验证

```bash
# 工作流完成后，在服务器上验证
docker ps  # 检查容器状态
docker logs finn-days-blog  # 查看博客日志
curl -sf http://localhost:8200  # 健康检查
```

### 10.4 回滚测试

```bash
# 测试回滚到指定版本
docker pull ghcr.io/finn7x/finn-days:sha-a1b2c3d
docker compose up -d blog --force-recreate
curl -sf http://localhost:8200  # 验证回滚后服务正常
```

---

## 十一、注意事项

1. **Secrets 安全**：永远不要在工作流文件或日志中明文输出 Secrets。GitHub Actions 会自动遮蔽已知的 Secret 值。

2. **SSH 密钥管理**：部署专用的 SSH 密钥建议使用 Ed25519 算法，并设置密钥过期策略。在服务器端限制该密钥只能执行特定命令（通过 `authorized_keys` 的 `command=` 选项）。

3. **GHCR 镜像清理**：GHCR 有存储限制。建议定期清理旧镜像：

   ```bash
   # 删除 30 天前的未标记镜像
   # 可在 GitHub Packages 页面手动管理
   # 或使用 ghcr-cleanup-action
   ```

4. **构建超时**：GitHub Actions 默认超时为 6 小时。对于 Next.js 项目，构建通常在 5-10 分钟内完成。可以设置更短的超时：

   ```yaml
   jobs:
     build-and-push:
       timeout-minutes: 15
   ```

5. **并发控制**：避免多次推送导致并发部署冲突：

   ```yaml
   concurrency:
     group: deploy-${{ github.ref }}
     cancel-in-progress: true
   ```

6. **环境保护**：对于 `deploy` job，建议使用 GitHub Environment 配置审批流程（个人项目可选）。

7. **镜像体积**：使用 standalone 输出模式 + Alpine 基础镜像，最终镜像体积约 100-200MB。定期检查镜像体积，避免不必要的膨胀。

8. **日志保留**：GitHub Actions 日志默认保留 90 天。重要的部署日志可以额外保存到服务器或日志服务。

---

*本文档为 Finn Days 博客 CI/CD 流水线方案的完整参考。*
