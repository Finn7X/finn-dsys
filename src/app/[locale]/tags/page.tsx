import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/routing"
import { getAllTags, getAllPosts } from "@/lib/content"
import { tagToSlug } from "@/lib/tag-utils"
import { cn } from "@/lib/utils"
import { siteConfig } from "@/config/site"
import { getBaseOpenGraph } from "@/lib/metadata"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>
}): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "tags" })
    const localePath = locale === "zh" ? "" : `/${locale}`
    const pageUrl = `${siteConfig.url}${localePath}/tags`
    const title = t("title")
    const description = t("description")
    return {
        title,
        description,
        openGraph: {
            ...getBaseOpenGraph(locale),
            title,
            description,
            url: pageUrl,
        },
        alternates: {
            canonical: pageUrl,
            languages: {
                zh: `${siteConfig.url}/tags`,
                en: `${siteConfig.url}/en/tags`,
            },
        },
    }
}

export default async function TagsPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const allTags = getAllTags(locale)
    const totalPosts = getAllPosts(locale).length

    return <TagsContent allTags={allTags} totalPosts={totalPosts} />
}

function TagsContent({
    allTags,
    totalPosts,
}: {
    allTags: { tag: string; count: number }[]
    totalPosts: number
}) {
    const t = useTranslations("tags")
    const maxCount = Math.max(...allTags.map((t) => t.count), 1)

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            <div className="mb-8">
                <h1 className="mb-2 text-3xl font-bold">{t("title")}</h1>
                <p className="text-muted-foreground">
                    {t("tagCount", { count: allTags.length })} /{" "}
                    {t("postCount", { count: totalPosts })}
                </p>
            </div>

            {/* Tag Cloud */}
            {allTags.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                    {allTags.map(({ tag, count }) => {
                        const ratio = count / maxCount
                        const sizeClass =
                            ratio > 0.75
                                ? "text-2xl"
                                : ratio > 0.5
                                  ? "text-xl"
                                  : ratio > 0.25
                                    ? "text-base"
                                    : "text-sm"
                        return (
                            <Link
                                key={tag}
                                href={`/tags/${tagToSlug(tag)}`}
                                className={cn(
                                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all hover:-translate-y-0.5 hover:shadow-md",
                                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                                    sizeClass,
                                )}
                            >
                                {tag}
                                <span className="text-xs text-muted-foreground">
                                    ({count})
                                </span>
                            </Link>
                        )
                    })}
                </div>
            ) : (
                <p className="py-20 text-center text-muted-foreground">
                    {t("description")}
                </p>
            )}
        </div>
    )
}
