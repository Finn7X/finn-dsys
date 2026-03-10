# 自定义 MDX 组件库

## 概述

自定义 MDX 组件库是 Finn Days 博客的内容表达核心。通过构建一套丰富的、风格统一的自定义组件，我们能在 MDX 文章中实现远超标准 Markdown 的表达能力——提示框、交互式代码块、标签页、步骤式教程、折叠面板、目录树、链接卡片以及多媒体嵌入等。

### 目标

- 打造独特且一致的内容表达能力
- 所有组件遵循统一的设计系统（颜色、圆角、间距、动画）
- 支持亮色/暗色模式自适应
- 满足无障碍 (a11y) 标准
- 在 MDX 中使用时语法简洁直观

---

## 组件注册表

所有自定义 MDX 组件通过统一的注册表导出，便于在 MDX 渲染器中一次性注入。

### 文件位置

```
src/components/mdx/index.tsx
```

### 注册表实现

```tsx
// src/components/mdx/index.tsx
import { Callout } from "./callout";
import { CodeBlock } from "./code-block";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
import { Steps, Step } from "./steps";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./accordion";
import { FileTree, Folder, File } from "./file-tree";
import { LinkCard } from "./link-card";
import { YouTube, Tweet } from "./embed";

// MDX 组件映射表
export const mdxComponents = {
  // 自定义组件
  Callout,
  CodeBlock,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Steps,
  Step,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  FileTree,
  Folder,
  File,
  LinkCard,
  YouTube,
  Tweet,

  // HTML 元素覆盖（可选，用于增强默认 Markdown 元素）
  // img: CustomImage,
  // a: CustomLink,
  // pre: CodeBlock,
};
```

### 在 Velite / MDX 渲染中注册

```tsx
// src/app/blog/[slug]/page.tsx
import { mdxComponents } from "@/components/mdx";
import { MDXContent } from "@/components/mdx-content";

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <MDXContent code={post.content} components={mdxComponents} />
    </article>
  );
}
```

---

## 组件详细设计

### 1. Callout 提示框

#### 文件位置

```
src/components/mdx/callout.tsx
```

#### 功能说明

Callout 是一种带有视觉区分的提示框，用于在文章中突出显示重要信息、警告、成功提示或错误说明。

#### 类型定义

| 类型 | 图标 | 背景色（亮色） | 背景色（暗色） | 边框色 | 用途 |
| --- | --- | --- | --- | --- | --- |
| `info` | `Info` | `blue-50` | `blue-950/50` | `blue-200` / `blue-800` | 补充信息、提示 |
| `warning` | `AlertTriangle` | `yellow-50` | `yellow-950/50` | `yellow-200` / `yellow-800` | 注意事项、警告 |
| `success` | `CheckCircle` | `green-50` | `green-950/50` | `green-200` / `green-800` | 成功提示、最佳实践 |
| `error` | `XCircle` | `red-50` | `red-950/50` | `red-200` / `red-800` | 错误提示、常见陷阱 |

#### 代码实现

```tsx
// src/components/mdx/callout.tsx
import { cn } from "@/lib/utils";
import {
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  type LucideIcon,
} from "lucide-react";

type CalloutType = "info" | "warning" | "success" | "error";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

const calloutConfig: Record<
  CalloutType,
  { icon: LucideIcon; className: string }
> = {
  info: {
    icon: Info,
    className:
      "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-100",
  },
  warning: {
    icon: AlertTriangle,
    className:
      "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-100",
  },
  success: {
    icon: CheckCircle,
    className:
      "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950/50 dark:text-green-100",
  },
  error: {
    icon: XCircle,
    className:
      "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-100",
  },
};

export function Callout({ type = "info", title, children }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "my-6 flex gap-3 rounded-lg border p-4",
        config.className
      )}
      role="note"
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0">
        {title && <p className="mb-1 font-semibold">{title}</p>}
        <div className="text-sm [&>p]:m-0">{children}</div>
      </div>
    </div>
  );
}
```

#### MDX 使用语法

```mdx
<Callout type="info" title="提示">
  这是一条有用的补充信息。
</Callout>

<Callout type="warning">
  请注意，此 API 即将被弃用。
</Callout>

<Callout type="success" title="最佳实践">
  推荐使用 `const` 而不是 `let` 来声明不会被重新赋值的变量。
</Callout>

<Callout type="error" title="常见错误">
  不要在循环内部调用 React Hooks。
</Callout>
```

