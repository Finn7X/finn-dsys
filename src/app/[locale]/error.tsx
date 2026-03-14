"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="container mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-32 text-center">
            <h1 className="mb-4 text-4xl font-bold">Something went wrong</h1>
            <p className="mb-8 text-muted-foreground">
                An unexpected error occurred. Please try again.
            </p>
            <Button onClick={reset}>Try again</Button>
        </div>
    )
}
