import { defineCollection, defineConfig, s } from "velite"
import rehypeSlug from "rehype-slug"
import rehypePrettyCode from "rehype-pretty-code"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import remarkGfm from "remark-gfm"

const computeReadingTime = (content: string): string => {
    // Chinese: ~300 chars/min, English: ~200 words/min
    const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length
    const englishWords = content
        .replace(/[\u4e00-\u9fff]/g, "")
        .split(/\s+/)
        .filter(Boolean).length
    const minutes = Math.ceil(chineseChars / 300 + englishWords / 200)
    return `${Math.max(1, minutes)} min read`
}

const posts = defineCollection({
    name: "Post",
    pattern: "blog/**/*.mdx",
    schema: s
        .object({
            title: s.string().max(120),
            description: s.string().max(260),
            date: s.isodate(),
            updated: s.isodate().optional(),
            tags: s.array(s.string()).default([]),
            category: s.string().optional(),
            series: s
                .object({
                    title: s.string(),
                    order: s.number(),
                })
                .optional(),
            cover: s.string().optional(),
            draft: s.boolean().default(false),
            locale: s.enum(["zh", "en"]).default("zh"),
            translationSlug: s.string().optional(),
            slug: s.path(),
            content: s.mdx(),
            metadata: s.metadata(),
            toc: s.toc(),
        })
        .transform((data) => ({
            ...data,
            slugAsParams: data.slug.split("/").slice(1).join("/"),
            readingTime: computeReadingTime(data.content),
            permalink: `/blog/${data.slug.split("/").slice(1).join("/")}`,
        })),
})

const projects = defineCollection({
    name: "Project",
    pattern: "projects/**/*.mdx",
    schema: s
        .object({
            title: s.string().max(100),
            description: s.string().max(300),
            date: s.isodate(),
            github: s.string().optional(),
            demo: s.string().optional(),
            cover: s.string().optional(),
            tags: s.array(s.string()).default([]),
            featured: s.boolean().default(false),
            draft: s.boolean().default(false),
            slug: s.path(),
            content: s.mdx(),
            metadata: s.metadata(),
        })
        .transform((data) => ({
            ...data,
            slugAsParams: data.slug.split("/").slice(1).join("/"),
            permalink: `/projects/${data.slug.split("/").slice(1).join("/")}`,
        })),
})

export default defineConfig({
    root: "content",
    output: {
        data: ".velite",
        assets: "public/static",
        base: "/static/",
        name: "[name]-[hash:6].[ext]",
        clean: true,
    },
    collections: { posts, projects },
    mdx: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
            rehypeSlug,
            [
                rehypePrettyCode,
                {
                    theme: {
                        dark: "github-dark",
                        light: "github-light",
                    },
                    keepBackground: false,
                },
            ],
            [
                rehypeAutolinkHeadings,
                {
                    behavior: "wrap",
                    properties: {
                        className: ["subheading-anchor"],
                        ariaLabel: "Link to section",
                    },
                },
            ],
        ],
    },
})
