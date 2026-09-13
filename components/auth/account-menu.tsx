'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SignOutButton } from './sign-out-button'

const linkClass = cn(buttonVariants({ variant: 'ghost' }), 'h-9 px-3')

export function AccountMenu() {
  const { data: session, status } = useSession()
  if (status === 'loading') return null
  if (!session?.user) {
    return (
      <Link href="/login" className={linkClass}>
        ログイン
      </Link>
    )
  }
  return (
    <div className="flex items-center gap-2">
      {session.user.role === 'admin' && (
        <Link href="/admin" className={linkClass}>
          運営審査
        </Link>
      )}
      <span className="hidden text-sm text-muted-foreground sm:inline">
        {session.user.name}
      </span>
      <SignOutButton />
    </div>
  )
}
