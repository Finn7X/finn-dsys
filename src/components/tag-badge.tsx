import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"

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
    size = "sm",
}: TagBadgeProps) {
    const className = cn(
        "inline-flex items-center gap-1 rounded-full font-medium transition-colors",
        size === "sm" && "px-2.5 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        linked
            ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            : "bg-secondary text-secondary-foreground",
    )

    if (linked) {
        return (
            <Link
                href={`/tags/${encodeURIComponent(tag)}`}
                className={className}
            >
                {tag}
                {count !== undefined && (
                    <span className="text-muted-foreground">({count})</span>
                )}
            </Link>
        )
    }

    return (
        <span className={className}>
            {tag}
            {count !== undefined && (
                <span className="text-muted-foreground">({count})</span>
            )}
        </span>
    )
}
