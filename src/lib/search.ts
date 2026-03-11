import { getAllPosts } from "@/lib/content"

export interface SearchablePost {
    title: string
    description: string
    slug: string
    tags: string[]
    url: string
}

export function getSearchableContent(locale?: string): SearchablePost[] {
    return getAllPosts(locale).map((post) => ({
        title: post.title,
        description: post.description,
        slug: post.slugAsParams,
        tags: post.tags,
        url: post.permalink,
    }))
}
