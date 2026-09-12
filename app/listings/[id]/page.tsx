import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ListingDetail } from '@/components/listing-detail'
import { getListing, getListingIds } from '@/lib/server/listings'
import { buildModes, estimateTransport } from '@/lib/server/listing-detail'

export function generateStaticParams() {
  return getListingIds().map((id) => ({ id }))
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
        <ListingDetail
          listing={listing}
          modes={buildModes(listing)}
          transportEstimate={estimateTransport(listing)}
        />
      </main>
      <SiteFooter />
    </div>
  )
}
