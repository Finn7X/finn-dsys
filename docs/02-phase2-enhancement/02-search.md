# 搜索功能

## 概述

为 Finn Days 博客添加全站搜索功能，允许用户通过关键词快速查找文章。推荐使用 Pagefind 作为主要搜索方案——它在构建时生成索引，客户端通过 WASM 执行搜索，无需后端服务，对 CJK（中日韩）内容有良好支持。同时提供客户端数组过滤作为渐进式备选方案。

## 方案选型对比

| 特性 | Pagefind | Algolia | 客户端数组过滤 |
|------|----------|---------|---------------|
| 索引方式 | 构建时静态生成 | 云端索引 | 运行时内存过滤 |
| 搜索执行 | 客户端 WASM | 服务端 API | 客户端 JS |
| CJK 支持 | 内置支持 | 良好 | 取决于实现 |
| 索引大小 | < 300KB（压缩后） | 云端无限制 | 全量数据加载 |
| 搜索质量 | 全文索引 + 权重 | 业界领先 | 基础字符串匹配 |
| 免费额度 | 完全免费 | 10,000 次/月 | 完全免费 |
| 依赖 | 无服务端 | 需 Algolia 账号 | 无 |
| 适用规模 | 中小型站点 | 任意规模 | 小型站点（< 100 篇） |
| 离线搜索 | 支持 | 不支持 | 支持 |

**推荐方案：Pagefind**

理由：
- 完全静态方案，与 Next.js 静态导出完美匹配
- 内置 CJK 分词支持，对中文博客至关重要
- 索引文件极小（通常 < 300KB），加载快速
- 零运维成本，无第三方服务依赖
- 搜索质量远优于简单客户端过滤

## Pagefind 工作原理

### 构建阶段

1. `next build` 生成静态 HTML 文件
2. `pagefind` CLI 扫描构建输出目录中的 HTML 文件
3. 解析页面内容，生成分词索引
4. 索引文件输出到 `_pagefind/` 目录，包含：
   - `pagefind.js`：搜索入口脚本
   - `pagefind-ui.js/css`：可选的预构建 UI
   - `pagefind.wasm`：WASM 搜索引擎
   - `fragment/` 和 `index/`：分片索引数据

### 搜索阶段

1. 用户触发搜索时，客户端加载 `pagefind.js`
2. 首次搜索时加载 WASM 引擎和索引元数据
3. WASM 在浏览器中执行全文检索
4. 按需加载匹配结果的片段数据（按需加载，非一次性全部加载）
5. 返回搜索结果（标题、摘要、URL、高亮关键词）

### 索引大小

Pagefind 使用分片索引策略，初始加载只需元数据文件（约 10-20KB），后续按需加载匹配的索引片段。对于一个拥有 100-500 篇文章的博客，总索引大小通常在 100-300KB 之间。

## 技术方案

### 依赖安装

```bash
npm install -D pagefind
```

### 构建脚本修改

修改 `package.json` 中的构建脚本，在 `next build` 之后执行 Pagefind 索引生成：

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build && pagefind --site .next/server/app --output-path public/_pagefind",
    "postbuild": "echo 'Pagefind index generated successfully'",
    "start": "next start -p 8200",
    "lint": "next lint"
  }
}
```

> **说明**：`--site` 指定 Next.js 构建输出中包含 HTML 的目录；`--output-path` 将索引输出到 `public/` 下以便静态服务。如果使用 `output: "export"` 模式，则 `--site out` 即可。

### Pagefind 配置文件

在项目根目录创建 `pagefind.yml`：

```yaml
# pagefind.yml
site: .next/server/app
output_path: public/_pagefind

# CJK 中文支持
force_language: zh-CN

# 排除不需要索引的页面元素
exclude_selectors:
  - "nav"
  - "footer"
  - ".no-search"
  - "#comments"

# 权重配置
ranking:
  page_length: 0.5
  term_frequency: 1.5
  term_similarity: 1.0
```

### .gitignore 更新

将构建生成的索引文件加入 `.gitignore`：

```gitignore
# Pagefind index (generated at build time)
public/_pagefind/
```

## 实现步骤

### 步骤 1：Pagefind 搜索服务封装

创建一个封装层，管理 Pagefind 的初始化和搜索调用：

```typescript
// src/lib/pagefind.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

interface PagefindResult {
  id: string;
  url: string;
  excerpt: string;
  meta: {
    title: string;
    image?: string;
  };
  sub_results?: {
    title: string;
    url: string;
    excerpt: string;
  }[];
}

interface PagefindSearchResult {
  results: {
    id: string;
    data: () => Promise<PagefindResult>;
  }[];
}

let pagefind: any = null;

export async function initPagefind() {
  if (pagefind) return pagefind;

  try {
    pagefind = await import(
      /* webpackIgnore: true */
      "/_pagefind/pagefind.js"
    );
    await pagefind.init();
    return pagefind;
  } catch (error) {
    console.warn("Pagefind not available:", error);
    return null;
  }
}

