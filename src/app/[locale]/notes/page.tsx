import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { siteConfig } from "@/config/site"
import { getBaseOpenGraph } from "@/lib/metadata"
import { getAllNotes, groupNotesByDate } from "@/lib/notes"
import { NoteCard } from "@/components/notes/note-card"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>
}): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "notes" })
    const localePath = locale === "zh" ? "" : `/${locale}`
    const pageUrl = `${siteConfig.url}${localePath}/notes`
    const title = t("title")
    const description = t("description")
    return {
        title,
        description,
        openGraph: {
            ...getBaseOpenGraph(locale),
            title,
            description,
            url: pageUrl,
        },
        alternates: {
            canonical: pageUrl,
            languages: {
                zh: `${siteConfig.url}/notes`,
                en: `${siteConfig.url}/en/notes`,
            },
        },
    }
}

export default async function NotesPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "notes" })
    const allNotes = getAllNotes(locale)
    const groupedNotes = groupNotesByDate(allNotes, locale)

    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">
                    {t("title")}
                </h1>
                <p className="mt-2 text-muted-foreground">
                    {t("description")}
                </p>
            </div>

            {/* Timeline */}
            {allNotes.length > 0 ? (
                <div className="space-y-8">
                    {Object.entries(groupedNotes).map(
                        ([dateLabel, notes]) => (
                            <div key={dateLabel}>
                                {/* Date separator */}
                                <div className="sticky top-16 z-10 mb-4 flex items-center gap-3">
                                    <div className="h-px flex-1 bg-border" />
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {dateLabel}
                                    </span>
                                    <div className="h-px flex-1 bg-border" />
                                </div>

                                {/* Notes */}
                                <div className="space-y-4">
                                    {notes.map((note) => (
                                        <NoteCard
                                            key={note.slugAsParams}
                                            note={note}
                                            locale={locale}
                                        />
                                    ))}
                                </div>
                            </div>
                        ),
                    )}
                </div>
            ) : (
                <div className="py-20 text-center">
                    <p className="text-muted-foreground">{t("noNotes")}</p>
                </div>
            )}
        </div>
    )
}
