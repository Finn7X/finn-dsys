# Finn Days Phase 3 Docker 补充验收报告

日期: 2026-03-13

## 结论

在 Docker daemon 可用后，我补做了 Phase 3 中之前因环境受限未完成的容器化验收。结果是：

- Docker Compose 链路已经能从 `config` 走到 `pull/build/up`
- PostgreSQL、Umami、博客容器都能成功创建并启动
- 但 **整栈部署场景仍不通过**

本次补充验收发现了两个此前无法验证的真实问题：

1. `docker-compose.yml` 中 blog/umami 的 healthcheck 会持续误报 `unhealthy`
2. Docker 化博客实例并不会实际注入 Umami 分析脚本

这意味着上一轮“代码交付通过”只适用于仓库代码与本地非容器产物；若把 Phase 3 的验收范围扩大到文档中的 Docker Compose 与分析部署链路，则当前仍有未通过项。

## 本轮实际执行

已完成：

- `docker info`
- `docker compose config`
- 使用临时测试变量启动 Compose 栈：
  - Blog: `8210`
  - Umami: `3001`
  - PostgreSQL: Docker 内部网络
- `docker compose ps`
- `docker logs` / `docker inspect` / `docker exec`
- `curl` 验证：
  - `http://localhost:8210/`
  - `http://localhost:3001/api/heartbeat`
  - `http://localhost:3001/script.js`
- 最后执行 `docker compose down` 清理临时栈

说明：

- 由于仓库本身没有可用的 `.env`，本次使用了临时测试变量，只验证编排、镜像构建、容器启动、基础连通性和脚本注入行为
- 不把这次测试视为真实生产凭据联调

## 通过项

### 1. Docker daemon 与 Compose 已可用

- `docker info` 正常返回 Server 信息
- `docker compose config` 可解析

### 2. Compose 栈可以完整启动

本次验证中，Compose 已成功完成：

- 拉取 `postgres:16-alpine`
- 拉取 `ghcr.io/umami-software/umami:postgresql-latest`
- 使用本地 `Dockerfile` 构建 blog 镜像
- 创建并启动：
  - `finn-days-db`
  - `finn-days-umami`
  - `finn-days-blog`

### 3. 容器服务本身可达

实测结果：

- Docker 化博客首页 `http://localhost:8210/` 返回 `200`
- Umami 心跳 `http://localhost:3001/api/heartbeat` 返回 `200`
- Umami 脚本 `http://localhost:3001/script.js` 返回 `200`
- Umami 容器日志显示数据库迁移成功并正常启动服务

## 未通过项

### 1. Blog 与 Umami healthcheck 配置会误判为 `unhealthy`

严重级别：高

实测结果：

- `docker compose ps` 显示：
  - `finn-days-blog ... Up ... (unhealthy)`
  - `finn-days-umami ... Up ... (unhealthy)`
- 但同一时间：
  - `http://localhost:8210/` 返回 `200`
  - `http://localhost:3001/api/heartbeat` 返回 `200`

进一步定位：

- `docker inspect` 中的 Health log 一直报：
  - blog: `wget: can't connect to remote host: Connection refused`
  - umami: `wget: can't connect to remote host: Connection refused`
- 在容器内手动执行：
  - `wget http://localhost:8200`
  - `wget http://localhost:3000/api/heartbeat`
  都返回连接拒绝

代码位置：

- `docker-compose.yml:15-20`
- `docker-compose.yml:47-52`

判断：

- 当前 healthcheck 使用的是 `http://localhost:...`
- 在容器内 `localhost` 实际走到 `::1`，而服务没有在 IPv6 loopback 上监听，导致检查持续失败
- 这是 healthcheck 配置问题，不是服务本身未启动

影响：

- Compose 栈在运维视角下始终表现为异常
- `depends_on: condition: service_healthy`、监控告警和后续自动化运维会受到影响

### 2. Docker 化博客并未实际注入 Umami 脚本

严重级别：高

实测结果：

- 启动 Compose 栈时，我传入了临时测试变量：
  - `NEXT_PUBLIC_UMAMI_URL=http://localhost:3002`
  - `NEXT_PUBLIC_UMAMI_ID=test-site-id`
- 但检查 `http://localhost:8210/` 的 HTML，未发现：
  - `script.js`
  - `data-website-id`
  - `test-site-id`
  - `umami`

代码位置：

- `src/components/common/analytics.tsx:5-16`
- `docker-compose.yml:10-14`
- `Dockerfile:15-17`

判断：

- `Analytics` 是 client component，使用的是 `process.env.NEXT_PUBLIC_*`
- `Dockerfile` 构建阶段没有接收或传入这些 `NEXT_PUBLIC_*` 变量
- `docker-compose.yml` 只在容器运行阶段注入了环境变量
- 对于客户端静态注入场景，运行时环境变量不会自动进入已构建好的前端 bundle

影响：

- 即使 Umami 服务已启动，Docker 化博客前台仍不会加载分析脚本
- Phase 3 文档中的“博客无侵入式接入分析脚本”在当前部署链路下并未真正成立

## 其他观察

### 1. Compose 中 Umami 端口仍固定为 `3001`

现状：

- 本次临时传入 `UMAMI_PORT=3002`
- 但 `docker-compose.yml` 里端口写死为 `127.0.0.1:3001:3000`

判断：

- 这不是本轮阻塞核心，但说明 Umami 端口当前并没有参数化

### 2. Blog 服务的 GHCR 拉取会先报 denied，但本地构建可继续完成

现状：

- `docker compose up` 过程中出现：
  - `ghcr.io/finn7x/finn-days/manifests/latest: denied`
- 随后 blog 服务继续走本地 `Dockerfile` 构建并成功启动

判断：

- 因为 compose 同时声明了 `image` 和 `build`
- 当前测试环境下，本地构建可兜底，不构成本轮主阻塞项

## 建议修复顺序

1. 先修 `docker-compose.yml` 中 blog/umami 的 healthcheck，把 `localhost` 改成 `127.0.0.1` 或等效可达写法
2. 修正 Docker 化博客的 Umami 注入方式：
   - 要么把 `NEXT_PUBLIC_*` 作为 build args 参与镜像构建
   - 要么改成真正支持运行时注入的实现
3. 修复后重新执行容器验收：
   - `docker compose up -d`
   - `docker compose ps`
   - 博客首页 `200`
   - Umami heartbeat `200`
   - 前台 HTML 中出现 Umami 脚本标签
4. 有真实凭据后，再做一次真实 website id 的事件上报联调

## 最终判定

**Docker / Compose / Umami 补充场景当前不通过。**

如果只看仓库代码与本地非容器产物，Phase 3 可以记为通过；但如果把 Phase 3 文档里的容器化部署与分析接入也纳入同一轮最终验收，那么当前仍需要继续修复。
