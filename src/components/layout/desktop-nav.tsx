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
                            "relative rounded-md px-3 py-1.5 text-sm transition-colors duration-150",
                            isActive
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                        )}
                    >
                        {t(item.key)}
                        {isActive && (
                            <span className="absolute inset-x-1 -bottom-[7px] h-0.5 rounded-full bg-accent" />
                        )}
                    </Link>
                )
            })}
        </nav>
    )
}
