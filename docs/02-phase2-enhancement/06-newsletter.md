# Newsletter 邮件订阅

## 概述

为 Finn Days 博客添加 Newsletter 邮件订阅功能，允许读者通过邮箱订阅博客更新通知。推荐使用 Buttondown 作为邮件服务提供商，它对开发者友好、免费额度充足，且注重用户隐私。

## 方案选型

### 为什么选择 Buttondown

| 特性 | Buttondown | Mailchimp | ConvertKit | Substack |
|------|-----------|-----------|------------|----------|
| 免费额度 | 100 订阅者 | 500 联系人 | 1,000 订阅者 | 无限 |
| 开发者友好 | API 简洁 | API 复杂 | API 中等 | 无 API |
| 用户追踪 | 默认关闭 | 默认开启 | 默认开启 | 默认开启 |
| 自定义域名 | 支持 | 付费功能 | 付费功能 | 不支持 |
| Markdown 支持 | 原生 | 不支持 | 不支持 | 原生 |
| 品牌定制 | 完全自定义 | 有限 | 有限 | 有限 |
| 价格（付费） | $9/月起 | $13/月起 | $29/月起 | 10% 抽成 |

**选择 Buttondown 的理由：**

- **开发者友好**：API 设计简洁，文档清晰，集成难度低
- **隐私优先**：默认不追踪邮件打开率和点击率，尊重订阅者隐私
- **Markdown 原生支持**：用 Markdown 写邮件，与博客写作工作流一致
- **无品牌水印**：免费版也不在邮件底部添加平台标识
- **RSS 自动发送**：可配置 RSS feed 自动触发邮件发送
- **免费额度够用**：100 个订阅者对个人博客初期完全足够

## 技术方案

### Buttondown 账户配置

