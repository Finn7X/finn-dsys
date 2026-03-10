import Link from "next/link"
import { Github, Twitter, Mail, Rss } from "lucide-react"
import { Button } from "@/components/ui/button"
import { siteConfig, navLinks } from "@/config/site"

export function Footer() {
    return (
        <footer className="border-t">
            <div className="container mx-auto max-w-4xl px-4 py-8">
                {/* Nav + Social */}
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
                    <nav className="flex flex-wrap justify-center gap-4">
                        {navLinks.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild>
                            <a
                                href={siteConfig.author.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="GitHub"
                            >
                                <Github className="h-4 w-4" />
                            </a>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <a
                                href={siteConfig.author.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Twitter"
                            >
                                <Twitter className="h-4 w-4" />
                            </a>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <a
                                href={`mailto:${siteConfig.author.email}`}
                                aria-label="Email"
                            >
                                <Mail className="h-4 w-4" />
                            </a>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <a href="/feed.xml" aria-label="RSS Feed">
                                <Rss className="h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-6 text-center text-sm text-muted-foreground">
                    <p>
                        &copy; {new Date().getFullYear()} {siteConfig.name}.
                        Built with{" "}
                        <a
                            href="https://nextjs.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-4 hover:text-foreground"
                        >
                            Next.js
                        </a>{" "}
                        and{" "}
                        <a
                            href="https://tailwindcss.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-4 hover:text-foreground"
                        >
                            Tailwind CSS
                        </a>
                        .
                    </p>
                </div>
            </div>
        </footer>
    )
}
