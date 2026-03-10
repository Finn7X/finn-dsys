"use client"

import * as runtime from "react/jsx-runtime"
import { useMemo } from "react"
import { CopyButton } from "./copy-button"

function useMDXComponent(code: string) {
    return useMemo(() => {
        const fn = new Function(code)
        return fn({ ...runtime }).default
    }, [code])
}

const components = {
    h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h1 className="mt-8 scroll-m-20 text-3xl font-bold tracking-tight" {...props} />
    ),
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h2 className="mt-8 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight" {...props} />
    ),
    h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h3 className="mt-6 scroll-m-20 text-xl font-semibold tracking-tight" {...props} />
    ),
    h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h4 className="mt-6 scroll-m-20 text-lg font-semibold tracking-tight" {...props} />
    ),
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
        <p className="leading-7 [&:not(:first-child)]:mt-4" {...props} />
    ),
    a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a className="font-medium text-primary underline underline-offset-4" {...props} />
    ),
    ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
        <ul className="my-4 ml-6 list-disc [&>li]:mt-2" {...props} />
    ),
    ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
        <ol className="my-4 ml-6 list-decimal [&>li]:mt-2" {...props} />
    ),
    li: (props: React.HTMLAttributes<HTMLLIElement>) => (
        <li className="leading-7" {...props} />
    ),
    blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
        <blockquote className="mt-4 border-l-4 border-primary/30 pl-4 italic text-muted-foreground" {...props} />
    ),
    hr: () => <hr className="my-6 border-border" />,
    table: (props: React.HTMLAttributes<HTMLTableElement>) => (
        <div className="my-6 w-full overflow-auto">
            <table className="w-full border-collapse text-sm" {...props} />
        </div>
    ),
    th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
        <th className="border border-border bg-muted px-4 py-2 text-left font-semibold" {...props} />
    ),
    td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
        <td className="border border-border px-4 py-2" {...props} />
    ),
    pre: ({
        children,
        ...props
    }: React.HTMLAttributes<HTMLPreElement> & {
        "data-language"?: string
        raw?: string
    }) => {
        const raw =
            (props as Record<string, unknown>).raw as string | undefined
        return (
            <div className="group relative my-4">
                {raw && (
                    <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <CopyButton text={raw} />
                    </div>
                )}
                <pre
                    className="overflow-x-auto rounded-lg border bg-muted/50 p-4 text-sm leading-relaxed"
                    {...props}
                >
                    {children}
                </pre>
            </div>
        )
    },
    code: (props: React.HTMLAttributes<HTMLElement>) => {
        // Inline code (not inside pre)
        const isInline = typeof props.children === "string"
        if (isInline && !props.className) {
            return (
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" {...props} />
            )
        }
        return <code {...props} />
    },
    img: ({
        alt,
        src,
        ...props
    }: React.ImgHTMLAttributes<HTMLImageElement>) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            className="my-4 rounded-lg border"
            alt={alt ?? ""}
            src={src}
            loading="lazy"
            {...props}
        />
    ),
}

interface MdxContentProps {
    code: string
}

export function MdxContent({ code }: MdxContentProps) {
    const Component = useMDXComponent(code)
    return (
        <article className="prose-custom">
            <Component components={components} />
        </article>
    )
}
