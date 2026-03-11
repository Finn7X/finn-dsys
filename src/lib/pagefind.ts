export interface SearchResult {
    title: string
    url: string
    excerpt: string
    tags: string[]
}

export interface SearchableItem {
    title: string
    description: string
    slug: string
    tags: string[]
    url: string
}

export function searchContent(
    query: string,
    items: SearchableItem[],
): SearchResult[] {
    if (!query.trim()) return []

    const normalizedQuery = query.toLowerCase()
    const terms = normalizedQuery.split(/\s+/).filter(Boolean)

    return items
        .map((item) => {
            const titleLower = item.title.toLowerCase()
            const descLower = item.description.toLowerCase()
            const tagsLower = item.tags.map((t) => t.toLowerCase())

            let score = 0
            let matched = false

            for (const term of terms) {
                const titleMatch = titleLower.includes(term)
                const descMatch = descLower.includes(term)
                const tagMatch = tagsLower.some((t) => t.includes(term))

                if (titleMatch) score += 10
                if (descMatch) score += 5
                if (tagMatch) score += 3

                if (titleMatch || descMatch || tagMatch) matched = true
            }

            if (!matched) return null

            // Build excerpt with highlight
            let excerpt = item.description
            for (const term of terms) {
                const regex = new RegExp(
                    `(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
                    "gi",
                )
                excerpt = excerpt.replace(regex, "<mark>$1</mark>")
            }

            return {
                title: item.title,
                url: item.url,
                excerpt,
                tags: item.tags,
                score,
            }
        })
        .filter(
            (r): r is SearchResult & { score: number } => r !== null,
        )
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((r) => ({
            title: r.title,
            url: r.url,
            excerpt: r.excerpt,
            tags: r.tags,
        }))
}
