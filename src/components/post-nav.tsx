import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PostNavProps {
    prev: { title: string; slugAsParams: string } | null
    next: { title: string; slugAsParams: string } | null
}

export function PostNav({ prev, next }: PostNavProps) {
    const t = useTranslations("blog")

    if (!prev && !next) return null

    return (
        <nav className="mt-12 grid gap-4 border-t pt-8 sm:grid-cols-2">
            {prev ? (
                <Link
                    href={`/blog/${prev.slugAsParams}`}
                    className="group flex items-start gap-2 rounded-lg border p-4 transition-colors hover:bg-accent"
                >
                    <ChevronLeft className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                        <p className="text-xs text-muted-foreground">{t("prev")}</p>
                        <p className="line-clamp-2 text-sm font-medium group-hover:text-primary">
                            {prev.title}
                        </p>
                    </div>
                </Link>
            ) : (
                <div />
            )}
            {next ? (
                <Link
                    href={`/blog/${next.slugAsParams}`}
                    className="group flex items-start justify-end gap-2 rounded-lg border p-4 text-right transition-colors hover:bg-accent"
                >
                    <div>
                        <p className="text-xs text-muted-foreground">{t("next")}</p>
                        <p className="line-clamp-2 text-sm font-medium group-hover:text-primary">
                            {next.title}
                        </p>
                    </div>
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
            ) : (
                <div />
            )}
        </nav>
    )
}
