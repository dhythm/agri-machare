import Link from 'next/link'
import { LogIn } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export function LoginPrompt({
  action,
  callbackUrl,
}: {
  action: string
  callbackUrl: string
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-8">
      <p className="text-sm text-foreground">
        {action}にはログインが必要です。
      </p>
      <Link
        href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
        className={`${buttonVariants()} mt-4`}
      >
        <LogIn className="size-4" />
        ログイン
      </Link>
    </div>
  )
}
