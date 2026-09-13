import { isApproved } from '@/lib/data'
import { handleSubmission, notFound } from '@/lib/server/api'
import { getTransportJob } from '@/lib/server/transport'
import { validateTransportApplication } from '@/lib/validation/transport'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const job = await getTransportJob(id)
  if (!job || !isApproved(job)) return notFound('運搬案件が見つかりません。')
  return handleSubmission(
    request,
    'transportApplication',
    validateTransportApplication,
    { targetId: id },
  )
}
