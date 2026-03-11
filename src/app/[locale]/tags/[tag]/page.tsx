import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { getPostsByTag, getTagSlugs } from "@/lib/content"
import { tagToSlug, slugToTag } from "@/lib/tag-utils"
import { PostCard } from "@/components/post-card"
import { ChevronRight } from "lucide-react"

export function generateStaticParams() {
    const tags = getTagSlugs()
    return tags.flatMap((tag) => [
        { locale: "zh", tag: tagToSlug(tag) },
        { locale: "en", tag: tagToSlug(tag) },
    ])
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ tag: string }>
}): Promise<Metadata> {
    const { tag } = await params
    const allTagNames = getTagSlugs()
    const originalTag = slugToTag(tag, allTagNames)
    return {
        title: `${originalTag ?? tag} - Tags`,
    }
}

export default async function TagPage({
    params,
}: {
    params: Promise<{ locale: string; tag: string }>
}) {
    const { locale, tag } = await params
    const allTagNames = getTagSlugs()
    const originalTag = slugToTag(tag, allTagNames)

    if (!originalTag) notFound()

    const posts = getPostsByTag(originalTag, locale)

    if (posts.length === 0) {
        // Check if the tag exists at all (in any locale)
        const allLocalePosts = getPostsByTag(originalTag)
        if (allLocalePosts.length === 0) notFound()
    }

    return <TagContent tag={originalTag} posts={posts} />
}

function TagContent({
    tag,
    posts,
}: {
    tag: string
    posts: {
        title: string
        description: string
        date: string
        readingTime: string
        tags: string[]
        slugAsParams: string
        cover?: string
    }[]
}) {
    const t = useTranslations("tags")

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
                <Link href="/tags" className="hover:text-foreground">
                    {t("title")}
                </Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground">{tag}</span>
            </nav>

            {/* Header */}
            <div className="mb-8">
                <h1 className="mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-3xl font-bold text-transparent">
                    {tag}
                </h1>
                <p className="text-muted-foreground">
                    {t("postCount", { count: posts.length })}
                </p>
            </div>

            {/* Posts Grid */}
            {posts.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2">
                    {posts.map((post) => (
                        <PostCard
                            key={post.slugAsParams}
                            title={post.title}
                            description={post.description}
                            date={post.date}
                            readingTime={post.readingTime}
                            tags={post.tags}
                            slug={post.slugAsParams}
                            cover={post.cover}
                        />
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
