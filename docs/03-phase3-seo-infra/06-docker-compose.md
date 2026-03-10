# Docker Compose 编排方案

> Finn Days 博客 - Phase 3: SEO 与基础设施
> 文档版本：v1.0
> 最后更新：2026-03-09

---

## 一、概述

Docker Compose 用于编排 Finn Days 博客的完整服务栈，包括博客应用、Umami 分析服务和 PostgreSQL 数据库。通过统一的 `docker-compose.yml` 文件实现一键启动、停止和管理所有服务。

### 目标

- 统一编排博客 + Umami + PostgreSQL 三个服务
- 健康检查确保服务可用性
- 数据卷持久化保护数据安全
- 网络隔离提升安全性
- 提供常用运维命令参考

### 整体服务架构

```
┌─────────────────────────────────────────────────┐
│                  Docker Host                     │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │         finn-days-network (bridge)       │    │
│  │                                          │    │
│  │  ┌────────────┐    ┌──────────────┐      │    │
│  │  │   blog     │    │    umami     │      │    │
│  │  │ Next.js    │    │  分析服务     │      │    │
│  │  │ :8200→8200 │    │ :3001→3000   │      │    │
│  │  └────────────┘    └──────┬───────┘      │    │
│  │                           │              │    │
│  │                    ┌──────┴───────┐      │    │
│  │                    │     db       │      │    │
│  │                    │ PostgreSQL   │      │    │
│  │                    │ :5432(内部)  │      │    │
│  │                    └──────────────┘      │    │
│  │                           │              │    │
│  └──────────────────────────────────────────┘    │
│                              │                   │
│                     ┌────────┴────────┐          │
│                     │   umami-data    │          │
│                     │  (Docker Volume)│          │
│                     └─────────────────┘          │
└──────────────────────────────────────────────────┘
```

---

## 二、技术方案

### 2.1 服务组成

| 服务 | 镜像 | 端口 | 说明 |
|------|------|------|------|
| **blog** | `ghcr.io/finn7x/finn-dsys:latest` 或本地构建 | 8200:8200 | Next.js 博客应用 |
| **umami** | `ghcr.io/umami-software/umami:postgresql-latest` | 3001:3000 | Umami 分析服务 |
| **db** | `postgres:16-alpine` | 无（仅内部访问） | PostgreSQL 数据库 |

### 2.2 网络设计

- 使用自定义 bridge 网络 `finn-days-network`
- 三个服务在同一网络内，通过服务名互相访问
- PostgreSQL 不暴露端口到宿主机，仅在 Docker 内部网络中可访问
- 博客和 Umami 通过端口映射暴露到宿主机

### 2.3 数据持久化

- PostgreSQL 数据通过 Docker Volume `umami-data` 持久化
- 容器重启/重建不会丢失数据

---

## 三、实现步骤

### 3.1 完整 docker-compose.yml

**文件：`docker-compose.yml`**

