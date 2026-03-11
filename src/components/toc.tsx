"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface TocItem {
    title: string
    url: string
    items?: TocItem[]
}

interface TocProps {
    items: TocItem[]
}

export function Toc({ items }: TocProps) {
    const t = useTranslations("blog")
    const [activeId, setActiveId] = useState<string>("")

    useEffect(() => {
        const headingIds = flattenToc(items).map(
            (item) => item.url.slice(1), // remove #
        )

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id)
                    }
                }
            },
            { rootMargin: "-80px 0px -80% 0px" },
        )

        for (const id of headingIds) {
            const el = document.getElementById(id)
            if (el) observer.observe(el)
        }

        return () => observer.disconnect()
    }, [items])

    if (!items.length) return null

    return (
        <nav className="hidden xl:block">
            <div className="sticky top-20">
                <h4 className="mb-3 text-sm font-semibold">{t("toc")}</h4>
                <TocList items={items} activeId={activeId} depth={0} />
            </div>
        </nav>
    )
}

function TocList({
    items,
    activeId,
    depth,
}: {
    items: TocItem[]
    activeId: string
    depth: number
}) {
    return (
        <ul className="space-y-1 text-sm">
            {items.map((item) => (
                <li key={item.url}>
                    <a
                        href={item.url}
                        className={cn(
                            "block truncate py-1 text-muted-foreground transition-colors hover:text-foreground",
                            depth > 0 && "pl-4",
                            activeId === item.url.slice(1) &&
                                "font-medium text-foreground",
                        )}
                    >
                        {item.title}
                    </a>
                    {item.items && item.items.length > 0 && (
                        <TocList
                            items={item.items}
                            activeId={activeId}
                            depth={depth + 1}
                        />
                    )}
                </li>
            ))}
        </ul>
    )
}

function flattenToc(items: TocItem[]): TocItem[] {
    return items.flatMap((item) => [
        item,
        ...(item.items ? flattenToc(item.items) : []),
    ])
}
