import { cn } from "@/lib/utils"
import {
    Info,
    AlertTriangle,
    CheckCircle,
    XCircle,
    type LucideIcon,
} from "lucide-react"

type CalloutType = "info" | "warning" | "success" | "error"

interface CalloutProps {
    type?: CalloutType
    title?: string
    children: React.ReactNode
}

const calloutConfig: Record<
    CalloutType,
    { icon: LucideIcon; className: string }
> = {
    info: {
        icon: Info,
        className:
            "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-100",
    },
    warning: {
        icon: AlertTriangle,
        className:
            "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-100",
    },
    success: {
        icon: CheckCircle,
        className:
            "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950/50 dark:text-green-100",
    },
    error: {
        icon: XCircle,
        className:
            "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-100",
    },
}

export function Callout({ type = "info", title, children }: CalloutProps) {
    const config = calloutConfig[type]
    const Icon = config.icon

    return (
        <div
            className={cn(
                "my-6 flex gap-3 rounded-lg border p-4",
                config.className,
            )}
            role="note"
        >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0">
                {title && <p className="mb-1 font-semibold">{title}</p>}
                <div className="text-sm [&>p]:m-0">{children}</div>
            </div>
        </div>
    )
}
