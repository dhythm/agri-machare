import type { Metadata } from 'next'
import { LoginPrompt } from '@/components/auth/login-prompt'
import {
  TransportJobForm,
  type TransportJobInitial,
} from '@/components/forms/transport-job-form'
import { PageIntro, PageShell } from '@/components/page-shell'
import { getCurrentUser } from '@/lib/server/auth/session'
import { getListing } from '@/lib/server/listings'

export const metadata: Metadata = { title: '運搬を依頼する | ノウキシェア' }

export const dynamic = 'force-dynamic'

async function initialFromListing(
  listingId: string | undefined,
): Promise<TransportJobInitial | undefined> {
  if (!listingId) return undefined
  const listing = await getListing(listingId)
  if (!listing) return undefined
  return {
    item: listing.name,
    category: listing.category,
    fromPrefecture: listing.prefecture,
    fromCity: listing.city,
  }
}

export default async function NewTransportJobPage({
  searchParams,
}: {
  searchParams: Promise<{ listingId?: string }>
}) {
  const user = await getCurrentUser()
  const initial = await initialFromListing((await searchParams).listingId)
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <PageIntro
          title="運搬を依頼する"
          description="運びたい農機具と区間、希望日、報酬を登録します。"
        />
        <div className="mt-8">
          {user ? (
            <TransportJobForm
              contact={{ name: user.name, email: user.email }}
              initial={initial}
            />
          ) : (
            <LoginPrompt action="運搬を依頼する" callbackUrl="/transport/new" />
          )}
        </div>
      </div>
    </PageShell>
  )
}
