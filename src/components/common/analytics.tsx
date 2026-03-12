"use client"

import Script from "next/script"

interface AnalyticsProps {
    umamiUrl?: string
    websiteId?: string
}

export function Analytics({ umamiUrl, websiteId }: AnalyticsProps) {
    if (!umamiUrl || !websiteId) return null

    return (
        <Script
            src={`${umamiUrl}/script.js`}
            data-website-id={websiteId}
            strategy="lazyOnload"
        />
    )
}
