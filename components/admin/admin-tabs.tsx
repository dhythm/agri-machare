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
    <nav aria-label="タブ" className="border-b border-border">
      <ul className="-mb-px flex flex-wrap gap-4">
        {items.map((item) => {
          const current = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'inline-block border-b-2 px-1 py-2 text-sm font-medium transition-colors',
                  current
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
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
