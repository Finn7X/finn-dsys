import { Link } from "@/i18n/routing"
import { Calendar, Clock, RotateCw } from "lucide-react"

interface PostHeaderProps {
    title: string
    date: string
    updated?: string
    readingTime: string
    tags: string[]
}

export function PostHeader({
    title,
    date,
    updated,
    readingTime,
    tags,
}: PostHeaderProps) {
    return (
        <header className="mb-8">
            <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                {title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(date).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </span>
                {updated && (
                    <span className="flex items-center gap-1">
                        <RotateCw className="h-3.5 w-3.5" />
                        {new Date(updated).toLocaleDateString("zh-CN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </span>
                )}
                <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {readingTime}
                </span>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <Link
                            key={tag}
                            href={`/tags/${encodeURIComponent(tag)}`}
                            className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                        >
                            {tag}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    )
}
