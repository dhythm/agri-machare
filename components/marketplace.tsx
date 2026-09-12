'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { categories, type DealFilter, type Listing } from '@/lib/data'
import { listingQueryOptions } from '@/lib/queries/listings'
import { ListingCard } from '@/components/listing-card'

const dealFilters: { id: DealFilter; label: string }[] = [
  { id: 'all', label: 'すべて' },
  { id: 'sale', label: '購入できる' },
  { id: 'rent', label: 'レンタルできる' },
  { id: 'rentToOwn', label: 'レンタル購入可' },
]

export function Marketplace({
  initialListings,
}: {
  initialListings: Listing[]
}) {
  const [category, setCategory] = useState<string>('すべて')
  const [deal, setDeal] = useState<DealFilter>('all')

  const query = useQuery({
    ...listingQueryOptions({ category, deal }),
    initialData:
      category === 'すべて' && deal === 'all' ? initialListings : undefined,
  })
  const filteredListings = query.data ?? []

  return (
    <section
      id="marketplace"
      className="mx-auto max-w-6xl scroll-mt-16 px-4 py-16 sm:px-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-balance font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            出品中の農機具
          </h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            売買・レンタルをまとめて。気になる1台は、まず借りて試せます。
          </p>
        </div>
        <div className="inline-flex rounded-xl border border-border bg-card p-1">
          {dealFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setDeal(f.id)}
              aria-pressed={deal === f.id}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                deal === f.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              category === c
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {query.isPending ? (
        <p role="status" className="mt-8 text-muted-foreground">
          読み込み中…
        </p>
      ) : query.isError ? (
        <div
          role="alert"
          className="mt-8 rounded-2xl border border-border bg-card p-6"
        >
          <p>農機具を取得できませんでした。</p>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="mt-3 font-medium text-primary"
          >
            再試行
          </button>
        </div>
      ) : filteredListings.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
          条件に合う農機具が見つかりませんでした。フィルターを変えてお試しください。
        </div>
      )}
    </section>
  )
}
