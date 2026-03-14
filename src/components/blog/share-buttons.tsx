"use client"

import { useState, useSyncExternalStore } from "react"
import { useTranslations } from "next-intl"
import {
    getTwitterShareUrl,
    getLinkedInShareUrl,
    copyToClipboard,
    canNativeShare,
    nativeShare,
    type ShareData,
} from "@/lib/sharing"

const emptySubscribe = () => () => {}

function useNativeShareSupport() {
    return useSyncExternalStore(
        emptySubscribe,
        () => canNativeShare(),
        () => false,
    )
}

interface ShareButtonsProps {
    title: string
    url: string
    description?: string
}

export function ShareButtons({ title, url, description }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false)
    const showNativeShare = useNativeShareSupport()
    const t = useTranslations("share")

    const shareData: ShareData = { title, url, description }

    const handleCopyLink = async () => {
        const success = await copyToClipboard(url)
        if (success) {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const openShareWindow = (shareUrl: string) => {
        window.open(shareUrl, "_blank", "width=600,height=400,noopener,noreferrer")
    }

    const handleNativeShare = async () => {
        await nativeShare(shareData)
    }

    const linkClass = "text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"

    return (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span className="mr-1">{t("label")}</span>
            <button
                onClick={() => openShareWindow(getTwitterShareUrl(shareData))}
                className={linkClass}
            >
                X
            </button>
            <span>&middot;</span>
            <button
                onClick={() => openShareWindow(getLinkedInShareUrl(shareData))}
                className={linkClass}
            >
                LinkedIn
            </button>
            <span>&middot;</span>
            <button
                onClick={handleCopyLink}
                className={`${linkClass} ${copied ? "text-green-600" : ""}`}
            >
                {copied ? t("linkCopied") : t("copyLink")}
            </button>
            {showNativeShare && (
                <>
                    <span>&middot;</span>
                    <button
                        onClick={handleNativeShare}
                        className={linkClass}
                    >
                        {t("moreOptions")}
                    </button>
                </>
            )}
        </div>
    )
}
