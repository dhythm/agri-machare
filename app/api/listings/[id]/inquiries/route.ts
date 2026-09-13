import { handleSubmission, notFound } from '@/lib/server/api'
import { buildModes } from '@/lib/server/listing-detail'
import { getListing } from '@/lib/server/listings'
import { validateListingInquiry } from '@/lib/validation/listing-inquiry'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const listing = getListing(id)
  if (!listing) return notFound('農機具が見つかりません。')
  const offered = buildModes(listing).map((mode) => mode.id)
  return handleSubmission(
    request,
    'listingInquiry',
    validateListingInquiry,
    (value) =>
      value.mode !== 'question' && !offered.includes(value.mode)
        ? { mode: 'この農機具では選択できない取引方法です。' }
        : undefined,
  )
}
