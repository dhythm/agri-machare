import { isApproved } from '@/lib/data'
import { conflict, handleSubmission, notFound } from '@/lib/server/api'
import { requireUser } from '@/lib/server/auth/session'
import { getTransportJob } from '@/lib/server/transport'
import { validateTransportApplication } from '@/lib/validation/transport'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const authorized = await requireUser()
  if (!authorized.ok) return authorized.response
  const job = await getTransportJob(id)
  if (!job || !isApproved(job)) return notFound('運搬案件が見つかりません。')
  if (job.status !== '募集中')
    return conflict('募集中の案件にのみ応募できます。')
  return handleSubmission(
    request,
    'transportApplication',
    validateTransportApplication,
    { targetId: id, userId: authorized.user.id },
  )
}
