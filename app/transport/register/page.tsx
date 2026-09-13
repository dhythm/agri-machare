import type { Metadata } from 'next'
import { LoginPrompt } from '@/components/auth/login-prompt'
import { CarrierProfileForm } from '@/components/carriers/carrier-profile-form'
import { PageIntro, PageShell } from '@/components/page-shell'
import { getCurrentUser } from '@/lib/server/auth/session'
import { getCarrierProfile } from '@/lib/server/carriers'
import type { CarrierProfileInput } from '@/lib/validation/carrier'

export const metadata: Metadata = { title: '運搬者登録 | ノウキシェア' }

export const dynamic = 'force-dynamic'

export default async function TransportRegisterPage() {
  const user = await getCurrentUser()
  const profile = user ? await getCarrierProfile(user.id) : undefined
  const initial: (CarrierProfileInput & { note?: string }) | undefined = profile
    ? {
        name: profile.name,
        kind: profile.kind,
        prefecture: profile.prefecture,
        vehicles: profile.vehicles as CarrierProfileInput['vehicles'],
        serviceAreas: profile.serviceAreas,
        note: profile.note,
      }
    : undefined
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <PageIntro
          title="運搬者として登録する"
          description="空きトラックや帰り便を活かして農機具の運搬を手伝い、報酬を受け取れます。対応地域に合う案件をマイページに表示します。"
        />
        <div className="mt-8">
          {user ? (
            <CarrierProfileForm
              contact={{ name: user.name, email: user.email }}
              initial={initial}
            />
          ) : (
            <LoginPrompt
              action="運搬者として登録する"
              callbackUrl="/transport/register"
            />
          )}
        </div>
      </div>
    </PageShell>
  )
}
