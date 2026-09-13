'use client'

import { cn } from '@/lib/utils'
import { categories, type DealFilter } from '@/lib/data'

const dealFilters: { id: DealFilter; label: string }[] = [
  { id: 'all', label: 'すべて' },
  { id: 'sale', label: '購入できる' },
  { id: 'rent', label: 'レンタルできる' },
  { id: 'rentToOwn', label: 'レンタル購入可' },
]

export function DealFilterToggle({
  value,
  onChange,
}: {
  value: DealFilter
  onChange: (deal: DealFilter) => void
}) {
  return (
    <div className="inline-flex flex-wrap rounded-xl border border-border bg-card p-1">
      {dealFilters.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onChange(f.id)}
          aria-pressed={value === f.id}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            value === f.id
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

export function CategoryChips({
  value,
  onChange,
}: {
  value: string
  onChange: (category: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-pressed={value === c}
          className={cn(
            'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
            value === c
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
          )}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
