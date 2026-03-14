# Finn Days

A personal tech blog built with Next.js, with native Chinese/English bilingual support.

**Live:** [finn7x.com](https://finn7x.com)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS 4 + CSS variable theme system |
| Content | Velite + MDX (file-driven, zero database) |
| Fonts | Newsreader (serif headings) + Noto Serif SC (CJK headings) + JetBrains Mono (code) |
| Syntax Highlighting | Shiki + rehype-pretty-code (dual theme, line highlights, filename labels) |
| i18n | next-intl (route-level bilingual, `/` = Chinese, `/en` = English) |
| Search | Command Palette (cmdk) |
| Comments | Giscus (GitHub Discussions) |
| Newsletter | Buttondown |
| Analytics | Umami (self-hosted, privacy-friendly) |
| Deployment | Docker (node:22-alpine) + GitHub Actions CI/CD |

## Features

- **Bilingual content** — Chinese and English written independently, not translated; linked via `translationSlug`
- **Blog system** — Index-style listing, tag filtering, series navigation, reading time estimation
- **Notes system** — Short-form technical memos in a date-grouped timeline
- **Project showcase** — Editorial-style list with GitHub/Demo links
- **Article typography** — 660px narrow reading width, code blocks expand to 740px, serif headings, 1.8 line height
- **MDX components** — Callout (3-tier semantic), Tabs, Steps, Accordion, FileTree, LinkCard, CodePlayground
- **Dark mode** — Blue-tinted dark background, 3-level depth hierarchy, warm white text
- **SEO** — Open Graph, JSON-LD structured data, dynamic OG images, Sitemap, RSS/Atom feeds
- **Performance** — Standalone output, AVIF/WebP images, View Transitions

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (Velite watch + Next.js Turbopack)
npm run dev

# Production build
npm run build

# Start production server (port 8200)
npm run start
```

## Project Structure

```
├── content/              # MDX content
│   ├── blog/             # Blog posts (*.mdx)
│   ├── notes/            # Technical notes
│   └── projects/         # Project descriptions
├── messages/             # i18n translations (zh.json / en.json)
├── src/
│   ├── app/[locale]/     # Page routes (home/blog/notes/projects/tags/about)
│   ├── components/       # React components
│   │   ├── layout/       #   Navbar, footer, theme toggle, language switcher
│   │   ├── mdx/          #   Custom MDX components (Callout, Tabs, Steps...)
│   │   ├── blog/         #   Blog-specific (reading progress, sharing, author card)
│   │   └── ui/           #   Base UI (shadcn/ui)
│   ├── config/           # Site configuration (site.ts, about.ts)
│   ├── lib/              # Utilities (content queries, feed generation, SEO)
│   └── i18n/             # i18n configuration
├── Dockerfile            # Multi-stage Docker build
├── docker-compose.yml    # Blog + Umami + PostgreSQL
└── .github/workflows/    # CI (lint/typecheck) + CD (Docker deploy)
```

## Writing Content

Create a `.mdx` file under `content/blog/`:

```yaml
---
title: "Post Title"
description: "Brief description"
date: "2026-03-15"
tags: ["React", "Next.js"]
locale: en                    # zh or en
translationSlug: my-post      # link to other language version (optional)
draft: false
---

Post content with full MDX component support...
```

Notes go in `content/notes/`, projects in `content/projects/`, with similar frontmatter.

## Deployment

```bash
# Build and start with Docker
docker compose up -d

# Or use GitHub Actions auto-deploy (triggered by v* tags)
git tag v1.0.0 && git push --tags
```

See `.env.example` for environment variables.

## License

MIT

---

[中文版](./README.md)
