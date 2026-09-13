'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/badge'
import { Button } from '@/components/ui/button'
import type { Notification } from '@/lib/server/store/types'
import { cn } from '@/lib/utils'

function when(iso: string): string {
  return new Date(iso).toLocaleString('ja-JP')
}

export function NotificationList({ items }: { items: Notification[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()

  const open = async (notification: Notification) => {
    setError(undefined)
    try {
      if (!notification.readAt)
        await fetch(`/api/notifications/${notification.id}`, {
          method: 'PATCH',
        })
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
      router.refresh()
    } catch {
      setError('更新できませんでした。')
    } finally {
      setBusy(false)
    }
  }

  if (items.length === 0)
    return <p className="text-sm text-muted-foreground">通知はまだありません</p>

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-3">
        {error && <span className="text-xs text-destructive">{error}</span>}
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy || items.every((item) => item.readAt)}
          onClick={() => void readAll()}
        >
          すべて既読にする
        </Button>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((notification) => (
          <li key={notification.id}>
            <button
              type="button"
              onClick={() => void open(notification)}
              className={cn(
                'flex w-full flex-col gap-1 rounded-2xl border p-4 text-left transition-colors hover:border-primary/40',
                notification.readAt
                  ? 'border-border bg-card'
                  : 'border-primary/30 bg-primary/5',
              )}
            >
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-foreground">
                  {notification.title}
                </span>
                {!notification.readAt && <Badge>未読</Badge>}
                <span className="text-xs text-muted-foreground">
                  {when(notification.createdAt)}
                </span>
              </span>
              {notification.body && (
                <span className="text-sm text-muted-foreground">
                  {notification.body}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
