import { generateFeed } from "@/lib/feed"

export const dynamic = "force-static"
export const revalidate = false

export function GET() {
    const feed = generateFeed("zh")
    return new Response(feed.rss2(), {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
        },
    })
}
