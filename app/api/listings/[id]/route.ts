import { notFound, parseBody } from '@/lib/server/api'
import { deleteListing, getListing, updateListing } from '@/lib/server/listings'
import { validateListingSubmission } from '@/lib/validation/listing-submission'

type Context = { params: Promise<{ id: string }> }

const missing = () => notFound('農機具が見つかりません。')

export async function GET(_request: Request, { params }: Context) {
  const listing = await getListing((await params).id)
  return listing ? Response.json(listing) : missing()
}

export async function PUT(request: Request, { params }: Context) {
  const { id } = await params
  if (!(await getListing(id))) return missing()
  const parsed = await parseBody(request, validateListingSubmission)
  if (!parsed.ok) return parsed.response
  const listing = await updateListing(id, parsed.value)
  return listing ? Response.json(listing) : missing()
}

export async function DELETE(_request: Request, { params }: Context) {
  const deleted = await deleteListing((await params).id)
  return deleted ? new Response(null, { status: 204 }) : missing()
}
