import { posts, projects } from "#site/content"

// --- Posts ---

export function getAllPosts(locale?: string) {
    return posts
        .filter((post) => !post.draft && (!locale || post.locale === locale))
        .sort(
            (a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime(),
        )
}

export function getPostBySlug(slug: string, locale?: string) {
    return posts.find(
        (post) =>
            post.slugAsParams === slug &&
            (!locale || post.locale === locale),
    )
}

export function getPostsByTag(tag: string, locale?: string) {
    return getAllPosts(locale).filter((post) =>
        post.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
    )
}

export function getPostsByCategory(category: string, locale?: string) {
    return getAllPosts(locale).filter(
        (post) => post.category?.toLowerCase() === category.toLowerCase(),
    )
}

export function getPostsBySeries(seriesTitle: string, locale?: string) {
    return getAllPosts(locale)
        .filter((post) => post.series?.title === seriesTitle)
        .sort((a, b) => (a.series?.order ?? 0) - (b.series?.order ?? 0))
}

export function getAllTags(locale?: string) {
    const tagCount = new Map<string, number>()
    for (const post of getAllPosts(locale)) {
        for (const tag of post.tags) {
            tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1)
        }
    }
    return Array.from(tagCount.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
}

export function getTagSlugs() {
    const tags = new Set<string>()
    for (const post of getAllPosts()) {
        for (const tag of post.tags) {
            tags.add(tag)
        }
    }
    return Array.from(tags)
}

export function getAllCategories(locale?: string) {
    const categories = new Set<string>()
    for (const post of getAllPosts(locale)) {
        if (post.category) categories.add(post.category)
    }
    return Array.from(categories)
}

export function getPaginatedPosts(
    page: number = 1,
    perPage: number = 10,
    locale?: string,
) {
    const allPosts = getAllPosts(locale)
    const totalPages = Math.ceil(allPosts.length / perPage)
    const start = (page - 1) * perPage
    return {
        posts: allPosts.slice(start, start + perPage),
        totalPages,
        totalPosts: allPosts.length,
        currentPage: page,
    }
}

export function getAdjacentPosts(slug: string, locale?: string) {
    const allPosts = getAllPosts(locale)
    const index = allPosts.findIndex((post) => post.slugAsParams === slug)
    return {
        prev: index < allPosts.length - 1 ? allPosts[index + 1] : null,
        next: index > 0 ? allPosts[index - 1] : null,
    }
}

export function getPostsByLocale(locale: string) {
    return getAllPosts(locale)
}

export function getTranslation(
    post: { translationSlug?: string; locale: string },
    targetLocale: string,
) {
    if (!post.translationSlug) return null
    return posts.find(
        (p) =>
            p.translationSlug === post.translationSlug &&
            p.locale === targetLocale &&
            !p.draft,
    )
}

// --- Series ---

interface SeriesPostInfo {
    title: string
    slug: string
    date: string
    order: number
}

interface SeriesInfo {
    title: string
    posts: SeriesPostInfo[]
    currentIndex: number
    prevPost: SeriesPostInfo | null
    nextPost: SeriesPostInfo | null
}

export function getSeriesInfo(
    seriesTitle: string,
    currentSlug: string,
    locale?: string,
): SeriesInfo | null {
    const seriesPosts = getAllPosts(locale)
        .filter((post) => post.series?.title === seriesTitle)
        .sort((a, b) => (a.series?.order ?? 0) - (b.series?.order ?? 0))
        .map((post) => ({
            title: post.title,
            slug: post.slugAsParams,
            date: post.date,
            order: post.series!.order,
        }))

    if (seriesPosts.length === 0) return null

    const currentIndex = seriesPosts.findIndex(
        (post) => post.slug === currentSlug,
    )

    return {
        title: seriesTitle,
        posts: seriesPosts,
        currentIndex,
        prevPost: currentIndex > 0 ? seriesPosts[currentIndex - 1] : null,
        nextPost:
            currentIndex < seriesPosts.length - 1
                ? seriesPosts[currentIndex + 1]
                : null,
    }
}

export function getAllSeries(locale?: string): { title: string; postCount: number }[] {
    const seriesMap = new Map<string, number>()

    getAllPosts(locale).forEach((post) => {
        if (post.series?.title) {
            seriesMap.set(
                post.series.title,
                (seriesMap.get(post.series.title) || 0) + 1,
            )
        }
    })

    return Array.from(seriesMap.entries())
        .map(([title, postCount]) => ({ title, postCount }))
        .sort((a, b) => a.title.localeCompare(b.title))
}

// --- Projects ---

export function getAllProjects() {
    return projects
        .filter((project) => !project.draft)
        .sort(
            (a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime(),
        )
}

export function getFeaturedProjects() {
    return getAllProjects().filter((project) => project.featured)
}

export function getProjectBySlug(slug: string) {
    return projects.find(
        (project) => project.slugAsParams === slug && !project.draft,
    )
}
