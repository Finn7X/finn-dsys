import { Link } from "@/i18n/routing"
import { tagToSlug } from "@/lib/tag-utils"

interface TagBadgeProps {
    tag: string
    count?: number
    linked?: boolean
    size?: "sm" | "md"
}

export function TagBadge({
    tag,
    count,
    linked = true,
}: TagBadgeProps) {
    const className = "text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"

    if (linked) {
        return (
            <Link
                href={`/tags/${tagToSlug(tag)}`}
                className={className}
            >
                {tag}
                {count !== undefined && (
                    <span className="text-muted-foreground"> ({count})</span>
                )}
            </Link>
        )
    }

    return (
        <span className="text-sm text-muted-foreground">
            {tag}
            {count !== undefined && (
                <span> ({count})</span>
            )}
        </span>
    )
}
