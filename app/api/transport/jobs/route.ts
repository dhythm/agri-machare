import { parseBody } from '@/lib/server/api'
import { requireUser } from '@/lib/server/auth/session'
import { createTransportJob, getTransportJobs } from '@/lib/server/transport'
import { validateTransportJob } from '@/lib/validation/transport'

export async function GET() {
  return Response.json(await getTransportJobs())
}

export async function POST(request: Request) {
  const authorized = await requireUser()
  if (!authorized.ok) return authorized.response
  const parsed = await parseBody(request, validateTransportJob)
  if (!parsed.ok) return parsed.response
  const job = await createTransportJob(parsed.value, authorized.user.id)
  return Response.json(
    { id: job.id, receivedAt: job.createdAt, job },
    { status: 201 },
  )
}
