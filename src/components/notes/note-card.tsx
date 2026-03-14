import { cn } from "@/lib/utils"
import { MdxContent } from "@/components/mdx-content"

interface NoteCardProps {
    note: {
        title: string
        date: string
        tags: string[]
        content: string
        slugAsParams: string
    }
    locale?: string
    className?: string
}

export function NoteCard({ note, locale = "zh", className }: NoteCardProps) {
    const dateLocale = locale === "zh" ? "zh-CN" : "en-US"
    const notesPath = locale === "zh" ? "/notes" : `/${locale}/notes`

    return (
        <article
            id={note.slugAsParams}
            className={cn(
                "scroll-mt-20 rounded-lg border bg-card p-5 transition-colors hover:bg-muted/30",
                className,
            )}
        >
            {/* Title */}
            <h3 className="mb-2 font-semibold leading-tight">
                {note.title}
            </h3>

            {/* Content */}
            <div className="prose-sm max-w-none">
                <MdxContent code={note.content} />
            </div>

            {/* Meta */}
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <time dateTime={note.date}>
                    {new Date(note.date).toLocaleDateString(dateLocale, {
                        month: "short",
                        day: "numeric",
                    })}
                </time>

                {note.tags.length > 0 && (
                    <div className="flex gap-1.5">
                        {note.tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full bg-muted px-2 py-0.5 text-xs"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <a
                    href={`${notesPath}#${note.slugAsParams}`}
                    className="ml-auto text-muted-foreground hover:text-foreground"
                    aria-label="Permalink"
                >
                    #
                </a>
            </div>
        </article>
    )
}
