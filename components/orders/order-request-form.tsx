'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { CircleCheckBig } from 'lucide-react'
import { FormAlert, TextareaField } from '@/components/forms/fields'
import { SubmitButton } from '@/components/forms/submit-button'
import { buttonVariants } from '@/components/ui/button'
import { formatYen } from '@/lib/data'
import { cn } from '@/lib/utils'

export function OrderRequestForm({
  listingId,
  price,
  signedIn,
  available,
}: {
  listingId: string
  price: number
  signedIn: boolean
  /** False while another buyer's order holds the listing. */
  available: boolean
}) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  if (!available)
    return (
      <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
        他の方の購入手続きが進んでいます。
      </p>
    )

  if (!signedIn)
    return (
      <Link
        href={`/login?callbackUrl=${encodeURIComponent(`/listings/${listingId}`)}`}
        className={cn(buttonVariants(), 'h-11')}
      >
        ログインして購入を申し込む
      </Link>
    )

  if (done)
    return (
      <div
        role="status"
        className="flex items-start gap-2 rounded-xl bg-secondary/60 p-3 text-sm"
      >
        <CircleCheckBig className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>
          購入を申し込みました。出品者の承諾をお待ちください。
          <Link href="/account" className="ml-1 font-medium text-primary">
            マイページで確認する
          </Link>
        </span>
      </div>
    )

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError(undefined)
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/listings/${listingId}/orders`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(message.trim() ? { message: message.trim() } : {}),
      })
      if (response.status !== 201) {
        const body = (await response.json()) as { error?: string }
        setError(body.error ?? '申し込めませんでした。')
        return
      }
      setDone(true)
    } catch {
      setError('申し込めませんでした。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3">
      <FormAlert error={error} />
      <p className="text-sm text-foreground">
        購入価格{' '}
        <span className="font-display font-bold">{formatYen(price)}</span>
      </p>
      <TextareaField
        id="order-message"
        label="出品者へのメッセージ"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <SubmitButton label="購入を申し込む" isSubmitting={isSubmitting} />
    </form>
  )
}
