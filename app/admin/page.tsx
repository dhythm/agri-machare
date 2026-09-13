import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { AdminLogin } from '@/components/admin/admin-login'
import { AdminQueue } from '@/components/admin/admin-queue'
import { PageIntro, PageShell } from '@/components/page-shell'
import { adminCookieName, isValidAdminSecret } from '@/lib/server/admin'
import { getModerationQueue } from '@/lib/server/moderation'

export const metadata: Metadata = { title: '運営審査 | ノウキシェア' }

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const signedIn = isValidAdminSecret(
    (await cookies()).get(adminCookieName)?.value,
  )

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <PageIntro title="運営審査" />
        <div className="mt-8">
          {signedIn ? (
            <AdminQueue initialQueue={await getModerationQueue('pending')} />
          ) : (
            <AdminLogin />
          )}
        </div>
      </div>
    </PageShell>
  )
}
