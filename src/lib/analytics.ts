export function trackEvent(
  eventName: string,
  data?: Record<string, string | number>
): void {
  if (typeof window === "undefined" || !window.umami) return
  window.umami.track(eventName, data)
}

export function trackReadComplete(slug: string, title: string): void {
  trackEvent("read_complete", { slug, title })
}

export function trackSearch(query: string, resultsCount: number): void {
  trackEvent("search", { query, resultsCount })
}

export function trackNewsletterSubscribe(source: string): void {
  trackEvent("newsletter_subscribe", { source })
}
