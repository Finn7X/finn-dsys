# 交互式代码演练场

## 概述

交互式代码演练场（Code Playground）允许读者在文章中直接编辑和运行代码，获得即时的视觉反馈。这对于 React 组件教程、CSS 演示、JavaScript 算法讲解等场景极其有用，能显著提升技术博客的互动性和教学效果。

---

## 技术选型：Sandpack

### 库简介

[Sandpack](https://sandpack.codesandbox.io/) 是由 CodeSandbox 团队开发的浏览器端打包工具和 React 组件库。它在浏览器中运行一个完整的开发环境（基于 Web Worker），无需服务端支持。

### 选型理由

| 考量维度 | Sandpack 表现 |
| --- | --- |
| 功能完整度 | 浏览器内完整打包、HMR（热模块替换） |
| React 集成 | 官方 React 组件库，开箱即用 |
| 主题支持 | 内建多套主题，支持自定义主题 |
| 模板丰富 | React、React-TS、Vanilla、Vue 等 |
| 多文件支持 | 支持多文件编辑和文件间引用 |
| 维护状态 | CodeSandbox 团队官方维护，持续更新 |
| 导出能力 | 一键导出至 CodeSandbox 在线编辑器 |

### 安装

```bash
npm install @codesandbox/sandpack-react
```

---

## 组件设计

### 文件位置

```
src/components/mdx/code-playground.tsx
```

### 核心代码实现

```tsx
// src/components/mdx/code-playground.tsx
"use client";

import * as React from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  SandpackConsole,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { ExternalLink, RotateCcw } from "lucide-react";

// ========== 主题映射 ==========

const lightTheme = {
  colors: {
    surface1: "hsl(0 0% 100%)",        // 编辑器背景
    surface2: "hsl(0 0% 96.1%)",       // 工具栏背景
    surface3: "hsl(0 0% 89.8%)",       // 边框
    clickable: "hsl(0 0% 45.1%)",      // 可点击文本
    base: "hsl(0 0% 3.9%)",            // 基础文本
    disabled: "hsl(0 0% 63.9%)",       // 禁用状态
    hover: "hsl(0 0% 9%)",             // hover 状态
    accent: "hsl(262 83% 58%)",        // 强调色 (purple-600)
    error: "hsl(0 84.2% 60.2%)",       // 错误色
    errorSurface: "hsl(0 100% 97%)",   // 错误背景
  },
  font: {
    body: "var(--font-geist-sans)",
    mono: "var(--font-geist-mono)",
    size: "14px",
    lineHeight: "1.6",
  },
};

const darkTheme = {
  colors: {
    surface1: "hsl(0 0% 3.9%)",
    surface2: "hsl(0 0% 14.9%)",
    surface3: "hsl(0 0% 14.9%)",
    clickable: "hsl(0 0% 63.9%)",
    base: "hsl(0 0% 98%)",
    disabled: "hsl(0 0% 45.1%)",
    hover: "hsl(0 0% 98%)",
    accent: "hsl(262 83% 68%)",
    error: "hsl(0 62.8% 50%)",
    errorSurface: "hsl(0 50% 10%)",
  },
  font: {
    body: "var(--font-geist-sans)",
    mono: "var(--font-geist-mono)",
    size: "14px",
    lineHeight: "1.6",
  },
};

// ========== 类型定义 ==========

type SandpackTemplate = "react" | "react-ts" | "vanilla" | "vanilla-ts";

type LayoutDirection = "horizontal" | "vertical";

interface CodePlaygroundProps {
  /** Sandpack 模板 */
  template?: SandpackTemplate;
  /** 文件内容映射 */
  files?: Record<string, string>;
  /** 预装依赖 */
  dependencies?: Record<string, string>;
  /** 布局方向 */
  layout?: LayoutDirection;
  /** 是否显示文件浏览器 */
  showFileExplorer?: boolean;
  /** 是否显示控制台 */
  showConsole?: boolean;
  /** 编辑器高度 */
  editorHeight?: number;
  /** 是否显示行号 */
  showLineNumbers?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 标题 */
  title?: string;
}

// ========== 主组件 ==========

export function CodePlayground({
  template = "react",
  files,
  dependencies,
  layout = "horizontal",
  showFileExplorer = false,
  showConsole = false,
  editorHeight = 350,
  showLineNumbers = true,
  className,
  title,
}: CodePlaygroundProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const theme = isDark ? darkTheme : lightTheme;

  // 构建 customSetup
  const customSetup = dependencies
    ? { dependencies }
    : undefined;

  return (
    <div className={cn("my-6 overflow-hidden rounded-lg border", className)}>
      {/* 标题栏 */}
      {title && (
        <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
      )}

      <SandpackProvider
        template={template}
        files={files}
        customSetup={customSetup}
        theme={theme}
      >
        <SandpackLayout
          className={cn(
            layout === "vertical" && "flex-col"
          )}
        >
          {showFileExplorer && <SandpackFileExplorer />}

          <SandpackCodeEditor
            showLineNumbers={showLineNumbers}
            showInlineErrors
            wrapContent
            style={{ height: `${editorHeight}px` }}
          />

          <SandpackPreview
            showOpenInCodeSandbox={false}
            showRefreshButton
            style={{ height: `${editorHeight}px` }}
          />
        </SandpackLayout>

        {showConsole && (
          <SandpackConsole style={{ height: "150px" }} />
        )}

        {/* 自定义工具栏 */}
        <PlaygroundToolbar />
      </SandpackProvider>
    </div>
  );
}

// ========== 工具栏组件 ==========

function PlaygroundToolbar() {
  const { sandpack } = useSandpack();

  const handleReset = () => {
    sandpack.resetAllFiles();
  };

  const handleOpenInCSB = () => {
    // 获取当前文件内容，构造 CodeSandbox URL
    const files = sandpack.files;
    const params = new URLSearchParams();

    Object.entries(files).forEach(([path, file]) => {
      params.set(`files[${path}]`, typeof file === "string" ? file : file.code);
    });

    window.open(
      `https://codesandbox.io/api/v1/sandboxes/define?parameters=${btoa(JSON.stringify({ files }))}`,
      "_blank"
    );
  };

  return (
    <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-3 py-1.5">
      <button
        onClick={handleReset}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="重置代码"
      >
        <RotateCcw className="h-3 w-3" />
        <span>重置</span>
      </button>
      <button
        onClick={handleOpenInCSB}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="在 CodeSandbox 中打开"
      >
        <ExternalLink className="h-3 w-3" />
        <span>在 CodeSandbox 中打开</span>
      </button>
    </div>
  );
}
```

---

## Sandpack 配置详解

### 模板选择

| 模板 | 适用场景 | 包含 |
| --- | --- | --- |
| `react` | React 组件演示（默认） | React + ReactDOM + JSX |
| `react-ts` | TypeScript React 组件 | React + ReactDOM + TypeScript |
| `vanilla` | 纯 JS/HTML/CSS 演示 | 无框架 |
| `vanilla-ts` | TypeScript 演示 | TypeScript，无框架 |

### 预装依赖

通过 `dependencies` prop 指定第三方库：

```tsx
<CodePlayground
  template="react"
  dependencies={{
    "framer-motion": "^10.0.0",
    "lucide-react": "latest",
  }}
  files={{
    "/App.js": `import { motion } from "framer-motion";

export default function App() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity }}
      style={{
        width: 100, height: 100,
        background: "linear-gradient(135deg, #9333ea, #2563eb)",
        borderRadius: 16
      }}
    />
  );
}`,
  }}
