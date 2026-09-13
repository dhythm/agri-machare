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
    <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 sm:inline-flex sm:flex-wrap">
      {dealFilters.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onChange(f.id)}
          aria-pressed={value === f.id}
          className={cn(
            'min-h-11 rounded-md px-2 py-2 text-xs font-medium sm:px-3 sm:text-sm transition-colors',
            value === f.id
              ? 'bg-card text-primary shadow-sm'
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
            'min-h-10 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
            value === c
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
          )}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
