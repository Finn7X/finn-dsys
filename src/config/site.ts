export const siteConfig = {
    name: "Finn Days",
    description:
        "Exploring technology, sharing knowledge, and documenting my journey in web development",
    url: "https://finn7x.com",
    author: {
        name: "Finn",
        email: "xujifennng@gmail.com",
        github: "https://github.com/Finn7X",
        twitter: "https://twitter.com/Finn7X",
    },
    links: {
        github: "https://github.com/Finn7X/finn-days",
    },
}

export const navLinks = [
    { title: "Blog", href: "/blog" },
    { title: "Projects", href: "/projects" },
    { title: "Tags", href: "/tags" },
    { title: "About", href: "/about" },
] as const

export const socialLinks = [
    {
        title: "GitHub",
        href: "https://github.com/Finn7X",
        icon: "github" as const,
    },
    {
        title: "Twitter",
        href: "https://twitter.com/Finn7X",
        icon: "twitter" as const,
    },
    {
        title: "Email",
        href: "mailto:xujifennng@gmail.com",
        icon: "mail" as const,
    },
] as const

export type SiteConfig = typeof siteConfig
