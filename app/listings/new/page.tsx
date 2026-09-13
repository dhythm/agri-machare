import type { Metadata } from 'next'
import { PageIntro, PageShell } from '@/components/page-shell'
import { ListingForm } from '@/components/forms/listing-form'

export const metadata: Metadata = { title: '出品する | ノウキシェア' }

export default function NewListingPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <PageIntro
          title="農機具を出品する"
          description="販売とレンタルをひとつの出品でまとめて募集できます。内容を確認のうえ掲載します。"
        />
        <div className="mt-8">
          <ListingForm />
        </div>
      </div>
    </PageShell>
  )
}
