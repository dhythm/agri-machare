import Link from 'next/link'
import type { ReactNode } from 'react'
import { Badge } from '@/components/badge'
import { formatYen, threadStatusLabels } from '@/lib/data'
import { rentalStatusLabels } from '@/lib/rent-to-own'
import type { AccountSummary, ThreadSummary } from '@/lib/server/admin-overview'
import type { RentalWithListing } from '@/lib/server/rentals'
import type { Review, Submission } from '@/lib/server/store/types'
import { StarRating } from '@/components/reviews/star-rating'
import { AccountStatusButton } from './account-status-button'

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function when(iso: string): string {
  return new Date(iso).toLocaleString('ja-JP')
}

function Table({
  headers,
  rows,
}: {
  headers: string[]
  rows: { key: string; cells: ReactNode[] }[]
}) {
  if (rows.length === 0)
    return <p className="text-sm text-muted-foreground">該当なし</p>
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-2 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-t border-border">
              {row.cells.map((cell, index) => (
                <td key={index} className="px-4 py-2 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function RentalTable({ items }: { items: RentalWithListing[] }) {
  return (
    <Table
      headers={['農機具', '申込者', '期間', '金額', '状態', '購入価格']}
      rows={items.map(({ rental, listing }) => ({
        key: rental.id,
        cells: [
          listing ? (
            <Link
              href={`/listings/${listing.id}`}
              className="font-medium hover:underline"
            >
              {listing.name}
            </Link>
          ) : (
            <span className="text-muted-foreground">（削除済み）</span>
          ),
          <code key="code-71" className="text-xs">
            {rental.renterUserId}
          </code>,
          `${rental.startDate} 〜 ${rental.endDate}（${rental.days}日）`,
          formatYen(rental.rentTotal),
          <Badge
            key="badge-74"
            variant={rental.status === 'requested' ? 'default' : 'muted'}
          >
            {rentalStatusLabels[rental.status]}
          </Badge>,
          rental.purchasePrice !== undefined
            ? formatYen(rental.purchasePrice)
            : '—',
        ],
      }))}
    />
  )
}

export function ThreadTable({ items }: { items: ThreadSummary[] }) {
  return (
    <Table
      headers={['対象', '送信者', '受付', '状態', '返信', '']}
      rows={items.map((thread) => ({
        key: thread.id,
        cells: [
          thread.targetId && !thread.targetName.startsWith('（') ? (
            <Link
              href={
                thread.kind === 'listingInquiry'
                  ? `/listings/${thread.targetId}`
                  : `/transport/${thread.targetId}`
              }
              className="font-medium hover:underline"
            >
              {thread.targetName}
            </Link>
          ) : (
            <span className="text-muted-foreground">{thread.targetName}</span>
          ),
          thread.senderName,
          when(thread.receivedAt),
          <Badge
            key="badge-109"
            variant={thread.status === 'new' ? 'default' : 'muted'}
          >
            {threadStatusLabels[thread.status]}
          </Badge>,
          String(thread.replyCount),
          <Link
            key="link-113"
            href={`/account/threads/${thread.id}`}
            className="text-primary hover:underline"
          >
            開く
          </Link>,
        ],
      }))}
    />
  )
}

export function CarrierTable({ items }: { items: Submission[] }) {
  return (
    <Table
      headers={['名前', '区分', '拠点', '車両', '登録日']}
      rows={items.map((carrier) => ({
        key: carrier.id,
        cells: [
          text(carrier.payload.name),
          text(carrier.payload.kind),
          text(carrier.payload.prefecture),
          text(carrier.payload.vehicle),
          when(carrier.receivedAt),
        ],
      }))}
    />
  )
}

const roleLabels = { admin: '運営', user: '一般' } as const

export function AccountTable({
  items,
  currentUserId,
}: {
  items: AccountSummary[]
  currentUserId: string
}) {
  return (
    <Table
      headers={[
        'ID',
        '名前',
        'メール',
        '役割',
        '出品',
        '運搬依頼',
        'レンタル',
        '状態',
        '',
      ]}
      rows={items.map((account) => ({
        key: account.id,
        cells: [
          <code key="code-152" className="text-xs">
            {account.id}
          </code>,
          account.name,
          account.email,
          <Badge
            key="badge-155"
            variant={account.role === 'admin' ? 'default' : 'muted'}
          >
            {roleLabels[account.role]}
          </Badge>,
          String(account.listingCount),
          String(account.transportJobCount),
          String(account.rentalCount),
          <span key="status" className="flex flex-col gap-1">
            <Badge
              variant={account.status === 'suspended' ? 'default' : 'muted'}
            >
              {account.status === 'suspended' ? '停止中' : '有効'}
            </Badge>
            {account.note && (
              <span className="text-xs text-muted-foreground">
                {account.note}
              </span>
            )}
          </span>,
          <AccountStatusButton
            key="action"
            userId={account.id}
            status={account.status}
            self={account.id === currentUserId}
          />,
        ],
      }))}
    />
  )
}

export type ReviewRow = { review: Review; listingName: string }

export function ReviewTable({ items }: { items: ReviewRow[] }) {
  return (
    <Table
      headers={['農機具', '出品者', 'レビュー者', '評価', 'コメント', '日時']}
      rows={items.map(({ review, listingName }) => ({
        key: review.id,
        cells: [
          listingName,
          <code key="seller" className="text-xs">
            {review.sellerUserId}
          </code>,
          <code key="reviewer" className="text-xs">
            {review.reviewerUserId}
          </code>,
          <StarRating key="rating" rating={review.rating} />,
          review.comment ?? '—',
          when(review.createdAt),
        ],
      }))}
    />
  )
}
