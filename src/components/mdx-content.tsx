"use client"

import * as runtime from "react/jsx-runtime"
import { Children, cloneElement, isValidElement, useMemo } from "react"
import { CodeBlock } from "./mdx/code-block"
import { mdxComponents } from "./mdx"

function extractText(node: React.ReactNode): string {
    if (typeof node === "string") return node
    if (typeof node === "number") return String(node)
    if (!node) return ""
    if (isValidElement(node)) {
        return extractText((node.props as { children?: React.ReactNode }).children)
    }
    if (Array.isArray(node)) return node.map(extractText).join("")
    return Children.toArray(node).map(extractText).join("")
}

function useMDXComponent(code: string) {
    return useMemo(() => {
        const fn = new Function(code)
        return fn({ ...runtime }).default
    }, [code])
}

const components = {
    h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h1 className="font-heading mt-16 scroll-m-20 text-3xl font-medium" {...props} />
    ),
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h2 className="font-heading mt-16 mb-4 scroll-m-20 text-2xl font-medium" {...props} />
    ),
    h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h3 className="mt-12 scroll-m-20 text-xl font-semibold" {...props} />
    ),
    h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h4 className="mt-8 scroll-m-20 text-lg font-semibold" {...props} />
    ),
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
        <p className="leading-[1.8] [&:not(:first-child)]:mt-6" {...props} />
    ),
    a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a className="text-accent underline underline-offset-3 decoration-accent/40 hover:decoration-accent" {...props} />
    ),
    ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
        <ul className="my-4 ml-6 list-disc [&>li]:mt-2" {...props} />
    ),
    ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
        <ol className="my-4 ml-6 list-decimal [&>li]:mt-2" {...props} />
    ),
    li: (props: React.HTMLAttributes<HTMLLIElement>) => (
        <li className="leading-[1.8]" {...props} />
    ),
    blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
        <blockquote className="mt-6 border-l-2 border-border pl-6 italic text-muted-foreground" {...props} />
    ),
    figure: ({
        children,
        ...props
    }: React.HTMLAttributes<HTMLElement>) => {
        // Handle rehype-pretty-code figures: extract title from figcaption, pass to CodeBlock
        if (
            "data-rehype-pretty-code-figure" in
            (props as Record<string, unknown>)
        ) {
            let title: string | undefined
            const processedChildren = Children.toArray(children)
                .filter((child) => {
                    if (isValidElement(child)) {
                        const cp = child.props as Record<string, unknown>
                        if ("data-rehype-pretty-code-title" in cp) {
                            title = extractText(
                                cp.children as React.ReactNode,
                            )
                            return false
                        }
                    }
                    return true
                })
                .map((child) =>
                    title && isValidElement(child)
                        ? cloneElement(
                              child as React.ReactElement<
                                  Record<string, unknown>
                              >,
                              { "data-filename": title },
                          )
                        : child,
                )
            return <figure {...props}>{processedChildren}</figure>
        }
        return <figure {...props}>{children}</figure>
    },
    hr: () => <hr className="my-12 border-border" />,
    table: (props: React.HTMLAttributes<HTMLTableElement>) => (
        <div className="my-6 w-full overflow-auto">
            <table className="w-full border-collapse text-sm" {...props} />
        </div>
    ),
    th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
        <th className="border border-border bg-secondary px-4 py-2 text-left font-semibold" {...props} />
    ),
    td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
        <td className="border border-border px-4 py-2" {...props} />
    ),
    pre: ({
        children,
        ...props
    }: React.HTMLAttributes<HTMLPreElement> & {
        "data-language"?: string
        "data-filename"?: string
    }) => {
        const codeText = extractText(children)
        return (
            <CodeBlock raw={codeText} {...props}>
                {children}
            </CodeBlock>
        )
    },
    code: (props: React.HTMLAttributes<HTMLElement>) => {
        // Inline code (not inside pre)
        const isInline = typeof props.children === "string"
        if (isInline && !props.className) {
            return (
                <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-sm" {...props} />
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
            className="my-8 rounded-lg"
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
    const render = useMDXComponent(code)
    return (
        <article className="prose-custom">
            {render({ components: { ...components, ...mdxComponents } })}
        </article>
    )
}
