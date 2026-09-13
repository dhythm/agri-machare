import type { Metadata } from 'next'
import { PageIntro, PageShell } from '@/components/page-shell'
import { TransportJobForm } from '@/components/forms/transport-job-form'

export const metadata: Metadata = { title: '運搬を依頼する | ノウキシェア' }

export default function NewTransportJobPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <PageIntro
          title="運搬を依頼する"
          description="運びたい農機具と区間、希望日、報酬を登録すると案件ボードに掲載されます。"
        />
        <div className="mt-8">
          <TransportJobForm />
        </div>
      </div>
    </PageShell>
  )
}
