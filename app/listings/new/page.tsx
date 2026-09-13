import type { Metadata } from 'next'
import { LoginPrompt } from '@/components/auth/login-prompt'
import { ListingForm } from '@/components/forms/listing-form'
import { PageIntro, PageShell } from '@/components/page-shell'
import { getCurrentUser } from '@/lib/server/auth/session'

export const metadata: Metadata = { title: '出品する | ノウキシェア' }

export const dynamic = 'force-dynamic'

export default async function NewListingPage() {
  const user = await getCurrentUser()
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <PageIntro
          title="農機具を出品する"
          description="販売とレンタルをひとつの出品でまとめて募集できます。内容を確認のうえ掲載します。"
        />
        <div className="mt-8">
          {user ? (
            <ListingForm contact={{ name: user.name, email: user.email }} />
          ) : (
            <LoginPrompt action="出品する" callbackUrl="/listings/new" />
          )}
        </div>
      </div>
    </PageShell>
  )
}
