"use client"

import { useEffect, useState, useCallback } from "react"
import { useTranslations } from "next-intl"

export function ReadingProgress() {
    const [progress, setProgress] = useState(0)
    const t = useTranslations("reading")

    const updateProgress = useCallback(() => {
        const scrollTop = window.scrollY
        const documentHeight = document.documentElement.scrollHeight
        const viewportHeight = window.innerHeight
        const scrollableHeight = documentHeight - viewportHeight

        if (scrollableHeight <= 0) {
            setProgress(0)
            return
        }

        const currentProgress = Math.min(
            Math.max((scrollTop / scrollableHeight) * 100, 0),
            100
        )

        setProgress(currentProgress)
    }, [])

    useEffect(() => {
        let rafId: number

        const handleScroll = () => {
            if (rafId) {
                cancelAnimationFrame(rafId)
            }
            rafId = requestAnimationFrame(updateProgress)
        }

        rafId = requestAnimationFrame(updateProgress)

        window.addEventListener("scroll", handleScroll, { passive: true })
        window.addEventListener("resize", handleScroll, { passive: true })

        return () => {
            window.removeEventListener("scroll", handleScroll)
            window.removeEventListener("resize", handleScroll)
            if (rafId) {
                cancelAnimationFrame(rafId)
            }
        }
    }, [updateProgress])

    return (
        <div
            className="fixed top-0 left-0 w-full h-[3px] z-[60] bg-transparent"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t("progress")}
        >
            <div
                className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-[width] duration-150 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    )
}
