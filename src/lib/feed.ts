import { Feed } from "feed"
import { siteConfig } from "@/config/site"
import { getAllPosts } from "./content"

export function generateFeed() {
    const posts = getAllPosts()

    const feed = new Feed({
        title: siteConfig.name,
        description: siteConfig.description,
        id: siteConfig.url,
        link: siteConfig.url,
        language: "zh-CN",
        image: `${siteConfig.url}/favicon/favicon.svg`,
        favicon: `${siteConfig.url}/favicon/favicon.svg`,
        copyright: `© ${new Date().getFullYear()} ${siteConfig.author.name}`,
        updated: posts.length > 0 ? new Date(posts[0].date) : new Date(),
        feedLinks: {
            rss2: `${siteConfig.url}/feed.xml`,
            atom: `${siteConfig.url}/atom.xml`,
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