```yaml
# Finn Days 博客 - Docker Compose 编排
# 服务栈：Blog + Umami + PostgreSQL

version: "3.8"

services:
  # ============================================================
  # 博客服务 (Next.js)
  # ============================================================
  blog:
    # 方式一：从容器仓库拉取预构建镜像（CI/CD 部署使用）
    image: ghcr.io/finn7x/finn-dsys:latest
    # 方式二：本地构建（开发/测试使用）
    # build:
    #   context: .
    #   dockerfile: Dockerfile
    container_name: finn-days-blog
    restart: unless-stopped
    ports:
      - "${BLOG_PORT:-8200}:8200"
    environment:
      NODE_ENV: production
      PORT: 8200
      # Umami 集成
      NEXT_PUBLIC_UMAMI_URL: ${NEXT_PUBLIC_UMAMI_URL:-}
      NEXT_PUBLIC_UMAMI_ID: ${NEXT_PUBLIC_UMAMI_ID:-}
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8200 || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    networks:
      - finn-days-network
    # 可选：资源限制
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "1.0"
        reservations:
          memory: 256M

  # ============================================================
  # Umami 分析服务
  # ============================================================
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    container_name: finn-days-umami
    restart: unless-stopped
    ports:
      - "${UMAMI_PORT:-3001}:3000"
    environment:
      DATABASE_URL: postgresql://umami:${UMAMI_DB_PASSWORD}@db:5432/umami
      APP_SECRET: ${UMAMI_APP_SECRET}
      # 禁用 Umami 遥测
      DISABLE_TELEMETRY: 1
      # 可选：自定义 Umami 配置
      # TRACKER_SCRIPT_NAME: custom-script-name  # 自定义脚本文件名（防屏蔽）
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:3000/api/heartbeat || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - finn-days-network
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.5"
        reservations:
          memory: 256M

  # ============================================================
  # PostgreSQL 数据库
  # ============================================================
  db:
    image: postgres:16-alpine
    container_name: finn-days-db
    restart: unless-stopped
    # 不暴露端口到宿主机，仅内部网络可访问
    # ports:
    #   - "5432:5432"  # 仅调试时启用
    volumes:
      - umami-data:/var/lib/postgresql/data
      # 可选：自定义初始化脚本
      # - ./init-db.sql:/docker-entrypoint-initdb.d/init.sql
    environment:
      POSTGRES_DB: umami
      POSTGRES_USER: umami
      POSTGRES_PASSWORD: ${UMAMI_DB_PASSWORD}
      # 可选：PostgreSQL 调优参数
      # POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U umami -d umami"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 20s
    networks:
      - finn-days-network
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: "0.5"
        reservations:
          memory: 128M

# ============================================================
# 数据卷
# ============================================================
volumes:
  umami-data:
    name: finn-days-umami-data
    driver: local

# ============================================================
# 网络
# ============================================================
networks:
  finn-days-network:
    name: finn-days-network
    driver: bridge
```

### 3.2 各服务配置详解

#### blog 服务

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `image` | `ghcr.io/finn7x/finn-dsys:latest` | 预构建镜像（CI/CD 推送） |
| `container_name` | `finn-days-blog` | 容器名称，便于管理 |
| `restart` | `unless-stopped` | 除非手动停止，否则自动重启 |
| `ports` | `8200:8200` | 宿主机端口映射 |
| `healthcheck` | `curl -f http://localhost:8200` | HTTP 健康检查 |
| `deploy.resources` | 512M / 1 CPU | 资源限制 |

**本地构建模式（开发/测试）：**

如果需要在服务器上从源码构建而非使用预构建镜像：

```yaml
blog:
  build:
    context: .
    dockerfile: Dockerfile
    # 可选：构建参数
    args:
      - NEXT_PUBLIC_UMAMI_URL=${NEXT_PUBLIC_UMAMI_URL}
      - NEXT_PUBLIC_UMAMI_ID=${NEXT_PUBLIC_UMAMI_ID}
  # 注释掉 image 行
  # image: ghcr.io/finn7x/finn-dsys:latest
```

#### umami 服务

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `image` | `ghcr.io/umami-software/umami:postgresql-latest` | Umami 官方 PostgreSQL 版镜像 |
| `DATABASE_URL` | `postgresql://umami:password@db:5432/umami` | 数据库连接字符串 |
| `APP_SECRET` | 环境变量 | JWT 签名密钥 |
| `depends_on` | `db (service_healthy)` | 等待数据库健康后启动 |
| `DISABLE_TELEMETRY` | `1` | 禁用 Umami 自身的遥测 |

#### db 服务 (PostgreSQL)

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `image` | `postgres:16-alpine` | Alpine 轻量版 PostgreSQL 16 |
| `volumes` | `umami-data:/var/lib/postgresql/data` | 数据持久化到 Docker Volume |
| `POSTGRES_DB` | `umami` | 初始数据库名 |
| `POSTGRES_USER` | `umami` | 数据库用户名 |
| `POSTGRES_PASSWORD` | 环境变量 | 数据库密码 |
| `healthcheck` | `pg_isready` | PostgreSQL 就绪检查 |

