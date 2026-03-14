import { Feed } from "feed"
import { siteConfig } from "@/config/site"
import { getAllPosts } from "./content"

export function generateFeed(locale: string = "zh") {
    const posts = getAllPosts(locale)
    const prefix = locale === "zh" ? "" : `/${locale}`

    const feed = new Feed({
        title: siteConfig.name,
        description: siteConfig.description,
        id: siteConfig.url,
        link: `${siteConfig.url}${prefix}`,
        language: locale === "en" ? "en" : "zh",
        image: `${siteConfig.url}/favicon.svg`,
        favicon: `${siteConfig.url}/favicon.svg`,
        copyright: `© ${new Date().getFullYear()} ${siteConfig.author.name}`,
        updated: posts.length > 0 ? new Date(posts[0].date) : new Date(),
        feedLinks: {
            rss2: `${siteConfig.url}${prefix}/feed.xml`,
            atom: `${siteConfig.url}${prefix}/atom.xml`,
        },
        author: {
            name: siteConfig.author.name,
            email: siteConfig.author.email,
            link: siteConfig.author.github,
        },
    })

    for (const post of posts) {
        feed.addItem({
            title: post.title,
            id: `${siteConfig.url}${post.permalink}`,
            link: `${siteConfig.url}${post.permalink}`,
            description: post.description,
            content: post.description,
            author: [
                {
                    name: siteConfig.author.name,
                    email: siteConfig.author.email,
                    link: siteConfig.author.github,
                },
            ],
            date: new Date(post.date),
            published: new Date(post.date),
            category: post.tags.map((tag) => ({ name: tag })),
            ...(post.cover && {
                image: `${siteConfig.url}${post.cover}`,
            }),
        })
    }

    return feed
}
