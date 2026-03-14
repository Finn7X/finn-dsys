import { getTranslations } from "next-intl/server"
import { siteConfig } from "@/config/site"

interface AuthorCardProps {
    bio?: string
}

export async function AuthorCard({ bio }: AuthorCardProps) {
    const t = await getTranslations("author")

    const bioText = bio || t("bio")

    return (
        <div className="mt-12 pt-8 border-t">
            <h3 className="text-lg font-semibold">{siteConfig.author.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {bioText}
            </p>
        </div>
    )
}
