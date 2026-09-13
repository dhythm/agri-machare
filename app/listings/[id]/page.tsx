import { notFound } from 'next/navigation'
import { PageShell } from '@/components/page-shell'
import { ListingDetail } from '@/components/listing-detail'
import { canManage, canView, getCurrentUser } from '@/lib/server/auth/session'
import { getListing, getRelatedListings } from '@/lib/server/listings'
import { buildModes } from '@/lib/server/listing-detail'
import { listBookedRanges } from '@/lib/server/rentals'
import { listReviewsForSeller } from '@/lib/server/reviews'
import type { RentToOwnTerms } from '@/lib/rent-to-own'
import type { Listing } from '@/lib/data'

export const dynamic = 'force-dynamic'

function rentToOwnTerms(listing: Listing): RentToOwnTerms | undefined {
  if (
    !listing.rentToOwn ||
    !listing.rentPerDay ||
    !listing.salePrice ||
    !listing.rentToOwnCreditRate
  )
    return undefined
  return {
    rentPerDay: listing.rentPerDay,
    salePrice: listing.salePrice,
    creditRate: listing.rentToOwnCreditRate,
    creditCap: listing.rentToOwnCreditCap,
  }
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const listing = await getListing(id)
  const user = await getCurrentUser()

  if (!listing || !canView(user, listing)) {
    notFound()
  }

  return (
    <PageShell>
      <ListingDetail
        listing={listing}
        modes={buildModes(listing)}
        related={await getRelatedListings(listing, 3)}
        rentToOwnTerms={rentToOwnTerms(listing)}
        booked={await listBookedRanges(listing.id)}
        sellerReviews={
          listing.ownerUserId
            ? (await listReviewsForSeller(listing.ownerUserId)).slice(0, 10)
            : []
        }
        viewer={{
          signedIn: user !== undefined,
          isOwner: user !== undefined && listing.ownerUserId === user.id,
          canEdit: canManage(user, listing),
        }}
      />
    </PageShell>
  )
}
