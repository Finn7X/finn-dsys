import type { Metadata } from "next"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Github, Twitter, Mail, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { aboutConfig, techStack, timeline } from "@/config/about"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
    title: "About",
}

export default function AboutPage() {
    return <AboutContent />
}

function AboutContent() {
    const t = useTranslations("about")

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            {/* Personal Introduction */}
            <section className="mb-16 flex flex-col items-center gap-8 text-center sm:flex-row sm:items-start sm:text-left">
                {/* Avatar */}
                <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-primary/10 shadow-lg">
                    <Image
                        src={aboutConfig.avatar}
                        alt={aboutConfig.name}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Info */}
                <div>
                    <h1 className="mb-1 text-3xl font-bold">
                        {aboutConfig.name}
                    </h1>
                    <p className="mb-2 text-lg text-muted-foreground">
                        {aboutConfig.role}
                    </p>
                    <p className="mb-4 flex items-center justify-center gap-1 text-sm text-muted-foreground sm:justify-start">
                        <MapPin className="h-3.5 w-3.5" />
                        {aboutConfig.location}
                    </p>

                    {aboutConfig.bio.map((paragraph, i) => (
                        <p
                            key={i}
                            className="mb-2 leading-7 text-muted-foreground"
                        >
                            {paragraph}
                        </p>
                    ))}

                    {/* Social Links */}
                    <div className="mt-4 flex justify-center gap-2 sm:justify-start">
                        <Button variant="outline" size="sm" asChild>
                            <a
                                href={siteConfig.author.github}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Github className="mr-1.5 h-4 w-4" />
                                GitHub
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a
                                href={siteConfig.author.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Twitter className="mr-1.5 h-4 w-4" />
                                Twitter
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href={`mailto:${siteConfig.author.email}`}>
                                <Mail className="mr-1.5 h-4 w-4" />
                                Email
                            </a>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="mb-16">
                <h2 className="mb-6 text-2xl font-bold">{t("techStack")}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    {Object.entries(techStack).map(([category, items]) => (
                        <Card key={category}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">
                                    {category}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {items.map((item) => (
                                        <span
                                            key={item}
                                            className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-sm font-medium"
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Timeline */}
            <section className="mb-16">
                <h2 className="mb-6 text-2xl font-bold">{t("experience")}</h2>
                <div className="space-y-6 border-l-2 border-border pl-8">
                    {timeline.map((item, i) => (
                        <div key={i} className="relative">
                            <div className="absolute -left-[calc(2rem+5px)] top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                            <p className="text-sm font-medium text-muted-foreground">
                                {item.year}
                            </p>
                            <h3 className="text-lg font-semibold">
                                {item.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {item.role}
                            </p>
                            <p className="mt-1 leading-7 text-muted-foreground">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact CTA */}
            <section>
                <Card>
                    <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
                        <h2 className="text-xl font-semibold">
                            {t("contactCta")}
                        </h2>
                        <div className="flex gap-3">
                            <Button asChild>
                                <a href={`mailto:${siteConfig.author.email}`}>
                                    <Mail className="mr-1.5 h-4 w-4" />
                                    {t("sendEmail")}
                                </a>
                            </Button>
                            <Button variant="outline" asChild>
                                <a
                                    href={siteConfig.author.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Github className="mr-1.5 h-4 w-4" />
                                    GitHub
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}