---

### 2. CodeBlock 代码块增强

#### 文件位置

```
src/components/mdx/code-block.tsx
```

#### 功能说明

在 rehype-pretty-code（基于 Shiki）提供的语法高亮基础上，增加以下增强功能：

- 文件名标签（顶部显示文件路径）
- 一键复制按钮
- 行高亮标记

#### 代码实现

```tsx
// src/components/mdx/code-block.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Copy, File } from "lucide-react";

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  /** 文件名/路径，通过 rehype-pretty-code 的 meta 传入 */
  "data-filename"?: string;
  /** 代码语言 */
  "data-language"?: string;
  /** 原始代码文本（用于复制） */
  raw?: string;
}

export function CodeBlock({
  children,
  className,
  raw,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const filename = props["data-filename"];
  const language = props["data-language"];

  const handleCopy = async () => {
    if (raw) {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="group relative my-6 overflow-hidden rounded-lg border bg-muted/30">
      {/* 顶部栏：文件名 + 语言标签 + 复制按钮 */}
      <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {filename && (
            <>
              <File className="h-3.5 w-3.5" />
              <span className="font-mono text-xs">{filename}</span>
            </>
          )}
          {!filename && language && (
            <span className="font-mono text-xs uppercase">{language}</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={copied ? "已复制" : "复制代码"}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* 代码区域 */}
      <pre
        className={cn(
          "overflow-x-auto p-4 text-sm leading-relaxed",
          // 行高亮样式
          "[&_[data-highlighted-line]]:bg-accent/50 [&_[data-highlighted-line]]:border-l-2 [&_[data-highlighted-line]]:border-primary [&_[data-highlighted-line]]:pl-[calc(1rem-2px)]",
          className
        )}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
```

#### MDX 使用语法

````mdx
```tsx title="src/app/page.tsx" {3,7-9}
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main>
      <h1>Welcome</h1>
      <Button variant="default">
        Click me
      </Button>
    </main>
  );
}
```
````

---

### 3. Tabs 标签页

#### 文件位置

```
src/components/mdx/tabs.tsx
```

#### 功能说明

标签页组件支持在 MDX 中展示多标签内容，最常见的用途是多语言/多框架的代码对比，也可用于展示任意分组内容。

#### 代码实现

```tsx
// src/components/mdx/tabs.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  defaultValue?: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | null>(null);

function useTabs() {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("Tabs 组件必须包裹在 <Tabs> 内使用");
  return context;
}

export function Tabs({ defaultValue = "", children, className }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("my-6", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-1 rounded-lg border bg-muted/50 p-1",
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
        isActive
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { activeTab } = useTabs();

  if (activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn(
        "mt-2 animate-in fade-in-50 duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}
```

#### MDX 使用语法

```mdx
<Tabs defaultValue="npm">
  <TabsList>
    <TabsTrigger value="npm">npm</TabsTrigger>
    <TabsTrigger value="yarn">yarn</TabsTrigger>
    <TabsTrigger value="pnpm">pnpm</TabsTrigger>
  </TabsList>
  <TabsContent value="npm">
    ```bash
    npm install next
    ```
  </TabsContent>
  <TabsContent value="yarn">
    ```bash
    yarn add next
    ```
  </TabsContent>
  <TabsContent value="pnpm">
    ```bash
    pnpm add next
    ```
  </TabsContent>
</Tabs>
```

---

### 4. Steps 步骤组件

#### 文件位置

```
src/components/mdx/steps.tsx
```

#### 功能说明

步骤组件用于展示有序的教程步骤，每个步骤包含序号、标题和详细内容，步骤之间通过连接线串联。

#### 代码实现

