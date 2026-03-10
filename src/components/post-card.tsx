import Image from "next/image"
import { Link } from "@/i18n/routing"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface PostCardProps {
    title: string
    description: string
    date: string
    readingTime: string
    tags: string[]
    slug: string
    cover?: string
    className?: string
}

export function PostCard({
    title,
    description,
    date,
    readingTime,
    tags,
    slug,
    cover,
    className,
}: PostCardProps) {
    return (
        <Link href={`/blog/${slug}`}>
            <Card
                className={cn(
                    "group h-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
                    className,
                )}
            >
                {/* Cover Image */}
                {cover && (
                    <div className="relative aspect-video overflow-hidden">
                        <Image
                            src={cover}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                    </div>
                )}

                <CardContent className="pt-6">
                    {/* Date + Reading Time */}
                    <div className="mb-2 flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(date).toLocaleDateString("zh-CN")}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {readingTime}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="mb-2 line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary">
                        {title}
                    </h3>

                    {/* Description */}
                    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                        {description}
                    </p>

                    {/* Tags */}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {tags.slice(0, 3).map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                                >
                                    {tag}
                                </span>
                            ))}
                            {tags.length > 3 && (
                                <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                                    +{tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    )
}
