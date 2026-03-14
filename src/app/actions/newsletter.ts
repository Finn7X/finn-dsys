"use server"

import zhMessages from "../../../messages/zh.json"
import enMessages from "../../../messages/en.json"

interface SubscribeResult {
    success: boolean
    message: string
}

export async function subscribeToNewsletter(
    formData: FormData
): Promise<SubscribeResult> {
    const email = formData.get("email") as string
    const locale = (formData.get("locale") as string) || "zh"

    const messages = locale === "en" ? enMessages : zhMessages
    const t = messages.newsletter

    if (!email || !email.includes("@")) {
        return {
            success: false,
            message: t.errorInvalidEmail,
        }
    }

    const honeypot = formData.get("_gotcha") as string
    if (honeypot) {
        return {
            success: true,
            message: t.successSubscribed,
        }
    }

    const apiKey = process.env.BUTTONDOWN_API_KEY
    if (!apiKey) {
        console.error("BUTTONDOWN_API_KEY is not configured")
        return {
            success: false,
            message: t.errorUnavailable,
        }
    }

    try {
        const response = await fetch(
            "https://api.buttondown.com/v1/subscribers",
            {
                method: "POST",
                headers: {
                    Authorization: `Token ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email_address: email,
                    type: "regular",
                }),
            }
        )

        if (response.ok) {
            return {
                success: true,
                message: t.successSubscribed,
            }
        }

        if (response.status === 409) {
            return {
                success: true,
                message: t.alreadySubscribed,
            }
        }

        const errorData = await response.json().catch(() => null)
        console.error("Buttondown API error:", response.status, errorData)

        return {
            success: false,
            message: t.errorFailed,
        }
    } catch (error) {
        console.error("Newsletter subscription error:", error)
        return {
            success: false,
            message: t.errorNetwork,
        }
    }
}
