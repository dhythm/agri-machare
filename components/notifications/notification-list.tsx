'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowUpRight, Bell, CheckCheck } from 'lucide-react'
import { Badge } from '@/components/badge'
import { Button } from '@/components/ui/button'
import type { Notification } from '@/lib/server/store/types'
import { cn } from '@/lib/utils'

function when(iso: string): string {
  return new Date(iso).toLocaleString('ja-JP')
}

export function NotificationList({ items }: { items: Notification[] }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [busy, setBusy] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const unreadCount = items.filter((item) => !item.readAt).length
  const visibleItems =
    filter === 'unread' ? items.filter((item) => !item.readAt) : items
  const [error, setError] = useState<string>()

  const open = async (notification: Notification) => {
    setError(undefined)
    try {
      if (!notification.readAt) {
        const response = await fetch(`/api/notifications/${notification.id}`, {
          method: 'PATCH',
        })
        if (response.ok)
          void queryClient.invalidateQueries({
            queryKey: ['notifications', 'unread-count'],
          })
      }
    } catch {
      // Opening the link matters more than the read mark.
    }
    router.push(notification.href)
  }

  const readAll = async () => {
    setBusy(true)
    setError(undefined)
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
      })
      if (!response.ok) {
        setError('更新できませんでした。')
        return
      }
      void queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      })
      router.refresh()
    } catch {
      setError('更新できませんでした。')
    } finally {
      setBusy(false)
    }
  }

  if (items.length === 0)
    return (
      <div className="flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary/5 text-primary">
          <Bell className="size-6" aria-hidden="true" />
        </span>
        <p className="mt-5 text-sm font-medium text-muted-foreground">
          通知はまだありません
        </p>
      </div>
    )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="通知の表示"
          className="flex rounded-xl border border-border bg-card p-1"
        >
          <Button
            type="button"
            variant={filter === 'all' ? 'secondary' : 'ghost'}
            aria-pressed={filter === 'all'}
            className="h-9 gap-2 px-3"
            onClick={() => setFilter('all')}
          >
            すべて <span className="text-xs tabular-nums">{items.length}</span>
          </Button>
          <Button
            type="button"
            variant={filter === 'unread' ? 'secondary' : 'ghost'}
            aria-pressed={filter === 'unread'}
            className="h-9 gap-2 px-3"
            onClick={() => setFilter('unread')}
          >
            未読のみ <span className="text-xs tabular-nums">{unreadCount}</span>
          </Button>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="min-h-9 text-primary"
          disabled={busy || unreadCount === 0}
          onClick={() => void readAll()}
        >
          <CheckCheck className="size-4" aria-hidden="true" />
          すべて既読にする
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {visibleItems.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          未読の通知はありません
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-border bg-card divide-y divide-border">
          {visibleItems.map((notification) => (
            <li key={notification.id}>
              <button
                type="button"
                onClick={() => void open(notification)}
                className={cn(
                  'group flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:p-6',
                  !notification.readAt && 'bg-primary/[0.025]',
                )}
              >
                <span
                  className={cn(
                    'hidden size-10 shrink-0 items-center justify-center rounded-full sm:flex',
                    notification.readAt
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-primary/10 text-primary',
                  )}
                >
                  <Bell className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold leading-relaxed text-foreground">
                      {notification.title}
                    </span>
                    {!notification.readAt && <Badge>未読</Badge>}
                  </span>
                  {notification.body && (
                    <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                      {notification.body}
                    </span>
                  )}
                  <time
                    dateTime={notification.createdAt}
                    className="mt-3 block text-xs text-muted-foreground"
                  >
                    {when(notification.createdAt)}
                  </time>
                </span>
                <ArrowUpRight
                  className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
