import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StarRating({ rating }: { rating: number }) {
  return (
    <span
      role="img"
      aria-label={`評価 ${rating}`}
      className="inline-flex items-center gap-0.5"
    >
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={cn(
            'size-3.5',
            value <= rating
              ? 'fill-accent text-accent'
              : 'text-muted-foreground/40',
          )}
        />
      ))}
    </span>
  )
}
