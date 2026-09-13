import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BackLink } from '@/components/back-link'
import { LoginPrompt } from '@/components/auth/login-prompt'
import { TransportJobForm } from '@/components/forms/transport-job-form'
import { PageIntro, PageShell } from '@/components/page-shell'
import { canManage } from '@/lib/server/auth/access'
import { getCurrentUser } from '@/lib/server/auth/session'
import { getTransportJob } from '@/lib/server/transport'

export const metadata: Metadata = { title: '運搬依頼を編集する | ノウキシェア' }

export const dynamic = 'force-dynamic'

export default async function EditTransportJobPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()
  const job = await getTransportJob(id)
  if (!job) notFound()
  if (user && !canManage(user, job)) notFound()

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <BackLink href={`/transport/${id}`} label="案件の詳細にもどる" />
        <div className="mt-6">
          <PageIntro title="運搬依頼を編集する" />
        </div>
        <div className="mt-8">
          {user ? (
            <TransportJobForm
              contact={{ name: user.name, email: user.email }}
              edit={{
                jobId: job.id,
                values: {
                  item: job.item,
                  from: job.from,
                  to: job.to,
                  distanceKm: String(job.distanceKm),
                  weight: job.weight,
                  desiredDate: job.desiredDate,
                  reward: String(job.reward),
                  contactEmail: user.email,
                },
              }}
            />
          ) : (
            <LoginPrompt
              action="運搬依頼を編集する"
              callbackUrl={`/transport/${id}/edit`}
            />
          )}
        </div>
      </div>
    </PageShell>
  )
}
