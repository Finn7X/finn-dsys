import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getAllPosts, getPostBySlug, getAdjacentPosts, getSeriesInfo } from "@/lib/content"
import { siteConfig } from "@/config/site"
import { MdxContent } from "@/components/mdx-content"
import { PostHeader } from "@/components/post-header"
import { PostNav } from "@/components/post-nav"
import { Toc } from "@/components/toc"
import { ReadingProgress } from "@/components/blog/reading-progress"
import { ShareButtons } from "@/components/blog/share-buttons"
import { AuthorCard } from "@/components/blog/author-card"
import { SeriesNav } from "@/components/blog/series-nav"
import { Comments } from "@/components/blog/comments"
import { Newsletter } from "@/components/common/newsletter"

export async function generateStaticParams() {
    const posts = getAllPosts()
    return posts.map((post) => ({
        locale: post.locale,
        slug: post.slugAsParams,
    }))
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
    const { locale, slug } = await params
    const post = getPostBySlug(slug, locale) ?? getPostBySlug(slug)
    if (!post) return { title: "Not Found" }

    return {
        title: post.title,
        description: post.description,
        openGraph: {
            title: post.title,
            description: post.description,
            type: "article",
            publishedTime: post.date,
            modifiedTime: post.updated,
            url: `${siteConfig.url}${post.permalink}`,
            tags: post.tags,
        },
    }
}

const localeNames: Record<string, string> = {
    zh: "中文",
    en: "English",
}

export default async function PostPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>
}) {
    const { locale, slug } = await params
    let post = getPostBySlug(slug, locale)
    let isFallback = false

    if (!post) {
        // Try to find the post in any locale
        post = getPostBySlug(slug)
        if (!post) notFound()
        isFallback = true
    }

    const contentLocale = isFallback ? post.locale : locale
    const { prev, next } = getAdjacentPosts(slug, contentLocale)
    const postUrl = `${siteConfig.url}${post.permalink}`
    const t = await getTranslations("fallback")

    // Get series info if the post belongs to a series
    const seriesInfo = post.series
        ? getSeriesInfo(post.series.title, slug, contentLocale)
        : null

    return (
        <>
            <ReadingProgress />

            <div className="container mx-auto max-w-6xl px-4 py-12">
                <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_minmax(0,_48rem)_14rem]">
                    {/* Left spacer */}
                    <div className="hidden xl:block" />

                    {/* Main content */}
                    <div className="min-w-0" data-pagefind-body>
                        <PostHeader
                            title={post.title}
                            date={post.date}
                            updated={post.updated}
                            readingTime={post.readingTime}
                            tags={post.tags}
                        />

                        {isFallback && (
                            <div className="my-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                                {t("notice", {
                                    targetLang: localeNames[locale] ?? locale,
                                    sourceLang: localeNames[post.locale] ?? post.locale,
                                })}
                            </div>
                        )}

                        {/* Series navigation - above content */}
                        {seriesInfo && (
                            <SeriesNav
                                seriesTitle={seriesInfo.title}
                                posts={seriesInfo.posts}
                                currentIndex={seriesInfo.currentIndex}
                                prevPost={seriesInfo.prevPost}
                                nextPost={seriesInfo.nextPost}
                            />
                        )}

                        <MdxContent code={post.content} />
                        <PostNav prev={prev} next={next} />

                        {/* Share buttons */}
                        <div className="mt-12 pt-6 border-t flex items-center justify-between">
                            <ShareButtons
                                title={post.title}
                                url={postUrl}
                                description={post.description}
                            />
                        </div>

                        {/* Author card */}
                        <AuthorCard />

                        {/* Newsletter subscription */}
                        <Newsletter variant="inline" />

                        {/* Comments */}
                        <Comments />
                    </div>

                    {/* TOC sidebar */}
                    <Toc items={post.toc} />
                </div>
            </div>
        </>
    )
}
