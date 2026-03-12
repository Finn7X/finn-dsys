import { siteConfig } from "@/config/site"

const localeMap: Record<string, string> = {
    zh: "zh_CN",
    en: "en_US",
}

/**
 * Returns base openGraph fields that should be included
 * in every page's openGraph metadata to avoid losing
 * layout-level defaults during Next.js metadata merging.
 *
 * Set `includeImage: false` for pages that have their own
 * opengraph-image.tsx convention (e.g. blog posts).
 */
export function getBaseOpenGraph(
    locale: string,
    { includeImage = true } = {},
) {
    const localePath = locale === "zh" ? "" : `/${locale}`
    return {
        type: "website" as const,
        locale: localeMap[locale] ?? "zh_CN",
        alternateLocale: locale === "zh" ? "en_US" : "zh_CN",
        siteName: siteConfig.name,
        ...(includeImage && {
            images: [
                {
                    url: `${siteConfig.url}${localePath}/opengraph-image`,
                    width: 1200,
                    height: 630,
                    type: "image/png",
                },
            ],
        }),
    }
}
