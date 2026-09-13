import { badRequest, forbidden, notFound } from '@/lib/server/api'
import { canManage, requireUser } from '@/lib/server/auth/session'
import { completeTransportJob, getTransportJob } from '@/lib/server/transport'
import { asRecord } from '@/lib/validation/shared'

/** Only completion is exposed; booking happens by accepting an application. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authorized = await requireUser()
  if (!authorized.ok) return authorized.response
  const { id } = await params
  const job = await getTransportJob(id)
  if (!job) return notFound('運搬案件が見つかりません。')
  if (!canManage(authorized.user, job))
    return forbidden('この案件を更新する権限がありません。')
  const body = asRecord(await request.json().catch(() => undefined))
  if (body?.status !== '完了')
    return badRequest('状態は「完了」のみ指定できます。')
  const updated = await completeTransportJob(id)
  return updated
    ? Response.json(updated)
    : notFound('運搬案件が見つかりません。')
}
