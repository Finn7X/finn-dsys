"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextType {
    activeTab: string
    setActiveTab: (value: string) => void
}

const TabsContext = React.createContext<TabsContextType | null>(null)

function useTabs() {
    const context = React.useContext(TabsContext)
    if (!context) throw new Error("Tabs components must be used within <Tabs>")
    return context
}

export function Tabs({
    defaultValue = "",
    children,
    className,
}: {
    defaultValue?: string
    children: React.ReactNode
    className?: string
}) {
    const [activeTab, setActiveTab] = React.useState(defaultValue)

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={cn("my-6", className)}>{children}</div>
        </TabsContext.Provider>
    )
}

export function TabsList({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <div
            className={cn(
                "flex gap-1 rounded-lg border bg-muted/50 p-1",
                className,
            )}
            role="tablist"
        >
            {children}
        </div>
    )
}

export function TabsTrigger({
    value,
    children,
    className,
}: {
    value: string
    children: React.ReactNode
    className?: string
}) {
    const { activeTab, setActiveTab } = useTabs()
    const isActive = activeTab === value

    return (
        <button
            role="tab"
            aria-selected={isActive}
            onClick={() => setActiveTab(value)}
            className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                className,
            )}
        >
            {children}
        </button>
    )
}

export function TabsContent({
    value,
    children,
    className,
}: {
    value: string
    children: React.ReactNode
    className?: string
}) {
    const { activeTab } = useTabs()

    if (activeTab !== value) return null

    return (
        <div role="tabpanel" className={cn("mt-2", className)}>
            {children}
        </div>
    )
}
