import { describe, expect, it, vi } from 'vitest'
import { POST } from './route'

vi.mock('server-only', () => ({}))

function post(body: unknown) {
  return POST(
    new Request('http://localhost/api/transport/registrations', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  )
}

describe('POST /api/transport/registrations', () => {
  it('accepts a registration', async () => {
    const response = await post({
      name: '佐藤運送',
      kind: '法人',
      prefecture: '秋田県',
      vehicle: '4tトラック',
      email: 'sato@example.com',
    })
    expect(response.status).toBe(201)
  })

  it('returns field errors', async () => {
    const response = await post({ name: '佐藤運送' })
    expect(response.status).toBe(400)
    expect(Object.keys((await response.json()).errors).sort()).toEqual([
      'email',
      'kind',
      'prefecture',
      'vehicle',
    ])
  })
})
