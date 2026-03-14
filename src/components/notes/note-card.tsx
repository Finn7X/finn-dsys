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
    const notesPath = locale === "zh" ? "/notes" : `/${locale}/notes`

    return (
        <article
            id={note.slugAsParams}
            className={cn("scroll-mt-20", className)}
        >
            {/* Title */}
            <h3 className="text-base font-medium leading-tight mb-1">
                {note.title}
            </h3>

            {/* Content */}
            <div className="prose-sm max-w-none text-muted-foreground">
                <MdxContent code={note.content} />
            </div>

            {/* Meta */}
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <time dateTime={note.date}>
                    {(() => {
                        const d = new Date(note.date)
                        const y = d.getFullYear()
                        const m = String(d.getMonth() + 1).padStart(2, "0")
                        const day = String(d.getDate()).padStart(2, "0")
                        return `${y}.${m}.${day}`
                    })()}
                </time>

                {note.tags.length > 0 && (
                    <div className="flex gap-2">
                        {note.tags.map((tag) => (
                            <span key={tag} className="text-sm text-muted-foreground">
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
