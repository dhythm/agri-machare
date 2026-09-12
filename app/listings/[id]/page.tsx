import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ListingDetail } from '@/components/listing-detail'
import { getListing, listings } from '@/lib/data'

export function generateStaticParams() {
  return listings.map((l) => ({ id: l.id }))
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const listing = getListing(id)

  if (!listing) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <ListingDetail listing={listing} />
      </main>
      <SiteFooter />
    </div>
  )
}