export async function search(query: string): Promise<PagefindResult[]> {
  const pf = await initPagefind();
  if (!pf || !query.trim()) return [];

  const searchResult: PagefindSearchResult = await pf.search(query);

  // 加载前 10 条结果的详细数据
  const results = await Promise.all(
    searchResult.results.slice(0, 10).map((r) => r.data())
  );

  return results;
}

export async function clearSearch() {
  if (pagefind) {
    // 清理搜索状态（可选）
  }
}
```

### 步骤 2：SearchDialog 组件

使用 shadcn/ui 的 Dialog 组件构建搜索对话框：

```typescript
// src/components/search/search-dialog.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import { search } from "@/lib/pagefind";

interface SearchResult {
  id: string;
  url: string;
  excerpt: string;
  meta: {
    title: string;
  };
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 快捷键 Ctrl/Cmd + K 打开搜索
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 搜索防抖
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      const searchResults = await search(query);
      setResults(searchResults);
      setActiveIndex(0);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // 键盘导航
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : results.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (results[activeIndex]) {
            navigateToResult(results[activeIndex].url);
          }
          break;
        case "Escape":
          setOpen(false);
          break;
      }
    },
    [results, activeIndex]
  );

  const navigateToResult = (url: string) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(url);
  };

  return (
    <>
      {/* 搜索触发按钮 */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        aria-label="搜索文章"
      >
        <SearchIcon className="h-4 w-4" />
        <span className="hidden sm:inline">搜索...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* 搜索对话框 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 gap-0">
          <DialogHeader className="sr-only">
            <DialogTitle>搜索文章</DialogTitle>
          </DialogHeader>

          {/* 搜索输入框 */}
          <div className="flex items-center border-b px-4">
            <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜索文章..."
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12"
              autoFocus
            />
          </div>

          {/* 搜索结果列表 */}
          <div className="max-h-[400px] overflow-y-auto p-2">
            {isLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                搜索中...
              </div>
            )}

            {!isLoading && query && results.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                未找到相关文章
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <ul role="listbox">
                {results.map((result, index) => (
                  <li
                    key={result.id}
                    role="option"
                    aria-selected={index === activeIndex}
                    className={`cursor-pointer rounded-md px-3 py-3 text-sm transition-colors ${
                      index === activeIndex
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                    }`}
                    onClick={() => navigateToResult(result.url)}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <div className="font-medium mb-1">
                      {result.meta.title}
                    </div>
                    <div
                      className="text-xs text-muted-foreground line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: result.excerpt }}
                    />
                  </li>
                ))}
              </ul>
            )}

            {!query && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                输入关键词开始搜索
              </div>
            )}
          </div>

          {/* 底部快捷键提示 */}
          <div className="flex items-center justify-end gap-3 border-t px-4 py-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1">↑</kbd>
              <kbd className="rounded border bg-muted px-1">↓</kbd>
              导航
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1">↵</kbd>
              打开
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1">esc</kbd>
              关闭
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### 步骤 3：导航栏集成搜索入口

在导航栏组件中添加搜索按钮：

```typescript
// src/components/layout/navbar.tsx（相关部分）
import { SearchDialog } from "@/components/search/search-dialog";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md z-50 border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Finn Days</h1>
        </div>

        {/* 导航链接 + 搜索 */}
        <div className="flex items-center gap-4">
          {/* 导航链接 */}
          <div className="hidden md:flex items-center gap-4">
            {/* ... 导航链接 */}
          </div>

          {/* 搜索按钮 */}
          <SearchDialog />

          {/* 主题切换按钮 */}
        </div>
      </div>
    </nav>
  );
}
```

### 步骤 4：文章页面添加搜索索引标记

在文章页面中使用 `data-pagefind-body` 属性标记需要索引的内容区域：

```html
<!-- 在文章详情页模板中 -->
<article data-pagefind-body>
  <h1 data-pagefind-meta="title">{post.title}</h1>
  <time data-pagefind-meta="date">{post.date}</time>
  <div>{/* MDX Content */}</div>
</article>
```

不需要索引的区域可以添加 `data-pagefind-ignore`：

```html
<nav data-pagefind-ignore>...</nav>
<footer data-pagefind-ignore>...</footer>
```

### 步骤 5：CJK 中文分词支持配置

Pagefind 从 v1.0 开始内置 CJK 分词支持，通过 `force_language` 配置即可启用：

```yaml
# pagefind.yml
force_language: zh-CN
```

也可以在 HTML 中使用 `lang` 属性：

```html
<html lang="zh-CN">
```

Pagefind 会自动检测 `lang` 属性并启用对应的分词器。对于中文内容，它使用基于字典的分词策略，能够正确处理中文词语边界。

### 搜索结果排序与权重配置

通过 `pagefind.yml` 的 `ranking` 字段和 HTML 属性控制搜索结果排序：

```yaml
# pagefind.yml
ranking:
  page_length: 0.5      # 页面长度对排名的影响（降低长文章的优势）
  term_frequency: 1.5    # 词频权重（提高关键词出现频率高的页面排名）
  term_similarity: 1.0   # 词形相似度权重
  term_saturation: 1.2   # 词频饱和度
```

