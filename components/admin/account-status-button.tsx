'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function AccountStatusButton({
  userId,
  status,
  self = false,
}: {
  userId: string
  status: 'active' | 'suspended'
  self?: boolean
}) {
  const router = useRouter()
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()

  const apply = async () => {
    setBusy(true)
    setError(undefined)
    try {
      const body =
        status === 'active'
          ? { status: 'suspended', note: note || undefined }
          : { status: 'active' }
      const response = await fetch(`/api/admin/accounts/${userId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        setError(payload.error ?? '更新できませんでした。')
        return
      }
      router.refresh()
    } catch {
      setError('更新できませんでした。')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-w-56 flex-wrap items-center gap-2">
      {status === 'active' && (
        <label className="flex items-center">
          <span className="sr-only">メモ</span>
          <input
            id={`note-${userId}`}
            value={note}
            placeholder="停止理由"
            onChange={(event) => setNote(event.target.value)}
            className="h-10 w-36 rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </label>
      )}
      <Button
        type="button"
        size="sm"
        variant={status === 'active' ? 'destructive' : 'outline'}
        disabled={busy || self}
        className="min-h-10 px-3"
        onClick={() => void apply()}
      >
        {status === 'active' ? '停止する' : '停止を解除'}
      </Button>
      {error && (
        <span role="alert" className="w-full text-xs text-destructive">
          {error}
        </span>
      )}
    </div>
  )
}
