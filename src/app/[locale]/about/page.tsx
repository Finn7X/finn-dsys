import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import { aboutConfig, techStack, timelineYears } from "@/config/about"
import { siteConfig } from "@/config/site"
import { getBaseOpenGraph } from "@/lib/metadata"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>
}): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "about" })
    const localePath = locale === "zh" ? "" : `/${locale}`
    const pageUrl = `${siteConfig.url}${localePath}/about`
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
                zh: `${siteConfig.url}/about`,
                en: `${siteConfig.url}/en/about`,
            },
        },
    }
}

export default function AboutPage() {
    return <AboutContent />
}

function AboutContent() {
    const t = useTranslations("about")

    const bio = [t("bio.0"), t("bio.1")]

    return (
        <div className="mx-auto max-w-[var(--content-width)] px-4 py-16">
            {/* Personal Introduction */}
            <section className="mb-16">
                <div className="mb-6">
                    <h1 className="font-heading text-2xl font-medium">
                        {aboutConfig.name}
                    </h1>
                    <p className="text-muted-foreground">
                        {t("role")}
                    </p>
                </div>

                {bio.map((paragraph, i) => (
                    <p
                        key={i}
                        className="mb-3 text-muted-foreground leading-relaxed"
                    >
                        {paragraph}
                    </p>
                ))}
            </section>

            {/* Timeline */}
            <section className="mb-16">
                <h2 className="font-heading text-lg font-medium mb-6">
                    {t("experience")}
                </h2>
                <div className="space-y-4">
                    {timelineYears.map((year) => (
                        <div key={year} className="flex gap-3">
                            <span className="shrink-0 text-sm tabular-nums text-muted-foreground pt-0.5">
                                {year}
                            </span>
                            <div>
                                <p className="font-medium text-foreground">
                                    {t(`timeline${year}Title`)}
                                    <span className="text-muted-foreground font-normal">
                                        {" "}
                                        &middot; {t(`timeline${year}Role`)}
                                    </span>
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
                                    {t(`timeline${year}Desc`)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tech Stack */}
            <section className="mb-16">
                <h2 className="font-heading text-lg font-medium mb-6">
                    {t("techStack")}
                </h2>
                <div className="space-y-3">
                    {Object.entries(techStack).map(([category, items]) => (
                        <p key={category} className="text-muted-foreground leading-relaxed">
                            <span className="text-foreground font-medium">
                                {category}:
                            </span>{" "}
                            {items.join(", ")}
                        </p>
                    ))}
                </div>
            </section>

            {/* Contact */}
            <section>
                <h2 className="font-heading text-lg font-medium mb-4">
                    {t("contactCta")}
                </h2>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    <a
                        href={siteConfig.author.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                    >
                        GitHub
                    </a>
                    <a
                        href={siteConfig.author.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                    >
                        Twitter
                    </a>
                    <a
                        href={`mailto:${siteConfig.author.email}`}
                        className="text-accent hover:underline"
                    >
                        {siteConfig.author.email}
                    </a>
                </div>
            </section>
        </div>
    )
}
