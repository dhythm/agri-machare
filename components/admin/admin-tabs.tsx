'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function AdminTabs({
  items,
}: {
  items: { href: string; label: string }[]
}) {
  const pathname = usePathname()
  return (
    <nav aria-label="タブ" className="overflow-x-auto border-b border-border">
      <ul className="flex min-w-max gap-1">
        {items.map((item) => {
          const current = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-12 items-center border-b-2 px-4 py-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
                  current
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
