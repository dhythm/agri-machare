import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'
import { PageIntro, PageShell } from '@/components/page-shell'
import { getCurrentUser } from '@/lib/server/auth/session'
import { readCallbackUrl } from '@/lib/validation/auth'

export const metadata: Metadata = { title: 'ログイン | ノウキシェア' }

export const dynamic = 'force-dynamic'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const callbackUrl = readCallbackUrl((await searchParams).callbackUrl)
  if (await getCurrentUser()) redirect(callbackUrl)

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <PageIntro title="ログイン" />
        <div className="mt-8">
          <LoginForm callbackUrl={callbackUrl} />
        </div>
      </div>
    </PageShell>
  )
}
