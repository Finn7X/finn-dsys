import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"
import { getAllPosts } from "@/lib/content"
import { siteConfig } from "@/config/site"
import { getBaseOpenGraph } from "@/lib/metadata"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>
}): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "metadata" })
    const localePath = locale === "zh" ? "" : `/${locale}`
    const pageUrl = `${siteConfig.url}${localePath}`
    const description = t("description")
    return {
        description,
        openGraph: {
            ...getBaseOpenGraph(locale, { includeImage: false }),
            title: siteConfig.name,
            description,
            url: pageUrl,
        },
        alternates: {
            canonical: pageUrl,
            languages: {
                zh: siteConfig.url,
                en: `${siteConfig.url}/en`,
            },
        },
    }
}

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const recentPosts = getAllPosts(locale).slice(0, 3)

    return <HomeContent recentPosts={recentPosts} />
}

function HomeContent({
    recentPosts,
}: {
    recentPosts: {
        title: string
        description: string
        date: string
        readingTime: string
        slugAsParams: string
        permalink: string
    }[]
}) {
    const t = useTranslations("home")

    return (
        <>
            {/* Hero Section */}
            <section className="px-4 pb-16 pt-32">
                <div className="mx-auto max-w-[var(--content-width)] text-left">
                    <h1 className="font-heading mb-4 text-5xl font-medium text-foreground">
                        {t("hero.title")}
                    </h1>
                    <p className="mb-8 text-lg text-secondary-foreground">
                        {t("hero.description")}
                    </p>
                    <div className="flex gap-4">
                        <Button variant="default" className="gap-2" asChild>
                            <a
                                href="https://github.com/Finn7X"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Github size={18} />
                                {t("hero.github")}
                            </a>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Recent Posts */}
            {recentPosts.length > 0 && (
                <section className="mx-auto max-w-[var(--content-width)] px-4 pt-12 pb-16">
                    <div className="flex items-baseline justify-between mb-8">
                        <h2 className="font-heading text-2xl font-medium">
                            {t("recentPosts")}
                        </h2>
                        <Link
                            href="/blog"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {t("viewAll")} →
                        </Link>
                    </div>
                    <div className="space-y-1">
                        {recentPosts.map((post) => {
                            const date = new Date(post.date)
                            const month = String(date.getMonth() + 1).padStart(
                                2,
                                "0",
                            )
                            const day = String(date.getDate()).padStart(2, "0")
                            return (
                                <Link
                                    key={post.slugAsParams}
                                    href={`/blog/${post.slugAsParams}`}
                                    className="group flex items-baseline gap-4 py-2 transition-colors duration-200"
                                >
                                    <time className="shrink-0 text-sm tabular-nums text-muted-foreground">
                                        {month}.{day}
                                    </time>
                                    <span className="text-base font-medium group-hover:text-accent transition-colors duration-200">
                                        {post.title}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                </section>
            )}
        </>
    )
}
