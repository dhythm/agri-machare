import Link from 'next/link'
import { Sprout, Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sprout className="size-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            ノウキシェア
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/#marketplace" className="transition-colors hover:text-foreground">
            探す
          </Link>
          <Link href="/#how" className="transition-colors hover:text-foreground">
            レンタル購入とは
          </Link>
          <Link href="/transport" className="transition-colors hover:text-foreground">
            運搬を手伝う
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            className="hidden h-9 sm:inline-flex"
            aria-label="農機具を検索"
          >
            <Search className="size-4" />
            <span className="text-muted-foreground">キーワードで探す</span>
          </Button>
          <Button className="h-9">
            <Plus className="size-4" />
            出品する
          </Button>
        </div>
      </div>
    </header>
  )
}
