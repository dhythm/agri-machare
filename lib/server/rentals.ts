import 'server-only'

import { randomUUID } from 'node:crypto'
import type { Listing } from '@/lib/data'
import {
  calculateRentToOwn,
  rentalStatusLabels,
  countRentalDays,
  rangesOverlap,
  type DateRange,
  type RentalStatus,
} from '@/lib/rent-to-own'
import type { AuthenticatedUser } from './auth/accounts'
import { notify } from './notifications'
import { getStore, type Rental } from './store'

export type RentalResult<T> =
  | { ok: true; value: T }
  | {
      ok: false
      reason:
        | 'not_found'
        | 'forbidden'
        | 'conflict'
        | 'unavailable'
        | 'invalid'
        | 'transition'
    }

export type RentalWithListing = { rental: Rental; listing?: Listing }

const fail = (reason: Extract<RentalResult<never>, { ok: false }>['reason']) =>
  ({ ok: false, reason }) as const

/** Ranges that block new requests: pending and running rentals. */
function isBooking(rental: Rental): boolean {
  return rental.status === 'requested' || rental.status === 'active'
}

export async function listBookedRanges(
  listingId: string,
): Promise<DateRange[]> {
  const rentals = await getStore().rentals.list()
  return rentals
    .filter((rental) => rental.listingId === listingId && isBooking(rental))
    .map(({ startDate, endDate }) => ({ startDate, endDate }))
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
}

export async function requestRental(
  listing: Listing,
  user: AuthenticatedUser,
  range: DateRange,
): Promise<RentalResult<Rental>> {
  if (!listing.rentPerDay) return fail('unavailable')
  if (listing.ownerUserId === user.id) return fail('forbidden')
  const days = countRentalDays(range.startDate, range.endDate)
  if (days === 0) return fail('invalid')
  const booked = await listBookedRanges(listing.id)
  if (booked.some((existing) => rangesOverlap(existing, range)))
    return fail('conflict')
  const now = new Date().toISOString()
  const rental = await getStore().rentals.create({
    id: randomUUID(),
    listingId: listing.id,
    renterUserId: user.id,
    startDate: range.startDate,
    endDate: range.endDate,
    days,
    rentPerDay: listing.rentPerDay,
    rentTotal: listing.rentPerDay * days,
    salePrice: listing.salePrice,
    creditRate: listing.rentToOwn ? listing.rentToOwnCreditRate : undefined,
    creditCap: listing.rentToOwn ? listing.rentToOwnCreditCap : undefined,
    status: 'requested',
    createdAt: now,
    updatedAt: now,
  })
  if (listing.ownerUserId)
    await notify({
      userId: listing.ownerUserId,
      kind: 'rental',
      title: 'レンタルの申込が届きました',
      body: `${listing.name}（${range.startDate} 〜 ${range.endDate}）`,
      href: '/account',
    })
  return { ok: true, value: rental }
}

type Party = 'owner' | 'renter'

const transitions: Record<
  Party,
  Partial<Record<RentalStatus, RentalStatus[]>>
> = {
  owner: { requested: ['active', 'cancelled'], active: ['completed'] },
  renter: { requested: ['cancelled'], active: ['converted'] },
}

async function partyOf(
  rental: Rental,
  user: AuthenticatedUser,
): Promise<Party | undefined> {
  if (rental.renterUserId === user.id) return 'renter'
  const listing = await getStore().listings.get(rental.listingId)
  return listing?.ownerUserId === user.id ? 'owner' : undefined
}

/** Owners approve, decline, and complete; renters cancel or convert to a purchase. */
export async function updateRentalStatus(
  id: string,
  user: AuthenticatedUser,
  status: RentalStatus,
): Promise<RentalResult<Rental>> {
  const store = getStore()
  const rental = await store.rentals.get(id)
  if (!rental) return fail('not_found')
  const party = await partyOf(rental, user)
  if (!party) return fail('forbidden')
  if (!transitions[party][rental.status]?.includes(status))
    return fail('transition')
  const patch: Partial<Rental> = { status, updatedAt: new Date().toISOString() }
  if (status === 'converted') {
    if (rental.salePrice === undefined || rental.creditRate === undefined)
      return fail('transition')
    patch.purchasePrice = calculateRentToOwn(
      {
        rentPerDay: rental.rentPerDay,
        salePrice: rental.salePrice,
        creditRate: rental.creditRate,
        creditCap: rental.creditCap,
      },
      rental.days,
    ).purchasePrice
  }
  const updated = await store.rentals.update(id, patch)
  if (!updated) return fail('not_found')
  const listing = await store.listings.get(rental.listingId)
  const recipient =
    party === 'owner' ? rental.renterUserId : listing?.ownerUserId
  if (recipient)
    await notify({
      userId: recipient,
      kind: 'rental',
      title: `レンタルが「${rentalStatusLabels[status]}」になりました`,
      body: listing?.name,
      href: '/account',
    })
  return { ok: true, value: updated }
}

async function withListings(rentals: Rental[]): Promise<RentalWithListing[]> {
  const listings = await getStore().listings.list()
  const byId = new Map(listings.map((listing) => [listing.id, listing]))
  return rentals.map((rental) => ({
    rental,
    listing: byId.get(rental.listingId),
  }))
}

export async function listRentalsForRenter(
  userId: string,
): Promise<RentalWithListing[]> {
  const rentals = await getStore().rentals.list()
  return withListings(
    rentals.filter((rental) => rental.renterUserId === userId),
  )
}

export async function listRentalsForOwner(
  userId: string,
): Promise<RentalWithListing[]> {
  const [rentals, listings] = await Promise.all([
    getStore().rentals.list(),
    getStore().listings.list(),
  ])
  const owned = new Set(
    listings
      .filter((listing) => listing.ownerUserId === userId)
      .map((listing) => listing.id),
  )
  return withListings(rentals.filter((rental) => owned.has(rental.listingId)))
}
