import { generateFeed } from "@/lib/feed"

export const dynamic = "force-static"
export const revalidate = false

export function GET() {
    const feed = generateFeed()
    return new Response(feed.atom1(), {
        headers: {
            "Content-Type": "application/atom+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
        },
    })
}
