"use client"

import Script from "next/script"

export function Analytics() {
  const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_URL
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_ID

  if (!umamiUrl || !websiteId) return null

  return (
    <Script
      src={`${umamiUrl}/script.js`}
      data-website-id={websiteId}
      strategy="lazyOnload"
    />
  )
}
