import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AccountOverviewView } from '@/components/account/account-overview'
import { PageIntro, PageShell } from '@/components/page-shell'
import { getAccountOverview } from '@/lib/server/account'
import { getCurrentUser } from '@/lib/server/auth/session'

export const metadata: Metadata = { title: 'マイページ | ノウキシェア' }

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?callbackUrl=%2Faccount')
  const overview = await getAccountOverview(user.id)

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <PageIntro
          title="マイページ"
          description={`${user.name}（${user.email}）`}
        />
        <div className="mt-8">
          <AccountOverviewView overview={overview} />
        </div>
      </div>
    </PageShell>
  )
}
