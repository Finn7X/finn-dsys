"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import type { CodePlaygroundProps } from "./code-playground-impl"

function PlaygroundSkeleton({ height = 350 }: { height?: number }) {
    return (
        <div
            className="my-6 animate-pulse rounded-lg border bg-muted/30"
            style={{ height: `${height}px` }}
        >
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Loading playground...
            </div>
        </div>
    )
}

const LazyCodePlayground = dynamic(
    () =>
        import("./code-playground-impl").then((mod) => mod.CodePlayground),
    {
        loading: () => <PlaygroundSkeleton />,
        ssr: false,
    },
)

export function CodePlayground(props: CodePlaygroundProps) {
    const ref = React.useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = React.useState(false)

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            { rootMargin: "200px" },
        )

        if (ref.current) observer.observe(ref.current)

        return () => observer.disconnect()
    }, [])

    return (
        <div ref={ref}>
            {isVisible ? (
                <LazyCodePlayground {...props} />
            ) : (
                <PlaygroundSkeleton height={props.editorHeight} />
            )}
        </div>
    )
}
