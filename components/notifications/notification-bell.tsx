'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

async function fetchUnreadCount(): Promise<number> {
  const response = await fetch('/api/notifications')
  if (!response.ok) throw new Error('通知を取得できませんでした。')
  return ((await response.json()) as { unreadCount: number }).unreadCount
}

export function NotificationBell() {
  const { data: unread } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: fetchUnreadCount,
    refetchInterval: 60_000,
    staleTime: 30_000,
  })
  const count = unread ?? 0
  return (
    <Link
      href="/account/notifications"
      aria-label={count > 0 ? `通知 ${count}件` : '通知'}
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'icon-lg' }),
        'relative',
      )}
    >
      <Bell className="size-4" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
