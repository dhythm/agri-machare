'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import {
  featuredListingCount,
  type DealFilter,
  type ListingPage,
} from '@/lib/data'
import { listingQueryOptions } from '@/lib/queries/listings'
import { buildListingSearchParams } from '@/lib/listing-search-params'
import { CategoryChips, DealFilterToggle } from '@/components/listing-filters'
import { ListingResults } from '@/components/listing-results'

export function Marketplace({ initialPage }: { initialPage: ListingPage }) {
  const [category, setCategory] = useState<string>('すべて')
  const [deal, setDeal] = useState<DealFilter>('all')
  const filter = { category, deal, keyword: '' }

  const query = useQuery({
    ...listingQueryOptions(filter, { page: 1, pageSize: featuredListingCount }),
    initialData:
      category === 'すべて' && deal === 'all' ? initialPage : undefined,
  })
  const search = buildListingSearchParams(filter, 1)
  const allHref = search ? `/listings?${search}` : '/listings'

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
        <DealFilterToggle value={deal} onChange={setDeal} />
      </div>

      <div className="mt-6">
        <CategoryChips value={category} onChange={setCategory} />
      </div>

      <ListingResults query={query} />

      <div className="mt-8 flex justify-center">
        <Link
          href={allHref}
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          すべての農機具を見る
          {query.data ? `（${query.data.total}件）` : ''}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  )
}
