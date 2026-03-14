"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
    ChevronRight,
    File as FileIcon,
    Folder as FolderIcon,
    FolderOpen,
} from "lucide-react"

interface FileTreeProps {
    children: React.ReactNode
    className?: string
}

interface FolderProps {
    name: string
    defaultOpen?: boolean
    children?: React.ReactNode
}

interface FileProps {
    name: string
    active?: boolean
}

export function FileTree({ children, className }: FileTreeProps) {
    return (
        <div
            className={cn(
                "my-6 rounded-lg border bg-muted/30 p-4 font-mono text-sm",
                className,
            )}
            role="tree"
        >
            <ul className="space-y-1">{children}</ul>
        </div>
    )
}

export function Folder({
    name,
    defaultOpen = false,
    children,
}: FolderProps) {
    const [isOpen, setIsOpen] = React.useState(defaultOpen)

    return (
        <li role="treeitem" aria-expanded={isOpen} aria-selected={false}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center gap-1.5 rounded px-1 py-0.5 text-left transition-colors hover:bg-muted"
            >
                <ChevronRight
                    className={cn(
                        "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-90",
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
    )
}

export function File({ name, active = false }: FileProps) {
    return (
        <li
            role="treeitem"
            aria-selected={false}
            className="flex items-center gap-1.5 px-1 py-0.5"
        >
            <span className="w-3.5" />
            <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span
                className={cn(
                    "text-foreground",
                    active && "font-semibold text-primary",
                )}
            >
                {name}
            </span>
        </li>
    )
}
