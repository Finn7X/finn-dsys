<p align="center">
  <img src="public/blog-logo.svg" alt="Finn Days" width="80" />
</p>

<h1 align="center">Finn Days</h1>

<p align="center">
  A modern, bilingual tech blog for the global developer community.<br/>
  面向全球开发者的现代化双语技术博客。
</p>

<p align="center">
  <a href="https://finndays.com">finndays.com</a>
</p>

---

## About

**Finn Days** is a personal tech blog built with cutting-edge web technologies, natively supporting **Chinese** and **English**. It focuses on delivering high-quality technical content with an elegant reading experience — interactive code demos, zero distractions, and privacy-first.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router, React 19) |
| Language | TypeScript |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Content | [Velite](https://velite.js.org) (MDX) |
| i18n | [next-intl](https://next-intl-docs.vercel.app) |
| Theme | [next-themes](https://github.com/pacocoursey/next-themes) (Dark / Light) |
| Deployment | Docker (node:22-alpine) |
| Analytics | [Umami](https://umami.is) (self-hosted, privacy-friendly) |

## Features

- **Bilingual** — Native Chinese / English support with `[locale]` routing
- **MDX Blog** — Write in MDX with syntax highlighting, TOC, and custom components
- **Dark Mode** — Seamless theme switching with system preference detection
- **RSS Feed** — RSS 2.0 & Atom feed generation
- **SEO Optimized** — Meta tags, Open Graph, JSON-LD, Sitemap
- **Privacy First** — Self-hosted analytics, no third-party trackers
- **Containerized** — Docker-based deployment with CI/CD via GitHub Actions

## Roadmap

Development follows a phased approach:

```
Phase 1 — MVP + i18n               Phase 2 — UX Enhancement
━━━━━━━━━━━━━━━━━━━━━━             ━━━━━━━━━━━━━━━━━━━━━━━
 Velite content system               Giscus comments
 [locale] routing (next-intl)        Full-text search (Pagefind)
 Blog list & detail pages            Reading progress bar
 Tag system                          Social sharing
 Theme switching                     Author card
 About / Projects pages              Newsletter subscription
 RSS / Atom feed                     Series navigation

Phase 3 — SEO & Infrastructure     Phase 4 — Advanced
━━━━━━━━━━━━━━━━━━━━━━━━━━         ━━━━━━━━━━━━━━━━━━━
 SEO optimization                    Command palette (⌘K)
 Dynamic OG image generation         Custom MDX components
 Umami analytics                     Code playground (Sandpack)
 CI/CD pipeline                      Short notes (TIL)
 Performance tuning                  View Transitions
 Docker Compose orchestration        Admin dashboard
```

> Detailed documentation for each phase is available in the [`docs/`](./docs/) directory.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server (port 8200)
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the site in development mode.

## Project Structure

```
finn-days/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   └── [locale]/     # i18n routing
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui primitives
│   │   ├── blog/         # Blog-specific components
│   │   └── layout/       # Navbar, Footer, etc.
│   ├── config/           # Site configuration
│   │   └── site.ts       # Centralized site config
│   ├── lib/              # Utilities & content queries
│   │   ├── content.ts    # Single content query entry
│   │   └── utils.ts      # Shared utilities
│   └── i18n/             # Internationalization setup
├── content/              # MDX blog posts & notes
│   ├── blog/
│   └── notes/
├── messages/             # i18n translation files
│   ├── zh.json
│   └── en.json
├── public/               # Static assets
├── docs/                 # Project documentation
└── Dockerfile            # Multi-stage Docker build
```

## Documentation

The [`docs/`](./docs/) directory contains comprehensive project documentation:

- [Architecture Overview](./docs/00-architecture/overview.md) — System design, tech decisions, data flow
- [Phase 1: MVP](./docs/01-phase1-mvp/) — Content system, layouts, blog pages, i18n
- [Phase 2: UX](./docs/02-phase2-enhancement/) — Comments, search, sharing, series navigation
- [Phase 3: SEO & Infra](./docs/03-phase3-seo-infra/) — SEO, analytics, CI/CD, Docker
- [Phase 4: Advanced](./docs/04-phase4-advanced/) — Command palette, MDX components, notes

## License

MIT

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Finn7X">Finn7X</a>
</p>
