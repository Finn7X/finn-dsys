import { notes } from "#site/content"

export function getAllNotes(locale?: string) {
    return notes
        .filter((note) => !locale || note.locale === locale)
        .sort(
            (a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime(),
        )
}

export function groupNotesByDate(
    notesList: typeof notes,
    locale: string = "zh",
): Record<string, typeof notes> {
    const groups: Record<string, typeof notes> = {}

    for (const note of notesList) {
        const date = new Date(note.date)
        const label = formatDateLabel(date, locale)

        if (!groups[label]) {
            groups[label] = []
        }
        groups[label].push(note)
    }

    return groups
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function formatDateLabel(date: Date, _locale: string): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}.${m}.${d}`
}
