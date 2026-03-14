import { cn } from "@/lib/utils"
import { ExternalLink } from "lucide-react"

interface LinkCardProps {
    href: string
    title: string
    description?: string
    favicon?: string
    className?: string
}

export function LinkCard({
    href,
    title,
    description,
    favicon,
    className,
}: LinkCardProps) {
    const hostname = new URL(href).hostname

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "group my-6 flex items-center gap-4 rounded-lg border p-4",
                "transition-all duration-200",
                "hover:border-primary/50 hover:bg-muted/50 hover:shadow-md",
                "no-underline",
                className,
            )}
        >
            {favicon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={favicon}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded"
                    loading="lazy"
                />
            ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted">
                    <ExternalLink className="h-5 w-5 text-muted-foreground" />
                </div>
            )}

            <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground transition-colors group-hover:text-primary">
                    {title}
                </p>
                {description && (
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                    {hostname}
                </p>
            </div>

            <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </a>
    )
}
