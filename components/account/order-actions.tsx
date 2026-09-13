'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { OrderStatus } from '@/lib/data'

type Action = { status: OrderStatus; label: string; destructive?: boolean }

function actionsFor(status: OrderStatus, party: 'buyer' | 'seller'): Action[] {
  if (party === 'seller') {
    if (status === 'requested')
      return [
        { status: 'accepted', label: '承諾する' },
        { status: 'cancelled', label: '辞退する', destructive: true },
      ]
    if (status === 'accepted')
      return [{ status: 'delivered', label: '引き渡し済みにする' }]
    return []
  }
  if (status === 'requested')
    return [{ status: 'cancelled', label: 'キャンセル', destructive: true }]
  if (status === 'delivered')
    return [{ status: 'completed', label: '受け取りを確認' }]
  return []
}

export function OrderActions({
  orderId,
  status,
  party,
}: {
  orderId: string
  status: OrderStatus
  party: 'buyer' | 'seller'
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const actions = actionsFor(status, party)
  if (actions.length === 0) return null

  const apply = async (next: OrderStatus) => {
    setBusy(true)
    setError(undefined)
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: next }),
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
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((action) => (
        <Button
          key={action.status}
          type="button"
          size="sm"
          variant={action.destructive ? 'destructive' : 'outline'}
          disabled={busy}
          onClick={() => void apply(action.status)}
        >
          {action.label}
        </Button>
      ))}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
}
