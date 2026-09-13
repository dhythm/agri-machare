import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from './route'
import { PATCH } from './[id]/route'
import { POST as readAll } from './read-all/route'
import { notify } from '@/lib/server/notifications'
import { resetStore } from '@/lib/server/store'
import { demoSeller, demoUser, signInAs } from '@/test/mock-auth'

vi.mock('server-only', () => ({}))
vi.mock('@/auth', () => import('@/test/mock-auth'))

beforeEach(() => {
  signInAs(demoUser)
  return resetStore()
})

const context = (id: string) => ({ params: Promise.resolve({ id }) })

describe('/api/notifications', () => {
  it('lists the caller notifications with the unread count and marks them read', async () => {
    const mine = await notify({
      userId: 'demo-user',
      kind: 'reply',
      title: '返信が届きました',
      href: '/account/threads/t-1',
    })
    await notify({
      userId: 'demo-seller',
      kind: 'inquiry',
      title: '他人',
      href: '/account',
    })
    const listed = await GET()
    expect(listed.status).toBe(200)
    const body = await listed.json()
    expect(body.unreadCount).toBe(1)
    expect(body.items.map((n: { id: string }) => n.id)).toEqual([mine.id])

    const marked = await PATCH(
      new Request('http://localhost'),
      context(mine.id),
    )
    expect(marked.status).toBe(200)
    expect((await marked.json()).readAt).toEqual(expect.any(String))
    expect((await (await GET()).json()).unreadCount).toBe(0)

    signInAs(demoSeller)
    expect(
      (await PATCH(new Request('http://localhost'), context(mine.id))).status,
    ).toBe(404)
    expect((await readAll()).status).toBe(204)
    expect((await (await GET()).json()).unreadCount).toBe(0)

    signInAs(null)
    expect((await GET()).status).toBe(401)
    expect((await readAll()).status).toBe(401)
  })
})
