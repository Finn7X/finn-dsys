"use client"

import { useActionState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { subscribeToNewsletter } from "@/app/actions/newsletter"
import { trackNewsletterSubscribe } from "@/lib/analytics"

interface NewsletterProps {
    variant?: "inline" | "hero"
}

export function Newsletter({ variant = "inline" }: NewsletterProps) {
    const [state, formAction, isPending] = useActionState(
        async (_prevState: { success: boolean; message: string } | null, formData: FormData) => {
            const result = await subscribeToNewsletter(formData)
            if (result.success) {
                trackNewsletterSubscribe(variant)
            }
            return result
        },
        null
    )
    const locale = useLocale()
    const t = useTranslations("newsletter")

    if (variant === "hero") {
        return (
            <div className="w-full max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-2 text-center">
                    {t("title")}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                    {t("heroDescription")}
                </p>

                <form action={formAction} className="flex gap-2">
                    <input type="hidden" name="locale" value={locale} />
                    <input
                        type="text"
                        name="_gotcha"
                        className="hidden"
                        tabIndex={-1}
                        autoComplete="off"
                    />

                    <Input
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        required
                        disabled={isPending}
                        className="flex-1"
                        aria-label={t("emailLabel")}
                    />
                    <Button type="submit" disabled={isPending} className="gap-2">
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Mail className="h-4 w-4" />
                        )}
                        {t("subscribe")}
                    </Button>
                </form>

                {state && (
                    <div
                        className={`mt-3 flex items-center gap-2 text-sm ${
                            state.success ? "text-green-600" : "text-red-600"
                        }`}
                    >
                        {state.success ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                        ) : (
                            <AlertCircle className="h-4 w-4 shrink-0" />
                        )}
                        <span>{state.message}</span>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="mt-12 pt-8 border-t">
            <div className="rounded-xl border bg-card p-6">
                <div className="flex items-start gap-3 mb-4">
                    <div className="rounded-full bg-primary p-2">
                        <Mail className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">{t("title")}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t("inlineDescription")}
                        </p>
                    </div>
                </div>

                <form action={formAction} className="flex flex-col sm:flex-row gap-2">
                    <input type="hidden" name="locale" value={locale} />
                    <input
                        type="text"
                        name="_gotcha"
                        className="hidden"
                        tabIndex={-1}
                        autoComplete="off"
                    />

                    <Input
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        required
                        disabled={isPending}
                        className="flex-1"
                        aria-label={t("emailLabel")}
                    />
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="gap-2 bg-primary text-primary-foreground rounded-full"
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Mail className="h-4 w-4" />
                        )}
                        {t("subscribe")}
                    </Button>
                </form>

                {state && (
                    <div
                        className={`mt-3 flex items-center gap-2 text-sm ${
                            state.success ? "text-green-600" : "text-red-600"
                        }`}
                    >
                        {state.success ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                        ) : (
                            <AlertCircle className="h-4 w-4 shrink-0" />
                        )}
                        <span>{state.message}</span>
                    </div>
                )}

                <p className="mt-4 text-xs text-muted-foreground">
                    {t("privacy")}
                </p>
            </div>
        </div>
    )
}
