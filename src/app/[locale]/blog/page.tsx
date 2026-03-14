import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/routing"
import { getAllPosts, getPostsByTag, getAllTags } from "@/lib/content"
import { Pagination } from "@/components/pagination"
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
        />
    )
}

function formatShortDate(dateStr: string) {
    const d = new Date(dateStr)
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${month}.${day}`
}

function BlogContent({
    posts,
    allTags,
    activeTag,
    currentPage,
    totalPages,
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
}) {
    const t = useTranslations("blog")

    // Group posts by year
    const postsByYear = posts.reduce(
        (groups, post) => {
            const year = new Date(post.date).getFullYear().toString()
            if (!groups[year]) groups[year] = []
            groups[year].push(post)
            return groups
        },
        {} as Record<string, typeof posts>,
    )

    return (
        <div className="mx-auto max-w-[var(--content-width)] px-4 py-16">
            {/* Header */}
            <h1 className="font-heading text-3xl font-medium mb-8">
                {t("title")}
            </h1>

            {/* Tag Filter */}
            {allTags.length > 0 && (
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-8">
                    <Link
                        href="/blog"
                        className={
                            !activeTag
                                ? "text-foreground font-medium"
                                : "hover:text-foreground transition-colors duration-200"
                        }
                    >
                        {t("allPosts")}
                    </Link>
                    {allTags.slice(0, 10).map(({ tag }) => (
                        <Link
                            key={tag}
                            href={`/blog?tag=${encodeURIComponent(tag)}`}
                            className={
                                activeTag === tag
                                    ? "text-foreground font-medium"
                                    : "hover:text-foreground transition-colors duration-200"
                            }
                        >
                            {tag}
                        </Link>
                    ))}
                </div>
            )}

            {/* Post Index or Empty State */}
            {posts.length > 0 ? (
                <>
                    {Object.entries(postsByYear)
                        .sort(([a], [b]) => Number(b) - Number(a))
                        .map(([year, yearPosts]) => (
                            <section key={year}>
                                <h2 className="font-heading italic text-sm text-muted-foreground mb-4 mt-12 first:mt-0">
                                    {year}
                                </h2>
                                <div className="space-y-1">
                                    {yearPosts.map((post) => (
                                        <Link
                                            key={post.slugAsParams}
                                            href={`/blog/${post.slugAsParams}`}
                                            className="group flex items-baseline gap-4 py-2 transition-colors duration-200"
                                        >
                                            <time className="shrink-0 text-sm tabular-nums text-muted-foreground">
                                                {formatShortDate(post.date)}
                                            </time>
                                            <span className="text-base font-medium text-foreground group-hover:text-accent transition-colors duration-200">
                                                {post.title}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        ))}
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
