import { generateFeed } from "@/lib/feed"
import { routing } from "@/i18n/routing"

export const dynamic = "force-static"
export const revalidate = false

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }))
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ locale: string }> },
) {
    const { locale } = await params
    const feed = generateFeed(locale)
    return new Response(feed.atom1(), {
        headers: {
            "Content-Type": "application/atom+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
        },
    })
}
