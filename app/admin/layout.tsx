import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/admin/admin-shell'
import { getCurrentUser } from '@/lib/server/auth/session'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login?callbackUrl=%2Fadmin')

  return (
    <AdminShell user={user}>
      {user.role === 'admin' ? (
        children
      ) : (
        <p role="alert" className="text-sm text-destructive">
          運営権限がありません。
        </p>
      )}
    </AdminShell>
  )
}
