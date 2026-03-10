# OG 图片动态生成方案

> Finn Days 博客 - Phase 3: SEO 与基础设施
> 文档版本：v1.0
> 最后更新：2026-03-09

---

## 一、概述

Open Graph 图片是链接在社交媒体上分享时展示的预览图。为每篇博客文章动态生成品牌化的 OG 图片，可以显著提升分享链接的点击率和品牌一致性。

本方案基于 Next.js 的 `opengraph-image` 文件约定和 `@vercel/og` 库（底层使用 Satori 引擎），在构建时或请求时为每篇文章自动生成包含标题、作者、日期和品牌元素的 1200x630 预览图。

### 目标

- 每篇文章自动生成唯一的品牌化 OG 图片
- 图片包含：文章标题、作者名称、发布日期、品牌 Logo
- 使用品牌渐变色背景（purple-600 → blue-600）
- 全局默认 OG 图片作为非文章页面的兜底
- 利用缓存策略避免重复生成

---

## 二、技术方案

### 2.1 Next.js opengraph-image 机制

Next.js App Router 支持基于文件约定自动生成 OG 图片。在任何路由段放置 `opengraph-image.tsx` 文件，Next.js 会：

1. 在该路由下自动注册 OG 图片的 URL
2. 自动在页面 `<head>` 中插入对应的 `<meta property="og:image">` 标签
3. 构建时（SSG）或请求时（SSR）调用导出的函数生成图片

**文件约定：**

| 文件名 | 生成标签 |
|--------|---------|
| `opengraph-image.tsx` | `<meta property="og:image">` |
| `twitter-image.tsx` | `<meta name="twitter:image">` |

### 2.2 @vercel/og 与 Satori

`@vercel/og` 是 Vercel 提供的 OG 图片生成库，核心引擎为 **Satori**。

**工作原理：**
1. 接收 JSX 模板（类似 React 组件）
2. Satori 将 JSX + CSS 子集转换为 SVG
3. 使用 Resvg 将 SVG 渲染为 PNG 图片
4. 返回 PNG 图片响应

**优势：**
- 无需 Puppeteer / Headless Chrome，运行在 Edge Runtime
- 支持类 Flexbox 布局
- 体积小，性能高
- 原生集成 Next.js

### 2.3 Satori 支持的 CSS 子集

Satori 并非完整的 CSS 引擎，仅支持以下布局和样式属性：

**布局相关（基于 Flexbox）：**

```
display: flex | none
flexDirection, flexWrap, flexGrow, flexShrink, flexBasis
alignItems, alignContent, alignSelf
justifyContent
gap
```

**盒模型：**

```
width, height, maxWidth, maxHeight, minWidth, minHeight
margin, padding
border, borderRadius
overflow: hidden
```

**文本：**

```
fontSize, fontWeight, fontFamily, fontStyle
lineHeight, letterSpacing
textAlign, textDecoration, textTransform, textOverflow
whiteSpace, wordBreak
color
```

**视觉：**

```
backgroundColor, backgroundImage (linear-gradient, radial-gradient)
opacity
boxShadow, textShadow
```

**不支持的特性：**

- CSS Grid
- `position: absolute/relative` (有限支持)
- CSS 动画/过渡
- `transform`（有限支持）
- `filter`
- CSS 变量
- 媒体查询

---

## 三、实现步骤

### 3.1 安装依赖

```bash
npm install @vercel/og
```

> 注意：Next.js 16.x 可能已内置 `@vercel/og`，如果已包含则无需额外安装。可通过 `next/og` 导入。

### 3.2 文章页 OG 图片

为每篇博客文章动态生成带有文章信息的品牌化预览图。

**文件：`src/app/blog/[slug]/opengraph-image.tsx`**

