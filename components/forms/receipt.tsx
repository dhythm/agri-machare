import Link from 'next/link'
import { CircleCheckBig } from 'lucide-react'
import type { Receipt } from '@/lib/queries/submit'

export function ReceiptPanel({
  receipt,
  title,
  description,
  links,
}: {
  receipt: Receipt
  title: string
  description: string
  links: { href: string; label: string }[]
}) {
  return (
    <div role="status" className="rounded-3xl border border-border bg-card p-8">
      <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CircleCheckBig className="size-6" />
      </span>
      <h2 className="mt-4 font-display text-xl font-bold text-foreground">
        {title}を受け付けました
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <dl className="mt-4 grid gap-1 text-sm">
        <div className="flex gap-3">
          <dt className="text-muted-foreground">受付番号</dt>
          <dd>
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              {receipt.id}
            </code>
          </dd>
        </div>
        <div className="flex gap-3">
          <dt className="text-muted-foreground">受付日時</dt>
          <dd>{new Date(receipt.receivedAt).toLocaleString('ja-JP')}</dd>
        </div>
      </dl>
      <div className="mt-6 flex flex-wrap gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-primary"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
