import { conflict, notFound, parseBody } from '@/lib/server/api'
import { setAccountStatus } from '@/lib/server/auth/account-status'
import { configuredAccounts } from '@/lib/server/auth/accounts'
import { getCurrentUser, requireAdmin } from '@/lib/server/auth/session'
import { validateAccountStatus } from '@/lib/validation/account-status'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin()
  if (denied) return denied
  const { id } = await params
  if (!configuredAccounts().some((account) => account.id === id))
    return notFound('アカウントが見つかりません。')
  const parsed = await parseBody(request, validateAccountStatus)
  if (!parsed.ok) return parsed.response
  const current = await getCurrentUser()
  if (parsed.value.status === 'suspended' && current?.id === id)
    return conflict('自分のアカウントは停止できません。')
  return Response.json(
    await setAccountStatus(id, parsed.value.status, parsed.value.note),
  )
}
