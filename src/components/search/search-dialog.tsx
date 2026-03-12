"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search as SearchIcon } from "lucide-react"
import {
    searchContent,
    type SearchableItem,
    type SearchResult,
} from "@/lib/pagefind"
import { trackSearch } from "@/lib/analytics"

interface SearchDialogProps {
    posts: SearchableItem[]
}

export function SearchDialog({ posts }: SearchDialogProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [activeIndex, setActiveIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const t = useTranslations("search")

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault()
                setOpen((prev) => !prev)
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            const trimmed = query.trim()
            const searchResults = trimmed
                ? searchContent(query, posts)
                : []
            setResults(searchResults)
            setActiveIndex(0)
            if (trimmed) {
                trackSearch(trimmed, searchResults.length)
            }
        }, 200)

        return () => clearTimeout(timer)
    }, [query, posts])

    const navigateToResult = useCallback(
        (url: string) => {
            setOpen(false)
            setQuery("")
            setResults([])
            router.push(url)
        },
        [router],
    )

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault()
                    setActiveIndex((prev) =>
                        prev < results.length - 1 ? prev + 1 : 0,
                    )
                    break
                case "ArrowUp":
                    e.preventDefault()
                    setActiveIndex((prev) =>
                        prev > 0 ? prev - 1 : results.length - 1,
                    )
                    break
                case "Enter":
                    e.preventDefault()
                    if (results[activeIndex]) {
                        navigateToResult(results[activeIndex].url)
                    }
                    break
                case "Escape":
                    setOpen(false)
                    break
            }
        },
        [results, activeIndex, navigateToResult],
    )

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label={t("title")}
            >
                <SearchIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{t("button")}</span>
                <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[550px] p-0 gap-0">
                    <DialogHeader className="sr-only">
                        <DialogTitle>{t("title")}</DialogTitle>
                        <DialogDescription>
                            {t("description")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-center border-b px-4">
                        <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <Input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t("placeholder")}
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12"
                            autoFocus
                        />
                    </div>

                    <div className="max-h-[400px] overflow-y-auto p-2">
                        {query && results.length === 0 && (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                {t("noResults")}
                            </div>
                        )}

                        {results.length > 0 && (
                            <ul role="listbox">
                                {results.map((result, index) => (
                                    <li
                                        key={result.url}
                                        role="option"
                                        aria-selected={index === activeIndex}
                                        className={`cursor-pointer rounded-md px-3 py-3 text-sm transition-colors ${
                                            index === activeIndex
                                                ? "bg-accent text-accent-foreground"
                                                : "hover:bg-accent/50"
                                        }`}
                                        onClick={() =>
                                            navigateToResult(result.url)
                                        }
                                        onMouseEnter={() =>
                                            setActiveIndex(index)
                                        }
                                    >
                                        <div className="font-medium mb-1">
                                            {result.title}
                                        </div>
                                        <div
                                            className="text-xs text-muted-foreground line-clamp-2"
                                            dangerouslySetInnerHTML={{
                                                __html: result.excerpt,
                                            }}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}

                        {!query && (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                {t("startSearching")}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t px-4 py-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <kbd className="rounded border bg-muted px-1">
                                ↑
                            </kbd>
                            <kbd className="rounded border bg-muted px-1">
                                ↓
                            </kbd>
                            {t("navigate")}
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="rounded border bg-muted px-1">
                                ↵
                            </kbd>
                            {t("open")}
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="rounded border bg-muted px-1">
                                esc
                            </kbd>
                            {t("close")}
                        </span>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
