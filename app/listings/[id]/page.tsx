import { notFound } from 'next/navigation'
import { PageShell } from '@/components/page-shell'
import { ListingDetail } from '@/components/listing-detail'
import { isApproved } from '@/lib/data'
import { getListing, getRelatedListings } from '@/lib/server/listings'
import { buildModes, estimateTransport } from '@/lib/server/listing-detail'

export const dynamic = 'force-dynamic'

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const listing = await getListing(id)

  if (!listing || !isApproved(listing)) {
    notFound()
  }

  return (
    <PageShell>
      <ListingDetail
        listing={listing}
        modes={buildModes(listing)}
        transportEstimate={estimateTransport(listing)}
        related={await getRelatedListings(listing, 3)}
      />
    </PageShell>
  )
}
