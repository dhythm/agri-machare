import type { Metadata } from 'next'
import Link from 'next/link'
import { AdminSection } from '@/components/admin/admin-section'
import { getAdminCounts } from '@/lib/server/admin-overview'

export const metadata: Metadata = {
  title: 'ダッシュボード | ノウキシェア 運営',
}

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const counts = await getAdminCounts()
  const cards = [
    {
      label: '審査待ちの出品',
      value: counts.pendingListings,
      href: '/admin/deals',
    },
    {
      label: '審査待ちの運搬依頼',
      value: counts.pendingTransportJobs,
      href: '/admin/transport',
    },
    {
      label: '申込中のレンタル',
      value: counts.requestedRentals,
      href: '/admin/deals/rentals',
    },
    {
      label: '未対応のやり取り',
      value: counts.openThreads,
      href: '/admin/deals/inquiries',
    },
    {
      label: '登録済みの運搬者',
      value: counts.carriers,
      href: '/admin/transport/carriers',
    },
  ]
  return (
    <AdminSection title="ダッシュボード">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <li key={card.href}>
            <Link
              href={card.href}
              className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="mt-2 font-display text-3xl font-bold text-foreground">
                {card.value}
                <span className="ml-1 text-base font-medium text-muted-foreground">
                  件
                </span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </AdminSection>
  )
}
