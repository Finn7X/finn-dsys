export const siteConfig = {
    name: "Finn Days",
    description:
        "Exploring technology, sharing knowledge, and documenting my journey in web development",
    url: "https://finn7x.com",
    author: {
        name: "Finn",
        bio: "全栈开发者，热爱开源技术和知识分享。专注于 React、Next.js 和现代 Web 开发。",
        avatar: "/images/avatar.jpg",
        email: "xujifennng@gmail.com",
        github: "https://github.com/Finn7X",
        twitter: "https://twitter.com/Finn7X",
    },
    links: {
        github: "https://github.com/Finn7X/finn-days",
    },
}

export const giscusConfig = {
    repo: "Finn7X/finn-dsys" as `${string}/${string}`,
    repoId: "R_kgDON7l_Pg",
    category: "General",
    categoryId: "DIC_kwDON7l_Ps4C4LEJ",
    mapping: "pathname" as const,
    reactionsEnabled: "1" as const,
    emitMetadata: "0" as const,
    inputPosition: "top" as const,
    loading: "lazy" as const,
}

export const navLinks = [
    { title: "Blog", href: "/blog" },
    { title: "Notes", href: "/notes" },
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
