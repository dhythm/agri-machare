import type { Metadata } from 'next'
import { LoginPrompt } from '@/components/auth/login-prompt'
import { TransportJobForm } from '@/components/forms/transport-job-form'
import { PageIntro, PageShell } from '@/components/page-shell'
import { getCurrentUser } from '@/lib/server/auth/session'

export const metadata: Metadata = { title: '運搬を依頼する | ノウキシェア' }

export const dynamic = 'force-dynamic'

export default async function NewTransportJobPage() {
  const user = await getCurrentUser()
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
            />
          ) : (
            <LoginPrompt action="運搬を依頼する" callbackUrl="/transport/new" />
          )}
        </div>
      </div>
    </PageShell>
  )
}
