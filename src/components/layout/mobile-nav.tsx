"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/routing"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { navLinks, siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

export function MobileNav() {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()
    const t = useTranslations("nav")

    return (
        <div className="md:hidden">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(!open)}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
            >
                {open ? (
                    <X className="h-5 w-5" />
                ) : (
                    <Menu className="h-5 w-5" />
                )}
            </Button>

            {open && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 top-14 z-40 bg-black/20 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                    />

                    {/* Menu Panel */}
                    <div className="fixed inset-x-0 top-14 z-50 animate-in slide-in-from-top-2 border-b bg-background p-4 shadow-lg">
                        <nav className="flex flex-col gap-1">
                            {navLinks.map((item) => {
                                const isActive =
                                    pathname === item.href ||
                                    pathname.startsWith(`${item.href}/`)
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className={cn(
                                            "rounded-md px-3 py-2 text-sm font-medium transition-colors",
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
                        <p className="mt-4 text-xs text-muted-foreground">
                            {siteConfig.description}
                        </p>
                    </div>
                </>
            )}
        </div>
    )
}
