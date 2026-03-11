import Image from "next/image"
import { Github, Twitter, Mail } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/config/site"

interface Author {
    name: string
    bio: string
    avatar: string
    github?: string
    twitter?: string
    email?: string
}

interface AuthorCardProps {
    author?: Author
}

export async function AuthorCard({ author }: AuthorCardProps) {
    const t = await getTranslations("author")

    const authorData: Author = author || {
        name: siteConfig.author.name,
        bio: t("bio"),
        avatar: "/images/avatar.jpg",
        github: siteConfig.author.github,
        twitter: siteConfig.author.twitter,
        email: siteConfig.author.email,
    }

    return (
        <div className="mt-12 pt-8 border-t">
            <div className="flex flex-col sm:flex-row items-start gap-5 rounded-xl border bg-card p-6">
                <div className="shrink-0">
                    <Image
                        src={authorData.avatar}
                        alt={authorData.name}
                        width={80}
                        height={80}
                        className="rounded-full border-2 border-muted"
                        priority={false}
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold">{authorData.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                        {authorData.bio}
                    </p>

                    <div className="mt-3 flex items-center gap-1">
                        {authorData.github && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                asChild
                            >
                                <a
                                    href={authorData.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="GitHub"
                                >
                                    <Github className="h-4 w-4" />
                                </a>
                            </Button>
                        )}

                        {authorData.twitter && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                asChild
                            >
                                <a
                                    href={authorData.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Twitter"
                                >
                                    <Twitter className="h-4 w-4" />
                                </a>
                            </Button>
                        )}

                        {authorData.email && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                asChild
                            >
                                <a href={`mailto:${authorData.email}`} aria-label="Email">
                                    <Mail className="h-4 w-4" />
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
