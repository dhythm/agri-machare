import type { Metadata } from 'next'
import { PageIntro, PageShell } from '@/components/page-shell'
import { TransportRegistrationForm } from '@/components/forms/transport-registration-form'

export const metadata: Metadata = { title: '運搬者登録 | ノウキシェア' }

export default function TransportRegisterPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <PageIntro
          title="運搬者として登録する"
          description="空きトラックや帰り便を活かして農機具の運搬を手伝い、報酬を受け取れます。登録後、対応可能な案件をご案内します。"
        />
        <div className="mt-8">
          <TransportRegistrationForm />
        </div>
      </div>
    </PageShell>
  )
}