```tsx
// src/components/mdx/steps.tsx
import { cn } from "@/lib/utils";

interface StepsProps {
  children: React.ReactNode;
  className?: string;
}

interface StepProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Steps({ children, className }: StepsProps) {
  return (
    <div className={cn("my-6 ml-4 border-l-2 border-border pl-6", className)}>
      {children}
    </div>
  );
}

export function Step({ title, children, className }: StepProps) {
  return (
    <div className={cn("relative pb-8 last:pb-0", className)}>
      {/* 序号圆点 */}
      <div className="absolute -left-[calc(1.5rem+1px+0.625rem)] flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-background text-xs font-bold text-primary">
        <StepCounter />
      </div>
      {/* 标题 */}
      <h4 className="mb-2 font-semibold leading-none tracking-tight">
        {title}
      </h4>
      {/* 内容 */}
      <div className="text-sm text-muted-foreground [&>p]:mt-2">
        {children}
      </div>
    </div>
  );
}

// 自动计数的步骤序号
// 在实际实现中，可通过 React context 或 CSS counter 实现自动编号
function StepCounter() {
  // 使用 CSS counter 方案更优雅
  // 此处简化为通过 CSS counter-increment 实现
  return <span className="step-counter" />;
}
```

#### CSS counter 方案

```css
/* 在 globals.css 中添加 */
.steps-container {
  counter-reset: step;
}

.step-counter::before {
  counter-increment: step;
  content: counter(step);
}
```

#### MDX 使用语法

```mdx
<Steps>
  <Step title="安装依赖">
    运行以下命令安装 Next.js 和相关依赖：

    ```bash
    npm install next react react-dom
    ```
  </Step>

  <Step title="创建页面">
    在 `src/app/page.tsx` 中创建首页组件。
  </Step>

  <Step title="启动开发服务器">
    ```bash
    npm run dev
    ```

    打开浏览器访问 `http://localhost:3000`。
  </Step>
</Steps>
```

---

### 5. Accordion 折叠组件

#### 文件位置

```
src/components/mdx/accordion.tsx
```

#### 功能说明

可折叠的内容区域，基于 Radix UI Accordion 原语构建，常用于 FAQ、API 参数说明等场景。

#### 代码实现

```tsx
// src/components/mdx/accordion.tsx
"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Root
    ref={ref}
    className={cn("my-6 space-y-2", className)}
    {...props}
  />
));
Accordion.displayName = "Accordion";

