import { isApproved } from '@/lib/data'
import { conflict, handleSubmission, notFound } from '@/lib/server/api'
import { requireUser } from '@/lib/server/auth/session'
import { getTransportJob } from '@/lib/server/transport'
import { validateTransportInquiry } from '@/lib/validation/transport'

/** A question to the job owner that opens a thread without applying. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authorized = await requireUser()
  if (!authorized.ok) return authorized.response
  const { id } = await params
  const job = await getTransportJob(id)
  if (!job || !isApproved(job)) return notFound('運搬案件が見つかりません。')
  if (job.status === '完了') return conflict('完了した案件には質問できません。')
  return handleSubmission(
    request,
    'transportInquiry',
    (input) => {
      const result = validateTransportInquiry(input)
      return result.ok
        ? { ok: true, value: { ...result.value, name: authorized.user.name } }
        : result
    },
    { targetId: id, userId: authorized.user.id },
  )
}
