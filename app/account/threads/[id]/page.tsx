import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { BackLink } from '@/components/back-link'
import { PageShell } from '@/components/page-shell'
import { ThreadView } from '@/components/threads/thread-view'
import { getCurrentUser } from '@/lib/server/auth/session'
import { findReviewForSource } from '@/lib/server/reviews'
import { markThreadRead } from '@/lib/server/thread-reads'
import { getThread } from '@/lib/server/threads'

export const metadata: Metadata = { title: 'やり取り | ノウキシェア' }

export const dynamic = 'force-dynamic'

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user)
    redirect(
      `/login?callbackUrl=${encodeURIComponent(`/account/threads/${id}`)}`,
    )
  const result = await getThread(id, user)
  if (!result.ok) notFound()
  if (result.value.role !== 'admin') await markThreadRead(id, user.id)
  const isInquiry = result.value.submission.kind === 'listingInquiry'
  const title = isInquiry ? '問い合わせ' : '応募'
  const canReview =
    isInquiry &&
    result.value.role === 'sender' &&
    result.value.status === 'agreed'
  const review =
    isInquiry && result.value.status === 'agreed'
      ? await findReviewForSource('thread', id)
      : undefined

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <BackLink href="/account" label="マイページにもどる" />
        <h1 className="mt-6 font-display text-2xl font-bold text-foreground">
          {title}のやり取り
        </h1>
        <div className="mt-6">
          <ThreadView
            thread={result.value}
            currentUserId={user.id}
            canReview={canReview}
            review={review}
          />
        </div>
      </div>
    </PageShell>
  )
}