export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("rounded-lg border", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between px-4 py-3 text-sm font-medium transition-all hover:bg-muted/50 [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = "AccordionTrigger";

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("px-4 pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = "AccordionContent";
```

#### MDX 使用语法

```mdx
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>什么是 Server Components？</AccordionTrigger>
    <AccordionContent>
      Server Components 是 React 18 引入的新概念，允许组件在服务端渲染，
      减少客户端 JavaScript 体积。
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="item-2">
    <AccordionTrigger>App Router 和 Pages Router 的区别？</AccordionTrigger>
    <AccordionContent>
      App Router 基于 Server Components，支持嵌套布局、流式渲染等新特性。
      Pages Router 是 Next.js 传统的路由方案。
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

---

### 6. FileTree 目录树

#### 文件位置

```
src/components/mdx/file-tree.tsx
```

#### 功能说明

用于展示项目目录结构的树形组件，支持文件/文件夹区分显示、折叠展开、文件类型图标区分。

#### 代码实现

```tsx
// src/components/mdx/file-tree.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  File as FileIcon,
  Folder as FolderIcon,
  FolderOpen,
} from "lucide-react";

interface FileTreeProps {
  children: React.ReactNode;
  className?: string;
}

interface FolderProps {
  name: string;
  defaultOpen?: boolean;
  children?: React.ReactNode;
}

interface FileProps {
  name: string;
  /** 是否高亮此文件（例如当前正在讨论的文件） */
  active?: boolean;
}

export function FileTree({ children, className }: FileTreeProps) {
  return (
    <div
      className={cn(
        "my-6 rounded-lg border bg-muted/30 p-4 font-mono text-sm",
        className
      )}
      role="tree"
    >
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

export function Folder({ name, defaultOpen = false, children }: FolderProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <li role="treeitem" aria-expanded={isOpen}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-1.5 rounded px-1 py-0.5 text-left hover:bg-muted transition-colors"
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-90"
          )}
        />
        {isOpen ? (
          <FolderOpen className="h-4 w-4 shrink-0 text-blue-500" />
        ) : (
          <FolderIcon className="h-4 w-4 shrink-0 text-blue-500" />
        )}
        <span className="text-foreground">{name}</span>
      </button>
      {isOpen && children && (
        <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-3">
          {children}
        </ul>
      )}
    </li>
  );
}

export function File({ name, active = false }: FileProps) {
  return (
    <li role="treeitem" className="flex items-center gap-1.5 px-1 py-0.5">
      <span className="w-3.5" /> {/* 与文件夹箭头对齐 */}
      <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span
        className={cn(
          "text-foreground",
          active && "font-semibold text-primary"
        )}
      >
        {name}
      </span>
    </li>
  );
}
```

#### MDX 使用语法

```mdx
<FileTree>
  <Folder name="src" defaultOpen>
    <Folder name="app" defaultOpen>
      <File name="layout.tsx" />
      <File name="page.tsx" active />
      <File name="globals.css" />
      <Folder name="blog">
        <File name="page.tsx" />
        <Folder name="[slug]">
          <File name="page.tsx" />
        </Folder>
      </Folder>
    </Folder>
    <Folder name="components">
      <Folder name="ui">
        <File name="button.tsx" />
        <File name="card.tsx" />
      </Folder>
      <Folder name="mdx">
        <File name="callout.tsx" />
        <File name="index.tsx" />
      </Folder>
    </Folder>
    <Folder name="lib">
      <File name="utils.ts" />
    </Folder>
  </Folder>
  <File name="package.json" />
  <File name="tsconfig.json" />
</FileTree>
```

---

### 7. LinkCard 链接卡片

#### 文件位置

```
src/components/mdx/link-card.tsx
```

#### 功能说明

用于在文章中以卡片形式展示外部链接的预览信息，包含标题、描述和网站图标，提供比普通超链接更丰富的视觉呈现。

#### 代码实现

```tsx
// src/components/mdx/link-card.tsx
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface LinkCardProps {
  href: string;
  title: string;
  description?: string;
  favicon?: string;
  className?: string;
}

export function LinkCard({
  href,
  title,
  description,
  favicon,
  className,
}: LinkCardProps) {
  // 从 URL 中提取域名
  const hostname = new URL(href).hostname;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group my-6 flex items-center gap-4 rounded-lg border p-4",
        "transition-all duration-200",
        "hover:border-primary/50 hover:bg-muted/50 hover:shadow-md",
        "no-underline",
        className
      )}
    >
      {/* Favicon */}
      {favicon ? (
        <img
          src={favicon}
          alt=""
          className="h-10 w-10 shrink-0 rounded"
          loading="lazy"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted">
          <ExternalLink className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      {/* 内容 */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground group-hover:text-primary transition-colors">
          {title}
        </p>
        {description && (
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {description}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{hostname}</p>
      </div>

      {/* 外链图标 */}
      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
  );
}
```

#### MDX 使用语法

```mdx
<LinkCard
  href="https://nextjs.org"
  title="Next.js - The React Framework"
  description="用于生产的 React 框架，提供静态和服务端渲染、TypeScript 支持、智能打包等功能。"
  favicon="https://nextjs.org/favicon.ico"
/>

<LinkCard
  href="https://tailwindcss.com"
  title="Tailwind CSS"
  description="一个实用优先的 CSS 框架，用于快速构建自定义用户界面。"
/>
```

---

### 8. YouTube / Tweet 嵌入

#### 文件位置

```
src/components/mdx/embed.tsx
```

#### 功能说明

响应式的多媒体嵌入组件，支持 YouTube 视频和 Twitter/X 推文的懒加载嵌入。未加载前显示占位符，减少对页面性能的影响。

#### 代码实现

```tsx
// src/components/mdx/embed.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

// ========== YouTube 嵌入 ==========

interface YouTubeProps {
  id: string;
  title?: string;
  className?: string;
}

export function YouTube({ id, title = "YouTube 视频", className }: YouTubeProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const thumbnailUrl = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

  if (!isLoaded) {
    return (
      <div className={cn("my-6", className)}>
        <button
          onClick={() => setIsLoaded(true)}
          className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted"
          aria-label={`播放视频: ${title}`}
        >
          {/* 缩略图 */}
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          {/* 播放按钮覆盖 */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
              <Play className="h-7 w-7 translate-x-0.5" fill="white" />
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className={cn("my-6", className)}>
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
          loading="lazy"
        />
      </div>
    </div>
  );
}

// ========== Tweet 嵌入 ==========

interface TweetProps {
  id: string;
  className?: string;
}

export function Tweet({ id, className }: TweetProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    // 动态加载 Twitter 嵌入脚本
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.onload = () => setIsLoaded(true);

    if (!document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')) {
      document.body.appendChild(script);
    } else {
      // 脚本已存在，手动触发渲染
      if (window.twttr?.widgets) {
        window.twttr.widgets.load(containerRef.current);
        setIsLoaded(true);
      }
    }
  }, []);

  React.useEffect(() => {
    if (isLoaded && window.twttr?.widgets) {
      window.twttr.widgets.load(containerRef.current);
    }
  }, [isLoaded]);

  return (
    <div
      ref={containerRef}
      className={cn("my-6 flex justify-center", className)}
    >
      {!isLoaded && (
        <div className="w-full max-w-lg animate-pulse rounded-lg border bg-muted p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted-foreground/20" />
            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-muted-foreground/20" />
              <div className="h-3 w-16 rounded bg-muted-foreground/20" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded bg-muted-foreground/20" />
            <div className="h-3 w-3/4 rounded bg-muted-foreground/20" />
          </div>
        </div>
      )}
      <blockquote className="twitter-tweet" data-theme="light">
        <a href={`https://twitter.com/x/status/${id}`}>加载推文中...</a>
      </blockquote>
    </div>
  );
}

// TypeScript 全局类型扩展
declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement | null) => void;
      };
    };
  }
}
```

#### MDX 使用语法

```mdx
<YouTube id="dQw4w9WgXcQ" title="介绍视频" />

