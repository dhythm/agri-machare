'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export function SignOutButton({ className }: { className?: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      className={className ?? 'h-9 px-3'}
      onClick={() => void signOut({ redirectTo: '/' })}
    >
      ログアウト
    </Button>
  )
}
