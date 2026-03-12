import type { MetadataRoute } from "next"
import { siteConfig } from "@/config/site"
import { getAllPosts, getAllTags } from "@/lib/content"

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = siteConfig.url
    const locales = ["zh", "en"] as const

    // Static pages with both locale variants
    const staticPages = ["/", "/blog", "/projects", "/about", "/tags"]
    const staticPriorities: Record<string, number> = {
        "/": 1.0,
        "/blog": 0.8,
        "/projects": 0.6,
        "/about": 0.5,
        "/tags": 0.5,
    }

    const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
        locales.map((locale) => ({
            url: `${baseUrl}${locale === "zh" ? "" : `/${locale}`}${page === "/" ? "" : page}`,
            lastModified: new Date(),
            changeFrequency: page === "/" ? ("daily" as const) : ("weekly" as const),
            priority: staticPriorities[page] ?? 0.5,
        })),
    )

    // Blog post entries
    const allPosts = getAllPosts()
    const postEntries: MetadataRoute.Sitemap = allPosts.map((post) => {
        const localePrefix = post.locale === "zh" ? "" : `/${post.locale}`
        return {
            url: `${baseUrl}${localePrefix}${post.permalink}`,
            lastModified: new Date(post.updated ?? post.date),
            changeFrequency: "monthly" as const,
            priority: 0.7,
        }
    })

    // Tag page entries for both locales
    const tagEntries: MetadataRoute.Sitemap = locales.flatMap((locale) => {
        const tags = getAllTags(locale)
        return tags.map(({ tag }) => ({
            url: `${baseUrl}${locale === "zh" ? "" : `/${locale}`}/tags/${encodeURIComponent(tag)}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.5,
        }))
    })

    return [...staticEntries, ...postEntries, ...tagEntries]
}
