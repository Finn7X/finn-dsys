interface WebSiteJsonLdProps {
    url: string
    name: string
    description: string
}

export function WebSiteJsonLd({ url, name, description }: WebSiteJsonLdProps) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        url,
        name,
        description,
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}

interface PersonJsonLdProps {
    name: string
    url: string
    jobTitle?: string
    sameAs?: string[]
}

export function PersonJsonLd({ name, url, jobTitle, sameAs }: PersonJsonLdProps) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Person",
        name,
        url,
        ...(jobTitle && { jobTitle }),
        ...(sameAs && sameAs.length > 0 && { sameAs }),
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}

interface BlogPostingJsonLdProps {
    title: string
    description: string
    url: string
    datePublished: string
    dateModified?: string
    author: {
        name: string
        url?: string
    }
    tags?: string[]
    image?: string
}

export function BlogPostingJsonLd({
    title,
    description,
    url,
    datePublished,
    dateModified,
    author,
    tags,
    image,
}: BlogPostingJsonLdProps) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title,
        description,
        url,
        datePublished,
        ...(dateModified && { dateModified }),
        author: {
            "@type": "Person",
            name: author.name,
            ...(author.url && { url: author.url }),
        },
        ...(tags && tags.length > 0 && { keywords: tags.join(", ") }),
        ...(image && {
            image: {
                "@type": "ImageObject",
                url: image,
            },
        }),
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}

interface BreadcrumbItem {
    name: string
    url: string
}

interface BreadcrumbJsonLdProps {
    items: BreadcrumbItem[]
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}
