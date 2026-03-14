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

function formatDateLabel(date: Date, locale: string): string {
    const now = new Date()
    const diffDays = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    )

    if (locale === "zh") {
        if (diffDays === 0) return "今天"
        if (diffDays === 1) return "昨天"
        if (diffDays < 7) return `${diffDays} 天前`
    } else {
        if (diffDays === 0) return "Today"
        if (diffDays === 1) return "Yesterday"
        if (diffDays < 7) return `${diffDays} days ago`
    }

    return date.toLocaleDateString(
        locale === "zh" ? "zh-CN" : "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric",
        },
    )
}
