'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/badge'
import { FormAlert, TextField } from '@/components/forms/fields'
import { Button } from '@/components/ui/button'
import { ListingStatusButton } from '@/components/listings/listing-status-button'
import {
  formatYen,
  type ModerationQueue,
  type ModerationQueueFilter,
} from '@/lib/data'

const filters: { id: ModerationQueueFilter; label: string }[] = [
  { id: 'all', label: 'すべて' },
  { id: 'pending', label: '審査待ち' },
  { id: 'approved', label: '承認済み' },
  { id: 'rejected', label: '却下済み' },
]

/** Pending rows first so review work is on top of the full list. */
function pendingFirst<T extends { moderationStatus?: string }>(
  items: T[],
): T[] {
  return [...items].sort(
    (a, b) =>
      Number(b.moderationStatus === 'pending') -
      Number(a.moderationStatus === 'pending'),
  )
}

export function AdminQueue({
  kind,
  initialQueue,
}: {
  kind: 'listing' | 'transportJob'
  initialQueue: ModerationQueue
}) {
  const [status, setStatus] = useState<ModerationQueueFilter>('all')
  const [queue, setQueue] = useState(initialQueue)
  const [error, setError] = useState<string>()
  const [pendingId, setPendingId] = useState<string>()

  const load = async (nextStatus: ModerationQueueFilter) => {
    setStatus(nextStatus)
    setError(undefined)
    const response = await fetch(`/api/admin/queue?status=${nextStatus}`)
    if (!response.ok) {
      setError('一覧を更新できませんでした。')
      return
    }
    setQueue((await response.json()) as ModerationQueue)
  }

  const decide = async (
    kind: 'listing' | 'transportJob',
    id: string,
    decision: 'approved' | 'rejected',
    note: string,
  ) => {
    setPendingId(id)
    setError(undefined)
    try {
      const response = await fetch('/api/admin/queue', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind,
          id,
          status: decision,
          note: note || undefined,
        }),
      })
      if (!response.ok) {
        setError('判定を保存できませんでした。')
        return
      }
      await load(status)
    } catch {
      setError('判定を保存できませんでした。')
    } finally {
      setPendingId(undefined)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <FormAlert error={error} />
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.id}
            type="button"
            size="sm"
            variant={status === filter.id ? 'default' : 'outline'}
            aria-pressed={status === filter.id}
            onClick={() => void load(filter.id)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {kind === 'listing' && (
        <QueueSection
          title="出品"
          empty="該当なし"
          pendingId={pendingId}
          items={pendingFirst(queue.listings).map((listing) => ({
            id: listing.id,
            image: listing.image,
            withdrawn: listing.withdrawnAt !== undefined,
            title: listing.name,
            meta: `${listing.prefecture} ${listing.city}・${listing.seller.name}`,
            status: listing.moderationStatus ?? 'approved',
            note: listing.moderationNote,
          }))}
          onDecide={(id, decision, note) =>
            decide('listing', id, decision, note)
          }
        />
      )}

      {kind === 'transportJob' && (
        <QueueSection
          title="運搬依頼"
          empty="該当なし"
          pendingId={pendingId}
          items={pendingFirst(queue.transportJobs).map((job) => ({
            id: job.id,
            title: job.item,
            meta: `${job.from} → ${job.to}・${formatYen(job.reward)}・${job.status}`,
            status: job.moderationStatus ?? 'approved',
            note: job.moderationNote,
          }))}
          onDecide={(id, decision, note) =>
            decide('transportJob', id, decision, note)
          }
        />
      )}
    </div>
  )
}

function QueueSection({
  title,
  empty,
  items,
  pendingId,
  onDecide,
}: {
  title: string
  empty: string
  items: {
    id: string
    image?: string
    withdrawn?: boolean
    title: string
    meta: string
    status: string
    note?: string
  }[]
  pendingId?: string
  onDecide: (
    id: string,
    decision: 'approved' | 'rejected',
    note: string,
  ) => Promise<void>
}) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">
          {title}
        </h2>
        <span className="text-sm text-muted-foreground">{items.length}件</span>
      </div>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-4">
          {items.map((item) => (
            <QueueItem
              key={item.id}
              item={item}
              busy={pendingId === item.id}
              onDecide={onDecide}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

function QueueItem({
  item,
  busy,
  onDecide,
}: {
  item: {
    id: string
    image?: string
    withdrawn?: boolean
    title: string
    meta: string
    status: string
    note?: string
  }
  busy: boolean
  onDecide: (
    id: string,
    decision: 'approved' | 'rejected',
    note: string,
  ) => Promise<void>
}) {
  const [note, setNote] = useState(item.note ?? '')
  const statusLabel =
    item.status === 'pending'
      ? '審査待ち'
      : item.status === 'rejected'
        ? '却下'
        : '承認済み'

  return (
    <li className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {item.image && (
            <span className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
              <Image
                src={item.image}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </span>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-foreground">{item.title}</h3>
              <Badge variant={item.status === 'pending' ? 'default' : 'muted'}>
                {statusLabel}
              </Badge>
              {item.withdrawn && <Badge>取り下げ中</Badge>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{item.meta}</p>
          </div>
        </div>
        <code className="text-xs text-muted-foreground">{item.id}</code>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <TextField
          id={`note-${item.id}`}
          label="メモ"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="flex-1"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            disabled={busy}
            onClick={() => void onDecide(item.id, 'approved', note)}
          >
            承認
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={busy}
            onClick={() => void onDecide(item.id, 'rejected', note)}
          >
            却下
          </Button>
          {item.withdrawn !== undefined && (
            <ListingStatusButton
              listingId={item.id}
              withdrawn={item.withdrawn}
            />
          )}
        </div>
      </div>
    </li>
  )
}
