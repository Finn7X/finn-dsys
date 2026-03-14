"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"

const emptySubscribe = () => () => {}

export function ThemeToggle() {
    const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)
    const { theme, setTheme } = useTheme()

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Toggle theme">
                <Sun className="h-4 w-4" />
            </Button>
        )
    }

    const cycleTheme = () => {
        if (theme === "light") setTheme("dark")
        else if (theme === "dark") setTheme("system")
        else setTheme("light")
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={cycleTheme}
            aria-label="Toggle theme"
        >
            {theme === "light" && <Sun className="h-4 w-4" />}
            {theme === "dark" && <Moon className="h-4 w-4" />}
            {theme === "system" && <Monitor className="h-4 w-4" />}
        </Button>
    )
}
