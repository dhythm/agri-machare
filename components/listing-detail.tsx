'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  MapPin,
  Star,
  Gauge,
  Calendar,
  Wrench,
  ShieldCheck,
  Repeat2,
  ShoppingCart,
  Truck,
  MessageSquare,
  CircleCheckBig,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/badge'
import { BackLink } from '@/components/back-link'
import { ListingCard } from '@/components/listing-card'
import {
  type Listing,
  type ListingMode,
  type ListingModeConfig,
  formatYen,
} from '@/lib/data'

const modeIcon = { buy: ShoppingCart, rent: Calendar, rentToOwn: Repeat2 }

export function ListingDetail({
  listing,
  modes,
  transportEstimate,
  related,
}: {
  listing: Listing
  modes: ListingModeConfig[]
  transportEstimate: number
  related: Listing[]
}) {
  const [mode, setMode] = useState<ListingMode>(modes[0].id)
  const active = modes.find((m) => m.id === mode) ?? modes[0]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <BackLink href="/listings" label="一覧にもどる" />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-muted">
            <Image
              src={listing.image || '/placeholder.svg'}
              alt={listing.name}
              fill
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
            <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
              {listing.deals.includes('sale') && (
                <Badge className="bg-primary text-primary-foreground shadow-sm">
                  販売
                </Badge>
              )}
              {listing.deals.includes('rent') && (
                <Badge className="bg-accent text-accent-foreground shadow-sm">
                  レンタル
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Spec
              icon={<Calendar className="size-4" />}
              label="年式"
              value={`${listing.year}年`}
            />
            <Spec
              icon={<Gauge className="size-4" />}
              label="稼働時間"
              value={`${listing.hours}h`}
            />
            <Spec
              icon={<Wrench className="size-4" />}
              label="状態"
              value={listing.condition}
            />
            <Spec
              icon={<MapPin className="size-4" />}
              label="所在地"
              value={listing.prefecture}
            />
          </div>

          <div className="mt-8">
            <h2 className="font-display text-lg font-bold text-foreground">
              この農機具について
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {listing.summary}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {listing.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary font-display text-lg font-bold text-primary">
              {listing.seller.name.charAt(0)}
            </span>
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {listing.seller.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {listing.seller.kind}
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              {listing.seller.reviews > 0 ? (
                <>
                  <Star className="size-4 fill-accent text-accent" />
                  <span className="font-medium text-foreground">
                    {listing.seller.rating}
                  </span>
                  <span>({listing.seller.reviews})</span>
                </>
              ) : (
                <span>評価なし</span>
              )}
            </div>
          </div>
        </div>

        {/* Action panel */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-3xl border border-border bg-card p-6">
            <p className="text-xs font-medium text-muted-foreground">
              {listing.maker} · {listing.category}
            </p>
            <h1 className="mt-1 text-balance font-display text-xl font-bold leading-snug text-foreground">
              {listing.name}
            </h1>

            <div className="mt-5 flex flex-col gap-2">
              {modes.map((m) => {
                const Icon = modeIcon[m.id]
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    className={cn(
                      'flex items-start gap-3 rounded-2xl border p-4 text-left transition-all',
                      mode === m.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                        : 'border-border hover:border-primary/40',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg',
                        mode === m.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-primary',
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="font-medium text-foreground">
                          {m.title}
                        </span>
                        <span className="font-display font-bold text-foreground">
                          {m.price}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                        {m.desc}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            {active.note && (
              <div className="mt-4 flex gap-2 rounded-xl bg-secondary/60 p-3 text-xs leading-relaxed text-secondary-foreground">
                <CircleCheckBig className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{active.note}</span>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2">
              <Link
                href={`/listings/${listing.id}/inquiry?mode=${active.id}`}
                className={cn(buttonVariants(), 'h-11')}
              >
                {active.cta}
              </Link>
              <Link
                href={`/listings/${listing.id}/inquiry?mode=question`}
                className={cn(buttonVariants({ variant: 'outline' }), 'h-11')}
              >
                <MessageSquare className="size-4" />
                出品者に質問する
              </Link>
            </div>

            <div className="mt-5 flex items-start gap-2 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
              <Truck className="mt-0.5 size-4 shrink-0" />
              <span>
                {listing.prefecture}
                {listing.city}
                発。運搬チャネルで配送を手配できます（目安{' '}
                {formatYen(transportEstimate)}〜）。
              </span>
            </div>
            <div className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              <span>
                取引はエスクロー決済で保護。受け取り確認後に出品者へ入金されます。
              </span>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-xl font-bold text-foreground">
              同じカテゴリの農機具
            </h2>
            <Link
              href={`/listings?category=${encodeURIComponent(listing.category)}`}
              className="text-sm font-medium text-primary"
            >
              {listing.category}をすべて見る
            </Link>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function Spec({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        {label}
      </span>
      <p className="mt-1.5 font-medium text-foreground">{value}</p>
    </div>
  )
}
