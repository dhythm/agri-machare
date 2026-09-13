import type { Metadata } from 'next'
import { AdminSection } from '@/components/admin/admin-section'
import { AccountTable } from '@/components/admin/admin-tables'
import { listAccountSummaries } from '@/lib/server/admin-overview'

export const metadata: Metadata = {
  title: 'アカウント管理 | ノウキシェア 運営',
}

export const dynamic = 'force-dynamic'

export default async function AdminAccountsPage() {
  return (
    <AdminSection title="アカウント管理">
      <AccountTable items={await listAccountSummaries()} />
    </AdminSection>
  )
}