/>
```

### 编辑器配置

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `showLineNumbers` | `true` | 显示行号 |
| `showInlineErrors` | `true` | 行内显示错误 |
| `wrapContent` | `true` | 长行自动换行 |
| `editorHeight` | `350` | 编辑器高度（px） |

---

## 在 MDX 中的使用语法

### 基础用法

```mdx
<CodePlayground
  files={{
    "/App.js": `export default function App() {
  return <h1>Hello, World!</h1>;
}`,
  }}
/>
```

### 多文件示例

```mdx
<CodePlayground
  template="react"
  showFileExplorer
  files={{
    "/App.js": `import { Button } from "./Button";

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>组件演示</h1>
      <Button label="点击我" />
    </div>
  );
}`,
    "/Button.js": `export function Button({ label }) {
  return (
    <button
      style={{
        padding: "8px 16px",
        borderRadius: 8,
        background: "linear-gradient(135deg, #9333ea, #2563eb)",
        color: "white",
        border: "none",
        cursor: "pointer",
        fontSize: 14,
      }}
    >
      {label}
    </button>
  );
}`,
  }}
/>
```

### TypeScript 示例

```mdx
<CodePlayground
  template="react-ts"
  files={{
    "/App.tsx": `interface Props {
  name: string;
  age: number;
}

function UserCard({ name, age }: Props) {
  return (
    <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
      <h2>{name}</h2>
      <p>年龄: {age}</p>
    </div>
  );
}

export default function App() {
  return <UserCard name="Finn" age={25} />;
}`,
  }}
/>
```

### 纵向布局

```mdx
<CodePlayground
  layout="vertical"
  editorHeight={250}
  title="CSS Grid 演示"
  files={{
    "/App.js": `export default function App() {
  return (
    <div className="grid">
      <div className="item">1</div>
      <div className="item">2</div>
      <div className="item">3</div>
    </div>
  );
}`,
    "/styles.css": `.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.item {
  background: linear-gradient(135deg, #9333ea, #2563eb);
  color: white;
  padding: 20px;
  text-align: center;
  border-radius: 8px;
}`,
  }}
/>
```

---

## 性能考虑

### 懒加载

Sandpack 组件体积较大（约 200KB gzipped），必须进行懒加载和代码分割。

```tsx
// src/components/mdx/code-playground.tsx 的懒加载包装
import dynamic from "next/dynamic";

