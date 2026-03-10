import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAllPosts, getPostBySlug, getAdjacentPosts } from "@/lib/content"
import { siteConfig } from "@/config/site"
import { MdxContent } from "@/components/mdx-content"
import { PostHeader } from "@/components/post-header"
import { PostNav } from "@/components/post-nav"
import { Toc } from "@/components/toc"

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
    const post = getPostBySlug(slug, locale)
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

export default async function PostPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>
}) {
    const { locale, slug } = await params
    const post = getPostBySlug(slug, locale)

    if (!post) notFound()

    const { prev, next } = getAdjacentPosts(slug, locale)

    return (
        <div className="container mx-auto max-w-6xl px-4 py-12">
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_minmax(0,_48rem)_14rem]">
                {/* Left spacer */}
                <div className="hidden xl:block" />

                {/* Main content */}
                <div className="min-w-0">
                    <PostHeader
                        title={post.title}
                        date={post.date}
                        updated={post.updated}
                        readingTime={post.readingTime}
                        tags={post.tags}
                    />
                    <MdxContent code={post.content} />
                    <PostNav prev={prev} next={next} />
                </div>

                {/* TOC sidebar */}
                <Toc items={post.toc} />
            </div>
        </div>
    )
}
