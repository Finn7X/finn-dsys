import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/routing"
import { getAllTags, getAllPosts } from "@/lib/content"
import { tagToSlug } from "@/lib/tag-utils"
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
    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            <div className="mb-8">
                <h1 className="mb-2 text-3xl font-bold">{t("title")}</h1>
                <p className="text-muted-foreground">
                    {t("tagCount", { count: allTags.length })} /{" "}
                    {t("postCount", { count: totalPosts })}
                </p>
            </div>

            {allTags.length > 0 ? (
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {allTags.map(({ tag, count }) => (
                        <Link
                            key={tag}
                            href={`/tags/${tagToSlug(tag)}`}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {tag}
                            <span className="text-muted-foreground/60">
                                {" "}({count})
                            </span>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="py-20 text-center text-muted-foreground">
                    {t("description")}
                </p>
            )}
        </div>
    )
}
