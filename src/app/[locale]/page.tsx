import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Github, Mail, ArrowRight, Calendar, Clock } from "lucide-react"
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
            <section className="px-4 pb-20 pt-16">
                <div className="container mx-auto max-w-4xl text-center">
                    <h1 className="mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-5xl font-bold text-transparent">
                        {t("hero.title")}
                    </h1>
                    <p className="mb-8 text-xl text-muted-foreground">
                        {t("hero.description")}
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button className="gap-2" asChild>
                            <a href={`mailto:xujifennng@gmail.com`}>
                                <Mail size={18} />
                                {t("hero.subscribe")}
                            </a>
                        </Button>
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
                </div>
            </section>

            {/* Recent Posts */}
            {recentPosts.length > 0 && (
                <section className="bg-muted/50 px-4 py-16">
                    <div className="container mx-auto max-w-4xl">
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="text-3xl font-bold">
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
                                                        "zh-CN",
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

            {/* Skills Section */}
            <section className="px-4 py-16">
                <div className="container mx-auto max-w-4xl text-center">
                    <h2 className="mb-8 text-3xl font-bold">
                        {t("skills.title")}
                    </h2>
                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="p-6">
                            <div className="mb-4 text-purple-600">
                                <svg
                                    className="mx-auto h-12 w-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">
                                {t("skills.webDev.title")}
                            </h3>
                            <p className="text-muted-foreground">
                                {t("skills.webDev.description")}
                            </p>
                        </div>
                        <div className="p-6">
                            <div className="mb-4 text-blue-600">
                                <svg
                                    className="mx-auto h-12 w-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">
                                {t("skills.writing.title")}
                            </h3>
                            <p className="text-muted-foreground">
                                {t("skills.writing.description")}
                            </p>
                        </div>
                        <div className="p-6">
                            <div className="mb-4 text-green-600">
                                <svg
                                    className="mx-auto h-12 w-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">
                                {t("skills.openSource.title")}
                            </h3>
                            <p className="text-muted-foreground">
                                {t("skills.openSource.description")}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
