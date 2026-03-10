# 后台管理系统设计方案

> Finn Days 博客 - Phase 3: SEO 与基础设施
> 文档版本：v1.0
> 最后更新：2026-03-10

---

## 目录

1. [概述与功能定位](#一概述与功能定位)
2. [方案调研与对比](#二方案调研与对比)
3. [整体架构设计](#三整体架构设计)
4. [认证系统设计](#四认证系统设计)
5. [Dashboard 仪表盘详细设计](#五dashboard-仪表盘详细设计)
6. [文章管理系统详细设计](#六文章管理系统详细设计)
7. [路由设计](#七路由设计)
8. [组件清单](#八组件清单)
9. [API 路由清单](#九api-路由清单)
10. [数据库需求评估](#十数据库需求评估)
11. [依赖清单](#十一依赖清单)
12. [分步实现计划](#十二分步实现计划)
13. [安全考虑](#十三安全考虑)
14. [测试要点](#十四测试要点)

---

## 一、概述与功能定位

### 1.1 背景

Finn Days 博客当前采用 Velite + MDX 的纯静态内容管理方式，文章通过本地编写 MDX 文件、Git 提交、CI/CD 自动构建部署。这种方式对开发者友好，但缺少以下能力：

- **流量可视化**：无法在博客内直观查看网站访问数据，需要登录独立的 Umami 仪表盘
- **内容管理效率**：发布/编辑文章需要本地开发环境，无法随时随地管理内容
- **状态管理**：缺少文章草稿、归档等状态管理能力

### 1.2 功能定位

后台管理系统（Admin Dashboard）定位为**轻量级单用户管理面板**，服务于博客作者本人，核心功能包括：

| 模块 | 功能 | 优先级 |
|------|------|--------|
| **Dashboard 仪表盘** | 网站整体流量概览、单篇文章流量数据 | P0 |
| **文章管理** | 文章列表、在线编辑、状态管理、发布流程 | P0 |
| **图片管理** | 文章配图上传与管理 | P1 |
| **系统设置** | 站点配置、缓存管理 | P2 |

### 1.3 设计原则

- **轻量优先**：不引入重型 CMS 框架，基于 Next.js App Router 原生能力构建
- **Git 为源**：MDX 文件仍由 Git 管理，后台只是提供更友好的编辑界面
- **复用现有基础设施**：集成已规划的 Umami Analytics，复用 Docker Compose 部署栈
- **安全第一**：单用户模式 + GitHub OAuth 认证，所有管理路由受保护

---

## 二、方案调研与对比

### 2.1 主流技术博客后台管理方案

调研了以下主流方案，从功能完备性、与本项目技术栈的契合度、维护成本三个维度进行对比。

#### 方案 A：Outstatic（Git-based CMS）

[Outstatic](https://outstatic.com/) 是一个为 Next.js 设计的 Git-based CMS，所有内容存储在 GitHub 仓库中。

| 维度 | 评价 |
|------|------|
| **优点** | 零数据库、内容存储在 Git、提供可视化编辑器、与 Next.js 深度集成、支持自定义字段 |
| **缺点** | 自有的内容格式（metadata.json），与 Velite 的 Schema 体系存在冲突；耦合其自身路由和 API；定制灵活度有限 |
| **适配性** | 中等 — 需要迁移现有 Velite 内容结构以适配 Outstatic 格式，引入额外的抽象层 |

#### 方案 B：Keystatic（by Thinkmill）

[Keystatic](https://keystatic.com/) 是 Thinkmill 开发的文件系统 CMS，支持 Markdown/YAML/JSON 内容编辑，直接与 Git 同步。

| 维度 | 评价 |
|------|------|
| **优点** | TypeScript API、GitHub 模式直接同步仓库、无数据库、支持 Markdoc/MDX、提供丰富的编辑器 UI |
| **缺点** | 自有的配置体系，与 Velite Schema 有重叠；引入新的配置文件和路由；对 MDX frontmatter 格式有自己的约定 |
| **适配性** | 中等 — 与 Velite 存在职责重叠，需要调和两套 Schema 定义 |

#### 方案 C：Ghost Admin 风格自建

参考 [Ghost CMS](https://ghost.org/) 的 Admin 面板设计理念，完全自建管理界面。

| 维度 | 评价 |
|------|------|
| **优点** | 完全可控、与现有技术栈零冲突、按需实现功能、无第三方依赖引入的兼容性风险 |
| **缺点** | 开发工作量最大、编辑器需要自行集成、需要自己实现 GitHub API 集成 |
| **适配性** | 高 — 可以完全适配 Velite 的 MDX 格式和 frontmatter Schema |

#### 方案 D：混合模式（推荐）

结合 Ghost 的管理面板设计理念 + WordPress 的仪表盘布局 + Git-based 内容管理方式，自建轻量管理系统。

| 维度 | 评价 |
|------|------|
| **优点** | 完全适配现有 Velite + MDX 体系；Dashboard 集成 Umami API 获取真实数据；通过 GitHub API 实现内容的在线编辑和自动提交；shadcn/ui 组件复用，UI 一致性好；按需渐进式开发 |
| **缺点** | 需要实现 GitHub API 集成逻辑和 MDX 编辑器集成 |
| **适配性** | 最高 — 零侵入现有架构，可渐进式添加功能 |

### 2.2 方案对比矩阵

| 评估维度 | Outstatic | Keystatic | 完全自建 | 混合模式（推荐） |
|---------|-----------|-----------|---------|----------------|
| 与 Velite 兼容性 | 低（格式冲突） | 中（Schema 重叠） | 高 | 高 |
| 开发工作量 | 低 | 低 | 高 | 中 |
| 定制灵活度 | 低 | 中 | 高 | 高 |
| Umami 集成 | 不支持 | 不支持 | 支持 | 支持 |
| UI 一致性 | 自有风格 | 自有风格 | 完全一致 | 完全一致 |
| 维护成本 | 中（依赖更新） | 中（依赖更新） | 低 | 低 |
| 学习成本 | 中 | 中 | 低 | 低 |

### 2.3 推荐方案

**推荐采用方案 D：混合模式**，理由如下：

1. **零侵入性**：不改变现有 Velite + MDX 的内容管理方式，后台只是提供一个 Web 编辑界面
2. **技术栈一致**：使用 Next.js App Router + shadcn/ui 构建，与博客前端完全一致
3. **真实数据驱动**：Dashboard 直接调用 Umami REST API 获取真实流量数据
4. **Git 版本控制**：通过 GitHub API 实现在线编辑 → 自动 commit → 触发 CI/CD 重新构建
5. **渐进式开发**：可以分步实现，先做 Dashboard，再做文章管理

---

## 三、整体架构设计

### 3.1 架构图

```
┌──────────────────────────────────────────────────────────────────────┐
│                        管理员浏览器                                    │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │  Dashboard  │  │  文章管理    │  │  文章编辑    │                  │
│  │  /admin     │  │ /admin/posts│  │ /admin/posts │                  │
│  │  /dashboard │  │             │  │ /[slug]/edit │                  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                  │
└─────────┼────────────────┼────────────────┼──────────────────────────┘
          │                │                │
          └────────────────┼────────────────┘
                           │
                  ┌────────┴────────┐
                  │   Next.js 16    │
                  │   App Router    │
                  │  /admin 路由组   │
                  └────────┬────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────┴──────┐  ┌─────┴──────┐  ┌─────┴──────┐
   │  Auth.js    │  │ API Routes │  │ Middleware  │
   │  GitHub     │  │ /api/admin │  │ 路由保护     │
   │  OAuth      │  │            │  │             │
   └─────────────┘  └─────┬──────┘  └─────────────┘
                          │
             ┌────────────┼────────────────┐
             │            │                │
      ┌──────┴──────┐ ┌──┴───────┐ ┌──────┴──────┐
      │  Umami API  │ │ GitHub   │ │   Velite    │
      │  流量数据    │ │ API      │ │   内容数据   │
      │  :3001      │ │ 文件读写  │ │ (构建时)    │
      └─────────────┘ │ commit   │ └─────────────┘
                      └──────────┘
```

### 3.2 数据流

```
┌─────────────────────────────────────────────────────────────────┐
│                     Dashboard 数据流                              │
│                                                                  │
│  管理员 ──→ /admin/dashboard ──→ API Route ──→ Umami REST API   │
│                                       │                          │
│                                       └──→ 格式化 + 缓存         │
│                                              │                   │
│                                              ▼                   │
│                                        Recharts 图表渲染          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     文章管理数据流                                 │
│                                                                  │
│  [查看] 管理员 ──→ /admin/posts ──→ Velite 数据（构建时）         │
│                                                                  │
│  [编辑] 管理员 ──→ /admin/posts/[slug]/edit                      │
│              │                                                   │
│              ├──→ 读取: GitHub API (GET /repos/.../contents/...) │
│              │                                                   │
│              └──→ 保存: GitHub API (PUT /repos/.../contents/...) │
│                         │                                        │
│                         ▼                                        │
│                   GitHub 自动 commit                              │
│                         │                                        │
│                         ▼                                        │
│                   CI/CD 触发重新构建                               │
│                         │                                        │
│                         ▼                                        │
│                   Velite 重新编译 MDX                              │
│                         │                                        │
│                         ▼                                        │
│                   新版本部署上线                                    │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 技术选型

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Next.js 16.1.6 App Router | 与博客主体一致 |
| UI 组件 | shadcn/ui (new-york) | 复用现有组件库 |
| 图表库 | Recharts | React 生态最成熟的图表库，支持响应式 |
| 编辑器 | Monaco Editor (@monaco-editor/react) | VS Code 同款编辑器，MDX 语法支持优秀 |
| 认证 | Auth.js v5 (next-auth) | Next.js 官方推荐，App Router 原生支持 |
| 外部 API | Umami REST API | 已部署的分析服务 |
| 外部 API | GitHub REST API (Octokit) | 文件读写与自动提交 |
| 样式 | Tailwind CSS 4.2.1 | 与博客主体一致 |

---

## 四、认证系统设计

### 4.1 方案概述

采用 Auth.js v5（原 NextAuth.js）实现 GitHub OAuth 登录，单用户管理员模式。只有指定的 GitHub 账户可以登录后台。

### 4.2 认证流程

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ 管理员    │     │ Next.js  │     │ Auth.js  │     │ GitHub   │
│ 浏览器    │     │ 服务端   │     │          │     │ OAuth    │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │  访问 /admin   │                │                │
     ├───────────────>│                │                │
     │                │ 检查 session   │                │
     │                ├───────────────>│                │
     │                │ 无 session     │                │
     │                │<───────────────┤                │
     │ 重定向到登录页  │                │                │
     │<───────────────┤                │                │
     │                │                │                │
     │ 点击 GitHub 登录│               │                │
     ├───────────────>│                │                │
     │                │ 发起 OAuth     │                │
     │                ├───────────────>│                │
     │                │                │ 重定向 GitHub  │
     │                │                ├───────────────>│
     │                │                │                │
     │  GitHub 授权   │                │                │
     │<────────────────────────────────────────────────┤
     │                │                │                │
     │ callback 回调  │                │                │
     ├───────────────>│                │                │
     │                │ 处理 callback  │                │
     │                ├───────────────>│                │
     │                │                │ 获取用户信息    │
     │                │                ├───────────────>│
     │                │                │ 返回用户数据    │
     │                │                │<───────────────┤
     │                │ 验证 GitHub ID │                │
     │                │ 创建 session   │                │
     │                │<───────────────┤                │
     │ 重定向到 Dashboard              │                │
     │<───────────────┤                │                │
     │                │                │                │
```

### 4.3 安装依赖

```bash
npm install next-auth@beta @auth/core
```

### 4.4 环境变量

**文件：`.env.local`**

```bash
# Auth.js 配置
AUTH_SECRET=your-auth-secret-here  # openssl rand -hex 32
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret

# 允许登录的 GitHub 用户 ID（管理员）
ADMIN_GITHUB_ID=Finn7X

# GitHub API 访问令牌（用于内容管理）
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_REPO_OWNER=Finn7X
GITHUB_REPO_NAME=finn-dsys
```

### 4.5 Auth.js 配置

**文件：`src/lib/auth.ts`**

```typescript
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  callbacks: {
    // 仅允许指定 GitHub 账户登录
    async signIn({ profile }) {
      return profile?.login === process.env.ADMIN_GITHUB_ID;
    },
    // 将 GitHub 用户名写入 session
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    // 控制授权重定向
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/admin/dashboard`;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
});
```

### 4.6 API 路由

**文件：`src/app/api/auth/[...nextauth]/route.ts`**

```typescript
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

### 4.7 中间件路由保护

**文件：`src/middleware.ts`**

```typescript
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // 仅保护 /admin 路由（排除登录页和 API 路由）
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!req.auth) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
```

### 4.8 登录页面

**文件：`src/app/admin/login/page.tsx`**

```tsx
import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github } from "lucide-react";

export default async function AdminLoginPage() {
  const session = await auth();

  // 已登录则重定向到 Dashboard
  if (session) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Finn Days
            </span>
          </CardTitle>
          <CardDescription>管理员登录</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/admin/dashboard" });
            }}
          >
            <Button type="submit" className="w-full" size="lg">
              <Github className="mr-2 h-5 w-5" />
              使用 GitHub 登录
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 4.9 TypeScript 类型扩展

**文件：`src/types/next-auth.d.ts`**

```typescript
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
```

---

## 五、Dashboard 仪表盘详细设计

### 5.1 页面布局

Dashboard 采用经典的管理面板布局，参考 Ghost Admin 和 WordPress 仪表盘的设计理念：

```
┌──────────────────────────────────────────────────────────────┐
│  Sidebar (固定左侧)           │       主内容区                │
│  ┌─────────────────────┐     │                               │
│  │ 🏠 Finn Days        │     │  ┌─ 时间范围选择器 ─────────┐  │
│  │                     │     │  │ 今天 | 7天 | 30天 | 自定义│  │
│  │ 📊 Dashboard        │     │  └──────────────────────────┘  │
│  │ 📝 文章管理          │     │                               │
│  │ 🖼  图片管理         │     │  ┌─ 指标卡片组 ────────────┐   │
│  │ ⚙  设置             │     │  │ PV │ UV │ 跳出率 │ 时长 │   │
│  │                     │     │  └──────────────────────────┘  │
│  │ ─────────────       │     │                               │
│  │ 返回博客首页         │     │  ┌─ 流量趋势图 ────────────┐   │
│  │ 退出登录             │     │  │                          │  │
│  │                     │     │  │    Recharts 折线图        │  │
│  └─────────────────────┘     │  │                          │  │
│                               │  └──────────────────────────┘  │
│                               │                               │
│                               │  ┌─ 热门文章 ──┐ ┌─ 来源 ──┐  │
│                               │  │ 1. xxx     │ │ Google │  │
│                               │  │ 2. xxx     │ │ Direct │  │
│                               │  │ 3. xxx     │ │ Twitter│  │
│                               │  └────────────┘ └────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**响应式策略：**

| 断点 | 布局 |
|------|------|
| < 768px（移动端） | Sidebar 隐藏，通过汉堡菜单展开（Sheet 组件） |
| >= 768px（平板） | Sidebar 收缩为图标模式（60px 宽） |
| >= 1024px（桌面） | Sidebar 完整展开（240px 宽） |

### 5.2 管理后台布局组件

**文件：`src/app/admin/layout.tsx`**

```tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata = {
  title: "管理后台 - Finn Days",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* 侧边栏 */}
      <AdminSidebar user={session.user} />

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-7xl p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
```

**文件：`src/components/admin/admin-sidebar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  ImageIcon,
  Settings,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "文章管理", icon: FileText },
  { href: "/admin/images", label: "图片管理", icon: ImageIcon },
  { href: "/admin/settings", label: "设置", icon: Settings },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-lg font-bold text-transparent">
              Finn Days
            </span>
            <span className="text-xs text-muted-foreground">Admin</span>
          </Link>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 底部操作 */}
        <div className="border-t border-border p-4 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            查看博客
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-muted-foreground"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
          >
            <LogOut className="h-4 w-4" />
            退出登录
          </Button>
        </div>

        {/* 用户信息 */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            {user.image && (
              <img
                src={user.image}
                alt={user.name || ""}
                className="h-8 w-8 rounded-full"
              />
            )}
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
```

### 5.3 数据指标卡片

**文件：`src/components/admin/stats-cards.tsx`**

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Users, ArrowDownUp, Clock } from "lucide-react";

interface StatsCardsProps {
  stats: {
    pageviews: { value: number; change: number };
    visitors: { value: number; change: number };
    bounceRate: { value: number; change: number };
    avgDuration: { value: number; change: number };
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "页面浏览量",
      value: stats.pageviews.value.toLocaleString(),
      change: stats.pageviews.change,
      icon: Eye,
    },
    {
      title: "独立访客",
      value: stats.visitors.value.toLocaleString(),
      change: stats.visitors.change,
      icon: Users,
    },
    {
      title: "跳出率",
      value: `${stats.bounceRate.value.toFixed(1)}%`,
      change: stats.bounceRate.change,
      invertColor: true, // 跳出率降低是好事
      icon: ArrowDownUp,
    },
    {
      title: "平均阅读时长",
      value: formatDuration(stats.avgDuration.value),
      change: stats.avgDuration.change,
      icon: Clock,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              <span
                className={
                  (card.invertColor ? card.change > 0 : card.change < 0)
                    ? "text-red-500"
                    : "text-green-500"
                }
              >
                {card.change > 0 ? "+" : ""}
                {card.change.toFixed(1)}%
              </span>{" "}
              较上一周期
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}秒`;
  const minutes = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${minutes}分${secs}秒`;
}
```

### 5.4 流量趋势图（Recharts）

**文件：`src/components/admin/traffic-chart.tsx`**

```tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrafficChartProps {
  data: Array<{
    date: string;
    pageviews: number;
    visitors: number;
  }>;
}

export function TrafficChart({ data }: TrafficChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">流量趋势</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
              />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  color: "hsl(var(--card-foreground))",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="pageviews"
                name="浏览量"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="visitors"
                name="访客数"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 5.5 热门文章排行

**文件：`src/components/admin/top-pages.tsx`**

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TopPagesProps {
  pages: Array<{
    path: string;
    title: string;
    views: number;
    visitors: number;
  }>;
}

export function TopPages({ pages }: TopPagesProps) {
  const maxViews = Math.max(...pages.map((p) => p.views), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">热门文章</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pages.map((page, index) => (
            <div key={page.path} className="flex items-center gap-4">
              {/* 排名 */}
              <Badge
                variant={index < 3 ? "default" : "secondary"}
                className="h-6 w-6 shrink-0 justify-center rounded-full p-0 text-xs"
              >
                {index + 1}
              </Badge>

              {/* 标题和进度条 */}
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{page.title}</p>
                <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-600 to-blue-600"
                    style={{ width: `${(page.views / maxViews) * 100}%` }}
                  />
                </div>
              </div>

              {/* 数据 */}
              <div className="shrink-0 text-right">
                <p className="text-sm font-medium">
                  {page.views.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {page.visitors.toLocaleString()} 访客
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 5.6 时间范围选择器

**文件：`src/components/admin/date-range-picker.tsx`**

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ranges = [
  { label: "今天", value: "today" },
  { label: "7 天", value: "7d" },
  { label: "30 天", value: "30d" },
  { label: "90 天", value: "90d" },
];

export function DateRangePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("range") || "7d";

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", value);
    router.push(`/admin/dashboard?${params.toString()}`);
  };

  return (
    <div className="flex gap-2">
      {ranges.map((range) => (
        <Button
          key={range.value}
          variant={current === range.value ? "default" : "outline"}
          size="sm"
          onClick={() => handleSelect(range.value)}
          className={cn(
            current === range.value &&
              "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0"
          )}
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
}
```

### 5.7 Umami API 集成

#### 5.7.1 Umami API 端点概览

Umami 提供以下 REST API 端点（详细文档：https://umami.is/docs/api）：

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/auth/login` | POST | 获取认证 Token |
| `/api/websites/:id/stats` | GET | 网站概览统计（PV、UV、跳出率、时长） |
| `/api/websites/:id/pageviews` | GET | 按时间维度的页面浏览数据 |
| `/api/websites/:id/metrics` | GET | 按维度的指标数据（页面、来源、浏览器等） |
| `/api/websites/:id/active` | GET | 当前实时在线访客数 |
| `/api/websites/:id/events/series` | GET | 事件时间序列数据 |

**通用查询参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `startAt` | number | 开始时间戳（毫秒） |
| `endAt` | number | 结束时间戳（毫秒） |
| `unit` | string | 时间粒度：`hour`/`day`/`week`/`month` |
| `type` | string | 指标维度：`url`/`referrer`/`browser`/`os`/`device`/`country` |

#### 5.7.2 Umami API 客户端封装

**文件：`src/lib/umami.ts`**

```typescript
/**
 * Umami Analytics API 客户端
 *
 * 封装 Umami REST API 的调用，包含认证、缓存和类型安全。
 * API 文档：https://umami.is/docs/api
 */

// ─── 类型定义 ───────────────────────────────────────

export interface UmamiStats {
  pageviews: { value: number; change: number };
  visitors: { value: number; change: number };
  visits: { value: number; change: number };
  bounces: { value: number; change: number };
  totaltime: { value: number; change: number };
}

export interface UmamiPageview {
  x: string; // 时间标签（如 "2026-03-09"）
  y: number; // 浏览量
}

export interface UmamiPageviewsResponse {
  pageviews: UmamiPageview[];
  sessions: UmamiPageview[];
}

export interface UmamiMetric {
  x: string; // 维度值（如页面路径、来源域名）
  y: number; // 计数
}

export interface UmamiActiveResponse {
  x: number; // 当前在线访客数
}

// ─── 时间范围工具 ───────────────────────────────────

export type DateRange = "today" | "7d" | "30d" | "90d" | "custom";

interface TimeRange {
  startAt: number;
  endAt: number;
  unit: "hour" | "day" | "week" | "month";
}

export function getTimeRange(range: DateRange): TimeRange {
  const now = Date.now();
  const endAt = now;

  switch (range) {
    case "today":
      return {
        startAt: new Date().setHours(0, 0, 0, 0),
        endAt,
        unit: "hour",
      };
    case "7d":
      return {
        startAt: now - 7 * 24 * 60 * 60 * 1000,
        endAt,
        unit: "day",
      };
    case "30d":
      return {
        startAt: now - 30 * 24 * 60 * 60 * 1000,
        endAt,
        unit: "day",
      };
    case "90d":
      return {
        startAt: now - 90 * 24 * 60 * 60 * 1000,
        endAt,
        unit: "week",
      };
    default:
      return {
        startAt: now - 7 * 24 * 60 * 60 * 1000,
        endAt,
        unit: "day",
      };
  }
}

// ─── API 客户端 ───────────────────────────────────

const UMAMI_API_URL = process.env.UMAMI_API_URL || "http://umami:3000";
const UMAMI_USERNAME = process.env.UMAMI_USERNAME || "admin";
const UMAMI_PASSWORD = process.env.UMAMI_PASSWORD!;
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_ID!;

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * 获取 Umami API 认证 Token
 * 自动缓存 Token，避免频繁认证请求
 */
async function getToken(): Promise<string> {
  // 检查缓存的 token 是否仍有效（提前 5 分钟刷新）
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  const res = await fetch(`${UMAMI_API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: UMAMI_USERNAME,
      password: UMAMI_PASSWORD,
    }),
  });

  if (!res.ok) {
    throw new Error(`Umami auth failed: ${res.status}`);
  }

  const data = await res.json();

  // 缓存 token（假设有效期 24 小时）
  cachedToken = {
    token: data.token,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };

  return data.token;
}

/**
 * 通用 Umami API 请求方法
 */
async function umamiRequest<T>(
  endpoint: string,
  params?: Record<string, string | number>
): Promise<T> {
  const token = await getToken();

  const url = new URL(
    `/api/websites/${UMAMI_WEBSITE_ID}${endpoint}`,
    UMAMI_API_URL
  );

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    // 服务端缓存 5 分钟
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Umami API error: ${res.status} ${endpoint}`);
  }

  return res.json();
}

// ─── 公共 API 方法 ───────────────────────────────────

/**
 * 获取网站概览统计
 */
export async function getWebsiteStats(range: DateRange): Promise<UmamiStats> {
  const { startAt, endAt } = getTimeRange(range);
  return umamiRequest<UmamiStats>("/stats", { startAt, endAt });
}

/**
 * 获取页面浏览量时间序列（用于折线图）
 */
export async function getPageviews(
  range: DateRange
): Promise<UmamiPageviewsResponse> {
  const { startAt, endAt, unit } = getTimeRange(range);
  return umamiRequest<UmamiPageviewsResponse>("/pageviews", {
    startAt,
    endAt,
    unit,
  });
}

/**
 * 获取指标数据（热门页面、来源等）
 */
export async function getMetrics(
  range: DateRange,
  type: "url" | "referrer" | "browser" | "os" | "device" | "country" = "url",
  limit: number = 10
): Promise<UmamiMetric[]> {
  const { startAt, endAt } = getTimeRange(range);
  return umamiRequest<UmamiMetric[]>("/metrics", {
    startAt,
    endAt,
    type,
    limit,
  });
}

/**
 * 获取当前实时在线访客数
 */
export async function getActiveVisitors(): Promise<number> {
  const data = await umamiRequest<UmamiActiveResponse>("/active");
  return data.x;
}
```

#### 5.7.3 环境变量补充

在 `.env.local` 中追加：

```bash
# Umami API（服务端使用，不暴露到客户端）
UMAMI_API_URL=http://localhost:3001    # 开发环境
# UMAMI_API_URL=http://umami:3000     # Docker 内部网络（生产环境）
UMAMI_USERNAME=admin
UMAMI_PASSWORD=your-umami-password
```

### 5.8 Dashboard 页面

**文件：`src/app/admin/dashboard/page.tsx`**

```tsx
import { Suspense } from "react";
import { DateRangePicker } from "@/components/admin/date-range-picker";
import { StatsCards } from "@/components/admin/stats-cards";
import { TrafficChart } from "@/components/admin/traffic-chart";
import { TopPages } from "@/components/admin/top-pages";
import { ReferrerList } from "@/components/admin/referrer-list";
import {
  getWebsiteStats,
  getPageviews,
  getMetrics,
  getActiveVisitors,
  type DateRange,
} from "@/lib/umami";

interface DashboardPageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const range = (params.range || "7d") as DateRange;

  // 并行获取所有数据
  const [stats, pageviews, topPages, referrers, activeVisitors] =
    await Promise.all([
      getWebsiteStats(range),
      getPageviews(range),
      getMetrics(range, "url", 10),
      getMetrics(range, "referrer", 10),
      getActiveVisitors(),
    ]);

  // 转换 stats 为卡片格式
  const cardStats = {
    pageviews: stats.pageviews,
    visitors: stats.visitors,
    bounceRate: {
      value:
        stats.visits.value > 0
          ? (stats.bounces.value / stats.visits.value) * 100
          : 0,
      change: stats.bounces.change,
    },
    avgDuration: {
      value:
        stats.visits.value > 0
          ? stats.totaltime.value / stats.visits.value
          : 0,
      change: stats.totaltime.change,
    },
  };

  // 转换 pageviews 为图表格式
  const chartData = pageviews.pageviews.map((pv, i) => ({
    date: pv.x,
    pageviews: pv.y,
    visitors: pageviews.sessions[i]?.y || 0,
  }));

  // 转换热门页面格式
  const topPagesData = topPages
    .filter((p) => p.x.startsWith("/blog/"))
    .map((p) => ({
      path: p.x,
      title: p.x.replace("/blog/", "").replace(/-/g, " "),
      views: p.y,
      visitors: 0, // 需要额外请求获取
    }));

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            当前在线访客：
            <span className="ml-1 font-medium text-green-500">
              {activeVisitors}
            </span>
          </p>
        </div>
        <Suspense fallback={null}>
          <DateRangePicker />
        </Suspense>
      </div>

      {/* 指标卡片 */}
      <StatsCards stats={cardStats} />

      {/* 流量趋势图 */}
      <TrafficChart data={chartData} />

      {/* 热门文章 & 来源 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopPages pages={topPagesData} />
        <ReferrerList referrers={referrers} />
      </div>
    </div>
  );
}
```

### 5.9 来源分布组件

**文件：`src/components/admin/referrer-list.tsx`**

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UmamiMetric } from "@/lib/umami";

interface ReferrerListProps {
  referrers: UmamiMetric[];
}

export function ReferrerList({ referrers }: ReferrerListProps) {
  const total = referrers.reduce((sum, r) => sum + r.y, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">流量来源</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {referrers.map((referrer) => (
            <div key={referrer.x} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="truncate text-sm">
                  {referrer.x || "(直接访问)"}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-medium">
                  {referrer.y.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {total > 0 ? ((referrer.y / total) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 六、文章管理系统详细设计

### 6.1 内容管理模式

采用**混合模式**：MDX 文件保持 Git 管理，后台提供在线编辑器 + 通过 GitHub API 自动提交。

```
在线编辑器 → GitHub API (PUT contents) → 自动 commit → CI/CD 触发 → Velite 重编译 → 部署
```

**优势：**
- MDX 文件始终在 Git 中，保留完整版本历史
- 可以继续使用本地编辑器编辑，两种方式互不冲突
- 通过 CI/CD 自动化，保证构建产物一致性

### 6.2 文章列表页

**文件：`src/app/admin/posts/page.tsx`**

```tsx
import Link from "next/link";
import { getAllPosts } from "@/lib/content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Edit, Eye } from "lucide-react";

export default function AdminPostsPage() {
  const posts = getAllPosts(); // Velite 构建时数据

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">文章管理</h1>
          <p className="text-sm text-muted-foreground">
            共 {posts.length} 篇文章
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            新建文章
          </Link>
        </Button>
      </div>

      {/* 文章列表 */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {posts.map((post) => (
              <div
                key={post.slug}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                {/* 左侧：文章信息 */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-medium">
                      {post.title}
                    </h3>
                    {post.published ? (
                      <Badge variant="secondary" className="shrink-0">
                        已发布
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0">
                        草稿
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <time>{post.date}</time>
                    <span>{post.readingTime}</span>
                    {post.tags?.map((tag: string) => (
                      <span key={tag} className="text-purple-500">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 右侧：操作按钮 */}
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/blog/${post.slug}`} target="_blank">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/posts/${post.slug}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 6.3 GitHub API 集成

**文件：`src/lib/github.ts`**

```typescript
/**
 * GitHub API 客户端
 *
 * 用于通过 GitHub REST API 读写仓库中的 MDX 文件。
 * 所有操作都会生成对应的 Git commit。
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GITHUB_OWNER = process.env.GITHUB_REPO_OWNER!;
const GITHUB_REPO = process.env.GITHUB_REPO_NAME!;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

const GITHUB_API_BASE = "https://api.github.com";

interface GitHubFileContent {
  name: string;
  path: string;
  sha: string;
  content: string; // Base64 编码
  encoding: string;
}

interface GitHubCommitResponse {
  content: {
    name: string;
    path: string;
    sha: string;
  };
  commit: {
    sha: string;
    message: string;
  };
}

/**
 * 通用 GitHub API 请求方法
 */
async function githubRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${GITHUB_API_BASE}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GitHub API error: ${res.status} - ${error}`);
  }

  return res.json();
}

/**
 * 获取文件内容
 */
export async function getFileContent(
  filePath: string
): Promise<{ content: string; sha: string }> {
  const data = await githubRequest<GitHubFileContent>(
    `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`
  );

  // 解码 Base64 内容
  const content = Buffer.from(data.content, "base64").toString("utf-8");

  return { content, sha: data.sha };
}

/**
 * 创建或更新文件
 */
export async function createOrUpdateFile(
  filePath: string,
  content: string,
  message: string,
  sha?: string // 更新时需提供当前文件的 SHA
): Promise<GitHubCommitResponse> {
  const body: Record<string, string> = {
    message,
    content: Buffer.from(content).toString("base64"),
    branch: GITHUB_BRANCH,
  };

  if (sha) {
    body.sha = sha;
  }

  return githubRequest<GitHubCommitResponse>(
    `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    }
  );
}

/**
 * 删除文件
 */
export async function deleteFile(
  filePath: string,
  sha: string,
  message: string
): Promise<void> {
  await githubRequest(
    `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
    {
      method: "DELETE",
      body: JSON.stringify({
        message,
        sha,
        branch: GITHUB_BRANCH,
      }),
    }
  );
}

/**
 * 获取目录内容列表
 */
export async function listDirectory(
  dirPath: string
): Promise<Array<{ name: string; path: string; type: string; sha: string }>> {
  return githubRequest(
    `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${dirPath}?ref=${GITHUB_BRANCH}`
  );
}

/**
 * 获取指定 MDX 文章的原始内容
 */
export async function getPostContent(
  slug: string
): Promise<{ content: string; sha: string }> {
  return getFileContent(`content/posts/${slug}.mdx`);
}

/**
 * 保存 MDX 文章内容
 */
export async function savePostContent(
  slug: string,
  content: string,
  sha?: string
): Promise<GitHubCommitResponse> {
  const message = sha
    ? `update: 编辑文章 ${slug}`
    : `feat: 新建文章 ${slug}`;

  return createOrUpdateFile(
    `content/posts/${slug}.mdx`,
    content,
    message,
    sha
  );
}
```

### 6.4 MDX 在线编辑器

编辑器选型对比：

| 编辑器 | 优势 | 劣势 | 包体积 |
|--------|------|------|--------|
| **Monaco Editor** | VS Code 同款、MDX 语法支持、智能补全 | 包体积较大 | ~2MB (gzip) |
| **CodeMirror 6** | 轻量、可扩展、Markdown 支持好 | MDX 语法支持需定制 | ~300KB |
| **Milkdown** | 所见即所得 Markdown 编辑器 | MDX 支持有限 | ~500KB |

**推荐选择 Monaco Editor**，理由：
1. 开发者更熟悉 VS Code 的编辑体验
2. 原生支持 TypeScript/JSX 语法高亮（MDX 的 JSX 部分）
3. 提供 diff 对比功能，方便查看修改
4. `@monaco-editor/react` 封装良好，集成简单

**文件：`src/components/admin/mdx-editor.tsx`**

```tsx
"use client";

import { useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Eye, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

interface MdxEditorProps {
  slug: string;
  initialContent: string;
  sha: string;
  onSave: (content: string, sha: string) => Promise<{ sha: string }>;
}

export function MdxEditor({ slug, initialContent, sha, onSave }: MdxEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [currentSha, setCurrentSha] = useState(sha);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { resolvedTheme } = useTheme();

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        setContent(value);
        setIsDirty(value !== initialContent);
      }
    },
    [initialContent]
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await onSave(content, currentSha);
      setCurrentSha(result.sha);
      setIsDirty(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Save failed:", error);
      alert("保存失败，请重试");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* 工具栏 */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">
            content/posts/{slug}.mdx
          </span>
          {isDirty && (
            <Badge variant="outline" className="text-yellow-500 border-yellow-500">
              未保存
            </Badge>
          )}
          {lastSaved && (
            <span className="text-xs text-muted-foreground">
              上次保存: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`/blog/${slug}`} target="_blank">
              <Eye className="mr-2 h-3.5 w-3.5" />
              预览
            </a>
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="mr-2 h-3.5 w-3.5" />
            )}
            保存并提交
          </Button>
        </div>
      </div>

      {/* 编辑器 */}
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="markdown"
          value={content}
          onChange={handleChange}
          theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
          options={{
            fontSize: 14,
            fontFamily: "var(--font-geist-mono), monospace",
            lineNumbers: "on",
            minimap: { enabled: false },
            wordWrap: "on",
            scrollBeyondLastLine: false,
            padding: { top: 16 },
            bracketPairColorization: { enabled: true },
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}
```

### 6.5 文章编辑页面

**文件：`src/app/admin/posts/[slug]/edit/page.tsx`**

```tsx
import { getPostContent, savePostContent } from "@/lib/github";
import { MdxEditor } from "@/components/admin/mdx-editor";

interface EditPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { slug } = await params;

  // 从 GitHub 获取 MDX 原始内容
  const { content, sha } = await getPostContent(slug);

  async function handleSave(
    newContent: string,
    currentSha: string
  ): Promise<{ sha: string }> {
    "use server";
    const result = await savePostContent(slug, newContent, currentSha);
    return { sha: result.content.sha };
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">编辑文章</h1>
        <p className="text-sm text-muted-foreground">
          修改将通过 GitHub API 自动提交到仓库
        </p>
      </div>

      <MdxEditor
        slug={slug}
        initialContent={content}
        sha={sha}
        onSave={handleSave}
      />
    </div>
  );
}
```

### 6.6 新建文章页面

**文件：`src/app/admin/posts/new/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DEFAULT_FRONTMATTER = `---
title: ""
description: ""
date: "${new Date().toISOString().split("T")[0]}"
published: false
tags: []
---

在这里开始写作...
`;

export default function NewPostPage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!slug) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          content: DEFAULT_FRONTMATTER.replace(
            'title: ""',
            `title: "${slug.replace(/-/g, " ")}"`
          ),
        }),
      });

      if (!res.ok) throw new Error("创建失败");

      router.push(`/admin/posts/${slug}/edit`);
    } catch (error) {
      console.error("Create failed:", error);
      alert("创建文章失败，请重试");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">新建文章</h1>
        <p className="text-sm text-muted-foreground">
          创建新的 MDX 文件到 Git 仓库
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">文章信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slug">文章 Slug</Label>
            <Input
              id="slug"
              placeholder="my-new-post"
              value={slug}
              onChange={(e) =>
                setSlug(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, "-")
                    .replace(/-+/g, "-")
                )
              }
            />
            <p className="text-xs text-muted-foreground">
              文件路径：content/posts/{slug || "..."}.mdx
            </p>
          </div>

          <Button
            onClick={handleCreate}
            disabled={!slug || isCreating}
            className="w-full"
          >
            {isCreating ? "创建中..." : "创建并编辑"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 6.7 文章管理 API 路由

**文件：`src/app/api/admin/posts/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { savePostContent } from "@/lib/github";

// POST /api/admin/posts - 新建文章
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug, content } = await req.json();

    if (!slug || !content) {
      return NextResponse.json(
        { error: "slug 和 content 是必填项" },
        { status: 400 }
      );
    }

    const result = await savePostContent(slug, content);

    return NextResponse.json({
      success: true,
      sha: result.content.sha,
      commit: result.commit.sha,
    });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json(
      { error: "创建文章失败" },
      { status: 500 }
    );
  }
}
```

**文件：`src/app/api/admin/posts/[slug]/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPostContent, savePostContent, deleteFile } from "@/lib/github";

// GET /api/admin/posts/[slug] - 获取文章内容
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const { content, sha } = await getPostContent(slug);
    return NextResponse.json({ content, sha });
  } catch (error) {
    return NextResponse.json(
      { error: "文章不存在" },
      { status: 404 }
    );
  }
}

// PUT /api/admin/posts/[slug] - 更新文章
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const { content, sha } = await req.json();
    const result = await savePostContent(slug, content, sha);

    return NextResponse.json({
      success: true,
      sha: result.content.sha,
    });
  } catch (error) {
    console.error("Update post error:", error);
    return NextResponse.json(
      { error: "更新文章失败" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/posts/[slug] - 删除文章
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const { sha } = await req.json();

    await deleteFile(
      `content/posts/${slug}.mdx`,
      sha,
      `delete: 删除文章 ${slug}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json(
      { error: "删除文章失败" },
      { status: 500 }
    );
  }
}
```

### 6.8 图片上传方案

图片同样通过 GitHub API 上传到仓库的 `public/images/posts/` 目录。

**文件：`src/app/api/admin/upload/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOrUpdateFile } from "@/lib/github";

// POST /api/admin/upload - 上传图片
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const slug = formData.get("slug") as string;

    if (!file) {
      return NextResponse.json({ error: "未提供文件" }, { status: 400 });
    }

    // 验证文件类型
    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "不支持的文件类型" },
        { status: 400 }
      );
    }

    // 限制文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "文件大小不能超过 5MB" },
        { status: 400 }
      );
    }

    // 生成文件路径
    const ext = file.name.split(".").pop();
    const timestamp = Date.now();
    const fileName = `${slug || "upload"}-${timestamp}.${ext}`;
    const filePath = `public/images/posts/${fileName}`;

    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer();
    const content = Buffer.from(arrayBuffer).toString("base64");

    // 上传到 GitHub
    await createOrUpdateFile(
      filePath,
      Buffer.from(arrayBuffer).toString(), // createOrUpdateFile 内部会做 base64
      `upload: 上传图片 ${fileName}`
    );

    // 返回可用的图片 URL
    const imageUrl = `/images/posts/${fileName}`;

    return NextResponse.json({
      success: true,
      url: imageUrl,
      path: filePath,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "上传失败" },
      { status: 500 }
    );
  }
}
```

---

## 七、路由设计

### 7.1 管理后台路由表

| 路由 | 类型 | 渲染方式 | 说明 |
|------|------|---------|------|
| `/admin/login` | 页面 | SSR | 管理员登录页 |
| `/admin/dashboard` | 页面 | SSR（动态） | 仪表盘（Umami 数据） |
| `/admin/posts` | 页面 | SSG | 文章列表 |
| `/admin/posts/new` | 页面 | 客户端 | 新建文章 |
| `/admin/posts/[slug]/edit` | 页面 | SSR | 文章编辑 |
| `/admin/images` | 页面 | SSR | 图片管理 |
| `/admin/settings` | 页面 | SSR | 系统设置 |

### 7.2 API 路由表

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/auth/[...nextauth]` | GET/POST | Auth.js 认证端点 |
| `/api/admin/posts` | POST | 新建文章 |
| `/api/admin/posts/[slug]` | GET/PUT/DELETE | 文章 CRUD |
| `/api/admin/upload` | POST | 图片上传 |
| `/api/admin/analytics/stats` | GET | 转发 Umami 统计数据 |
| `/api/admin/analytics/pageviews` | GET | 转发 Umami 浏览量数据 |

### 7.3 目录结构

```
src/app/
├── admin/
│   ├── layout.tsx                    # 管理后台布局（侧边栏 + 主区域）
│   ├── login/
│   │   └── page.tsx                  # 登录页面
│   ├── dashboard/
│   │   ├── page.tsx                  # 仪表盘主页
│   │   └── loading.tsx               # 仪表盘加载态
│   ├── posts/
│   │   ├── page.tsx                  # 文章列表
│   │   ├── new/
│   │   │   └── page.tsx              # 新建文章
│   │   └── [slug]/
│   │       └── edit/
│   │           └── page.tsx          # 编辑文章
│   ├── images/
│   │   └── page.tsx                  # 图片管理
│   └── settings/
│       └── page.tsx                  # 系统设置
│
├── api/
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts              # Auth.js API
│   └── admin/
│       ├── posts/
│       │   ├── route.ts              # POST 新建文章
│       │   └── [slug]/
│       │       └── route.ts          # GET/PUT/DELETE 文章
│       ├── upload/
│       │   └── route.ts              # POST 图片上传
│       └── analytics/
│           ├── stats/
│           │   └── route.ts          # GET Umami 统计
│           └── pageviews/
│               └── route.ts          # GET Umami 浏览量
```

---

## 八、组件清单

### 8.1 管理后台组件

| 组件 | 文件路径 | 职责 |
|------|---------|------|
| `AdminSidebar` | `src/components/admin/admin-sidebar.tsx` | 管理后台侧边栏导航 |
| `AdminMobileNav` | `src/components/admin/admin-mobile-nav.tsx` | 移动端导航（Sheet 组件） |
| `StatsCards` | `src/components/admin/stats-cards.tsx` | 概览指标卡片组（PV/UV/跳出率/时长） |
| `TrafficChart` | `src/components/admin/traffic-chart.tsx` | 流量趋势折线图（Recharts） |
| `TopPages` | `src/components/admin/top-pages.tsx` | 热门文章排行列表 |
| `ReferrerList` | `src/components/admin/referrer-list.tsx` | 流量来源分布 |
| `DateRangePicker` | `src/components/admin/date-range-picker.tsx` | 时间范围选择器 |
| `MdxEditor` | `src/components/admin/mdx-editor.tsx` | MDX 在线编辑器（Monaco） |
| `ImageUploader` | `src/components/admin/image-uploader.tsx` | 图片拖拽上传组件 |
| `PostStatusBadge` | `src/components/admin/post-status-badge.tsx` | 文章状态标签（草稿/已发布/归档） |
| `RealtimeVisitors` | `src/components/admin/realtime-visitors.tsx` | 实时在线访客显示 |

### 8.2 需新增的 shadcn/ui 组件

| 组件 | 安装命令 | 用途 |
|------|---------|------|
| `sheet` | `npx shadcn@latest add sheet` | 移动端侧边栏抽屉 |
| `table` | `npx shadcn@latest add table` | 文章列表表格 |
| `badge` | `npx shadcn@latest add badge` | 状态标签 |
| `input` | `npx shadcn@latest add input` | 表单输入 |
| `label` | `npx shadcn@latest add label` | 表单标签 |
| `separator` | `npx shadcn@latest add separator` | 分隔线 |
| `dropdown-menu` | `npx shadcn@latest add dropdown-menu` | 操作下拉菜单 |
| `dialog` | `npx shadcn@latest add dialog` | 确认弹窗 |
| `skeleton` | `npx shadcn@latest add skeleton` | 加载骨架屏 |
| `tabs` | `npx shadcn@latest add tabs` | 编辑器/预览切换 |
| `textarea` | `npx shadcn@latest add textarea` | 多行文本输入 |
| `select` | `npx shadcn@latest add select` | 下拉选择 |

---

## 九、API 路由清单

| 路由 | 方法 | 认证 | 请求参数 | 响应 | 说明 |
|------|------|------|---------|------|------|
| `/api/auth/[...nextauth]` | GET/POST | 公开 | - | Session | Auth.js 自动处理 |
| `/api/admin/posts` | POST | 需要 | `{ slug, content }` | `{ success, sha, commit }` | 新建文章（GitHub API） |
| `/api/admin/posts/[slug]` | GET | 需要 | - | `{ content, sha }` | 获取文章 MDX 原文 |
| `/api/admin/posts/[slug]` | PUT | 需要 | `{ content, sha }` | `{ success, sha }` | 更新文章（GitHub API） |
| `/api/admin/posts/[slug]` | DELETE | 需要 | `{ sha }` | `{ success }` | 删除文章（GitHub API） |
| `/api/admin/upload` | POST | 需要 | FormData (file, slug) | `{ success, url, path }` | 上传图片（GitHub API） |
| `/api/admin/analytics/stats` | GET | 需要 | `?range=7d` | Umami 统计数据 | 代理 Umami API |
| `/api/admin/analytics/pageviews` | GET | 需要 | `?range=7d` | Umami 浏览量序列 | 代理 Umami API |

---

## 十、数据库需求评估

### 10.1 是否需要数据库？

**结论：当前阶段不需要引入独立数据库。**

| 数据类型 | 存储方案 | 说明 |
|---------|---------|------|
| 文章内容 | MDX 文件 (Git) | Velite 构建时编译，GitHub API 读写 |
| 文章元数据 | MDX frontmatter | 随文章内容存储在 Git 中 |
| 流量数据 | Umami (PostgreSQL) | 已有独立的 Umami 数据库 |
| 用户 Session | JWT Token | Auth.js 默认使用 JWT，不需要数据库 |
| 图片资源 | 仓库文件 (Git) | 通过 GitHub API 上传到 public/ 目录 |

### 10.2 未来可能需要数据库的场景

| 场景 | 触发条件 | 推荐方案 |
|------|---------|---------|
| 评论管理后台 | 需要在后台管理 Giscus 评论 | 通过 GitHub API 读取 Discussions |
| 文章草稿系统 | 需要保存未完成的草稿状态 | Velite frontmatter `published: false` |
| 多用户协作 | 需要多个管理员 | 引入 PostgreSQL（复用 Umami 的数据库） |
| Newsletter 订阅者管理 | 需要本地管理订阅列表 | 引入 PostgreSQL 或 SQLite |
| 浏览量缓存 | 减少 Umami API 调用频率 | Redis / 内存缓存 / Next.js `revalidate` |

### 10.3 如需数据库的推荐选型

```
优先级排序：

1. PostgreSQL（复用 Umami 现有实例）
   - 已在 Docker Compose 中运行
   - 通过 Prisma ORM 连接
   - 在现有 db 容器中创建新的 database

2. SQLite（嵌入式，零运维）
   - 通过 better-sqlite3 或 Drizzle ORM
   - 适合单用户小数据量场景
   - Docker Volume 持久化

3. Redis（缓存层）
   - 用于 Umami API 响应缓存
   - Session 存储（如放弃 JWT）
```

---

## 十一、依赖清单

### 11.1 生产依赖

| 包名 | 版本 | 用途 | 包体积（gzip） |
|------|------|------|--------------|
| `next-auth` | ^5 (beta) | 认证框架（Auth.js v5） | ~50KB |
| `@auth/core` | ^0.37 | Auth.js 核心 | 包含在 next-auth 中 |
| `recharts` | ^2.15 | React 图表库 | ~180KB |
| `@monaco-editor/react` | ^4.7 | Monaco 编辑器 React 封装 | ~15KB (加载器) |
| `monaco-editor` | ^0.52 | Monaco 编辑器核心（CDN 或 webpack） | ~2MB (CDN 按需加载) |

### 11.2 开发依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| `@types/node` | ^22 | Node.js 类型定义（已有） |

### 11.3 安装命令

```bash
# Auth.js v5
npm install next-auth@beta

# 图表库
npm install recharts

# Monaco 编辑器
npm install @monaco-editor/react

# 需要的 shadcn/ui 组件
npx shadcn@latest add sheet table badge input label separator dropdown-menu dialog skeleton tabs textarea select
```

### 11.4 不需要额外安装的依赖

| 能力 | 已有依赖 |
|------|---------|
| GitHub API 调用 | Node.js 原生 `fetch`（Next.js 扩展版） |
| Umami API 调用 | Node.js 原生 `fetch` |
| UI 组件库 | shadcn/ui（已配置） |
| 样式 | Tailwind CSS 4.2.1（已安装） |
| 图标 | Lucide React（已安装） |

---

## 十二、分步实现计划

### Step 1：认证系统（预计 1 天）

- [ ] 安装 `next-auth@beta`
- [ ] 创建 GitHub OAuth App（GitHub Settings → Developer settings → OAuth Apps）
- [ ] 配置 `src/lib/auth.ts`
- [ ] 创建 `src/app/api/auth/[...nextauth]/route.ts`
- [ ] 实现 `src/middleware.ts` 路由保护
- [ ] 创建 `/admin/login` 页面
- [ ] 配置环境变量 `.env.local`
- [ ] 测试登录/登出流程

### Step 2：管理后台布局（预计 0.5 天）

- [ ] 创建 `src/app/admin/layout.tsx`
- [ ] 实现 `AdminSidebar` 组件
- [ ] 实现 `AdminMobileNav` 组件（Sheet 侧边栏）
- [ ] 安装所需 shadcn/ui 组件
- [ ] 添加 `robots: { index: false }` 防止搜索引擎索引

### Step 3：Dashboard 仪表盘（预计 2 天）

- [ ] 安装 `recharts`
- [ ] 实现 `src/lib/umami.ts` Umami API 客户端
- [ ] 配置 Umami 相关环境变量
- [ ] 实现 `StatsCards` 指标卡片组件
- [ ] 实现 `TrafficChart` 流量趋势图组件
- [ ] 实现 `TopPages` 热门文章排行组件
- [ ] 实现 `ReferrerList` 来源分布组件
- [ ] 实现 `DateRangePicker` 时间范围选择器
- [ ] 组装 `/admin/dashboard` 页面
- [ ] 添加 loading 骨架屏

### Step 4：文章列表与管理（预计 1 天）

- [ ] 实现 `/admin/posts` 文章列表页
- [ ] 实现文章搜索和筛选
- [ ] 实现文章状态标签（草稿/已发布）
- [ ] 实现 `src/lib/github.ts` GitHub API 客户端
- [ ] 实现 `POST /api/admin/posts` 新建文章 API
- [ ] 实现 `GET/PUT/DELETE /api/admin/posts/[slug]` 文章 CRUD API

### Step 5：MDX 在线编辑器（预计 1.5 天）

- [ ] 安装 `@monaco-editor/react`
- [ ] 实现 `MdxEditor` 组件
- [ ] 实现 `/admin/posts/[slug]/edit` 编辑页面
- [ ] 实现 `/admin/posts/new` 新建文章页面
- [ ] 实现自动保存提示（未保存状态检测）
- [ ] 实现保存并提交到 GitHub 功能
- [ ] 测试完整的 编辑 → 保存 → CI/CD → 部署 流程

### Step 6：图片上传（预计 0.5 天）

- [ ] 实现 `POST /api/admin/upload` 图片上传 API
- [ ] 实现 `ImageUploader` 拖拽上传组件
- [ ] 集成到编辑器工具栏（插入图片 Markdown 语法）
- [ ] 文件类型和大小校验

### Step 7：测试与优化（预计 1 天）

- [ ] 端到端测试各功能流程
- [ ] 响应式布局调试（移动端/平板/桌面）
- [ ] 错误处理和用户提示优化
- [ ] 性能优化（API 缓存策略）
- [ ] Docker 部署验证

**总预估工期：约 7.5 天**

---

## 十三、安全考虑

### 13.1 认证安全

| 措施 | 说明 |
|------|------|
| **单用户限制** | `signIn` 回调中严格校验 `profile.login === ADMIN_GITHUB_ID` |
| **JWT 签名** | `AUTH_SECRET` 使用 `openssl rand -hex 32` 生成的强随机密钥 |
| **CSRF 保护** | Auth.js 内置 CSRF Token 保护 |
| **Session 过期** | JWT 默认有效期 30 天，可通过 `maxAge` 配置缩短 |
| **HTTPS 强制** | 生产环境通过 Nginx 反向代理强制 HTTPS |

### 13.2 API 安全

| 措施 | 说明 |
|------|------|
| **认证检查** | 每个 API Route 开头调用 `auth()` 验证 session |
| **中间件保护** | Middleware 拦截所有 `/admin/*` 路由 |
| **输入校验** | 所有用户输入进行类型和格式校验 |
| **文件上传限制** | 限制文件类型（仅图片）和大小（5MB） |
| **Rate Limiting** | 建议使用 `next-rate-limit` 或 Nginx `limit_req` |

### 13.3 敏感信息保护

| 信息 | 保护方式 |
|------|---------|
| `AUTH_SECRET` | `.env.local`，不提交 Git |
| `AUTH_GITHUB_SECRET` | `.env.local`，不提交 Git |
| `GITHUB_TOKEN` | `.env.local`，不提交 Git，使用最小权限 Scope |
| `UMAMI_PASSWORD` | `.env.local`，不提交 Git |
| 管理后台页面 | `robots: { index: false }` 禁止搜索引擎索引 |

### 13.4 GitHub Token 权限最小化

创建 GitHub Personal Access Token (Fine-grained) 时，仅授予以下权限：

| 权限 | 范围 | 说明 |
|------|------|------|
| `Contents` | Read and write | 读写仓库文件内容 |
| `Metadata` | Read | 读取仓库基本信息 |

不要授予 `Administration`、`Actions`、`Secrets` 等其他权限。

### 13.5 网络安全

```
┌─────────────────────────────────────────────────────────────┐
│                     生产环境网络拓扑                          │
│                                                              │
│  互联网 ──→ Nginx (HTTPS, 443)                              │
│                  │                                           │
│                  ├──→ /admin/*  ──→ Blog (:8200)            │
│                  ├──→ /api/*   ──→ Blog (:8200)            │
│                  ├──→ /*       ──→ Blog (:8200)            │
│                  └──→ analytics.* ──→ Umami (:3001)        │
│                                                              │
│  Blog (:8200) ──→ Umami API (Docker 内部: umami:3000)      │
│              ──→ GitHub API (外部: api.github.com)          │
│                                                              │
│  PostgreSQL (:5432) 仅 Docker 内部网络可访问                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 十四、测试要点

### 14.1 认证测试

```bash
# 1. 测试登录流程
# 访问 /admin/dashboard → 应重定向到 /admin/login
# 点击 GitHub 登录 → 应跳转 GitHub OAuth 授权页
# 授权后 → 应重定向回 /admin/dashboard

# 2. 测试非授权用户
# 使用非 ADMIN_GITHUB_ID 的 GitHub 账户登录
# 应显示拒绝访问或重定向回登录页

# 3. 测试 Session 有效性
# 登录后关闭浏览器再打开 → 应保持登录状态
# 清除 Cookie → 应重定向到登录页

# 4. 测试退出登录
# 点击退出 → 应清除 Session 并重定向到登录页
```

### 14.2 Dashboard 测试

```bash
# 1. 测试 Umami API 连通性
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}'
# 应返回 {"token":"..."}

# 2. 测试统计数据获取
curl http://localhost:3001/api/websites/{id}/stats?startAt=...&endAt=... \
  -H "Authorization: Bearer {token}"
# 应返回 PV/UV 等统计数据

# 3. 页面渲染测试
# 访问 /admin/dashboard → 应显示指标卡片和图表
# 切换时间范围 → 数据应更新
# 无数据时 → 应显示空状态而非报错
```

### 14.3 文章管理测试

```bash
# 1. 文章列表
# 访问 /admin/posts → 应显示所有文章
# 文章数量应与 Velite 构建数据一致

# 2. 新建文章
# 访问 /admin/posts/new → 填写 slug → 创建
# GitHub 仓库中应出现对应的 MDX 文件
# 应自动跳转到编辑页面

# 3. 编辑文章
# 访问 /admin/posts/{slug}/edit → 应加载 MDX 原文
# 修改内容 → 点击保存
# GitHub 仓库中应有对应的 commit
# CI/CD 应被触发

# 4. 删除文章
# 删除操作应有确认弹窗
# 确认后 GitHub 仓库中对应文件应被删除
```

### 14.4 图片上传测试

```bash
# 1. 正常上传
# 拖拽或选择 PNG/JPEG/WebP 图片
# 应成功上传到 GitHub 仓库 public/images/posts/
# 应返回可用的图片 URL

# 2. 异常情况
# 上传非图片文件 → 应提示不支持的文件类型
# 上传超过 5MB 的文件 → 应提示文件过大
# 未登录上传 → 应返回 401
```

### 14.5 响应式测试

| 断点 | 测试点 |
|------|--------|
| 移动端 (< 768px) | 侧边栏隐藏、汉堡菜单可用、卡片单列堆叠、编辑器满宽 |
| 平板 (768px-1024px) | 侧边栏图标模式、卡片双列、图表自适应 |
| 桌面 (>= 1024px) | 侧边栏完整展开、卡片四列、双栏布局 |

### 14.6 端到端测试流程

```
完整创作流程测试：

1. 登录管理后台
2. 查看 Dashboard 确认数据正常
3. 进入文章管理 → 点击新建文章
4. 输入 slug（如 test-admin-post）→ 创建
5. 在编辑器中编写 MDX 内容
6. 上传一张配图
7. 将图片 URL 插入到 MDX 中
8. 点击保存 → 确认 GitHub 有新 commit
9. 等待 CI/CD 构建完成
10. 访问 /blog/test-admin-post 确认文章正常显示
11. 返回编辑页修改标题 → 保存
12. 确认 GitHub 有更新 commit
13. 退出登录
```

---

## 附录 A：GitHub OAuth App 创建步骤

1. 访问 https://github.com/settings/developers
2. 点击 "New OAuth App"
3. 填写信息：
   - Application name: `Finn Days Admin`
   - Homepage URL: `https://finn-days.com`
   - Authorization callback URL: `https://finn-days.com/api/auth/callback/github`
   - （本地开发：`http://localhost:3000/api/auth/callback/github`）
4. 创建后获取 Client ID 和 Client Secret
5. 填入 `.env.local` 的 `AUTH_GITHUB_ID` 和 `AUTH_GITHUB_SECRET`

## 附录 B：Umami API 完整端点参考

| 端点 | 方法 | 说明 | 本项目使用 |
|------|------|------|-----------|
| `/api/auth/login` | POST | 获取 JWT Token | 是 |
| `/api/websites/:id/stats` | GET | 汇总统计（PV/UV/跳出率/时长） | 是 |
| `/api/websites/:id/pageviews` | GET | 按时间维度的浏览量序列 | 是 |
| `/api/websites/:id/metrics` | GET | 按维度的指标（页面/来源/浏览器等） | 是 |
| `/api/websites/:id/active` | GET | 实时在线访客数 | 是 |
| `/api/websites/:id/events/series` | GET | 事件时间序列 | 可选 |
| `/api/websites` | GET | 网站列表 | 否 |

详细 API 文档：https://umami.is/docs/api 或 https://docs.umami.is/docs/api

## 附录 C：环境变量完整清单

```bash
# ── Auth.js ──────────────────────────────
AUTH_SECRET=                          # openssl rand -hex 32
AUTH_GITHUB_ID=                       # GitHub OAuth App Client ID
AUTH_GITHUB_SECRET=                   # GitHub OAuth App Client Secret
ADMIN_GITHUB_ID=Finn7X               # 允许登录的 GitHub 用户名

# ── GitHub API ───────────────────────────
GITHUB_TOKEN=                         # GitHub Fine-grained PAT
GITHUB_REPO_OWNER=Finn7X             # 仓库所有者
GITHUB_REPO_NAME=finn-dsys           # 仓库名称
GITHUB_BRANCH=main                   # 目标分支

# ── Umami API（服务端） ──────────────────
UMAMI_API_URL=http://umami:3000      # Docker 内部地址
UMAMI_USERNAME=admin                 # Umami 登录用户名
UMAMI_PASSWORD=                      # Umami 登录密码

# ── Umami 前端（已有） ──────────────────
NEXT_PUBLIC_UMAMI_URL=https://analytics.finn-days.com
NEXT_PUBLIC_UMAMI_ID=                # Umami Website ID
```

---

*本文档为 Finn Days 博客后台管理系统的完整设计方案。建议按照分步实现计划中的顺序，从认证系统开始渐进式开发。*