### 3.3 环境变量文件

**文件：`.env`**

```bash
# ============================================================
# Finn Days Docker Compose 环境变量
# ============================================================

# ---------- 博客服务 ----------
# 博客端口（默认 8200）
BLOG_PORT=8200

# Umami 分析集成
NEXT_PUBLIC_UMAMI_URL=https://analytics.finn-days.com
NEXT_PUBLIC_UMAMI_ID=your-website-id-here

# ---------- Umami 服务 ----------
# Umami 访问端口（默认 3001）
UMAMI_PORT=3001

# Umami 应用密钥（JWT 签名，请使用随机字符串）
# 生成命令：openssl rand -hex 32
UMAMI_APP_SECRET=change_me_to_random_string

# ---------- 数据库 ----------
# PostgreSQL 密码（请使用强密码）
# 生成命令：openssl rand -base64 24
UMAMI_DB_PASSWORD=change_me_to_strong_password
```

**安全提醒：**

```bash
# .env 文件包含敏感信息，必须加入 .gitignore
echo ".env" >> .gitignore

# 可以提供一个 .env.example 作为模板（不含真实密码）
cp .env .env.example
# 然后编辑 .env.example，将真实密码替换为占位符
```

**文件：`.env.example`（提交到 Git 作为参考）**

```bash
# Finn Days Docker Compose 环境变量模板
# 复制此文件为 .env 并填入实际值

BLOG_PORT=8200
NEXT_PUBLIC_UMAMI_URL=https://analytics.your-domain.com
NEXT_PUBLIC_UMAMI_ID=

UMAMI_PORT=3001
UMAMI_APP_SECRET=
UMAMI_DB_PASSWORD=
```

### 3.4 网络配置说明

```yaml
networks:
  finn-days-network:
    name: finn-days-network
    driver: bridge
```

- **bridge 网络**：Docker 默认的网络驱动，在单机环境下使用
- **服务名解析**：同一网络内的容器可通过服务名互相访问（如 `db:5432`）
- **隔离性**：不同 Docker Compose 项目的网络默认隔离
- **命名网络**：使用 `name` 固定网络名称，避免使用项目前缀

### 3.5 数据卷管理

```yaml
volumes:
  umami-data:
    name: finn-days-umami-data
    driver: local
```

- **命名卷**：使用 `name` 固定卷名称
- **持久化**：容器删除后卷数据保留
- **位置**：默认在 `/var/lib/docker/volumes/finn-days-umami-data/_data`

```bash
# 查看卷详情
docker volume inspect finn-days-umami-data

# 查看所有卷
docker volume ls

# 清理未使用的卷（谨慎操作）
docker volume prune
```

---

## 四、常用运维命令

### 4.1 启动/停止/重启

```bash
# 启动所有服务（后台运行）
docker compose up -d

# 启动指定服务
docker compose up -d blog
docker compose up -d umami db

# 停止所有服务
docker compose down

# 停止并删除卷（删除所有数据，谨慎操作）
docker compose down -v

# 重启所有服务
docker compose restart

# 重启指定服务
docker compose restart blog

# 强制重建容器（不使用缓存）
docker compose up -d --force-recreate

# 仅重建博客服务（更新镜像后）
docker compose up -d blog --force-recreate
```

### 4.2 查看日志

```bash
# 查看所有服务日志
docker compose logs

# 查看指定服务日志
docker compose logs blog
docker compose logs umami
docker compose logs db

# 实时查看日志（跟踪模式）
docker compose logs -f blog

# 查看最近 100 行日志
docker compose logs --tail 100 blog

# 查看指定时间段的日志
docker compose logs --since "2026-03-09T10:00:00" blog
```

### 4.3 查看服务状态

```bash
# 查看所有服务状态
docker compose ps

# 查看详细状态（包含健康检查）
docker compose ps -a

# 查看资源使用情况
docker stats finn-days-blog finn-days-umami finn-days-db
```

### 4.4 备份数据库

