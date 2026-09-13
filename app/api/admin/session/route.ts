import {
  adminCookieHeader,
  clearAdminCookieHeader,
  isAdminRequest,
  isValidAdminSecret,
} from '@/lib/server/admin'
import { parseBody, unauthorized } from '@/lib/server/api'
import { validateAdminLogin } from '@/lib/validation/moderation'

export async function GET(request: Request) {
  return isAdminRequest(request) ? Response.json({ ok: true }) : unauthorized()
}

export async function POST(request: Request) {
  const parsed = await parseBody(request, validateAdminLogin)
  if (!parsed.ok) return parsed.response
  if (!isValidAdminSecret(parsed.value.secret))
    return unauthorized('運営キーが違います。')
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'set-cookie': adminCookieHeader(parsed.value.secret),
    },
  })
}

export async function DELETE() {
  return new Response(null, {
    status: 204,
    headers: { 'set-cookie': clearAdminCookieHeader() },
  })
}
