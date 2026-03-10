import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import { siteConfig } from "@/config/site"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: { icon: "/favicon/favicon.svg" },
    metadataBase: new URL(siteConfig.url),
    alternates: {
        types: {
            "application/rss+xml": [
                { url: "/feed.xml", title: `${siteConfig.name} RSS Feed` },
            ],
            "application/atom+xml": [
                { url: "/atom.xml", title: `${siteConfig.name} Atom Feed` },
            ],
        },
    },
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params

    if (!routing.locales.includes(locale as "zh" | "en")) {
        notFound()
    }

    const messages = await getMessages()

    return (
        <NextIntlClientProvider messages={messages}>
            <ThemeProvider>
                <div className="relative flex min-h-screen flex-col">
                    <Navbar />
                    <main className="flex-1">{children}</main>
                    <Footer />
                </div>
            </ThemeProvider>
        </NextIntlClientProvider>
    )
}
