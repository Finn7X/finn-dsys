import Image from "next/image"
import { Link } from "@/i18n/routing"
import { siteConfig } from "@/config/site"
import { DesktopNav } from "./desktop-nav"
import { MobileNav } from "./mobile-nav"
import { ThemeToggle } from "./theme-toggle"
import { LanguageSwitcher } from "./language-switcher"

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/favicon.svg"
                        alt="Logo"
                        width={28}
                        height={28}
                        className="rounded-sm"
                    />
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-lg font-bold text-transparent">
                        {siteConfig.name}
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <DesktopNav />

                {/* Right Actions */}
                <div className="flex items-center gap-1">
                    <LanguageSwitcher />
                    <ThemeToggle />
                    <MobileNav />
                </div>
            </div>
        </header>
    )
}
