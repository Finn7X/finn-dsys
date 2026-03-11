"use client"

import { useState, useSyncExternalStore } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Twitter, Linkedin, Link2, Check, Share2 } from "lucide-react"
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

    const handleNativeShare = async () => {
        await nativeShare(shareData)
    }

    const openShareWindow = (shareUrl: string) => {
        window.open(shareUrl, "_blank", "width=600,height=400,noopener,noreferrer")
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-1">{t("label")}</span>

            <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]"
                onClick={() => openShareWindow(getTwitterShareUrl(shareData))}
                aria-label={t("twitter")}
            >
                <Twitter className="h-4 w-4" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]"
                onClick={() => openShareWindow(getLinkedInShareUrl(shareData))}
                aria-label={t("linkedin")}
            >
                <Linkedin className="h-4 w-4" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 rounded-full transition-colors ${
                    copied
                        ? "text-green-600 hover:bg-green-600/10"
                        : "hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={handleCopyLink}
                aria-label={copied ? t("linkCopied") : t("copyLink")}
            >
                {copied ? (
                    <Check className="h-4 w-4" />
                ) : (
                    <Link2 className="h-4 w-4" />
                )}
            </Button>

            {showNativeShare && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full hover:bg-accent hover:text-accent-foreground"
                    onClick={handleNativeShare}
                    aria-label={t("moreOptions")}
                >
                    <Share2 className="h-4 w-4" />
                </Button>
            )}
        </div>
    )
}
