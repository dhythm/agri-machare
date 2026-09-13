'use client'

import { useState } from 'react'
import { formatYen } from '@/lib/data'
import { calculateRentToOwn, type RentToOwnTerms } from '@/lib/rent-to-own'

export function RentToOwnSimulator({ terms }: { terms: RentToOwnTerms }) {
  const [days, setDays] = useState(30)
  const estimate = calculateRentToOwn(terms, Math.max(0, days))
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <label
        htmlFor="rent-to-own-days"
        className="block text-xs font-medium text-foreground"
      >
        レンタル日数
      </label>
      <input
        id="rent-to-own-days"
        type="number"
        min={1}
        max={3650}
        value={days}
        onChange={(event) => setDays(Number(event.target.value) || 0)}
        className="mt-1 h-9 w-28 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
      />
      <dl className="mt-3 grid gap-1 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">レンタル料合計</dt>
          <dd className="font-medium">{formatYen(estimate.rentTotal)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">
            充当額（{terms.creditRate}%
            {terms.creditCap !== undefined &&
              `・上限 ${formatYen(terms.creditCap)}`}
            ）
          </dt>
          <dd className="font-medium text-primary">
            {formatYen(estimate.credit)}
          </dd>
        </div>
        <div className="flex justify-between gap-3 border-t border-border pt-1">
          <dt className="text-muted-foreground">購入時の支払い</dt>
          <dd className="font-display font-bold">
            {formatYen(estimate.purchasePrice)}
          </dd>
        </div>
      </dl>
    </div>
  )
}
