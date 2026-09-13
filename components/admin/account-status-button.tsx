'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TextField } from '@/components/forms/fields'
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
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      {status === 'active' && (
        <TextField
          id={`note-${userId}`}
          label="メモ"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="sm:w-48"
        />
      )}
      <Button
        type="button"
        size="sm"
        variant={status === 'active' ? 'destructive' : 'outline'}
        disabled={busy || self}
        onClick={() => void apply()}
      >
        {status === 'active' ? '停止する' : '停止を解除'}
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
}
