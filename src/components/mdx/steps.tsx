import { cn } from "@/lib/utils"

interface StepsProps {
    children: React.ReactNode
    className?: string
}

interface StepProps {
    title: string
    children: React.ReactNode
    className?: string
}

export function Steps({ children, className }: StepsProps) {
    return (
        <div
            className={cn(
                "steps-container my-6 ml-4 border-l-2 border-border pl-6",
                className,
            )}
        >
            {children}
        </div>
    )
}

export function Step({ title, children, className }: StepProps) {
    return (
        <div className={cn("relative pb-8 last:pb-0", className)}>
            {/* Step number circle */}
            <div className="absolute -left-[calc(1.5rem+1px+0.625rem)] flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-background text-xs font-bold text-primary">
                <span className="step-counter" />
            </div>
            {/* Title */}
            <h4 className="mb-2 font-semibold leading-none tracking-tight">
                {title}
            </h4>
            {/* Content */}
            <div className="text-sm text-muted-foreground [&>p]:mt-2">
                {children}
            </div>
        </div>
    )
}
