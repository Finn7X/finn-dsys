import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import { getAllProjects } from "@/lib/content"
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

function formatProjectDate(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
    })
}

export default function ProjectsPage() {
    const allProjects = getAllProjects()

    return <ProjectsContent projects={allProjects} />
}

function ProjectsContent({
    projects,
}: {
    projects: {
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

    return (
        <div className="mx-auto max-w-[var(--content-width)] px-4 py-16">
            <h1 className="font-heading text-3xl font-medium mb-2">
                {t("title")}
            </h1>
            <p className="text-muted-foreground mb-12">{t("description")}</p>

            {projects.length > 0 ? (
                <div className="space-y-12">
                    {projects.map((project) => (
                        <article key={project.title} className="group">
                            <div className="flex items-baseline justify-between mb-1">
                                <h3 className="font-heading text-xl font-medium text-foreground">
                                    {project.title}
                                </h3>
                                <time className="text-sm text-muted-foreground">
                                    {formatProjectDate(project.date)}
                                </time>
                            </div>
                            <p className="text-muted-foreground mb-3">
                                {project.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                                {project.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-muted-foreground"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {project.github && (
                                    <a
                                        href={project.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-accent hover:underline"
                                    >
                                        GitHub
                                    </a>
                                )}
                                {project.demo && (
                                    <a
                                        href={project.demo}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-accent hover:underline"
                                    >
                                        Demo
                                    </a>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
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
