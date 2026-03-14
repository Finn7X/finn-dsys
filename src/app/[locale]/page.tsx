import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Github, ArrowRight, Calendar, Clock } from "lucide-react"
import { Newsletter } from "@/components/common/newsletter"
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

    return <HomeContent recentPosts={recentPosts} locale={locale} />
}

function HomeContent({
    recentPosts,
    locale,
}: {
    recentPosts: {
        title: string
        description: string
        date: string
        readingTime: string
        slugAsParams: string
        permalink: string
    }[]
    locale: string
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
                    <p className="mb-8 text-lg text-muted-foreground">
                        {t("hero.description")}
                    </p>
                    <div className="flex gap-4 mb-6">
                        <Button variant="outline" className="gap-2" asChild>
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
                    <Newsletter variant="hero" />
                </div>
            </section>

            {/* Recent Posts */}
            {recentPosts.length > 0 && (
                <section className="px-4 pt-16 pb-16">
                    <div className="mx-auto max-w-[var(--content-width)]">
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="font-heading text-2xl">
                                {t("recentPosts")}
                            </h2>
                            <Button variant="ghost" className="gap-1" asChild>
                                <Link href="/blog">
                                    {t("viewAll")}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {recentPosts.map((post) => (
                                <Link
                                    key={post.slugAsParams}
                                    href={`/blog/${post.slugAsParams}`}
                                >
                                    <Card className="h-full transition-shadow hover:shadow-lg">
                                        <CardContent className="pt-6">
                                            <div className="mb-2 flex items-center gap-3 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {new Date(
                                                        post.date,
                                                    ).toLocaleDateString(
                                                        locale === "en" ? "en-US" : "zh-CN",
                                                    )}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {post.readingTime}
                                                </span>
                                            </div>
                                            <h3 className="mb-2 line-clamp-2 text-xl font-semibold">
                                                {post.title}
                                            </h3>
                                            <p className="line-clamp-2 text-muted-foreground">
                                                {post.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    )
}
