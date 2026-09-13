import { conflict, forbidden, notFound, parseBody } from '@/lib/server/api'
import { requireUser } from '@/lib/server/auth/session'
import { createReview } from '@/lib/server/reviews'
import { validateReview } from '@/lib/validation/review'

export async function POST(request: Request) {
  const authorized = await requireUser()
  if (!authorized.ok) return authorized.response
  const parsed = await parseBody(request, validateReview)
  if (!parsed.ok) return parsed.response
  const result = await createReview(authorized.user, parsed.value)
  if (result.ok) return Response.json(result.value, { status: 201 })
  switch (result.reason) {
    case 'not_found':
      return notFound('対象の取引が見つかりません。')
    case 'forbidden':
      return forbidden('この取引をレビューする権限がありません。')
    case 'not_reviewable':
      return conflict('取引が完了してからレビューできます。')
    case 'duplicate':
      return conflict('すでにレビュー済みです。')
  }
}
