import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

export default createMiddleware(routing)

export const config = {
    matcher: [
        "/((?!api|_next|_vercel|opengraph-image|[^/]+\\.(?:ico|png|jpg|jpeg|gif|svg|webp|avif|css|js|map|woff|woff2|ttf|eot|xml|txt|webmanifest)$).*)",
    ],
}