<Tweet id="1234567890123456789" />
```

---

## 样式一致性

所有 MDX 组件必须遵循以下设计系统规范：

### 颜色

- 使用 CSS 变量系统（`hsl(var(--xxx))`），确保亮色/暗色模式自动适配
- 品牌色仅用于强调元素（如活跃状态、链接高亮）
- 边框统一使用 `border-border`

### 圆角

- 小型元素：`rounded-md`（基于 `--radius - 2px`）
- 中型容器：`rounded-lg`（基于 `--radius`）
- 使用一致的圆角值，避免混用

### 间距

- 组件外间距：`my-6`（24px 上下边距）
- 组件内间距：`p-4`（16px 内边距）
- 遵循 4px 间距尺度

### 字体

- 正文：`font-sans`（Geist Sans）
- 代码/路径：`font-mono`（Geist Mono）

### 动画

- 过渡时长：`duration-200`（200ms）
- 缓动函数：默认 `ease-in-out`
- 展开/收起动画：使用 `tw-animate-css` 提供的 keyframes

---

## 无障碍 (a11y) 考虑

### 通用要求

| 组件 | a11y 要求 |
| --- | --- |
| Callout | 使用 `role="note"` 语义化标记 |
| CodeBlock | 复制按钮有 `aria-label`，复制成功有状态反馈 |
| Tabs | 使用 `role="tablist"` / `role="tab"` / `role="tabpanel"` |
| Steps | 使用有序列表语义 |
| Accordion | 基于 Radix UI，内建完整 ARIA 支持 |
| FileTree | 使用 `role="tree"` / `role="treeitem"` |
| LinkCard | 链接有明确文本，`rel="noopener noreferrer"` |
| YouTube | 播放按钮有 `aria-label`，iframe 有 `title` |
| Tweet | 提供降级链接文本 |

### 键盘操作

- 所有交互元素可通过 Tab 键聚焦
- 折叠/展开操作支持 Enter/Space 触发
- 标签页支持左右键切换
- 焦点可见性：确保 `focus-visible` 样式清晰

---

## 文件结构总览

```
src/components/mdx/
├── index.tsx          # 组件注册表
├── callout.tsx        # 提示框
├── code-block.tsx     # 代码块增强
├── tabs.tsx           # 标签页
├── steps.tsx          # 步骤组件
├── accordion.tsx      # 折叠组件
├── file-tree.tsx      # 目录树
├── link-card.tsx      # 链接卡片
└── embed.tsx          # YouTube / Tweet 嵌入
```
