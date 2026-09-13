'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number
  pageCount: number
  onChange: (page: number) => void
}) {
  if (pageCount <= 1) return null
  return (
    <nav
      aria-label="ページ"
      className="mt-10 flex items-center justify-center gap-4"
    >
      <Button
        variant="outline"
        className="h-9"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft className="size-4" />
        前のページ
      </Button>
      <span className="text-sm text-muted-foreground">
        {page} / {pageCount}
      </span>
      <Button
        variant="outline"
        className="h-9"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
      >
        次のページ
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  )
}
