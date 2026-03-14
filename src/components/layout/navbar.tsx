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
                <Link href="/" className="flex items-center">
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
