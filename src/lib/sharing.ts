export interface ShareData {
    title: string
    url: string
    description?: string
}

export function getTwitterShareUrl(data: ShareData): string {
    const params = new URLSearchParams({
        text: data.title,
        url: data.url,
    })
    return `https://twitter.com/intent/tweet?${params.toString()}`
}

export function getLinkedInShareUrl(data: ShareData): string {
    const params = new URLSearchParams({
        url: data.url,
    })
    return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`
}

export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch {
        try {
            const textarea = document.createElement("textarea")
            textarea.value = text
            textarea.style.position = "fixed"
            textarea.style.opacity = "0"
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand("copy")
            document.body.removeChild(textarea)
            return true
        } catch {
            return false
        }
    }
}

export function canNativeShare(): boolean {
    return typeof navigator !== "undefined" && !!navigator.share
}

export async function nativeShare(data: ShareData): Promise<boolean> {
    if (!canNativeShare()) return false

    try {
        await navigator.share({
            title: data.title,
            text: data.description || data.title,
            url: data.url,
        })
        return true
    } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
            return false
        }
        return false
    }
}
