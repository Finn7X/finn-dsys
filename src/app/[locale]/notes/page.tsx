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
        <div className="mx-auto max-w-[var(--content-width)] px-4 py-16">
            {/* Header */}
            <h1 className="font-heading text-3xl font-medium mb-2">
                {t("title")}
            </h1>
            <p className="text-muted-foreground mb-12">
                {t("description")}
            </p>

            {/* Timeline */}
            {allNotes.length > 0 ? (
                <div className="space-y-10">
                    {Object.entries(groupedNotes).map(
                        ([dateLabel, notes]) => (
                            <div key={dateLabel}>
                                {/* Date group header */}
                                <h2 className="font-heading italic text-sm text-muted-foreground mb-4">
                                    {dateLabel}
                                </h2>

                                {/* Notes */}
                                <div className="space-y-6">
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
