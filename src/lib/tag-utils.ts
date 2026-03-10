export function tagToSlug(tag: string): string {
    return tag
        .toLowerCase()
        .replace(/\+\+/g, "pp")
        .replace(/\./g, "-")
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "")
        .replace(/-{2,}/g, "-")
        .replace(/^-|-$/g, "")
}

export function slugToTag(
    slug: string,
    allTags: string[],
): string | undefined {
    // First try exact match (case-insensitive)
    const exact = allTags.find((t) => t.toLowerCase() === slug.toLowerCase())
    if (exact) return exact

    // Then try slug match
    return allTags.find((t) => tagToSlug(t) === slug)
}
