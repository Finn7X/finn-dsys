import { useLocale } from "next-intl"
import { Link } from "@/i18n/routing"
import { tagToSlug } from "@/lib/tag-utils"

interface PostHeaderProps {
    title: string
    date: string
    updated?: string
    readingTime: string
    tags: string[]
    slug?: string
}

export function PostHeader({
    title,
    date,
    updated,
    readingTime,
    tags,
    slug,
}: PostHeaderProps) {
    const locale = useLocale()

    const formatDate = (d: string) => {
        const dt = new Date(d)
        return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}`
    }

    return (
        <header className="mb-16">
            <h1
                className="mb-4 font-heading text-4xl font-medium leading-[1.25]"
                style={slug ? { viewTransitionName: `post-title-${slug}` } : undefined}
            >
                {title}
            </h1>

            {/* Meta */}
            <div className="text-sm text-muted-foreground">
                <span>{formatDate(date)}</span>
                {updated && (
                    <>
                        <span className="mx-2">&middot;</span>
                        <span>
                            {locale === "zh" ? "更新于 " : "Updated "}
                            {formatDate(updated)}
                        </span>
                    </>
                )}
                <span className="mx-2">&middot;</span>
                <span>{readingTime}</span>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
                    {tags.map((tag) => (
                        <Link
                            key={tag}
                            href={`/tags/${tagToSlug(tag)}`}
                            className="text-sm text-accent transition-colors hover:text-accent/80"
                        >
                            {tag}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    )
}