// 懒加载骨架屏
function PlaygroundSkeleton({ height = 350 }: { height?: number }) {
  return (
    <div
      className="my-6 animate-pulse rounded-lg border bg-muted/30"
      style={{ height: `${height}px` }}
    >
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        加载代码演练场...
      </div>
    </div>
  );
}

export const CodePlayground = dynamic(
  () => import("./code-playground-impl").then((mod) => mod.CodePlayground),
  {
    loading: () => <PlaygroundSkeleton />,
    ssr: false, // Sandpack 不支持 SSR
  }
);
```

### 代码分割策略

```
文章列表页 → 不加载 Sandpack（0 KB 额外负担）
文章详情页 → 仅在包含 <CodePlayground> 的文章中按需加载
```

### Intersection Observer 延迟加载

进一步优化：仅在用户滚动到 CodePlayground 可视区域时才加载 Sandpack：

```tsx
"use client";

import * as React from "react";

export function LazyCodePlayground(props: CodePlaygroundProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // 提前 200px 开始加载
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {isVisible ? (
        <CodePlayground {...props} />
      ) : (
        <PlaygroundSkeleton height={props.editorHeight} />
      )}
    </div>
  );
}
```

---

## 导出至 CodeSandbox

Sandpack 提供了内建的"Open in CodeSandbox"功能，但我们可以自定义导出逻辑：

### 使用 Sandpack 内建按钮

```tsx
<SandpackPreview
  showOpenInCodeSandbox={true}  // 启用内建按钮
  showRefreshButton={true}
/>
```

### 自定义导出逻辑

使用 [CodeSandbox Define API](https://codesandbox.io/docs/learn/sandboxes/cli-api#define-api) 可以程序化地创建 sandbox：

```tsx
import { getParameters } from "codesandbox/lib/api/define";

function exportToCodeSandbox(files: Record<string, string>) {
  const parameters = getParameters({
    files: Object.fromEntries(
      Object.entries(files).map(([path, code]) => [
        path.replace(/^\//, ""),
        { content: code },
      ])
    ),
  });

  window.open(
    `https://codesandbox.io/api/v1/sandboxes/define?parameters=${parameters}`,
    "_blank"
  );
}
```

---

## Prettier 格式化集成

在编辑器中集成 Prettier 格式化功能，让用户可以一键格式化代码：

```tsx
// 安装：npm install prettier @prettier/plugin-estree

import { format } from "prettier/standalone";
import * as prettierPluginEstree from "prettier/plugins/estree";
import * as prettierPluginBabel from "prettier/plugins/babel";
import * as prettierPluginTypescript from "prettier/plugins/typescript";

async function formatCode(code: string, language: string): Promise<string> {
  const plugins = [prettierPluginEstree];

  if (language === "typescript" || language === "tsx") {
    plugins.push(prettierPluginTypescript);
  } else {
    plugins.push(prettierPluginBabel);
  }

  return format(code, {
    parser: language === "typescript" || language === "tsx" ? "typescript" : "babel",
    plugins,
    semi: true,
    singleQuote: false,
    tabWidth: 2,
    trailingComma: "all",
  });
}
```

将格式化按钮添加到工具栏中：

```tsx
function PlaygroundToolbar() {
  const { sandpack } = useSandpack();

  const handleFormat = async () => {
    const activeFile = sandpack.activeFile;
    const code = sandpack.files[activeFile]?.code;
    if (!code) return;

    try {
      const formatted = await formatCode(code, "babel");
      sandpack.updateFile(activeFile, formatted);
    } catch (error) {
      console.error("格式化失败:", error);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-3 py-1.5">
      <button onClick={handleFormat} /* ... */>
        格式化
      </button>
      {/* 其他按钮 */}
    </div>
  );
}
```

---

## 实现优先级

| 阶段 | 功能 | 复杂度 |
| --- | --- | --- |
| P0 | 基础 CodePlayground（单文件编辑 + 预览） | 中 |
| P0 | 主题跟随暗色模式 | 低 |
| P1 | 多文件支持 + 文件浏览器 | 低（Sandpack 内建） |
| P1 | 懒加载 + 代码分割 | 中 |
| P2 | 导出至 CodeSandbox | 低 |
| P2 | Prettier 格式化 | 中 |
| P2 | 控制台面板 | 低（Sandpack 内建） |

---

## 注意事项

1. **SSR 兼容**：Sandpack 依赖浏览器 API（Web Worker），必须使用 `ssr: false` 的 dynamic import
2. **CSP 策略**：如果部署时配置了 Content Security Policy，需要允许 `blob:` 和 Sandpack CDN 域名
3. **移动端体验**：小屏幕下建议使用 `layout="vertical"`，编辑器和预览上下排列
4. **性能监控**：在包含多个 CodePlayground 的长文中，注意内存占用，考虑限制同时运行的实例数量
