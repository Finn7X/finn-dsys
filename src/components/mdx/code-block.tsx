"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, Copy, File } from "lucide-react"

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
    "data-filename"?: string
    "data-language"?: string
    raw?: string
}

export function CodeBlock({
    children,
    className,
    raw,
    ...props
}: CodeBlockProps) {
    const [copied, setCopied] = React.useState(false)
    const filename = props["data-filename"]
    const language = props["data-language"]

    const handleCopy = async () => {
        if (raw) {
            await navigator.clipboard.writeText(raw)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className="group relative my-6 overflow-hidden rounded-lg border bg-muted/30">
            {/* Top bar: filename + language label + copy button */}
            <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {filename && (
                        <>
                            <File className="h-3.5 w-3.5" />
                            <span className="font-mono text-xs">
                                {filename}
                            </span>
                        </>
                    )}
                    {!filename && language && (
                        <span className="font-mono text-xs uppercase">
                            {language}
                        </span>
                    )}
                </div>
                <button
                    onClick={handleCopy}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={copied ? "Copied" : "Copy code"}
                >
                    {copied ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                        <Copy className="h-3.5 w-3.5" />
                    )}
                </button>
            </div>

            {/* Code area */}
            <pre
                className={cn(
                    "overflow-x-auto p-4 text-sm leading-relaxed",
                    "[&_[data-highlighted-line]]:bg-primary/10 [&_[data-highlighted-line]]:border-l-2 [&_[data-highlighted-line]]:border-primary [&_[data-highlighted-line]]:pl-[calc(1rem-2px)]",
                    className,
                )}
                {...props}
            >
                {children}
            </pre>
        </div>
    )
}
