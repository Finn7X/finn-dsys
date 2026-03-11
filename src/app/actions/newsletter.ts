"use server"

interface SubscribeResult {
    success: boolean
    message: string
}

export async function subscribeToNewsletter(
    formData: FormData
): Promise<SubscribeResult> {
    const email = formData.get("email") as string

    if (!email || !email.includes("@")) {
        return {
            success: false,
            message: "请输入有效的邮箱地址",
        }
    }

    const honeypot = formData.get("_gotcha") as string
    if (honeypot) {
        return {
            success: true,
            message: "订阅成功！请检查邮箱确认订阅。",
        }
    }

    const apiKey = process.env.BUTTONDOWN_API_KEY
    if (!apiKey) {
        console.error("BUTTONDOWN_API_KEY is not configured")
        return {
            success: false,
            message: "订阅服务暂时不可用，请稍后再试",
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
                message: "订阅成功！请检查邮箱确认订阅。",
            }
        }

        if (response.status === 409) {
            return {
                success: true,
                message: "该邮箱已订阅，感谢你的关注！",
            }
        }

        const errorData = await response.json().catch(() => null)
        console.error("Buttondown API error:", response.status, errorData)

        return {
            success: false,
            message: "订阅失败，请稍后再试",
        }
    } catch (error) {
        console.error("Newsletter subscription error:", error)
        return {
            success: false,
            message: "网络错误，请检查网络连接后重试",
        }
    }
}
