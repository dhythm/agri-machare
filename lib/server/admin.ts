import 'server-only'

import { createHash, timingSafeEqual } from 'node:crypto'

export const adminCookieName = 'admin_key'
export const adminSecretHeader = 'x-admin-secret'
const defaultDevSecret = 'dev-admin'
const cookieMaxAge = 60 * 60 * 24 * 7

export function configuredAdminSecret(): string | undefined {
  const explicit = process.env.ADMIN_SECRET?.trim()
  if (explicit) return explicit
  if (process.env.NODE_ENV === 'production') return undefined
  return defaultDevSecret
}

export function isValidAdminSecret(provided: string | undefined): boolean {
  const expected = configuredAdminSecret()
  if (!expected || !provided) return false
  const left = createHash('sha256').update(provided).digest()
  const right = createHash('sha256').update(expected).digest()
  return timingSafeEqual(left, right)
}

function readCookie(cookieHeader: string, name: string): string | undefined {
  for (const part of cookieHeader.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return decodeURIComponent(rest.join('='))
  }
  return undefined
}

function readAdminSecret(request: Request): string | undefined {
  const header = request.headers.get(adminSecretHeader)?.trim()
  if (header) return header
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return undefined
  return readCookie(cookieHeader, adminCookieName)?.trim()
}

export function isAdminRequest(request: Request): boolean {
  return isValidAdminSecret(readAdminSecret(request))
}

export function adminCookieHeader(
  value: string,
  maxAge = cookieMaxAge,
): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${adminCookieName}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`
}

export function clearAdminCookieHeader(): string {
  return adminCookieHeader('', 0)
}
