import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import { getAllProjects, getFeaturedProjects } from "@/lib/content"
import { ProjectCard } from "@/components/project-card"
import { Rocket } from "lucide-react"
import { siteConfig } from "@/config/site"
import { getBaseOpenGraph } from "@/lib/metadata"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>
}): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "projects" })
    const localePath = locale === "zh" ? "" : `/${locale}`
    const pageUrl = `${siteConfig.url}${localePath}/projects`
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
                zh: `${siteConfig.url}/projects`,
                en: `${siteConfig.url}/en/projects`,
            },
        },
    }
}

export default function ProjectsPage() {
    const featured = getFeaturedProjects()
    const allProjects = getAllProjects()
    const other = allProjects.filter((p) => !p.featured)

    return (
        <ProjectsContent featured={featured} other={other} />
    )
}

function ProjectsContent({
    featured,
    other,
}: {
    featured: {
        title: string
        description: string
        date: string
        github?: string
        demo?: string
        cover?: string
        tags: string[]
        featured: boolean
    }[]
    other: {
        title: string
        description: string
        date: string
        github?: string
        demo?: string
        cover?: string
        tags: string[]
        featured: boolean
    }[]
}) {
    const t = useTranslations("projects")
    const hasProjects = featured.length > 0 || other.length > 0

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            <div className="mb-8">
                <h1 className="mb-2 text-3xl font-bold">{t("title")}</h1>
                <p className="text-muted-foreground">{t("description")}</p>
            </div>

            {hasProjects ? (
                <>
                    {/* Featured Projects */}
                    {featured.length > 0 && (
                        <section className="mb-12">
                            <h2 className="mb-6 text-xl font-semibold">
                                {t("featured")}
                            </h2>
                            <div className="grid gap-6 sm:grid-cols-2">
                                {featured.map((project) => (
                                    <ProjectCard
                                        key={project.title}
                                        {...project}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Other Projects */}
                    {other.length > 0 && (
                        <section>
                            <h2 className="mb-6 text-xl font-semibold">
                                {t("other")}
                            </h2>
                            <div className="grid gap-6 sm:grid-cols-2">
                                {other.map((project) => (
                                    <ProjectCard
                                        key={project.title}
                                        {...project}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </>
            ) : (
                <div className="py-20 text-center">
                    <Rocket className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground">
                        {t("noProjects")}
                    </p>
                </div>
            )}
        </div>
    )
}