```bash
# 备份 PostgreSQL 数据（SQL dump）
docker compose exec db pg_dump -U umami umami > backup_$(date +%Y%m%d_%H%M%S).sql

# 压缩备份
docker compose exec db pg_dump -U umami umami | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# 恢复数据库
cat backup_20260309_143022.sql | docker compose exec -T db psql -U umami umami

# 从压缩文件恢复
gunzip -c backup_20260309_143022.sql.gz | docker compose exec -T db psql -U umami umami
```

**定时备份脚本：**

```bash
#!/bin/bash
# /opt/finn-days/backup.sh
# 建议通过 crontab 每日执行

BACKUP_DIR="/opt/finn-days/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
KEEP_DAYS=30

mkdir -p "$BACKUP_DIR"

# 执行备份
docker compose -f /opt/finn-days/docker-compose.yml exec -T db \
  pg_dump -U umami umami | gzip > "$BACKUP_DIR/umami_${TIMESTAMP}.sql.gz"

# 清理旧备份
find "$BACKUP_DIR" -name "umami_*.sql.gz" -mtime +$KEEP_DAYS -delete

echo "[$(date)] Backup completed: umami_${TIMESTAMP}.sql.gz"
```

```bash
# 设置 crontab（每天凌晨 3 点备份）
crontab -e
# 添加：
# 0 3 * * * /opt/finn-days/backup.sh >> /opt/finn-days/backups/backup.log 2>&1
```

### 4.5 更新镜像

```bash
# 更新博客镜像
docker compose pull blog
docker compose up -d blog --force-recreate

# 更新 Umami 镜像
docker compose pull umami
docker compose up -d umami --force-recreate

# 更新所有镜像
docker compose pull
docker compose up -d --force-recreate

# 清理旧镜像
docker image prune -f
```

### 4.6 进入容器调试

```bash
# 进入博客容器
docker compose exec blog sh

# 进入 Umami 容器
docker compose exec umami sh

# 进入数据库容器
docker compose exec db psql -U umami umami

# 在数据库中执行 SQL
docker compose exec db psql -U umami umami -c "SELECT count(*) FROM website;"
```

---

## 五、生产环境安全建议

### 5.1 密码管理

1. **使用强密码**：所有密码使用 `openssl rand -hex 32` 或类似工具生成
2. **不提交 .env**：`.env` 文件必须在 `.gitignore` 中排除
3. **定期轮换**：建议每 90 天轮换数据库密码和 APP_SECRET
4. **Docker Secrets（可选）**：对于更高安全要求，使用 Docker Secrets 代替环境变量

```yaml
# Docker Secrets 示例（需要 Docker Swarm 模式或 Docker Compose v3.1+）
services:
  db:
    secrets:
      - db_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

### 5.2 网络隔离

```yaml
services:
  # 数据库不暴露端口
  db:
    # ports: 注释掉或删除
    networks:
      - finn-days-network

  # Umami 仅监听 127.0.0.1（通过反向代理访问）
  umami:
    ports:
      - "127.0.0.1:3001:3000"

  # 博客仅监听 127.0.0.1（通过反向代理访问）
  blog:
    ports:
      - "127.0.0.1:8200:8200"
