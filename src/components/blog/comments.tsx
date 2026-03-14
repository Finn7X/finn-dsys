"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import Giscus from "@giscus/react"
import { useTheme } from "next-themes"
import { useLocale, useTranslations } from "next-intl"
import { giscusConfig } from "@/config/site"

const emptySubscribe = () => () => {}

function useMounted() {
    return useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false,
    )
}

const isGiscusConfigured =
    giscusConfig.repoId !== "REPLACE_WITH_REPO_ID" &&
    giscusConfig.categoryId !== "REPLACE_WITH_CATEGORY_ID"

interface CommentsProps {
    slug: string
}

export function Comments({ slug }: CommentsProps) {
    const { resolvedTheme } = useTheme()
    const mounted = useMounted()
    const [isVisible, setIsVisible] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const t = useTranslations("comments")
    const locale = useLocale()

    useEffect(() => {
        if (!containerRef.current) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            { rootMargin: "200px" }
        )

        observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [])

    if (!isGiscusConfigured) {
        return (
            <section className="mt-12 pt-8 border-t" id="comments">
                <h2 className="text-2xl font-bold mb-6">{t("title")}</h2>
                <p className="text-sm text-muted-foreground">
                    {t("comingSoon")}
                </p>
            </section>
        )
    }

    const giscusTheme = resolvedTheme === "dark" ? "dark" : "light"
    const giscusLang = locale === "zh" ? "zh-CN" : "en"

    return (
        <section className="mt-12 pt-8 border-t" id="comments" ref={containerRef}>
            <h2 className="text-2xl font-bold mb-6">{t("title")}</h2>
            {mounted && isVisible ? (
                <Giscus
                    repo={giscusConfig.repo}
                    repoId={giscusConfig.repoId}
                    category={giscusConfig.category}
                    categoryId={giscusConfig.categoryId}
                    mapping={giscusConfig.mapping}
                    term={`blog/${slug}`}
                    reactionsEnabled={giscusConfig.reactionsEnabled}
                    emitMetadata={giscusConfig.emitMetadata}
                    inputPosition={giscusConfig.inputPosition}
                    theme={giscusTheme}
                    lang={giscusLang}
                    loading={giscusConfig.loading}
                />
            ) : (
                <div className="h-48 animate-pulse rounded-lg bg-muted" />
            )}
        </section>
    )
}
