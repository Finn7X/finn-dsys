"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import {
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SeriesPost {
    title: string
    slug: string
    order: number
}

interface SeriesNavProps {
    seriesTitle: string
    posts: SeriesPost[]
    currentIndex: number
    prevPost: SeriesPost | null
    nextPost: SeriesPost | null
}

export function SeriesNav({
    seriesTitle,
    posts,
    currentIndex,
    prevPost,
    nextPost,
}: SeriesNavProps) {
    const [isExpanded, setIsExpanded] = useState(true)
    const t = useTranslations("series")

    return (
        <div className="mb-10 rounded-xl border bg-card overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-accent/50 transition-colors"
                aria-expanded={isExpanded}
                aria-controls="series-post-list"
            >
                <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-purple-600 shrink-0" />
                    <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                            {t("label")}
                        </div>
                        <div className="font-semibold mt-0.5">{seriesTitle}</div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                        {currentIndex + 1} / {posts.length}
                    </span>
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>
            </button>

            {isExpanded && (
                <div id="series-post-list" className="border-t">
                    <ol className="divide-y" role="list">
                        {posts.map((post, index) => {
                            const isCurrent = index === currentIndex

                            return (
                                <li key={post.slug}>
                                    {isCurrent ? (
                                        <div
                                            className="flex items-center gap-3 px-5 py-3 bg-accent/50"
                                            aria-current="page"
                                        >
                                            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-medium shrink-0">
                                                {post.order}
                                            </span>
                                            <span className="font-medium text-sm">
                                                {post.title}
                                            </span>
                                            <span className="ml-auto text-xs text-purple-600 font-medium shrink-0">
                                                {t("current")}
                                            </span>
                                        </div>
                                    ) : (
                                        <Link
                                            href={`/blog/${post.slug}`}
                                            className="flex items-center gap-3 px-5 py-3 hover:bg-accent/30 transition-colors group"
                                        >
                                            <span className="flex items-center justify-center h-6 w-6 rounded-full border text-xs font-medium text-muted-foreground group-hover:border-purple-600 group-hover:text-purple-600 transition-colors shrink-0">
                                                {post.order}
                                            </span>
                                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                                {post.title}
                                            </span>
                                        </Link>
                                    )}
                                </li>
                            )
                        })}
                    </ol>

                    <div className="border-t px-5 py-3 flex items-center justify-between gap-4">
                        {prevPost ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-muted-foreground hover:text-foreground"
                                asChild
                            >
                                <Link href={`/blog/${prevPost.slug}`}>
                                    <ChevronLeft className="h-4 w-4" />
                                    <span className="hidden sm:inline truncate max-w-[150px]">
                                        {prevPost.title}
                                    </span>
                                    <span className="sm:hidden">{t("prev")}</span>
                                </Link>
                            </Button>
                        ) : (
                            <div />
                        )}

                        {nextPost ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-muted-foreground hover:text-foreground"
                                asChild
                            >
                                <Link href={`/blog/${nextPost.slug}`}>
                                    <span className="hidden sm:inline truncate max-w-[150px]">
                                        {nextPost.title}
                                    </span>
                                    <span className="sm:hidden">{t("next")}</span>
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        ) : (
                            <div />
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