1. 注册 Buttondown 账户：[https://buttondown.com/register](https://buttondown.com/register)
2. 在 Settings 中获取 API Key
3. 配置发件人信息（名称、邮箱）
4. 可选：配置自定义域名
5. 可选：关联博客 RSS feed 实现自动推送

### API 集成方案对比

**方案 A：直接使用 Buttondown 表单 action**

```html
<form
  action="https://buttondown.com/api/emails/embed-subscribe/your-username"
  method="post"
  target="popupwindow"
>
  <input type="email" name="email" placeholder="输入邮箱地址" required />
  <button type="submit">订阅</button>
</form>
```

优点：零后端代码，最简单
缺点：提交后跳转到 Buttondown 页面，体验不够流畅；无法自定义错误处理

**方案 B：通过 Next.js API Route / Server Action 代理（推荐）**

```
用户提交 → Next.js Server Action → Buttondown API → 返回结果
```

优点：
- 完全控制提交流程和用户体验
- 可以自定义验证、错误处理、成功提示
- API Key 不暴露在客户端
- 可以添加 rate limiting、蜜罐字段等防垃圾措施

缺点：需要编写少量后端代码

**推荐使用方案 B。**

## 实现步骤

### 步骤 1：配置环境变量

```bash
# .env.local
BUTTONDOWN_API_KEY=your-api-key-here
```

确保 `.env.local` 已在 `.gitignore` 中（Next.js 默认已包含）。

### 步骤 2：创建 Server Action

```typescript
// src/app/actions/newsletter.ts
"use server";

interface SubscribeResult {
  success: boolean;
  message: string;
}

export async function subscribeToNewsletter(
  formData: FormData
): Promise<SubscribeResult> {
  const email = formData.get("email") as string;

  // 基础验证
  if (!email || !email.includes("@")) {
    return {
      success: false,
      message: "请输入有效的邮箱地址",
    };
  }

  // 蜜罐字段检测（防机器人）
  const honeypot = formData.get("_gotcha") as string;
  if (honeypot) {
    // 静默返回成功，不暴露检测逻辑
    return {
      success: true,
      message: "订阅成功！请检查邮箱确认订阅。",
    };
  }

  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (!apiKey) {
    console.error("BUTTONDOWN_API_KEY is not configured");
    return {
      success: false,
      message: "订阅服务暂时不可用，请稍后再试",
    };
  }

  try {
    const response = await fetch(
      "https://api.buttondown.com/v1/subscribers",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          type: "regular",
        }),
      }
    );

    if (response.ok) {
      return {
        success: true,
        message: "订阅成功！请检查邮箱确认订阅。",
      };
    }

    // 处理已订阅的情况
    if (response.status === 409) {
      return {
        success: true,
        message: "该邮箱已订阅，感谢你的关注！",
      };
    }

    const errorData = await response.json().catch(() => null);
    console.error("Buttondown API error:", response.status, errorData);

    return {
      success: false,
      message: "订阅失败，请稍后再试",
    };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return {
      success: false,
      message: "网络错误，请检查网络连接后重试",
    };
  }
}
```

### 步骤 3：创建 Newsletter 组件

```typescript
// src/components/common/newsletter.tsx
"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { subscribeToNewsletter } from "@/app/actions/newsletter";

interface NewsletterProps {
  /** 显示风格：inline 用于文章底部，hero 用于首页 Hero 区域 */
  variant?: "inline" | "hero";
}

export function Newsletter({ variant = "inline" }: NewsletterProps) {
  const [state, formAction, isPending] = useActionState(
    async (_prevState: { success: boolean; message: string } | null, formData: FormData) => {
      return await subscribeToNewsletter(formData);
    },
    null
  );

  // 首页 Hero 区域样式
  if (variant === "hero") {
    return (
      <div className="w-full max-w-md mx-auto">
        <h3 className="text-lg font-semibold mb-2 text-center">
          订阅 Newsletter
        </h3>
        <p className="text-sm text-muted-foreground mb-4 text-center">
          获取最新文章推送，不错过任何更新。
        </p>

        <form action={formAction} className="flex gap-2">
          {/* 蜜罐字段（隐藏，防机器人） */}
          <input
            type="text"
            name="_gotcha"
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          <Input
            type="email"
            name="email"
            placeholder="your@email.com"
            required
            disabled={isPending}
            className="flex-1"
            aria-label="邮箱地址"
          />
          <Button type="submit" disabled={isPending} className="gap-2">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            订阅
          </Button>
        </form>

        {/* 状态提示 */}
        {state && (
          <div
            className={`mt-3 flex items-center gap-2 text-sm ${
              state.success ? "text-green-600" : "text-red-600"
            }`}
          >
            {state.success ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{state.message}</span>
          </div>
        )}
      </div>
    );
  }

  // 文章底部内联样式
  return (
    <div className="mt-12 pt-8 border-t">
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 p-2">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">订阅 Newsletter</h3>
            <p className="text-sm text-muted-foreground mt-1">
              每周精选技术文章，直达你的收件箱。不发垃圾邮件，随时退订。
            </p>
          </div>
        </div>

        <form action={formAction} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            name="_gotcha"
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          <Input
            type="email"
            name="email"
            placeholder="your@email.com"
            required
            disabled={isPending}
            className="flex-1"
            aria-label="邮箱地址"
          />
          <Button
            type="submit"
            disabled={isPending}
            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            订阅
          </Button>
        </form>

        {state && (
          <div
            className={`mt-3 flex items-center gap-2 text-sm ${
              state.success ? "text-green-600" : "text-red-600"
            }`}
          >
            {state.success ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{state.message}</span>
          </div>
        )}

        <p className="mt-4 text-xs text-muted-foreground">
          我们尊重你的隐私，邮箱信息仅用于发送 Newsletter，不会分享给第三方。
        </p>
      </div>
    </div>
  );
}
```

### 步骤 4：在各页面中集成

**首页 Hero 区域：**

```typescript
// src/app/page.tsx（相关部分）
import { Newsletter } from "@/components/common/newsletter";

// 在 Hero Section 中
<section className="pt-32 pb-20 px-4">
  <div className="container mx-auto max-w-4xl text-center">
    <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
      Welcome to Finn Days
    </h1>
    <p className="text-xl text-gray-600 mb-8">
      Exploring technology, sharing knowledge, and documenting my journey
    </p>

    {/* Newsletter 订阅 */}
    <Newsletter variant="hero" />
  </div>
</section>
```

**文章底部：**

```typescript
// src/app/blog/[slug]/page.tsx（相关部分）
import { Newsletter } from "@/components/common/newsletter";
import { AuthorCard } from "@/components/blog/author-card";
import { Comments } from "@/components/blog/comments";

// 文章底部区域顺序
<article>
  {/* 文章正文 */}
  {/* 分享按钮 */}
  {/* 作者卡片 */}
  <AuthorCard />

  {/* Newsletter 订阅 */}
  <Newsletter variant="inline" />

  {/* 评论区 */}
  <Comments />
</article>
```

**可选独立页面 /subscribe：**

```typescript
// src/app/subscribe/page.tsx
import { Newsletter } from "@/components/common/newsletter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "订阅 Newsletter - Finn Days",
  description: "订阅 Finn Days Newsletter，获取最新技术文章推送。",
};

export default function SubscribePage() {
  return (
    <div className="container mx-auto max-w-2xl py-24 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          订阅{" "}
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Newsletter
          </span>
        </h1>
        <p className="text-lg text-muted-foreground">
          每周精选技术文章，直达你的收件箱。
        </p>
      </div>

      <Newsletter variant="hero" />

      <div className="mt-16 space-y-6 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">
          你将获得什么？
        </h2>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-0.5">-</span>
            <span>最新技术文章推送，涵盖 React、Next.js、TypeScript 等主题</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-0.5">-</span>
            <span>实用开发技巧和最佳实践分享</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-0.5">-</span>
            <span>开源项目更新和行业动态</span>
          </li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground pt-4">
          隐私承诺
        </h2>
        <p>
          你的邮箱信息仅用于发送 Newsletter，不会出售或分享给任何第三方。
          我们使用 Buttondown 作为邮件服务提供商，它默认不追踪邮件打开率和点击率。
          你可以随时通过邮件底部的链接退订。
        </p>
      </div>
    </div>
  );
}
```

### 步骤 5：替代方案——直接表单 action

如果暂时不想使用 Server Action，可以使用 Buttondown 的嵌入表单作为快速方案：

```typescript
// src/components/common/newsletter-simple.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

export function NewsletterSimple() {
  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="text-lg font-semibold mb-2">订阅 Newsletter</h3>
      <p className="text-sm text-muted-foreground mb-4">
        获取最新文章推送，不错过任何更新。
      </p>

      <form
        action="https://buttondown.com/api/emails/embed-subscribe/your-username"
        method="post"
        target="popupwindow"
        className="flex gap-2"
      >
        <Input
          type="email"
          name="email"
          placeholder="your@email.com"
          required
          className="flex-1"
        />
        <Button type="submit" className="gap-2">
          <Mail className="h-4 w-4" />
          订阅
        </Button>
      </form>
    </div>
  );
}
```

## 文件清单

| 文件路径 | 说明 | 操作 |
|---------|------|------|
| `.env.local` | 添加 `BUTTONDOWN_API_KEY` | 修改 |
| `src/app/actions/newsletter.ts` | Newsletter Server Action | 新建 |
| `src/components/common/newsletter.tsx` | Newsletter 订阅组件 | 新建 |
| `src/app/subscribe/page.tsx` | 独立订阅页面（可选） | 新建 |
| `src/app/page.tsx` | 首页 | 修改（集成 Newsletter） |
| `src/app/blog/[slug]/page.tsx` | 文章详情页 | 修改（集成 Newsletter） |

## 依赖说明

本功能不需要额外安装第三方 npm 包。

使用的技术：
- Next.js Server Actions：处理表单提交和 API 调用
- React `useActionState`：管理表单提交状态
- Buttondown REST API：订阅者管理
- shadcn/ui Input + Button：表单 UI 组件（项目已安装）
- lucide-react：图标（项目已安装）

如未安装 shadcn/ui 的 Input 组件：

```bash
npx shadcn@latest add input
```

## 隐私说明

在博客的隐私政策页面或 Newsletter 组件中应明确告知用户：

1. 邮箱地址仅用于发送 Newsletter，不会出售或分享给第三方
2. 邮件服务由 Buttondown 提供，其隐私政策可在 [buttondown.com/legal/privacy](https://buttondown.com/legal/privacy) 查阅
3. 默认不追踪邮件打开率和点击率
4. 用户可以随时通过邮件底部的退订链接取消订阅
5. 如果需要遵循 GDPR，可在表单中添加同意复选框

## 测试要点

1. **表单提交测试**
   - 输入有效邮箱，点击订阅，显示成功提示
   - 输入无效邮箱（格式错误），显示错误提示
   - 提交空邮箱，浏览器原生验证拦截（`required` 属性）
   - 重复订阅同一邮箱，显示"已订阅"提示
   - 提交过程中按钮显示 loading 状态，防止重复提交

2. **API 集成测试**
   - Server Action 正确调用 Buttondown API
   - API Key 不暴露在客户端（检查 Network 面板）
   - API 返回错误时显示友好的错误信息
   - 网络超时或断网时显示网络错误提示

3. **蜜罐字段测试**
   - 蜜罐字段（`_gotcha`）隐藏不可见
   - 机器人填写蜜罐字段后静默返回成功，不实际创建订阅

4. **UI 测试**
   - Hero 样式（`variant="hero"`）居中显示，适合首页
   - Inline 样式（`variant="inline"`）卡片式显示，适合文章底部
   - 响应式布局在移动端正确换行
   - 加载状态动画流畅

5. **集成位置测试**
   - 首页 Hero 区域 Newsletter 表单正常显示和工作
   - 文章底部 Newsletter 表单正常显示和工作
   - 独立 /subscribe 页面（如创建）正常访问

6. **无障碍测试**
   - 邮箱输入框有 `aria-label`
   - 状态提示信息对屏幕阅读器可读
   - 表单可通过键盘操作（Tab 聚焦、Enter 提交）

## 注意事项

1. **API Key 安全**：`BUTTONDOWN_API_KEY` 必须存放在 `.env.local` 中，通过 Server Action 在服务端使用，绝不能暴露到客户端代码中
2. **Rate Limiting**：Buttondown API 有频率限制，对于个人博客通常不会触达。如需防护，可在 Server Action 中添加简单的 IP 限流
3. **邮箱确认**：Buttondown 默认启用双重确认（Double Opt-in），用户提交邮箱后需要在邮件中点击确认链接才能正式订阅
4. **静态导出**：如果使用 `output: "export"` 静态导出模式，Server Action 不可用，需要改用方案 A（直接表单 action）或部署一个独立的 API 端点
5. **环境变量验证**：在开发环境中如未配置 `BUTTONDOWN_API_KEY`，表单提交应返回友好提示而非崩溃
6. **邮件内容**：可以在 Buttondown 后台配置欢迎邮件模板，新订阅者确认后自动收到欢迎邮件

---

## 实现状态

> 本节记录实际实现与上述设计的差异，于 Phase 2 验收通过 (2026-03-12) 后补充。

### 已完成

- Newsletter 组件已上线，支持 `inline` 和 `hero` 两种 variant
- Server Action 后端逻辑已就绪
- 放置在文章底部（作者卡片下方、评论区上方）

### 与设计的差异

| 项目 | 设计文档 | 实际实现 |
|------|---------|---------|
| UI 文案 | 硬编码中文 | 使用 `useTranslations("newsletter")` 国际化所有文案 |
| 页面路径 | `src/app/blog/[slug]/page.tsx` | `src/app/[locale]/blog/[slug]/page.tsx` |
