import { isAdminRequest } from '@/lib/server/admin'
import { badRequest, parseBody, unauthorized } from '@/lib/server/api'
import { applyModeration, getModerationQueue } from '@/lib/server/moderation'
import {
  readModerationQueueFilter,
  validateModerationInput,
} from '@/lib/validation/moderation'

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return unauthorized()
  const status = readModerationQueueFilter(
    new URL(request.url).searchParams.get('status') ?? undefined,
  )
  if (!status) return badRequest('検索条件が不正です。')
  return Response.json(await getModerationQueue(status))
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) return unauthorized()
  const parsed = await parseBody(request, validateModerationInput)
  if (!parsed.ok) return parsed.response
  const entity = await applyModeration(parsed.value.kind, parsed.value.id, {
    status: parsed.value.status,
    note: parsed.value.note,
  })
  if (!entity)
    return Response.json({ error: '対象が見つかりません。' }, { status: 404 })
  return Response.json(entity)
}
