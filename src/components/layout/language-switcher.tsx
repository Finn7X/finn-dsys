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
            size="icon"
            className="h-8 w-8"
            onClick={handleSwitch}
            aria-label={`Switch to ${localeLabels[targetLocale]}`}
        >
            <Languages className="h-4 w-4" />
        </Button>
    )
}
