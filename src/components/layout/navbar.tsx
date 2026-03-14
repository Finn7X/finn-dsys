import { Link } from "@/i18n/routing"
import { getLocale } from "next-intl/server"
import { siteConfig } from "@/config/site"
import { DesktopNav } from "./desktop-nav"
import { MobileNav } from "./mobile-nav"
import { ThemeToggle } from "./theme-toggle"
import { LanguageSwitcher } from "./language-switcher"
import { CommandPalette } from "@/components/search/command-palette"
import { getSearchableContent } from "@/lib/search"

export async function Navbar() {
    const locale = await getLocale()
    const searchPosts = getSearchableContent(locale)

    return (
        <header
            className="sticky top-0 z-50 border-b border-border/40 bg-background"
            style={{ viewTransitionName: "header" }}
        >
            <div className="mx-auto flex h-12 max-w-[var(--nav-width)] items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <svg viewBox="0 0 32 32" className="h-6 w-6 shrink-0" aria-hidden="true">
                        <rect className="fill-foreground" width="32" height="32" rx="7"/>
                        <g transform="translate(16, 16) rotate(2) translate(-16, -16)">
                            <rect className="fill-background" x="14" y="10" width="3.2" height="16" rx="1"/>
                            <path className="fill-background" d="M17.2 10 C17.2 7.5 18.5 6.5 20.5 6.5 C21 6.5 21.5 6.6 21.8 6.8 L21 9 C20.7 8.8 20.3 8.7 20 8.7 C19 8.7 18.2 9.2 17.8 10 Z"/>
                            <rect className="fill-background" x="10" y="15.5" width="12" height="2.8" rx="1"/>
                        </g>
                    </svg>
                    <span className="font-heading italic text-xl tracking-tight text-foreground">
                        {siteConfig.name}
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <DesktopNav />

                {/* Right Actions */}
                <div className="flex items-center gap-1">
                    <CommandPalette posts={searchPosts} />
                    <LanguageSwitcher />
                    <ThemeToggle />
                    <MobileNav />
                </div>
            </div>
        </header>
    )
}