```typescript
import { ImageResponse } from "next/og";
import { posts } from "#site/content";

// 图片尺寸
export const size = {
  width: 1200,
  height: 630,
};

// 图片内容类型
export const contentType = "image/png";

// 替代文本
export const alt = "Finn Days Blog Post";

// 运行时（edge 性能更好）
export const runtime = "edge";

// 自定义字体加载
async function loadFont(): Promise<ArrayBuffer> {
  const response = await fetch(
    new URL("../../../../assets/fonts/GeistSans-Bold.woff", import.meta.url)
  );
  return response.arrayBuffer();
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    // 文章不存在时返回默认图片
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #9333ea, #2563eb)",
            color: "white",
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          Finn Days
        </div>
      ),
      { ...size }
    );
  }

  // 加载自定义字体（可选）
  // const fontData = await loadFont();

  // 格式化日期
  const formattedDate = new Date(post.date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          // 品牌渐变背景 purple-600 → blue-600
          background: "linear-gradient(135deg, #9333ea 0%, #2563eb 100%)",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        {/* 顶部区域：Logo + 站点名 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "auto",
          }}
        >
          {/* Logo 圆形占位 */}
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              color: "white",
              fontWeight: 700,
            }}
          >
            F
          </div>
          <span
            style={{
              fontSize: "24px",
              color: "rgba(255, 255, 255, 0.9)",
              fontWeight: 600,
            }}
          >
            Finn Days
          </span>
        </div>

        {/* 中间区域：文章标题 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            marginBottom: "auto",
          }}
        >
          <h1
            style={{
              fontSize: post.title.length > 40 ? "42px" : "56px",
              fontWeight: 700,
              color: "white",
              lineHeight: 1.2,
              margin: 0,
              // 限制最多显示 3 行
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {post.title}
          </h1>

          {/* 文章描述（可选） */}
          {post.description && (
            <p
              style={{
                fontSize: "22px",
                color: "rgba(255, 255, 255, 0.8)",
                lineHeight: 1.4,
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {post.description}
            </p>
          )}
        </div>

        {/* 底部区域：作者 + 日期 + 标签 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* 作者信息 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {/* 作者头像占位 */}
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                color: "white",
                fontWeight: 600,
              }}
            >
              F
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "18px",
                  color: "white",
                  fontWeight: 600,
                }}
              >
                Finn7X
              </span>
              <span
                style={{
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.7)",
                }}
              >
                {formattedDate}
              </span>
            </div>
          </div>

          {/* 标签 */}
          <div style={{ display: "flex", gap: "8px" }}>
            {post.tags?.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      // 自定义字体（可选）
      // fonts: [
      //   {
      //     name: "Geist Sans",
      //     data: fontData,
      //     style: "normal",
      //     weight: 700,
      //   },
      // ],
    }
  );
}
```

### 3.3 全局默认 OG 图片

为非文章页面（首页、关于页等）提供默认的品牌 OG 图片。

**文件：`src/app/opengraph-image.tsx`**

```typescript
import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";
export const alt = "Finn Days - 个人技术博客";
export const runtime = "edge";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #9333ea 0%, #2563eb 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
            color: "white",
            fontWeight: 700,
            marginBottom: "24px",
          }}
        >
          F
        </div>

        {/* 站点标题 */}
        <h1
          style={{
            fontSize: "72px",
            fontWeight: 700,
            color: "white",
            margin: "0 0 16px 0",
            letterSpacing: "-1px",
          }}
        >
          Finn Days
        </h1>

        {/* 描述 */}
        <p
          style={{
            fontSize: "24px",
            color: "rgba(255, 255, 255, 0.8)",
            margin: 0,
            maxWidth: "600px",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Exploring technology, sharing knowledge,
          and documenting my journey
        </p>

        {/* 底部标签 */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "40px",
          }}
        >
          {["Next.js", "React", "TypeScript"].map((tag) => (
            <span
              key={tag}
              style={{
                padding: "8px 20px",
                borderRadius: "24px",
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "16px",
                fontWeight: 500,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
```

### 3.4 字体加载

在 OG 图片中使用自定义字体（如 Geist Sans），需要将字体文件以 `ArrayBuffer` 形式加载。

**字体文件放置：**

```
src/
  assets/
    fonts/
      GeistSans-Regular.woff
      GeistSans-Bold.woff
```

**加载方式：**

```typescript
// 方式一：从本地文件加载
async function loadFont(): Promise<ArrayBuffer> {
  const response = await fetch(
    new URL("../../../assets/fonts/GeistSans-Bold.woff", import.meta.url)
  );
  return response.arrayBuffer();
}

// 方式二：从 Google Fonts CDN 加载
async function loadGoogleFont(): Promise<ArrayBuffer> {
  const response = await fetch(
    "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2"
  );
  return response.arrayBuffer();
}

// 在 ImageResponse 中使用
return new ImageResponse(<Component />, {
  ...size,
  fonts: [
    {
      name: "Geist Sans",
      data: await loadFont(),
      style: "normal",
      weight: 700,
    },
  ],
});
```

**注意：** Edge Runtime 下无法使用 Node.js 的 `fs` 模块，必须使用 `fetch` + `import.meta.url` 方式加载字体文件。

### 3.5 Twitter Image

如果希望 Twitter 和 Open Graph 使用不同的图片，可以单独创建 `twitter-image.tsx`。通常两者共用即可，Next.js 会在没有 `twitter-image.tsx` 时自动回退使用 `opengraph-image.tsx`。

```typescript
// src/app/blog/[slug]/twitter-image.tsx
// 如果需要不同的 Twitter 图片，创建此文件
// 否则会自动使用 opengraph-image.tsx
export { default, size, contentType, alt } from "./opengraph-image";
```

---

## 四、缓存策略

### 4.1 静态生成（推荐）

对于博客文章，OG 图片内容不会频繁变化，建议在构建时静态生成：

```typescript
// 在 opengraph-image.tsx 中导出 generateStaticParams
// 让 Next.js 在构建时预生成所有文章的 OG 图片
export async function generateStaticParams() {
  return posts
    .filter((post) => !post.draft)
    .map((post) => ({
      slug: post.slug,
    }));
}
```

