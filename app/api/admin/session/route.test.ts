import { afterEach, describe, expect, it, vi } from 'vitest'
import { DELETE, GET, POST } from './route'
import { adminCookieName, adminSecretHeader } from '@/lib/server/admin'

vi.mock('server-only', () => ({}))

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('/api/admin/session', () => {
  it('signs in with the shared secret and reads the session', async () => {
    vi.stubEnv('ADMIN_SECRET', 'shared-key')
    const denied = await GET(new Request('http://localhost/api/admin/session'))
    expect(denied.status).toBe(401)

    const created = await POST(
      new Request('http://localhost/api/admin/session', {
        method: 'POST',
        body: JSON.stringify({ secret: 'shared-key' }),
      }),
    )
    expect(created.status).toBe(200)
    expect(created.headers.get('set-cookie')).toContain(`${adminCookieName}=`)

    const ok = await GET(
      new Request('http://localhost/api/admin/session', {
        headers: { [adminSecretHeader]: 'shared-key' },
      }),
    )
    expect(ok.status).toBe(200)
    expect(await ok.json()).toEqual({ ok: true })
  })

  it('rejects a wrong secret and clears the cookie', async () => {
    vi.stubEnv('ADMIN_SECRET', 'shared-key')
    const wrong = await POST(
      new Request('http://localhost/api/admin/session', {
        method: 'POST',
        body: JSON.stringify({ secret: 'nope' }),
      }),
    )
    expect(wrong.status).toBe(401)
    expect((await wrong.json()).error).toBe('運営キーが違います。')

    const cleared = await DELETE()
    expect(cleared.status).toBe(204)
    expect(cleared.headers.get('set-cookie')).toContain('Max-Age=0')
  })
})
