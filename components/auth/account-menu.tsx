'use client'

import Link from 'next/link'
import { UserRound, ChevronDown } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { SignOutButton } from './sign-out-button'

const linkClass =
  'block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted'

export function AccountMenu() {
  const { data: session, status } = useSession()
  if (status === 'loading') return null
  if (!session?.user)
    return (
      <Link
        href="/login"
        className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap text-xs font-bold sm:text-sm"
      >
        <UserRound className="size-4" />
        ログイン
      </Link>
    )
  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      <NotificationBell />
      <details
        className="group relative"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.currentTarget.open = false
            event.currentTarget.querySelector('summary')?.focus()
          }
        }}
      >
        <summary
          aria-label="アカウント"
          className="flex h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-border px-3 text-xs font-bold marker:hidden hover:bg-muted [&::-webkit-details-marker]:hidden"
        >
          <UserRound className="size-4" />
          <span className="sr-only sm:not-sr-only">アカウント</span>
          <ChevronDown className="size-3 transition-transform group-open:rotate-180" />
        </summary>
        <div className="absolute right-0 top-14 z-50 w-60 rounded-xl border border-border bg-card p-2 shadow-xl">
          <p className="mb-2 border-b border-border px-3 py-3 text-sm font-bold">
            {session.user.name}
          </p>
          <Link href="/account" className={linkClass}>
            マイページ
          </Link>
          <Link href="/account/notifications" className={linkClass}>
            お知らせ
          </Link>
          {session.user.role === 'admin' && (
            <Link href="/admin" className={linkClass}>
              運営画面
            </Link>
          )}
          <div className="mt-2 border-t border-border pt-2">
            <SignOutButton className="w-full justify-start px-3" />
          </div>
        </div>
      </details>
    </div>
  )
}
