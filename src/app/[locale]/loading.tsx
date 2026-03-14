export default function Loading() {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-16">
            <div className="animate-pulse space-y-6">
                <div className="h-8 w-2/3 rounded bg-muted" />
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-5/6 rounded bg-muted" />
                <div className="h-4 w-4/6 rounded bg-muted" />
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                    <div className="h-48 rounded-lg bg-muted" />
                    <div className="h-48 rounded-lg bg-muted" />
                </div>
            </div>
        </div>
    )
}
