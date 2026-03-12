import { ImageResponse } from "next/og"
import { getAllPosts, getPostBySlug } from "@/lib/content"
import { siteConfig } from "@/config/site"

export const alt = "Blog post"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export async function generateStaticParams() {
    const posts = getAllPosts()
    return posts.map((post) => ({
        locale: post.locale,
        slug: post.slugAsParams,
    }))
}

export default async function OgImage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>
}) {
    const { locale, slug } = await params
    const post = getPostBySlug(slug, locale) ?? getPostBySlug(slug)

    if (!post) {
        return new ImageResponse(
            (
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                            "linear-gradient(135deg, #9333ea 0%, #2563eb 100%)",
                        fontSize: 48,
                        fontWeight: 700,
                        color: "#ffffff",
                    }}
                >
                    Post Not Found
                </div>
            ),
            { ...size },
        )
    }

    const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })

    const displayTags = post.tags.slice(0, 3)

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    background:
                        "linear-gradient(135deg, #9333ea 0%, #2563eb 100%)",
                    padding: "60px",
                }}
            >
                {/* Top: Branding */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <div
                        style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: "rgba(255, 255, 255, 0.8)",
                        }}
                    >
                        Finn Days
                    </div>
                    <div
                        style={{
                            fontSize: 18,
                            color: "rgba(255, 255, 255, 0.6)",
                        }}
                    >
                        {formattedDate}
                    </div>
                </div>

                {/* Middle: Title + Description */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        justifyContent: "center",
                        gap: 16,
                    }}
                >
                    <div
                        style={{
                            fontSize: 52,
                            fontWeight: 700,
                            color: "#ffffff",
                            lineHeight: 1.2,
                            letterSpacing: "-0.02em",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                        }}
                    >
                        {post.title}
                    </div>
                    {post.description && (
                        <div
                            style={{
                                fontSize: 24,
                                fontWeight: 400,
                                color: "rgba(255, 255, 255, 0.8)",
                                lineHeight: 1.4,
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                            }}
                        >
                            {post.description}
                        </div>
                    )}
                </div>

                {/* Bottom: Tags + Author */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: 10,
                        }}
                    >
                        {displayTags.map((tag) => (
                            <div
                                key={tag}
                                style={{
                                    fontSize: 16,
                                    color: "#ffffff",
                                    background: "rgba(255, 255, 255, 0.15)",
                                    borderRadius: 9999,
                                    padding: "6px 16px",
                                    fontWeight: 500,
                                }}
                            >
                                {tag}
                            </div>
                        ))}
                    </div>
                    <div
                        style={{
                            fontSize: 18,
                            color: "rgba(255, 255, 255, 0.7)",
                            fontWeight: 500,
                        }}
                    >
                        {siteConfig.author.name}
                    </div>
                </div>
            </div>
        ),
        { ...size },
    )
}
