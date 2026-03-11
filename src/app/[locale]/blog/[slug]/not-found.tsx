import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
    const t = useTranslations("blog")

    return (
        <div className="container mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-20 text-center">
            <FileQuestion className="mb-4 h-16 w-16 text-muted-foreground" />
            <h1 className="mb-2 text-2xl font-bold">{t("notFound")}</h1>
            <p className="mb-6 text-muted-foreground">
                {t("notFoundDescription")}
            </p>
            <Button asChild>
                <Link href="/blog">{t("backToList")}</Link>
            </Button>
        </div>
    )
}
