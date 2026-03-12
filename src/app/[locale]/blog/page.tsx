import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/routing"
import { getAllPosts, getPostsByTag, getAllTags } from "@/lib/content"
import { PostCard } from "@/components/post-card"
import { Pagination } from "@/components/pagination"
import { cn } from "@/lib/utils"
import { FileText } from "lucide-react"
import { siteConfig } from "@/config/site"
import { getBaseOpenGraph } from "@/lib/metadata"

const POSTS_PER_PAGE = 10

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>
}): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "blog" })
    const localePath = locale === "zh" ? "" : `/${locale}`
    const pageUrl = `${siteConfig.url}${localePath}/blog`
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
                zh: `${siteConfig.url}/blog`,
                en: `${siteConfig.url}/en/blog`,
            },
        },
    }
}

export default async function BlogPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>
    searchParams: Promise<{ page?: string; tag?: string }>
}) {
    const { locale } = await params
    const { page, tag: activeTag } = await searchParams
    const currentPage = Math.max(1, Number(page) || 1)

    const allTags = getAllTags(locale)
    const filteredPosts = activeTag
        ? getPostsByTag(activeTag, locale)
        : getAllPosts(locale)

    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
    const paginatedPosts = filteredPosts.slice(
        (currentPage - 1) * POSTS_PER_PAGE,
        currentPage * POSTS_PER_PAGE,
    )

    return (
        <BlogContent
            posts={paginatedPosts}
            allTags={allTags}
            activeTag={activeTag}
            currentPage={currentPage}
            totalPages={totalPages}
            totalPosts={filteredPosts.length}
        />
    )
}

function BlogContent({
    posts,
    allTags,
    activeTag,
    currentPage,
    totalPages,
    totalPosts,
}: {
    posts: {
        title: string
        description: string
        date: string
        readingTime: string
        tags: string[]
        slugAsParams: string
        cover?: string
    }[]
    allTags: { tag: string; count: number }[]
    activeTag?: string
    currentPage: number
    totalPages: number
    totalPosts: number
}) {
    const t = useTranslations("blog")

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            {/* Header */}
            <div className="mb-8">
                <h1 className="mb-2 text-3xl font-bold">{t("title")}</h1>
                <p className="text-muted-foreground">
                    {activeTag
                        ? `${activeTag} (${totalPosts} ${t("posts")})`
                        : `${t("allPosts")} (${totalPosts} ${t("posts")})`}
                </p>
            </div>

            {/* Tag Filter */}
            {allTags.length > 0 && (
                <div className="mb-8 flex flex-wrap gap-2">
                    <Link
                        href="/blog"
                        className={cn(
                            "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors",
                            !activeTag
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                        )}
                    >
                        {t("allPosts")}
                    </Link>
                    {allTags.slice(0, 10).map(({ tag, count }) => (
                        <Link
                            key={tag}
                            href={`/blog?tag=${encodeURIComponent(tag)}`}
                            className={cn(
                                "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-colors",
                                activeTag === tag
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                            )}
                        >
                            {tag}
                            <span className="text-xs opacity-70">
                                {count}
                            </span>
                        </Link>
                    ))}
                </div>
            )}

            {/* Post Grid or Empty State */}
            {posts.length > 0 ? (
                <>
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
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        basePath="/blog"
                        searchParams={
                            activeTag ? { tag: activeTag } : undefined
                        }
                    />
                </>
            ) : (
                <div className="py-20 text-center">
                    <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h2 className="mb-2 text-xl font-semibold">
                        {t("noPostsTitle")}
                    </h2>
                    <p className="mb-4 text-muted-foreground">
                        {activeTag
                            ? t("noPostsForTag", { tag: activeTag })
                            : t("noPosts")}
                    </p>
                    {activeTag && (
                        <Link
                            href="/blog"
                            className="text-primary underline underline-offset-4"
                        >
                            {t("viewAll")}
                        </Link>
                    )}
                </div>
            )}
        </div>
    )
}
