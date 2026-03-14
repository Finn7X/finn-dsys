"use client"

import * as React from "react"
import {
    SandpackProvider,
    SandpackLayout,
    SandpackCodeEditor,
    SandpackPreview,
    SandpackFileExplorer,
    SandpackConsole,
    useSandpack,
    UnstyledOpenInCodeSandboxButton,
} from "@codesandbox/sandpack-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { ExternalLink, RotateCcw } from "lucide-react"

const lightTheme = {
    colors: {
        surface1: "hsl(0 0% 100%)",
        surface2: "hsl(0 0% 96.1%)",
        surface3: "hsl(0 0% 89.8%)",
        clickable: "hsl(0 0% 45.1%)",
        base: "hsl(0 0% 3.9%)",
        disabled: "hsl(0 0% 63.9%)",
        hover: "hsl(0 0% 9%)",
        accent: "hsl(262 83% 58%)",
        error: "hsl(0 84.2% 60.2%)",
        errorSurface: "hsl(0 100% 97%)",
    },
    font: {
        body: "var(--font-geist-sans)",
        mono: "var(--font-geist-mono)",
        size: "14px",
        lineHeight: "1.6",
    },
}

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
}

type SandpackTemplate = "react" | "react-ts" | "vanilla" | "vanilla-ts"
type LayoutDirection = "horizontal" | "vertical"

export interface CodePlaygroundProps {
    template?: SandpackTemplate
    files?: Record<string, string>
    dependencies?: Record<string, string>
    layout?: LayoutDirection
    showFileExplorer?: boolean
    showConsole?: boolean
    editorHeight?: number
    showLineNumbers?: boolean
    className?: string
    title?: string
}

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
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"
    const theme = isDark ? darkTheme : lightTheme

    const customSetup = dependencies ? { dependencies } : undefined

    return (
        <div
            className={cn(
                "my-6 overflow-hidden rounded-lg border",
                className,
            )}
        >
            {title && (
                <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
                    <span className="text-sm font-medium text-foreground">
                        {title}
                    </span>
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
                        layout === "vertical" && "flex-col",
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

                <PlaygroundToolbar />
            </SandpackProvider>
        </div>
    )
}

function PlaygroundToolbar() {
    const { sandpack } = useSandpack()

    const handleReset = () => {
        sandpack.resetAllFiles()
    }

    return (
        <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-3 py-1.5">
            <button
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Reset code"
            >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
            </button>
            <UnstyledOpenInCodeSandboxButton
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Open in CodeSandbox"
            >
                <ExternalLink className="h-3 w-3" />
                <span>CodeSandbox</span>
            </UnstyledOpenInCodeSandboxButton>
        </div>
    )
}
