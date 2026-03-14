"use client"

import { useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/routing"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { navLinks } from "@/config/site"
import { cn } from "@/lib/utils"

export function MobileNav() {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()
    const t = useTranslations("nav")

    const handleOpen = useCallback(() => {
        setOpen(true)
        document.body.style.overflow = "hidden"
    }, [])

    const handleClose = useCallback(() => {
        setOpen(false)
        document.body.style.overflow = ""
    }, [])

    return (
        <div className="md:hidden">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={open ? handleClose : handleOpen}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
            >
                <Menu className="h-5 w-5" />
            </Button>

            {/* Overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/20 transition-opacity duration-200",
                    open
                        ? "opacity-100"
                        : "pointer-events-none opacity-0",
                )}
                onClick={handleClose}
            />

            {/* Side panel */}
            <div
                className={cn(
                    "fixed right-0 top-0 z-50 flex h-full w-72 flex-col bg-popover shadow-lg transition-transform duration-200 ease-out",
                    open ? "translate-x-0" : "translate-x-full",
                )}
            >
                {/* Close button */}
                <div className="flex items-center justify-end px-4 py-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleClose}
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Nav items */}
                <nav className="flex flex-col">
                    {navLinks.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            pathname.startsWith(`${item.href}/`)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={handleClose}
                                className={cn(
                                    "px-4 py-3 text-base transition-colors duration-150",
                                    isActive
                                        ? "text-foreground bg-secondary/50"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                                )}
                            >
                                {t(item.key)}
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </div>
    )
}
