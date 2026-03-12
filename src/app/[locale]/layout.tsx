import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import { siteConfig } from "@/config/site"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { WebSiteJsonLd } from "@/components/common/seo"
import { Analytics } from "@/components/common/analytics"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>
}): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "metadata" })

    return {
        title: {
            default: siteConfig.name,
            template: `%s | ${siteConfig.name}`,
        },
        description: t("description"),
        icons: { icon: "/favicon.svg" },
        metadataBase: new URL(siteConfig.url),
        authors: [{ name: siteConfig.author.name, url: siteConfig.author.github }],
        creator: siteConfig.author.name,
        twitter: {
            card: "summary_large_image",
            creator: "@Finn7X",
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
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
        <html lang={locale} suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <WebSiteJsonLd
                    url={siteConfig.url}
                    name={siteConfig.name}
                    description={siteConfig.description}
                />
                <NextIntlClientProvider messages={messages}>
                    <ThemeProvider>
                        <div className="relative flex min-h-screen flex-col">
                            <Navbar />
                            <main className="flex-1">{children}</main>
                            <Footer />
                        </div>
                    </ThemeProvider>
                </NextIntlClientProvider>
                <Analytics />
            </body>
        </html>
    )
}
