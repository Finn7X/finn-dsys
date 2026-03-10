import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps {
    currentPage: number
    totalPages: number
    basePath: string
    searchParams?: Record<string, string>
}

function buildHref(
    basePath: string,
    page: number,
    searchParams?: Record<string, string>,
) {
    const params = new URLSearchParams(searchParams)
    if (page > 1) params.set("page", String(page))
    const query = params.toString()
    return query ? `${basePath}?${query}` : basePath
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

    const pages: (number | "...")[] = [1]

    if (current > 3) pages.push("...")
    for (
        let i = Math.max(2, current - 1);
        i <= Math.min(total - 1, current + 1);
        i++
    ) {
        pages.push(i)
    }
    if (current < total - 2) pages.push("...")

    pages.push(total)
    return pages
}

export function Pagination({
    currentPage,
    totalPages,
    basePath,
    searchParams,
}: PaginationProps) {
    if (totalPages <= 1) return null

    const pages = getPageNumbers(currentPage, totalPages)

    return (
        <nav
            className="mt-8 flex items-center justify-center gap-1"
            aria-label="Pagination"
        >
            {/* Previous */}
            <Button
                variant="ghost"
                size="icon"
                asChild={currentPage > 1}
                disabled={currentPage <= 1}
            >
                {currentPage > 1 ? (
                    <Link
                        href={buildHref(
                            basePath,
                            currentPage - 1,
                            searchParams,
                        )}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                ) : (
                    <span>
                        <ChevronLeft className="h-4 w-4" />
                    </span>
                )}
            </Button>

            {/* Page Numbers */}
            {pages.map((page, i) =>
                page === "..." ? (
                    <span
                        key={`ellipsis-${i}`}
                        className="px-2 text-muted-foreground"
                    >
                        ...
                    </span>
                ) : (
                    <Button
                        key={page}
                        variant={page === currentPage ? "default" : "ghost"}
                        size="icon"
                        asChild={page !== currentPage}
                        className={cn(
                            "h-9 w-9",
                            page === currentPage && "pointer-events-none",
                        )}
                    >
                        {page !== currentPage ? (
                            <Link
                                href={buildHref(basePath, page, searchParams)}
                            >
                                {page}
                            </Link>
                        ) : (
                            <span>{page}</span>
                        )}
                    </Button>
                ),
            )}

            {/* Next */}
            <Button
                variant="ghost"
                size="icon"
                asChild={currentPage < totalPages}
                disabled={currentPage >= totalPages}
            >
                {currentPage < totalPages ? (
                    <Link
                        href={buildHref(
                            basePath,
                            currentPage + 1,
                            searchParams,
                        )}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                ) : (
                    <span>
                        <ChevronRight className="h-4 w-4" />
                    </span>
                )}
            </Button>
        </nav>
    )
}
