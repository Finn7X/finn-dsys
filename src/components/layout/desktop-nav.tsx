"use client"

import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/routing"
import { navLinks } from "@/config/site"
import { cn } from "@/lib/utils"

export function DesktopNav() {
    const pathname = usePathname()
    const t = useTranslations("nav")

    return (
        <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((item) => {
                const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`)
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                            isActive
                                ? "bg-accent text-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        )}
                    >
                        {t(item.title.toLowerCase() as "blog" | "notes" | "projects" | "tags" | "about")}
                    </Link>
                )
            })}
        </nav>
    )
}
