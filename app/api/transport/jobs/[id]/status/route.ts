import { badRequest, conflict, forbidden, notFound } from '@/lib/server/api'
import { requireUser } from '@/lib/server/auth/session'
import { updateTransportJobStatus } from '@/lib/server/transport'
import { asRecord } from '@/lib/validation/shared'

/** Booking happens by accepting an application; this moves the haul forward. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authorized = await requireUser()
  if (!authorized.ok) return authorized.response
  const body = asRecord(await request.json().catch(() => undefined))
  const status = body?.status
  if (status !== '運搬中' && status !== '完了')
    return badRequest('状態は「運搬中」か「完了」を指定してください。')
  const result = await updateTransportJobStatus(
    (await params).id,
    authorized.user,
    status,
  )
  if (result.ok) return Response.json(result.value)
  switch (result.reason) {
    case 'not_found':
      return notFound('運搬案件が見つかりません。')
    case 'forbidden':
      return forbidden('この案件を更新する権限がありません。')
    case 'transition':
      return conflict('現在の状態ではその操作はできません。')
  }
}
