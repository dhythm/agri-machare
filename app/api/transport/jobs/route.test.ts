import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from './route'
import { resetStore } from '@/lib/server/store'

vi.mock('server-only', () => ({}))

beforeEach(() => resetStore())

const input = {
  item: 'トラクター 25馬力',
  from: '長野県 松本市',
  to: '長野県 諏訪市',
  distanceKm: '40',
  weight: '約1.2t',
  desiredDate: '相談',
  reward: '14000',
  contactEmail: 'owner@example.com',
}

const post = (body: unknown) =>
  POST(
    new Request('http://localhost/api/transport/jobs', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  )

describe('/api/transport/jobs', () => {
  it('lists jobs', async () => {
    const response = await GET()
    expect(response.status).toBe(200)
    expect((await response.json()).length).toBeGreaterThanOrEqual(10)
  })

  it('creates a job and lists it first', async () => {
    const response = await post(input)
    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.job).toMatchObject({
      id: body.id,
      item: input.item,
      status: '募集中',
    })
    expect(JSON.stringify(body)).not.toContain('owner@example.com')
    expect((await (await GET()).json())[0].id).toBe(body.id)
  })

  it('validates input', async () => {
    const response = await post({ ...input, reward: '' })
    expect(response.status).toBe(400)
    expect((await response.json()).errors).toHaveProperty('reward')
  })
})
