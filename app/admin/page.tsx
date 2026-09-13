import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AdminQueue } from '@/components/admin/admin-queue'
import { PageIntro, PageShell } from '@/components/page-shell'
import { getCurrentUser } from '@/lib/server/auth/session'
import { getModerationQueue } from '@/lib/server/moderation'

export const metadata: Metadata = { title: '運営審査 | ノウキシェア' }

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?callbackUrl=%2Fadmin')

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <PageIntro title="運営審査" />
        <div className="mt-8">
          {user.role === 'admin' ? (
            <AdminQueue initialQueue={await getModerationQueue('pending')} />
          ) : (
            <p role="alert" className="text-sm text-destructive">
              運営権限がありません。
            </p>
          )}
        </div>
      </div>
    </PageShell>
  )
}
