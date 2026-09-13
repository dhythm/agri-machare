import { notFound } from 'next/navigation'
import { PageShell } from '@/components/page-shell'
import { ListingDetail } from '@/components/listing-detail'
import {
  getListing,
  getListingIds,
  getRelatedListings,
} from '@/lib/server/listings'
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
    <PageShell>
      <ListingDetail
        listing={listing}
        modes={buildModes(listing)}
        transportEstimate={estimateTransport(listing)}
        related={getRelatedListings(listing, 3)}
      />
    </PageShell>
  )
}
