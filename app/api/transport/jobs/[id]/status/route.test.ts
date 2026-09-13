import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PATCH } from './route'
import { resetStore } from '@/lib/server/store'
import { getTransportJob } from '@/lib/server/transport'
import { demoAdmin, demoSeller, demoUser, signInAs } from '@/test/mock-auth'

vi.mock('server-only', () => ({}))
vi.mock('@/auth', () => import('@/test/mock-auth'))

beforeEach(() => {
  signInAs(demoSeller)
  return resetStore()
})

const patch = (id: string, body: unknown) =>
  PATCH(
    new Request('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) },
  )

describe('PATCH /api/transport/jobs/[id]/status', () => {
  it('lets the owner or an admin complete a job', async () => {
    const response = await patch('tj-01', { status: '完了' })
    expect(response.status).toBe(200)
    expect((await response.json()).status).toBe('完了')
    expect((await getTransportJob('tj-01'))?.status).toBe('完了')
    expect((await patch('tj-02', { status: '募集中' })).status).toBe(400)
    signInAs(demoUser)
    expect((await patch('tj-02', { status: '完了' })).status).toBe(403)
    signInAs(null)
    expect((await patch('tj-02', { status: '完了' })).status).toBe(401)
    signInAs(demoAdmin)
    expect((await patch('tj-03', { status: '完了' })).status).toBe(200)
    expect((await patch('missing', { status: '完了' })).status).toBe(404)
  })
})
