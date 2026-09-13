'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [{ href: '/admin', label: '審査', icon: ClipboardCheck }]

function isCurrent(pathname: string, href: string): boolean {
  return href === '/admin'
    ? pathname === '/admin'
    : pathname === href || pathname.startsWith(`${href}/`)
}

export function AdminNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="運営メニュー">
      <ul className="flex gap-1 md:flex-col">
        {items.map((item) => {
          const current = isCurrent(pathname, item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  current
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
