import type { MetadataRoute } from "next"
import { siteConfig } from "@/config/site"
import { getAllPosts, getAllTags } from "@/lib/content"

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = siteConfig.url
    const locales = ["zh", "en"] as const

    function localeUrl(locale: string, path: string) {
        const prefix = locale === "zh" ? "" : `/${locale}`
        return `${baseUrl}${prefix}${path}`
    }

    function langAlternates(path: string) {
        return {
            languages: Object.fromEntries(
                locales.map((l) => [l, localeUrl(l, path)]),
            ),
        }
    }

    // Static pages with both locale variants and hreflang alternates
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
            url: localeUrl(locale, page === "/" ? "" : page),
            lastModified: new Date(),
            changeFrequency: page === "/" ? ("daily" as const) : ("weekly" as const),
            priority: staticPriorities[page] ?? 0.5,
            alternates: langAlternates(page === "/" ? "" : page),
        })),
    )

    // Blog post entries - both locales for every post (en falls back if no translation)
    const allPosts = getAllPosts()
    const slugs = [...new Set(allPosts.map((p) => p.slugAsParams))]
    const postEntries: MetadataRoute.Sitemap = slugs.flatMap((slug) => {
        const post = allPosts.find((p) => p.slugAsParams === slug)!
        const lastMod = new Date(post.updated ?? post.date)
        return locales.map((locale) => ({
            url: localeUrl(locale, `/blog/${slug}`),
            lastModified: lastMod,
            changeFrequency: "monthly" as const,
            priority: 0.7,
            alternates: langAlternates(`/blog/${slug}`),
        }))
    })

    // Tag page entries for both locales
    const allTagNames = new Set<string>()
    for (const locale of locales) {
        for (const { tag } of getAllTags(locale)) {
            allTagNames.add(tag)
        }
    }

    const tagEntries: MetadataRoute.Sitemap = [...allTagNames].flatMap((tag) => {
        const encodedTag = encodeURIComponent(tag)
        const path = `/tags/${encodedTag}`
        return locales.map((locale) => ({
            url: localeUrl(locale, path),
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.5,
            alternates: langAlternates(path),
        }))
    })

    return [...staticEntries, ...postEntries, ...tagEntries]
}
