import type { ReactNode } from 'react'
import Link from 'next/link'
import { ExternalLink, Sprout } from 'lucide-react'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { AdminNav } from './admin-nav'

export function AdminShell({
  user,
  children,
}: {
  user: { name: string }
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <aside className="flex flex-col gap-4 border-b border-sidebar-border bg-sidebar px-4 py-4 text-sidebar-foreground md:w-60 md:shrink-0 md:border-b-0 md:border-r md:px-4 md:py-6">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Sprout className="size-4" />
          </span>
          <span className="font-display text-base font-bold tracking-tight">
            ノウキシェア 運営
          </span>
        </Link>
        <AdminNav />
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-border px-4 sm:px-6">
          <Link
            href="/"
            className="mr-auto flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="size-4" />
            サイトを表示
          </Link>
          <span className="text-sm text-muted-foreground">{user.name}</span>
          <SignOutButton />
        </header>
        <main className="flex-1 px-4 py-8 sm:px-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