在 HTML 中为重要元素设置权重：

```html
<h1 data-pagefind-weight="10">{post.title}</h1>
<p data-pagefind-weight="2">{post.description}</p>
```

### 渐进式方案：客户端数组过滤

在 Pagefind 集成之前，可以先实现一个简单的客户端过滤方案作为过渡：

```typescript
// src/lib/search-simple.ts
import { allPosts } from "@/lib/velite"; // 假设 Velite 导出所有文章

interface SimpleSearchResult {
  title: string;
  slug: string;
  excerpt: string;
  date: string;
}

export function simpleSearch(query: string): SimpleSearchResult[] {
  if (!query.trim()) return [];

  const normalizedQuery = query.toLowerCase();

  return allPosts
    .filter((post) => {
      const titleMatch = post.title.toLowerCase().includes(normalizedQuery);
      const bodyMatch = post.body?.toLowerCase().includes(normalizedQuery);
      const tagMatch = post.tags?.some((tag: string) =>
        tag.toLowerCase().includes(normalizedQuery)
      );
      return titleMatch || bodyMatch || tagMatch;
    })
    .map((post) => ({
      title: post.title,
      slug: post.slug,
      excerpt: post.description || post.body?.substring(0, 150) || "",
      date: post.date,
    }))
    .slice(0, 10);
}
```

这个方案适合文章数量少于 100 篇的初期阶段，不需要构建时生成索引，但搜索质量和性能不如 Pagefind。

## 文件清单

| 文件路径 | 说明 | 操作 |
|---------|------|------|
| `pagefind.yml` | Pagefind 配置文件 | 新建 |
| `package.json` | 修改 build 脚本 | 修改 |
| `.gitignore` | 添加 `public/_pagefind/` | 修改 |
| `src/lib/pagefind.ts` | Pagefind 搜索服务封装 | 新建 |
| `src/lib/search-simple.ts` | 简单客户端搜索（渐进式） | 新建（可选） |
| `src/components/search/search-dialog.tsx` | 搜索对话框组件 | 新建 |
| `src/components/layout/navbar.tsx` | 导航栏 | 修改（添加搜索入口） |
| `src/app/blog/[slug]/page.tsx` | 文章详情页 | 修改（添加 pagefind 标记） |

## 依赖说明

| 依赖包 | 版本 | 类型 | 说明 |
|--------|------|------|------|
| `pagefind` | `^1.3.0` | devDependency | 构建时索引生成工具 |

> **注意**：Pagefind 的客户端 JS/WASM 不需要通过 npm 安装，由 CLI 工具在构建时自动生成到 `public/_pagefind/` 目录中。

需要确保已安装以下 shadcn/ui 组件（如未安装需提前添加）：

```bash
npx shadcn@latest add dialog input
```

## 测试要点

1. **构建与索引测试**
   - 执行 `npm run build`，确认 Pagefind 索引成功生成
   - 检查 `public/_pagefind/` 目录结构和文件大小
   - 确认 `pagefind.yml` 配置正确解析

2. **搜索功能测试**
   - 输入英文关键词，返回正确结果
   - 输入中文关键词，验证 CJK 分词正确
   - 搜索不存在的关键词，显示"未找到"提示
   - 搜索结果中的高亮标记正确显示

3. **UI 交互测试**
   - `Ctrl/Cmd + K` 快捷键正确打开/关闭搜索对话框
   - 上下方向键正确导航搜索结果列表
   - `Enter` 键跳转到选中的搜索结果页面
   - `Escape` 键关闭搜索对话框
   - 点击搜索结果项跳转到对应页面
   - 鼠标悬停更新高亮选项

4. **性能测试**
   - 搜索输入有 300ms 防抖，避免频繁触发搜索
   - Pagefind WASM 和索引按需加载，不影响首屏性能
   - 搜索响应时间 < 100ms（本地 WASM 执行）

5. **响应式测试**
   - 移动端搜索对话框全屏显示
   - 快捷键提示在移动端隐藏
   - 搜索按钮在小屏幕上仅显示图标

6. **开发环境测试**
   - 开发模式下 Pagefind 索引不存在时不报错，优雅降级
   - 控制台输出友好的提示信息

## 注意事项

1. **开发环境**：Pagefind 索引仅在构建后生成，开发模式下搜索功能不可用。可在开发时切换使用简单客户端过滤方案
2. **动态路由**：确保 Pagefind 扫描的 HTML 包含文章的完整内容，而非客户端渲染的空壳页面。Next.js App Router 的 SSG/SSR 页面默认会输出完整 HTML
3. **索引更新**：每次构建都会重新生成索引，无需手动更新
4. **搜索结果 URL**：Pagefind 返回的 URL 可能包含 `.html` 后缀或路径差异，需要在封装层中做路径映射处理
5. **CSP 策略**：如果启用了 Content Security Policy，需要允许加载 `/_pagefind/` 目录下的 WASM 文件
6. **多语言**：如果未来有英文文章，可以按语言分别建立索引，Pagefind 支持多语言索引
