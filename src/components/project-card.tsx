import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { Github, ExternalLink, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
    title: string
    description: string
    date: string
    github?: string
    demo?: string
    cover?: string
    tags: string[]
    featured?: boolean
}

export function ProjectCard({
    title,
    description,
    date,
    github,
    demo,
    cover,
    tags,
    featured,
}: ProjectCardProps) {
    const locale = useLocale()
    const t = useTranslations("projects")
    const dateLocale = locale === "zh" ? "zh-CN" : "en-US"

    return (
        <Card
            className={cn(
                "group overflow-hidden transition-colors duration-200 hover:border-primary/30",
                featured && "border-primary/30 shadow-md",
            )}
        >
            {/* Cover */}
            {cover && (
                <div className="relative aspect-video overflow-hidden">
                    <Image
                        src={cover}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {featured && (
                        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                            <Star className="h-3 w-3" />
                            {t("featuredBadge")}
                        </div>
                    )}
                </div>
            )}

            <CardContent className="pt-6">
                {/* Date */}
                <p className="mb-2 text-sm text-muted-foreground">
                    {new Date(date).toLocaleDateString(dateLocale, {
                        year: "numeric",
                        month: "long",
                    })}
                </p>

                {/* Title */}
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>

                {/* Description */}
                <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                    {description}
                </p>

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Links */}
                <div className="flex gap-2">
                    {github && (
                        <Button variant="outline" size="sm" asChild>
                            <a
                                href={github}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Github className="mr-1.5 h-3.5 w-3.5" />
                                {t("viewSource")}
                            </a>
                        </Button>
                    )}
                    {demo && (
                        <Button size="sm" asChild>
                            <a
                                href={demo}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                                {t("viewDemo")}
                            </a>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
