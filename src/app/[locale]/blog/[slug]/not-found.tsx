import { Link } from "@/i18n/routing"
import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
    return (
        <div className="container mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-20 text-center">
            <FileQuestion className="mb-4 h-16 w-16 text-muted-foreground" />
            <h1 className="mb-2 text-2xl font-bold">文章未找到</h1>
            <p className="mb-6 text-muted-foreground">
                你访问的文章不存在或已被删除
            </p>
            <Button asChild>
                <Link href="/blog">返回博客列表</Link>
            </Button>
        </div>
    )
}
