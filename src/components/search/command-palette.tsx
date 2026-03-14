"use client"

import * as React from "react"
import { useRouter } from "@/i18n/routing"
import { useTheme } from "next-themes"
import { useTranslations, useLocale } from "next-intl"
import {
    FileText,
    Home,
    Moon,
    Sun,
    Monitor,
    Github,
    Twitter,
    Search,
    Hash,
    BookOpen,
    ExternalLink,
    StickyNote,
} from "lucide-react"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import { siteConfig } from "@/config/site"

interface CommandPaletteProps {
    posts?: Array<{
        slug: string
        title: string
        description?: string
        tags?: string[]
    }>
}

export function CommandPalette({ posts = [] }: CommandPaletteProps) {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()
    const locale = useLocale()
    const { setTheme } = useTheme()
    const t = useTranslations("command")

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((prev) => !prev)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false)
        command()
    }, [])

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                aria-label={t("title")}
            >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">{t("button")}</span>
                <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder={t("placeholder")} />
                <CommandList>
                    <CommandEmpty>{t("noResults")}</CommandEmpty>

                    {/* Navigation - uses i18n router, locale preserved automatically */}
                    <CommandGroup heading={t("navigation")}>
                        <CommandItem
                            onSelect={() =>
                                runCommand(() => router.push("/"))
                            }
                        >
                            <Home className="mr-2 h-4 w-4" />
                            <span>{t("home")}</span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() =>
                                runCommand(() => router.push("/blog"))
                            }
                        >
                            <BookOpen className="mr-2 h-4 w-4" />
                            <span>{t("blog")}</span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() =>
                                runCommand(() => router.push("/notes"))
                            }
                        >
                            <StickyNote className="mr-2 h-4 w-4" />
                            <span>{t("notes")}</span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() =>
                                runCommand(() => router.push("/tags"))
                            }
                        >
                            <Hash className="mr-2 h-4 w-4" />
                            <span>{t("tags")}</span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() =>
                                runCommand(() => router.push("/about"))
                            }
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            <span>{t("about")}</span>
                        </CommandItem>
                    </CommandGroup>

                    <CommandSeparator />

                    {/* Posts - locale-filtered data passed from navbar */}
                    {posts.length > 0 && (
                        <>
                            <CommandGroup heading={t("posts")}>
                                {posts.map((post) => (
                                    <CommandItem
                                        key={post.slug}
                                        value={`${post.title} ${locale}`}
                                        onSelect={() =>
                                            runCommand(() =>
                                                router.push(
                                                    `/blog/${post.slug}`,
                                                ),
                                            )
                                        }
                                    >
                                        <Search className="mr-2 h-4 w-4" />
                                        <span>{post.title}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                            <CommandSeparator />
                        </>
                    )}

                    {/* Theme */}
                    <CommandGroup heading={t("theme")}>
                        <CommandItem
                            onSelect={() =>
                                runCommand(() => setTheme("light"))
                            }
                        >
                            <Sun className="mr-2 h-4 w-4" />
                            <span>{t("lightMode")}</span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() =>
                                runCommand(() => setTheme("dark"))
                            }
                        >
                            <Moon className="mr-2 h-4 w-4" />
                            <span>{t("darkMode")}</span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() =>
                                runCommand(() => setTheme("system"))
                            }
                        >
                            <Monitor className="mr-2 h-4 w-4" />
                            <span>{t("systemMode")}</span>
                        </CommandItem>
                    </CommandGroup>

                    <CommandSeparator />

                    {/* External Links */}
                    <CommandGroup heading={t("links")}>
                        <CommandItem
                            onSelect={() =>
                                runCommand(() =>
                                    window.open(
                                        siteConfig.author.github,
                                        "_blank",
                                    ),
                                )
                            }
                        >
                            <Github className="mr-2 h-4 w-4" />
                            <span>GitHub</span>
                            <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
                        </CommandItem>
                        <CommandItem
                            onSelect={() =>
                                runCommand(() =>
                                    window.open(
                                        siteConfig.author.twitter,
                                        "_blank",
                                    ),
                                )
                            }
                        >
                            <Twitter className="mr-2 h-4 w-4" />
                            <span>Twitter</span>
                            <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
