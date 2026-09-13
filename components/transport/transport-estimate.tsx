'use client'

import { useState } from 'react'
import { Truck } from 'lucide-react'
import { formatYen } from '@/lib/data'
import {
  estimateDistanceKm,
  estimateTransportFee,
  prefectureNames,
  transportBaseRate,
} from '@/lib/transport-fee'

export function TransportEstimate({
  category,
  fromPrefecture,
}: {
  category: string
  fromPrefecture: string
}) {
  const [to, setTo] = useState('')
  const distance = to ? estimateDistanceKm(fromPrefecture, to) : undefined
  return (
    <div className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
      <Truck className="mt-0.5 size-4 shrink-0" />
      <div className="flex-1">
        <p>
          {fromPrefecture}発。運搬チャネルで配送を手配できます（
          {distance === undefined
            ? `${formatYen(transportBaseRate(category))}〜`
            : `約${distance}km・${formatYen(estimateTransportFee(category, distance))}`}
          ）。
        </p>
        <label className="mt-2 flex items-center gap-2">
          <span className="shrink-0">届け先の都道府県</span>
          <select
            aria-label="届け先の都道府県"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="h-8 rounded-lg border border-border bg-background px-2 text-xs text-foreground"
          >
            <option value="">選択</option>
            {prefectureNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        {distance !== undefined && (
          <p className="mt-1 text-foreground">
            目安 {formatYen(estimateTransportFee(category, distance))}
          </p>
        )}
      </div>
    </div>
  )
}
