import { forbidden, notFound, parseBody } from '@/lib/server/api'
import {
  canManage,
  canView,
  getCurrentUser,
  requireUser,
} from '@/lib/server/auth/session'
import {
  deleteTransportJob,
  getTransportJob,
  updateTransportJob,
} from '@/lib/server/transport'
import { validateTransportJob } from '@/lib/validation/transport'

type Context = { params: Promise<{ id: string }> }

const missing = () => notFound('運搬案件が見つかりません。')
const notOwner = () => forbidden('この案件を編集する権限がありません。')

export async function GET(_request: Request, { params }: Context) {
  const job = await getTransportJob((await params).id)
  if (!job) return missing()
  return canView(await getCurrentUser(), job) ? Response.json(job) : missing()
}

export async function PUT(request: Request, { params }: Context) {
  const { id } = await params
  const authorized = await requireUser()
  if (!authorized.ok) return authorized.response
  const current = await getTransportJob(id)
  if (!current) return missing()
  if (!canManage(authorized.user, current)) return notOwner()
  const parsed = await parseBody(request, validateTransportJob)
  if (!parsed.ok) return parsed.response
  const job = await updateTransportJob(id, parsed.value)
  return job ? Response.json(job) : missing()
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params
  const authorized = await requireUser()
  if (!authorized.ok) return authorized.response
  const current = await getTransportJob(id)
  if (!current) return missing()
  if (!canManage(authorized.user, current)) return notOwner()
  const deleted = await deleteTransportJob(id)
  return deleted ? new Response(null, { status: 204 }) : missing()
}
