# Umami 分析方案

> Finn Days 博客 - Phase 3: SEO 与基础设施
> 文档版本：v1.0
> 最后更新：2026-03-09

---

## 一、概述

网站分析是了解用户行为、优化内容策略的重要手段。Finn Days 博客选择 Umami 作为分析方案，它是一个开源的、注重隐私的网站分析工具，可自部署、无 Cookie、GDPR 合规。

本文档涵盖 Umami 的选型理由、Docker 自部署方案、博客端集成方法以及自定义事件追踪等内容。

### 目标

- 部署自托管的 Umami 分析服务
- 博客无侵入式接入分析脚本
- 追踪页面浏览量、访客数等基础指标
- 可选：追踪自定义事件（阅读完成、外链点击等）
- 确保访客隐私，无 Cookie，GDPR 合规

---

## 二、技术方案

### 2.1 为什么选择 Umami

| 特性 | Umami | Google Analytics | Plausible | Fathom |
|------|-------|-----------------|-----------|--------|
| **开源** | 是 (MIT) | 否 | 是 (AGPL) | 否 |
| **自托管** | 是 | 否 | 是 | 否 |
| **免费** | 完全免费（自部署） | 免费（有数据限制） | 自部署免费，托管付费 | 付费 |
| **无 Cookie** | 是 | 否（需 Cookie 同意） | 是 | 是 |
| **GDPR 合规** | 是 | 需配置 | 是 | 是 |
| **数据归属** | 完全自有 | Google 拥有 | 自有（自部署） | Fathom 托管 |
| **脚本体积** | ~2KB | ~45KB | ~1KB | ~1KB |
| **仪表盘** | 简洁单页 | 复杂功能丰富 | 简洁单页 | 简洁单页 |
| **学习曲线** | 低 | 高 | 低 | 低 |
| **自定义事件** | 支持 | 支持 | 支持 | 支持 |
| **实时数据** | 是 | 是（有延迟） | 是 | 是 |
| **Docker 部署** | 官方支持 | N/A | 官方支持 | N/A |

**选择 Umami 的核心理由：**

1. **开源且完全免费**：MIT 许可证，自部署后无任何费用限制
2. **隐私至上**：不使用 Cookie，不追踪个人信息，天然 GDPR 合规，无需烦人的 Cookie 同意横幅
3. **数据完全自有**：所有数据存储在自己的 PostgreSQL 数据库中，不依赖第三方
4. **极简设计**：单页仪表盘，提供关键指标一目了然
5. **Docker 友好**：官方提供 Docker 镜像，与博客的 Docker 部署方案完美契合
6. **轻量脚本**：分析脚本仅约 2KB，对页面性能几乎无影响

### 2.2 Umami 架构

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   博客前端    │────→│   Umami      │────→│  PostgreSQL  │
│ (分析脚本)   │     │   服务端     │     │   数据库     │
│  :8200       │     │   :3001      │     │   :5432      │
└──────────────┘     └──────────────┘     └──────────────┘
       ↑                    ↑
   访客浏览器         Umami 仪表盘
   发送分析数据        查看统计报表
