import Link from 'next/link'
import { Sprout, Search, Plus } from 'lucide-react'
import { AccountMenu } from '@/components/auth/account-menu'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
          <Link
            href="/listings"
            className="transition-colors hover:text-foreground"
          >
            探す
          </Link>
          <Link
            href="/guide#rent-to-own"
            className="transition-colors hover:text-foreground"
          >
            レンタル購入とは
          </Link>
          <Link
            href="/transport"
            className="transition-colors hover:text-foreground"
          >
            運搬を手伝う
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <form
            action="/listings"
            method="get"
            role="search"
            className="hidden sm:block"
          >
            <label className="relative block">
              <span className="sr-only">キーワードで探す</span>
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                name="q"
                placeholder="キーワードで探す"
                className="h-9 w-44 rounded-lg border border-border bg-background pl-8 pr-3 text-sm text-foreground outline-none transition-[width] focus-visible:w-64 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 lg:w-56"
              />
            </label>
          </form>
          <Link
            href="/listings"
            aria-label="農機具を探す"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'icon-lg' }),
              'sm:hidden',
            )}
          >
            <Search className="size-4" />
          </Link>
          <Link
            href="/listings/new"
            className={cn(buttonVariants(), 'h-9 px-3')}
          >
            <Plus className="size-4" />
            出品する
          </Link>
          <AccountMenu />
        </div>
      </div>
    </header>
  )
}
