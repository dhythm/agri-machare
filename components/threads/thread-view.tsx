'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/badge'
import { FormAlert, TextareaField } from '@/components/forms/fields'
import { SubmitButton } from '@/components/forms/submit-button'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  formatYen,
  threadStatusLabels,
  threadStatuses,
  type ThreadStatus,
} from '@/lib/data'
import type { Thread } from '@/lib/server/threads'
import { validateMessage } from '@/lib/validation/thread'
import { cn } from '@/lib/utils'

const inquiryModeLabels: Record<string, string> = {
  buy: '購入したい',
  rent: 'レンタルしたい',
  rentToOwn: 'レンタル購入したい',
  question: '質問',
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function when(iso: string): string {
  return new Date(iso).toLocaleString('ja-JP')
}

function TargetCard({ target }: { target: Thread['target'] }) {
  if (!target)
    return (
      <p className="text-sm text-muted-foreground">
        対象の農機具・案件は削除されました。
      </p>
    )
  if (target.kind === 'listing') {
    const { listing } = target
    return (
      <div className="rounded-2xl border border-border bg-card p-4 text-sm">
        <p className="text-xs text-muted-foreground">
          {listing.maker} · {listing.category}
        </p>
        <Link
          href={`/listings/${listing.id}`}
          className="font-medium text-foreground hover:underline"
        >
          {listing.name}
        </Link>
        <p className="mt-1 text-muted-foreground">
          {listing.rentPerDay && `${formatYen(listing.rentPerDay)}/日`}
          {listing.rentPerDay && listing.salePrice && ' · '}
          {listing.salePrice && `販売 ${formatYen(listing.salePrice)}`}
        </p>
      </div>
    )
  }
  const { job } = target
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-sm">
      <div className="flex items-center gap-2">
        <Link
          href={`/transport/${job.id}`}
          className="font-medium text-foreground hover:underline"
        >
          {job.item}
        </Link>
        <Badge variant="muted">{job.status}</Badge>
      </div>
      <p className="mt-1 text-muted-foreground">
        {job.from} → {job.to}・{formatYen(job.reward)}
      </p>
    </div>
  )
}

function OpeningMessage({ thread }: { thread: Thread }) {
  const { payload } = thread.submission
  const isInquiry = thread.submission.kind === 'listingInquiry'
  return (
    <div className="rounded-2xl bg-muted/60 p-4 text-sm">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">
          {text(payload.name)}
        </span>
        <span>{when(thread.submission.receivedAt)}</span>
        {isInquiry && text(payload.mode) && (
          <Badge variant="outline">
            {inquiryModeLabels[text(payload.mode)] ?? text(payload.mode)}
          </Badge>
        )}
        {!isInquiry && (
          <span>
            {text(payload.vehicle)}
            {text(payload.availableDate) && `・${text(payload.availableDate)}`}
          </span>
        )}
        {isInquiry && text(payload.preferredDate) && (
          <span>希望日 {text(payload.preferredDate)}</span>
        )}
      </div>
      {text(payload.message) && (
        <p className="mt-2 whitespace-pre-wrap text-foreground">
          {text(payload.message)}
        </p>
      )}
    </div>
  )
}

export function ThreadView({
  thread,
  currentUserId,
}: {
  thread: Thread
  currentUserId: string
}) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [fieldError, setFieldError] = useState<string>()
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [changing, setChanging] = useState<ThreadStatus>()
  const canReply = thread.role !== 'admin'
  const canDecide = thread.role === 'owner'

  const send = async (event: FormEvent) => {
    event.preventDefault()
    setError(undefined)
    const parsed = validateMessage({ body })
    if (!parsed.ok) {
      setFieldError(parsed.errors.body)
      return
    }
    setFieldError(undefined)
    setIsSubmitting(true)
    try {
      const response = await fetch(
        `/api/threads/${thread.submission.id}/messages`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(parsed.value),
        },
      )
      if (!response.ok) {
        setError('送信できませんでした。')
        return
      }
      setBody('')
      router.refresh()
    } catch {
      setError('送信できませんでした。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const decide = async (status: ThreadStatus) => {
    setChanging(status)
    setError(undefined)
    try {
      const response = await fetch(`/api/threads/${thread.submission.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        setError('状態を更新できませんでした。')
        return
      }
      router.refresh()
    } catch {
      setError('状態を更新できませんでした。')
    } finally {
      setChanging(undefined)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={thread.status === 'new' ? 'default' : 'muted'}>
          {threadStatusLabels[thread.status]}
        </Badge>
        {canDecide && (
          <div className="ml-auto flex flex-wrap gap-2">
            {threadStatuses
              .filter((status) => status !== 'new')
              .map((status) => (
                <Button
                  key={status}
                  type="button"
                  size="sm"
                  variant={thread.status === status ? 'default' : 'outline'}
                  aria-pressed={thread.status === status}
                  disabled={changing !== undefined}
                  onClick={() => void decide(status)}
                >
                  {threadStatusLabels[status]}
                </Button>
              ))}
          </div>
        )}
      </div>
      <TargetCard target={thread.target} />
      {thread.status === 'agreed' &&
        thread.target?.kind === 'listing' &&
        thread.role !== 'admin' && (
          <Link
            href={`/transport/new?listingId=${thread.target.listing.id}`}
            className={cn(buttonVariants({ variant: 'outline' }), 'self-start')}
          >
            運搬を依頼する
          </Link>
        )}
      <FormAlert error={error} />
      <OpeningMessage thread={thread} />
      <ol className="flex flex-col gap-3">
        {thread.messages.map((message) => {
          const mine = message.senderUserId === currentUserId
          return (
            <li
              key={message.id}
              className={cn(
                'flex flex-col',
                mine ? 'items-end' : 'items-start',
              )}
            >
              <span className="flex gap-1 text-xs text-muted-foreground">
                <span className="font-medium">{mine ? '自分' : '相手'}</span>
                <span>{when(message.createdAt)}</span>
              </span>
              <p
                className={cn(
                  'mt-1 max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm',
                  mine
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-foreground',
                )}
              >
                {message.body}
              </p>
            </li>
          )
        })}
      </ol>
      {canReply && (
        <form onSubmit={send} noValidate className="flex flex-col gap-3">
          <TextareaField
            id="reply"
            label="返信"
            value={body}
            error={fieldError}
            onChange={(event) => setBody(event.target.value)}
          />
          <div>
            <SubmitButton label="送信する" isSubmitting={isSubmitting} />
          </div>
        </form>
      )}
    </div>
  )
}