```

### 5.3 反向代理配置

生产环境中，博客和 Umami 应通过反向代理（Nginx/Caddy）暴露，而非直接暴露容器端口。

**Nginx 配置示例：**

```nginx
# 博客
server {
    listen 443 ssl http2;
    server_name finn-days.com;

    ssl_certificate /etc/letsencrypt/live/finn-days.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/finn-days.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8200;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Next.js 静态资源长期缓存
    location /_next/static/ {
        proxy_pass http://127.0.0.1:8200;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}

# Umami 分析
server {
    listen 443 ssl http2;
    server_name analytics.finn-days.com;

    ssl_certificate /etc/letsencrypt/live/analytics.finn-days.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/analytics.finn-days.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name finn-days.com analytics.finn-days.com;
    return 301 https://$server_name$request_uri;
}
```

**Caddy 配置（更简单，自动 HTTPS）：**

```
finn-days.com {
    reverse_proxy localhost:8200
}

analytics.finn-days.com {
    reverse_proxy localhost:3001
}
```

### 5.4 日志管理

```yaml
services:
  blog:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"   # 单个日志文件最大 10MB
        max-file: "3"      # 最多保留 3 个日志文件
```

### 5.5 自动重启策略

| 策略 | 说明 | 适用场景 |
|------|------|---------|
| `no` | 不自动重启 | 开发/调试 |
| `always` | 总是重启 | 关键服务 |
| `unless-stopped` | 除非手动停止 | 推荐（生产环境） |
| `on-failure` | 仅失败时重启 | 一次性任务 |

---

## 六、与 CI/CD 集成

### 6.1 部署流程

CI/CD 流水线（参见 `04-cicd-pipeline.md`）在构建完成后，通过 SSH 在服务器上执行：

```bash
# 1. 拉取最新镜像
docker pull ghcr.io/finn7x/finn-dsys:latest

# 2. 重启博客服务
docker compose -f /opt/finn-days/docker-compose.yml up -d blog --force-recreate

# 3. 清理旧镜像
docker image prune -f

# 4. 验证服务状态
docker compose -f /opt/finn-days/docker-compose.yml ps
```

### 6.2 服务器目录结构

```
/opt/finn-days/
├── docker-compose.yml     # Docker Compose 配置
├── .env                   # 环境变量（敏感信息）
├── backups/               # 数据库备份目录
│   ├── umami_20260309_030000.sql.gz
│   └── backup.log
└── backup.sh              # 备份脚本
```

### 6.3 首次部署

在全新服务器上首次部署的完整步骤：

```bash
# 1. 安装 Docker 和 Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 2. 创建项目目录
sudo mkdir -p /opt/finn-days/backups
sudo chown -R $USER:$USER /opt/finn-days

# 3. 创建 docker-compose.yml 和 .env
cd /opt/finn-days
# 将 docker-compose.yml 和 .env 放到此目录

# 4. 生成密钥
echo "UMAMI_DB_PASSWORD=$(openssl rand -hex 16)" >> .env
echo "UMAMI_APP_SECRET=$(openssl rand -hex 32)" >> .env

# 5. 登录 GHCR（如果使用私有镜像）
echo "YOUR_TOKEN" | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# 6. 拉取镜像并启动
docker compose pull
docker compose up -d

# 7. 检查服务状态
docker compose ps
docker compose logs

# 8. 配置 Umami（访问 http://server:3001）
# - 修改默认密码
# - 添加网站
# - 获取 Website ID

# 9. 更新 .env 中的 NEXT_PUBLIC_UMAMI_ID
# 10. 重启博客服务
docker compose up -d blog --force-recreate
```

---

## 七、文件清单

| 文件路径 | 说明 |
|---------|------|
| `docker-compose.yml` | Docker Compose 编排配置 |
| `.env` | 环境变量文件（不提交 Git） |
| `.env.example` | 环境变量模板（提交 Git） |
| `Dockerfile` | 博客 Docker 镜像构建文件 |
| `.dockerignore` | Docker 构建排除文件 |
| `backup.sh`（服务器端） | 数据库备份脚本 |

---

## 八、依赖说明

### 服务器环境要求

| 要求 | 最低版本 | 推荐版本 |
|------|---------|---------|
| Docker Engine | 20.10+ | 24.0+ |
| Docker Compose | v2.0+ | v2.20+ |
| 操作系统 | Linux (任何发行版) | Ubuntu 22.04 / Debian 12 |
| 内存 | 1GB | 2GB+ |
| 磁盘 | 5GB | 20GB+ |
| CPU | 1 核 | 2 核+ |

### Docker 镜像

| 镜像 | 标签 | 体积（约） |
|------|------|----------|
| `ghcr.io/finn7x/finn-dsys` | latest | ~100-200MB |
| `ghcr.io/umami-software/umami` | postgresql-latest | ~200MB |
| `postgres` | 16-alpine | ~80MB |

---

## 九、测试要点

### 9.1 服务启动测试

```bash
# 启动所有服务
docker compose up -d

# 检查所有容器状态（应全部为 Up + healthy）
docker compose ps

# 预期输出：
# NAME              STATUS                    PORTS
# finn-days-blog    Up (healthy)              0.0.0.0:8200->8200/tcp
# finn-days-umami   Up (healthy)              0.0.0.0:3001->3000/tcp
# finn-days-db      Up (healthy)              5432/tcp
```

### 9.2 健康检查测试

```bash
# 博客健康检查
curl -sf http://localhost:8200 && echo "Blog OK" || echo "Blog FAIL"

# Umami 健康检查
curl -sf http://localhost:3001/api/heartbeat && echo "Umami OK" || echo "Umami FAIL"

# PostgreSQL 健康检查
docker compose exec db pg_isready -U umami && echo "DB OK" || echo "DB FAIL"
```

### 9.3 网络连通性测试

```bash
# 从 blog 容器访问 umami
docker compose exec blog wget -qO- http://umami:3000/api/heartbeat

# 从 umami 容器访问 db
docker compose exec umami pg_isready -h db -U umami
```

### 9.4 数据持久化测试

```bash
# 1. 在 Umami 中创建一些数据（添加网站等）

# 2. 停止并删除容器（但保留卷）
docker compose down

# 3. 重新启动
docker compose up -d

# 4. 检查数据是否保留
# 登录 Umami 确认之前的数据还在
```

### 9.5 备份恢复测试

```bash
# 执行备份
docker compose exec db pg_dump -U umami umami > test_backup.sql

# 检查备份文件
head -20 test_backup.sql

# 模拟恢复（先删除再恢复）
docker compose exec db psql -U umami umami -c "DROP TABLE IF EXISTS test_table;"
cat test_backup.sql | docker compose exec -T db psql -U umami umami
```

---

## 十、注意事项

1. **密码安全**：首次部署时必须修改所有默认密码。使用 `openssl rand` 生成随机密码，不要使用文档示例中的占位符。

2. **数据备份**：配置定时备份脚本（每日备份 + 保留 30 天），在任何重大操作（升级、迁移）之前手动备份一次。

3. **Docker 版本**：确保使用 Docker Compose v2（`docker compose` 命令）而非 v1（`docker-compose` 命令）。v2 性能更好且支持更多特性。

4. **磁盘空间**：Docker 镜像和日志会占用磁盘空间。定期执行 `docker system prune` 清理不再使用的资源。监控磁盘使用率：

   ```bash
   docker system df  # 查看 Docker 磁盘使用
   df -h             # 查看系统磁盘使用
   ```

5. **PostgreSQL 版本**：使用固定的大版本号（如 `postgres:16-alpine`），避免使用 `latest` 标签。PostgreSQL 大版本升级需要手动执行数据迁移。

6. **环境变量优先级**：Docker Compose 的环境变量优先级为：`docker compose run -e` > `.env` 文件 > `environment` 指令 > Dockerfile `ENV`。

7. **健康检查依赖**：使用 `depends_on.condition: service_healthy` 确保服务按正确顺序启动。没有健康检查的 `depends_on` 只保证容器启动顺序，不保证服务就绪。

8. **资源限制**：`deploy.resources` 在 Docker Compose v3 中需要 `--compatibility` 标志或 Docker Swarm 模式才生效。在普通 Docker Compose 中可以使用 `mem_limit` 和 `cpus`：

   ```yaml
   services:
     blog:
       mem_limit: 512m
       cpus: 1.0
   ```

9. **日志轮转**：配置日志大小限制（`max-size` + `max-file`），防止日志文件占满磁盘。

10. **网络安全**：生产环境中将 `ports` 绑定到 `127.0.0.1`，通过反向代理对外暴露。不要直接将容器端口暴露在公网上。

---

*本文档为 Finn Days 博客 Docker Compose 编排方案的完整参考。*
