import { isApproved } from '@/lib/data'
import { notFound, parseBody } from '@/lib/server/api'
import {
  deleteTransportJob,
  getTransportJob,
  updateTransportJob,
} from '@/lib/server/transport'
import { validateTransportJob } from '@/lib/validation/transport'

type Context = { params: Promise<{ id: string }> }

const missing = () => notFound('運搬案件が見つかりません。')

export async function GET(_request: Request, { params }: Context) {
  const job = await getTransportJob((await params).id)
  return job && isApproved(job) ? Response.json(job) : missing()
}

export async function PUT(request: Request, { params }: Context) {
  const { id } = await params
  if (!(await getTransportJob(id))) return missing()
  const parsed = await parseBody(request, validateTransportJob)
  if (!parsed.ok) return parsed.response
  const job = await updateTransportJob(id, parsed.value)
  return job ? Response.json(job) : missing()
}

export async function DELETE(_request: Request, { params }: Context) {
  const deleted = await deleteTransportJob((await params).id)
  return deleted ? new Response(null, { status: 204 }) : missing()
}
