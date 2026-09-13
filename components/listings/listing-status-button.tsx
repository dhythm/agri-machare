'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function ListingStatusButton({
  listingId,
  withdrawn,
}: {
  listingId: string
  withdrawn: boolean
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()

  const apply = async () => {
    setBusy(true)
    setError(undefined)
    try {
      const response = await fetch(`/api/listings/${listingId}/status`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: withdrawn ? 'listed' : 'withdrawn' }),
      })
      if (!response.ok) {
        const body = (await response.json()) as { error?: string }
        setError(body.error ?? '更新できませんでした。')
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
    <span className="inline-flex flex-wrap items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant={withdrawn ? 'outline' : 'destructive'}
        disabled={busy}
        onClick={() => void apply()}
      >
        {withdrawn ? '再掲載する' : '取り下げる'}
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </span>
  )
}
