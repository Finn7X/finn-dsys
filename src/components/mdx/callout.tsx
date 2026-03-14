import { cn } from "@/lib/utils"

type CalloutType = "info" | "warning" | "success" | "error"

interface CalloutProps {
    type?: CalloutType
    title?: string
    children: React.ReactNode
}

const calloutConfig: Record<
    CalloutType,
    { className: string; label?: string }
> = {
    info: {
        className: "border-border bg-secondary",
    },
    warning: {
        className:
            "border-[hsl(35,80%,50%)] bg-[hsl(35,40%,95%)] dark:border-[hsl(35,60%,60%)] dark:bg-[hsl(35,20%,12%)]",
        label: "Warning",
    },
    success: {
        className: "border-border bg-secondary",
    },
    error: {
        className:
            "border-[hsl(0,70%,55%)] bg-[hsl(0,40%,96%)] dark:border-[hsl(0,55%,60%)] dark:bg-[hsl(0,20%,12%)]",
        label: "Danger",
    },
}

export function Callout({ type = "info", title, children }: CalloutProps) {
    const config = calloutConfig[type]

    return (
        <div
            className={cn(
                "my-8 rounded-lg border-l-[3px] p-4",
                config.className,
            )}
            role="note"
        >
            {(title || config.label) && (
                <p className="mb-1 text-sm font-bold">{title || config.label}</p>
            )}
            <div className="text-sm [&>p]:m-0">{children}</div>
        </div>
    )
}
