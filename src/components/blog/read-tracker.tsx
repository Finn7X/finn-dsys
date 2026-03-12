"use client"

import { useEffect, useRef } from "react"
import { trackReadComplete } from "@/lib/analytics"

interface ReadTrackerProps {
  slug: string
  title: string
}

export function ReadTracker({ slug, title }: ReadTrackerProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const trackedRef = useRef(false)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !trackedRef.current) {
          trackedRef.current = true
          trackReadComplete(slug, title)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [slug, title])

  return <div ref={sentinelRef} aria-hidden="true" />
}
