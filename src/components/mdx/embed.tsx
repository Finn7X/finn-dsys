"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Play } from "lucide-react"

// ========== YouTube ==========

interface YouTubeProps {
    id: string
    title?: string
    className?: string
}

export function YouTube({
    id,
    title = "YouTube video",
    className,
}: YouTubeProps) {
    const [isLoaded, setIsLoaded] = React.useState(false)
    const thumbnailUrl = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`

    if (!isLoaded) {
        return (
            <div className={cn("my-6", className)}>
                <button
                    onClick={() => setIsLoaded(true)}
                    className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted"
                    aria-label={`Play video: ${title}`}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={thumbnailUrl}
                        alt={title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                            <Play
                                className="h-7 w-7 translate-x-0.5"
                                fill="white"
                            />
                        </div>
                    </div>
                </button>
            </div>
        )
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
    )
}

// ========== Tweet ==========

interface TweetProps {
    id: string
    className?: string
}

export function Tweet({ id, className }: TweetProps) {
    const containerRef = React.useRef<HTMLDivElement>(null)
    const [isLoaded, setIsLoaded] = React.useState(false)

    React.useEffect(() => {
        const scriptSrc = "https://platform.twitter.com/widgets.js"

        if (
            !document.querySelector(`script[src="${scriptSrc}"]`)
        ) {
            const script = document.createElement("script")
            script.src = scriptSrc
            script.async = true
            script.onload = () => setIsLoaded(true)
            document.body.appendChild(script)
        } else {
            if (window.twttr?.widgets) {
                window.twttr.widgets.load(containerRef.current)
                setIsLoaded(true)
            }
        }
    }, [])

    React.useEffect(() => {
        if (isLoaded && window.twttr?.widgets) {
            window.twttr.widgets.load(containerRef.current)
        }
    }, [isLoaded])

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
                <a
                    href={`https://twitter.com/x/status/${id}`}
                >
                    Loading tweet...
                </a>
            </blockquote>
        </div>
    )
}

declare global {
    interface Window {
        twttr?: {
            widgets: {
                load: (element?: HTMLElement | null) => void
            }
        }
    }
}
