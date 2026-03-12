import type { Metadata } from "next"
import { siteConfig } from "@/config/site"
import "./globals.css"

export const metadata: Metadata = {
    metadataBase: new URL(siteConfig.url),
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return children
}