```

---

## 三、实现步骤

### 3.1 Umami Docker Compose 部署

Umami 通过 Docker Compose 与博客和 PostgreSQL 一起编排（完整编排方案参见 `06-docker-compose.md`）。

**文件：`docker-compose.yml`（Umami 相关部分）**

```yaml
services:
  # Umami 分析服务
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    container_name: finn-days-umami
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      DATABASE_URL: postgresql://umami:${UMAMI_DB_PASSWORD}@db:5432/umami
      APP_SECRET: ${UMAMI_APP_SECRET}
      # 可选：禁用遥测
      DISABLE_TELEMETRY: 1
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:3000/api/heartbeat || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    networks:
      - finn-days-network

  # PostgreSQL 数据库（Umami 和博客共用）
  db:
    image: postgres:16-alpine
    container_name: finn-days-db
    restart: unless-stopped
    volumes:
      - umami-data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: umami
      POSTGRES_USER: umami
      POSTGRES_PASSWORD: ${UMAMI_DB_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U umami"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - finn-days-network

volumes:
  umami-data:

networks:
  finn-days-network:
    driver: bridge
```

### 3.2 环境变量配置

**文件：`.env`**

```bash
# Umami 数据库密码（请使用强密码）
UMAMI_DB_PASSWORD=your_strong_password_here

# Umami 应用密钥（用于 JWT 签名，请生成随机字符串）
UMAMI_APP_SECRET=your_random_secret_key_here

# 博客端 Umami 集成
NEXT_PUBLIC_UMAMI_URL=https://analytics.finn-days.com
NEXT_PUBLIC_UMAMI_ID=your-website-id-here
```

**生成随机密钥：**

```bash
# 生成 APP_SECRET
openssl rand -hex 32

# 生成数据库密码
openssl rand -base64 24
```

### 3.3 Umami 初始化与配置

**1. 启动 Umami 服务：**

```bash
docker compose up -d umami db
```

**2. 首次登录：**

打开 `http://your-server:3001`，使用默认凭据登录：

- 用户名：`admin`
- 密码：`umami`

**3. 修改默认密码（重要）：**

登录后立即在 Settings → Profile 中修改密码。

**4. 添加网站：**

1. 进入 Settings → Websites
2. 点击 "Add website"
3. 填写信息：
   - Name: `Finn Days`
   - Domain: `finn-days.com`
4. 保存后获取 `Website ID`（格式类似 `a1b2c3d4-e5f6-7890-abcd-ef1234567890`）
5. 将此 ID 填入 `.env` 文件的 `NEXT_PUBLIC_UMAMI_ID`

### 3.4 博客端集成

#### 方式一：直接在 layout.tsx 中添加 Script

**文件：`src/app/layout.tsx`**

```typescript
import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        {children}

        {/* Umami 分析脚本 */}
        {process.env.NEXT_PUBLIC_UMAMI_URL && (
          <Script
            src={`${process.env.NEXT_PUBLIC_UMAMI_URL}/script.js`}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_ID}
            strategy="lazyOnload"
          />
        )}
      </body>
    </html>
  );
}
```

#### 方式二：封装为独立组件（推荐）

**文件：`src/components/common/analytics.tsx`**

```typescript
"use client";

import Script from "next/script";

export function UmamiAnalytics() {
  const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_URL;
  const umamiId = process.env.NEXT_PUBLIC_UMAMI_ID;

  // 开发环境或未配置时不加载
  if (!umamiUrl || !umamiId) {
    return null;
  }

  return (
    <Script
      src={`${umamiUrl}/script.js`}
      data-website-id={umamiId}
      strategy="lazyOnload"
      // 可选：在开发环境中也追踪（默认 localhost 不追踪）
      // data-do-not-track="false"
      // 可选：自动追踪所有事件
      // data-auto-track="true"
      // 可选：追踪域名列表（逗号分隔）
      // data-domains="finn-days.com"
    />
  );
}
```

**在 layout.tsx 中使用：**

```typescript
import { UmamiAnalytics } from "@/components/common/analytics";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <UmamiAnalytics />
      </body>
    </html>
  );
}
```

**`strategy="lazyOnload"` 说明：**

Next.js Script 组件的加载策略：

| 策略 | 说明 |
|------|------|
| `beforeInteractive` | 在页面可交互前加载（不建议用于分析） |
| `afterInteractive` | 页面可交互后立即加载（默认值） |
| `lazyOnload` | 浏览器空闲时加载（推荐用于分析） |

使用 `lazyOnload` 确保分析脚本不影响页面的首次渲染和交互性能。

### 3.5 环境变量管理

在 Next.js 中，`NEXT_PUBLIC_` 前缀的环境变量会暴露在客户端：

```bash
# .env.local（本地开发，不提交到 Git）
NEXT_PUBLIC_UMAMI_URL=http://localhost:3001
NEXT_PUBLIC_UMAMI_ID=local-test-id

# .env.production（生产环境）
NEXT_PUBLIC_UMAMI_URL=https://analytics.finn-days.com
NEXT_PUBLIC_UMAMI_ID=production-website-id
```

**注意：** `.env.local` 应在 `.gitignore` 中排除。

---

## 四、自定义事件追踪（可选）

Umami 支持自定义事件追踪，用于记录特定用户行为。

### 4.1 Umami 事件追踪 API

Umami 在全局注入 `umami` 对象，提供 `track` 方法：

```typescript
// 基本事件追踪
umami.track("event-name");

// 带数据的事件追踪
umami.track("event-name", { key: "value" });
```

### 4.2 TypeScript 类型声明

**文件：`src/types/umami.d.ts`**

```typescript
declare global {
  interface Window {
    umami?: {
      track: (
        eventName: string,
        eventData?: Record<string, string | number | boolean>
      ) => void;
    };
  }
}

export {};
```

### 4.3 封装事件追踪工具

**文件：`src/lib/analytics.ts`**

```typescript
/**
 * 追踪自定义事件
 */
export function trackEvent(
  eventName: string,
  eventData?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && window.umami) {
    window.umami.track(eventName, eventData);
  }
}

/**
 * 追踪文章阅读完成
 */
export function trackReadComplete(slug: string, title: string) {
  trackEvent("read-complete", {
    slug,
    title,
  });
}

/**
 * 追踪外部链接点击
 */
export function trackExternalLinkClick(url: string) {
  trackEvent("external-link-click", {
    url,
  });
}

/**
 * 追踪 Newsletter 订阅
 */
export function trackNewsletterSubscribe(source: string) {
  trackEvent("newsletter-subscribe", {
    source,  // 如 "hero", "post-footer", "sidebar"
  });
}

/**
 * 追踪搜索行为
 */
export function trackSearch(query: string, resultsCount: number) {
  trackEvent("search", {
    query,
    results: resultsCount,
  });
}
```

### 4.4 文章阅读完成追踪

使用 Intersection Observer 检测用户是否滚动到文章底部。

**文件：`src/components/blog/read-tracker.tsx`**

```typescript
"use client";

import { useEffect, useRef } from "react";
import { trackReadComplete } from "@/lib/analytics";

interface ReadTrackerProps {
  slug: string;
  title: string;
}

export function ReadTracker({ slug, title }: ReadTrackerProps) {
  const markerRef = useRef<HTMLDivElement>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !trackedRef.current) {
          trackedRef.current = true;
          trackReadComplete(slug, title);
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(marker);
    return () => observer.disconnect();
  }, [slug, title]);

  // 在文章内容末尾放置一个不可见的标记元素
  return <div ref={markerRef} aria-hidden="true" />;
}
```

使用方式（文章详情页）：

```typescript
// src/app/blog/[slug]/page.tsx
import { ReadTracker } from "@/components/blog/read-tracker";

export default function PostPage() {
  return (
    <article>
      {/* 文章内容 */}
      <div className="mdx-content">{/* ... */}</div>

      {/* 阅读完成追踪（放在文章内容末尾） */}
      <ReadTracker slug={post.slug} title={post.title} />

      {/* 评论区、分享按钮等 */}
    </article>
  );
}
```

### 4.5 外部链接点击追踪

**文件：`src/components/common/external-link.tsx`**

```typescript
"use client";

import { trackExternalLinkClick } from "@/lib/analytics";

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function ExternalLink({ href, children, className }: ExternalLinkProps) {
  const handleClick = () => {
    trackExternalLinkClick(href);
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
```

---

## 五、Umami 仪表盘功能

### 5.1 核心指标

Umami 仪表盘提供以下核心指标：

| 指标 | 说明 |
|------|------|
| **Pageviews** | 页面浏览次数 |
| **Visitors** | 独立访客数（基于浏览器指纹，非 Cookie） |
| **Bounce rate** | 跳出率 |
| **Average visit time** | 平均访问时长 |
| **Pages** | 最受欢迎的页面排名 |
| **Referrers** | 流量来源 |
| **Browsers** | 浏览器分布 |
| **OS** | 操作系统分布 |
| **Devices** | 设备类型（桌面/移动/平板） |
| **Countries** | 访客地理位置 |
| **Languages** | 浏览器语言 |
| **Events** | 自定义事件统计 |

### 5.2 时间维度

支持按以下时间维度查看数据：

- 实时（Today）
- 最近 24 小时
- 最近 7 天
- 最近 30 天
- 最近 90 天
- 今年
- 自定义时间范围

### 5.3 数据导出

Umami 支持通过 API 导出数据：

```bash
# 获取页面浏览量
GET /api/websites/{websiteId}/stats

# 获取页面排名
GET /api/websites/{websiteId}/pages

# 获取事件数据
GET /api/websites/{websiteId}/events
```

---

## 六、安全性

### 6.1 反向代理配置

生产环境中建议通过反向代理（如 Nginx / Caddy）暴露 Umami 服务，而非直接暴露端口。

**Nginx 反向代理示例：**

```nginx
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
```

**Caddy 反向代理示例（更简单）：**

```
analytics.finn-days.com {
    reverse_proxy localhost:3001
}
```

### 6.2 访问控制

- **修改默认密码**：首次登录后立即修改 `admin` 账户密码
- **禁用注册**：Umami 默认禁用公开注册，保持默认即可
- **网络隔离**：数据库容器不暴露端口到宿主机，仅在 Docker 内部网络中通信
- **HTTPS**：生产环境必须使用 HTTPS，防止分析数据被窃听

### 6.3 Docker 网络隔离

```yaml
services:
  umami:
    ports:
      - "127.0.0.1:3001:3000"  # 仅监听本地，通过反向代理暴露
    networks:
      - finn-days-network

  db:
    # 不暴露端口到宿主机
    networks:
      - finn-days-network

networks:
  finn-days-network:
    driver: bridge
```

---

## 七、文件清单

| 文件路径 | 说明 |
|---------|------|
| `docker-compose.yml` | Umami + PostgreSQL Docker 编排 |
| `.env` | 环境变量（数据库密码、Umami ID 等） |
| `src/app/layout.tsx` | 集成 Umami 分析脚本 |
| `src/components/common/analytics.tsx` | Umami 分析组件封装 |
| `src/lib/analytics.ts` | 自定义事件追踪工具函数 |
| `src/types/umami.d.ts` | Umami TypeScript 类型声明 |
| `src/components/blog/read-tracker.tsx` | 阅读完成追踪组件 |
| `src/components/common/external-link.tsx` | 外链点击追踪组件 |

---

## 八、依赖说明

### 服务端依赖

| 服务 | 镜像 | 说明 |
|------|------|------|
| Umami | `ghcr.io/umami-software/umami:postgresql-latest` | 分析服务 |
| PostgreSQL | `postgres:16-alpine` | 数据存储 |

### 前端依赖

**无需额外 npm 依赖**。Umami 分析脚本通过 `<script>` 标签从 Umami 服务端加载，Next.js 的 `Script` 组件是内置的。

---

## 九、测试要点

### 9.1 Umami 服务测试

```bash
# 启动服务
docker compose up -d umami db

# 检查服务状态
docker compose ps

# 检查 Umami 健康状态
curl http://localhost:3001/api/heartbeat
# 预期返回：{"ok":true}

# 访问仪表盘
open http://localhost:3001
```

### 9.2 分析脚本加载测试

```bash
# 启动博客（开发模式）
npm run dev

# 在浏览器中打开博客，检查 Network 面板：
# 1. 确认加载了 script.js
# 2. 确认有分析数据发送请求
# 3. 检查 Umami 仪表盘是否有数据

# 注意：Umami 默认不追踪 localhost 访问
# 开发测试时可以添加 data-do-not-track="false" 属性
```

### 9.3 自定义事件测试

```javascript
// 在浏览器控制台手动触发事件
window.umami.track("test-event", { key: "value" });

// 然后在 Umami 仪表盘的 Events 面板查看是否记录
```

### 9.4 数据库持久化测试

```bash
# 停止并重启服务
docker compose down
docker compose up -d

# 检查数据是否保留
# 登录 Umami 仪表盘，确认之前的数据仍然存在
```

---

## 十、注意事项

1. **默认密码**：Umami 默认账户 `admin` / `umami`，首次登录后必须立即修改密码。

2. **数据库密码**：不要使用示例中的 `password`，请使用 `openssl rand -hex 32` 生成强密码。

3. **环境变量安全**：`.env` 文件包含敏感信息，必须在 `.gitignore` 中排除，不得提交到 Git 仓库。

4. **开发环境注意**：Umami 默认不追踪来自 `localhost` 的访问。开发测试时需要在 Script 标签添加 `data-do-not-track="false"` 或使用 `data-domains` 指定域名。

5. **脚本加载策略**：使用 `strategy="lazyOnload"` 确保分析脚本不影响页面加载性能。分析脚本不是关键资源，应在页面完成加载后异步加载。

6. **备份策略**：定期备份 PostgreSQL 数据（参见 `06-docker-compose.md` 中的备份命令），防止数据丢失。

7. **版本更新**：关注 Umami 的版本更新。更新时先备份数据库，再拉取新镜像重启服务：

   ```bash
   docker compose pull umami
   docker compose up -d umami
   ```

8. **资源占用**：Umami + PostgreSQL 大约需要 512MB 内存。对于小型个人博客，1GB 内存的服务器即可同时运行博客和 Umami。

---

*本文档为 Finn Days 博客 Umami 分析方案的完整参考。*