### 4.2 运行时缓存

如果使用动态生成，可通过 HTTP 缓存头控制缓存：

```typescript
export const revalidate = 86400; // 24 小时重新验证

// 或在 route segment config 中
export const dynamic = "force-static";
```

### 4.3 Edge Runtime

使用 Edge Runtime 可以获得更快的图片生成速度：

```typescript
export const runtime = "edge";
```

---

## 五、文件清单

| 文件路径 | 说明 |
|---------|------|
| `src/app/opengraph-image.tsx` | 全局默认 OG 图片 |
| `src/app/blog/[slug]/opengraph-image.tsx` | 文章页动态 OG 图片 |
| `src/assets/fonts/GeistSans-Bold.woff` | 自定义字体文件（可选） |

---

## 六、依赖说明

| 依赖 | 版本 | 说明 |
|------|------|------|
| `@vercel/og` 或 `next/og` | 与 Next.js 版本对应 | OG 图片生成引擎（Next.js 16 内置 `next/og`） |

安装命令（如需单独安装）：

```bash
npm install @vercel/og
```

> Next.js 14+ 已内置 `next/og`，可直接从 `next/og` 导入 `ImageResponse`，无需额外安装 `@vercel/og`。

---

## 七、测试方法

### 7.1 本地预览

OG 图片本质上是一个 HTTP 端点，可以直接在浏览器中访问：

```bash
# 启动开发服务器
npm run dev

# 在浏览器中访问 OG 图片 URL
# 全局默认图片
http://localhost:3000/opengraph-image

# 文章 OG 图片
http://localhost:3000/blog/getting-started-with-nextjs/opengraph-image
```

### 7.2 检查 HTML meta 标签

```bash
# 查看页面源码中的 og:image 标签
curl -s http://localhost:3000/blog/getting-started | grep "og:image"

# 预期输出类似：
# <meta property="og:image" content="http://localhost:3000/blog/getting-started/opengraph-image" />
# <meta property="og:image:width" content="1200" />
# <meta property="og:image:height" content="630" />
```

### 7.3 社交媒体调试工具

部署到生产环境后，使用以下工具验证 OG 图片的实际展示效果：

| 平台 | 调试工具 |
|------|---------|
| Facebook | https://developers.facebook.com/tools/debug/ |
| Twitter/X | https://cards-dev.twitter.com/validator |
| LinkedIn | https://www.linkedin.com/post-inspector/ |
| 通用 | https://www.opengraph.xyz/ |

### 7.4 图片质量检查清单

- [ ] 图片尺寸为 1200x630 像素
- [ ] 文章标题完整显示（长标题正确截断）
- [ ] 品牌渐变色正确渲染
- [ ] 作者名称和日期正确显示
- [ ] 标签正确显示（最多 3 个）
- [ ] 文字在渐变背景上清晰可读
- [ ] 不同标题长度的文章都能正常显示

---

## 八、注意事项

1. **Satori CSS 限制**：Satori 仅支持 Flexbox 布局和有限的 CSS 属性。不能使用 CSS Grid、`position: absolute`（有限支持）、CSS 动画等高级特性。设计模板时请参考本文档第二节中的 CSS 子集说明。

2. **字体限制**：默认只有少量内置字体（如 sans-serif），如需使用 Geist Sans 等自定义字体，必须手动加载字体文件（`.woff` / `.ttf` 格式）。

3. **中文字体体积**：中文字体文件通常较大（数 MB），在 OG 图片中使用中文自定义字体会显著增加生成时间。建议：
   - 对中文内容使用系统默认字体（Noto Sans CJK 等）
   - 或使用字体子集化工具（如 `fonttools`）裁剪出常用字符

4. **Edge Runtime 限制**：使用 `runtime = "edge"` 时，不能使用 Node.js 特有的 API（如 `fs`、`path`）。字体和图片需通过 `fetch` 加载。

5. **图片尺寸规范**：始终使用 1200x630 像素，这是 Facebook、Twitter、LinkedIn 等主流平台推荐的尺寸比例 (1.91:1)。

6. **文字长度处理**：文章标题可能很长，模板设计时应处理文字溢出：
   - 根据标题长度动态调整字号
   - 使用 `textOverflow: "ellipsis"` 截断过长文字
   - 限制显示行数

7. **开发环境与生产环境差异**：OG 图片在开发模式下是动态生成的，在生产构建时如果配置了 `generateStaticParams` 则会静态生成。确保在 `npm run build` 后测试图片质量。

8. **调试技巧**：如果 OG 图片不符合预期，可以暂时将 `ImageResponse` 替换为简单的 JSX 进行逐步调试，确认布局和样式是否在 Satori 中按预期工作。

---

*本文档为 Finn Days 博客 OG 图片动态生成方案的完整参考。*
