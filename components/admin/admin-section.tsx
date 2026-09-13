import type { ReactNode } from 'react'
import { AdminTabs } from './admin-tabs'

export function AdminSection({
  title,
  tabs,
  children,
}: {
  title: string
  tabs?: { href: string; label: string }[]
  children: ReactNode
}) {
  return (
    <>
      <h1 className="font-display text-2xl font-black tracking-tight text-foreground">
        {title}
      </h1>
      {tabs && (
        <div className="mt-4">
          <AdminTabs items={tabs} />
        </div>
      )}
      <div className="mt-6">{children}</div>
    </>
  )
}

export const dealTabs = [
  { href: '/admin/deals', label: '出品' },
  { href: '/admin/deals/rentals', label: 'レンタル' },
  { href: '/admin/deals/inquiries', label: '問い合わせ' },
  { href: '/admin/deals/reviews', label: 'レビュー' },
]

export const transportTabs = [
  { href: '/admin/transport', label: '運搬依頼' },
  { href: '/admin/transport/applications', label: '応募' },
  { href: '/admin/transport/carriers', label: '運搬者' },
]
