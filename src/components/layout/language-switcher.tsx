"use client"

import { useLocale } from "next-intl"
import { usePathname, useRouter } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Languages } from "lucide-react"

const localeLabels: Record<string, string> = {
    zh: "中文",
    en: "EN",
}

export function LanguageSwitcher() {
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()

    const targetLocale = locale === "zh" ? "en" : "zh"

    const handleSwitch = () => {
        router.replace(pathname, { locale: targetLocale })
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleSwitch}
            className="gap-1.5"
            aria-label={`Switch to ${localeLabels[targetLocale]}`}
        >
            <Languages className="h-4 w-4" />
            <span className="text-xs">{localeLabels[targetLocale]}</span>
        </Button>
    )
}
