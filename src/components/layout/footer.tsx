import { Link } from "@/i18n/routing"
import { getTranslations } from "next-intl/server"

export async function Footer() {
    const t = await getTranslations("nav")

    return (
        <footer className="border-t border-border/40">
            <div className="mx-auto flex max-w-[var(--nav-width)] items-center justify-between px-4 py-6">
                <span className="font-heading italic text-sm text-muted-foreground">
                    Finn Days
                </span>
                <nav className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Link
                        href="/blog"
                        className="transition-colors hover:text-foreground"
                    >
                        {t("blog")}
                    </Link>
                    <span>&middot;</span>
                    <Link
                        href="/about"
                        className="transition-colors hover:text-foreground"
                    >
                        {t("about")}
                    </Link>
                    <span>&middot;</span>
                    <a
                        href="/feed.xml"
                        className="transition-colors hover:text-foreground"
                    >
                        RSS
                    </a>
                </nav>
            </div>
        </footer>
    )
}
