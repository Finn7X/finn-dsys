# 命令面板 (Cmd+K)

## 概述

命令面板是一种键盘驱动的全局导航工具，允许用户通过快捷键快速搜索页面、执行命令和切换设置。这一交互模式广泛应用于 Vercel、Linear、GitHub 等现代 Web 应用中，已成为开发者和高级用户的标配功能。

在 Finn Days 博客中，命令面板将作为全局入口，统一页面导航、文章搜索、主题切换和外部链接跳转等能力。

---

## 技术选型：cmdk

### 库简介

[cmdk](https://cmdk.paco.me/) 是由 Paco Coursey（Vercel 设计工程师）开发的 React 命令面板组件库。

### 选型理由

| 考量维度 | cmdk 表现 |
| --- | --- |
| 体积 | 极轻量（~3KB gzipped） |
| 无障碍 | 内建完整的 ARIA 属性与键盘导航 |
| 组合性 | Headless 设计，不包含样式，完全可定制 |
| 生态兼容 | 与 Radix UI / shadcn/ui 天然契合 |
| 维护状态 | Vercel 团队成员维护，活跃更新 |
| 搜索能力 | 内建模糊搜索，无需额外依赖 |

> shadcn/ui 的 Command 组件本身就是基于 cmdk 封装的，因此在我们的技术栈中使用 cmdk 是最自然的选择。

### 安装

```bash
npm install cmdk
```

如果使用 shadcn/ui 的 Command 组件（推荐），则可以直接通过 shadcn CLI 添加：

```bash
npx shadcn@latest add command dialog
```

这会自动安装 cmdk 依赖，并生成 `src/components/ui/command.tsx` 和 `src/components/ui/dialog.tsx`。

---

## 组件设计

### 文件位置

```
src/components/search/command-palette.tsx
```

### 组件结构

```
CommandPalette
├── Dialog (shadcn/ui)          // 对话框容器
│   └── Command (cmdk)          // 命令面板核心
│       ├── Command.Input       // 搜索输入框
│       ├── Command.List        // 命令列表容器
│       │   ├── Command.Empty   // 无结果提示
│       │   ├── Command.Group   // 页面导航分组
│       │   │   └── Command.Item × N
│       │   ├── Command.Group   // 文章搜索分组
│       │   │   └── Command.Item × N
│       │   ├── Command.Group   // 主题切换分组
│       │   │   └── Command.Item × N
│       │   └── Command.Group   // 外部链接分组
│       │       └── Command.Item × N
│       └── Command.Separator   // 分组分隔线
└── KeyboardShortcutListener    // 全局快捷键监听
```

### 核心代码示例

```tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  FileText,
  Home,
  Moon,
  Sun,
  Monitor,
  Github,
  Twitter,
  Search,
  Hash,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

interface CommandPaletteProps {
  posts?: Array<{
    slug: string;
    title: string;
    description?: string;
    tags?: string[];
  }>;
}

export function CommandPalette({ posts = [] }: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  // 全局快捷键注册
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback(
    (command: () => void) => {
      setOpen(false);
      command();
    },
    []
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="输入命令或搜索..." />
      <CommandList>
        <CommandEmpty>没有找到相关结果。</CommandEmpty>

        {/* 页面导航 */}
        <CommandGroup heading="页面导航">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/"))}
          >
            <Home className="mr-2 h-4 w-4" />
            <span>首页</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/blog"))}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            <span>博客</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/tags"))}
          >
            <Hash className="mr-2 h-4 w-4" />
            <span>标签</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/about"))}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>关于</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* 文章搜索 */}
        {posts.length > 0 && (
          <CommandGroup heading="文章搜索">
            {posts.map((post) => (
              <CommandItem
                key={post.slug}
                value={post.title}
                onSelect={() =>
                  runCommand(() => router.push(`/blog/${post.slug}`))
                }
              >
                <Search className="mr-2 h-4 w-4" />
                <span>{post.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* 主题切换 */}
        <CommandGroup heading="主题">
          <CommandItem
            onSelect={() => runCommand(() => setTheme("light"))}
          >
            <Sun className="mr-2 h-4 w-4" />
            <span>浅色模式</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => setTheme("dark"))}
          >
            <Moon className="mr-2 h-4 w-4" />
            <span>深色模式</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => setTheme("system"))}
          >
            <Monitor className="mr-2 h-4 w-4" />
            <span>跟随系统</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* 外部链接 */}
        <CommandGroup heading="外部链接">
          <CommandItem
            onSelect={() =>
              runCommand(() =>
                window.open("https://github.com/your-username", "_blank")
              )
            }
          >
            <Github className="mr-2 h-4 w-4" />
            <span>GitHub</span>
            <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() =>
                window.open("https://twitter.com/your-handle", "_blank")
              )
            }
          >
            <Twitter className="mr-2 h-4 w-4" />
            <span>Twitter</span>
            <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
```

---

## 快捷键设计

| 快捷键 | 平台 | 功能 |
| --- | --- | --- |
| `Cmd + K` | macOS | 打开/关闭命令面板 |
| `Ctrl + K` | Windows / Linux | 打开/关闭命令面板 |
| `↑` / `↓` | 通用 | 上下移动选中项 |
| `Enter` | 通用 | 执行选中命令 |
| `Esc` | 通用 | 关闭命令面板 |

> cmdk 库已内建上下键导航与 Enter 确认逻辑，无需手动实现。

---

## 与 Pagefind 搜索的关系

命令面板与 Pagefind 全文搜索可以有两种集成策略：

### 方案 A：独立并存（推荐初期方案）

- 命令面板：负责快速导航、主题切换、命令执行
- Pagefind：负责全文搜索，有独立的搜索页面 `/search`
- 命令面板中的"文章搜索"使用标题匹配（基于 Velite 的文章元数据）
- 在命令面板中提供"前往全文搜索"入口，跳转至 Pagefind 搜索页面

### 方案 B：深度集成

- 在命令面板中嵌入 Pagefind 搜索结果
- 用户输入关键词后，实时显示 Pagefind 的搜索结果
- 复杂度较高，需处理异步加载与 UI 状态

```tsx
// 方案 A 的跳转示例
<CommandItem
  onSelect={() =>
    runCommand(() => router.push("/search"))
  }
>
  <Search className="mr-2 h-4 w-4" />
  <span>全文搜索...</span>
  <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
    <span className="text-xs">/</span>
  </kbd>
</CommandItem>
```

---

## 全局注册

命令面板需要在根布局中全局注册，确保在所有页面都可使用。

### 在 RootLayout 中注册

```tsx
// src/app/layout.tsx
import { CommandPalette } from "@/components/search/command-palette";
import { posts as allPosts } from "#site/content";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 从 Velite 获取所有文章数据（用于搜索）
  const posts = allPosts.map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    tags: post.tags,
  }));

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          {children}
          <CommandPalette posts={posts} />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 导航栏触发按钮

除了键盘快捷键外，应在导航栏中添加一个可视化的触发按钮：

```tsx
// src/components/layout/search-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function SearchButton() {
  return (
    <Button
      variant="outline"
      className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
      onClick={() => {
        document.dispatchEvent(
          new KeyboardEvent("keydown", { key: "k", metaKey: true })
        );
      }}
    >
      <Search className="h-4 w-4 xl:mr-2" />
      <span className="hidden xl:inline-flex">搜索文章...</span>
      <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
}
```

---

## 样式设计

命令面板的视觉风格参考 Vercel 和 Linear 的命令面板，遵循以下原则：

### 设计要点

1. **背景遮罩**：使用半透明黑色遮罩（`bg-black/50`），加上 `backdrop-blur-sm` 实现毛玻璃效果
2. **面板容器**：居中弹出，最大宽度 `max-w-lg`（512px），圆角 `rounded-lg`
3. **搜索输入框**：顶部固定，带搜索图标前缀，无边框，大字号
4. **命令列表**：可滚动区域，最大高度约 300px
5. **分组标题**：小字号、muted 颜色、大写字母间距
6. **命令项**：hover 时使用 `accent` 背景色，选中状态与 hover 一致
7. **快捷键标签**：右侧显示 `<kbd>` 风格的快捷键提示

### 自定义样式覆盖

```css
/* 命令面板的品牌渐变色应用 */
[cmdk-group-heading] {
  @apply text-xs font-medium text-muted-foreground px-2 py-1.5;
}

[cmdk-item] {
  @apply relative flex cursor-pointer select-none items-center
         rounded-sm px-2 py-1.5 text-sm outline-none
         data-[selected=true]:bg-accent
         data-[selected=true]:text-accent-foreground;
}

[cmdk-input] {
  @apply flex h-11 w-full rounded-md bg-transparent py-3
         text-sm outline-none
         placeholder:text-muted-foreground
         disabled:cursor-not-allowed disabled:opacity-50;
}
```

---

## 动画效果

### Dialog 进入/退出动画

```tsx
// shadcn/ui Dialog 已内建动画，可通过 Tailwind 类自定义
// 进入：fade-in + zoom-in + slide-in-from-bottom
// 退出：fade-out + zoom-out

// 命令面板特定动画配置
<DialogContent className="overflow-hidden p-0 shadow-lg">
  <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
    {/* 命令面板内容 */}
  </Command>
</DialogContent>
```

### 列表项动画

- 选中项切换：使用 `transition-colors duration-150` 实现平滑的背景色过渡
- 列表筛选：cmdk 内建的过滤动画（项目淡出/淡入）

---

## 测试要点

### 功能测试

- [ ] `Cmd+K` / `Ctrl+K` 正确打开和关闭命令面板
- [ ] 搜索框聚焦状态：打开时自动聚焦输入框
- [ ] 模糊搜索：输入部分关键词能匹配到结果
- [ ] 键盘导航：上下键移动选中，Enter 执行，Esc 关闭
- [ ] 页面导航：选择导航项后正确跳转
- [ ] 主题切换：选择主题选项后正确切换
- [ ] 外部链接：新窗口打开外部链接
- [ ] 空结果：无匹配时显示"没有找到相关结果"

### 无障碍测试

- [ ] ARIA role 正确设置（combobox / listbox / option）
- [ ] 屏幕阅读器能正确朗读命令项
- [ ] 焦点管理：打开时焦点进入面板，关闭时焦点返回触发元素
- [ ] 键盘完全可操作，无需鼠标

### 性能测试

- [ ] 大量文章数据（100+篇）下搜索响应流畅
- [ ] 命令面板组件懒加载，不影响首屏性能
- [ ] Dialog 动画帧率 60fps

### 响应式测试

- [ ] 移动端（< 640px）：全屏模式，底部弹出
- [ ] 平板端（768px - 1024px）：居中弹窗，适当宽度
- [ ] 桌面端（> 1024px）：居中弹窗，max-w-lg

---

## 实现优先级

| 阶段 | 功能 | 复杂度 |
| --- | --- | --- |
| P0 | 基础命令面板 + 页面导航 | 低 |
| P0 | 快捷键触发 | 低 |
| P1 | 文章标题搜索 | 中 |
| P1 | 主题切换 | 低 |
| P2 | Pagefind 深度集成 | 高 |
| P2 | 最近访问记录 | 中 |
