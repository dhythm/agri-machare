import { describe, expect, it, vi } from 'vitest'
import { POST } from './route'

vi.mock('server-only', () => ({}))

function post(body: unknown) {
  return POST(
    new Request('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  )
}

describe('POST /api/contact', () => {
  it('accepts a message', async () => {
    const response = await post({
      name: '鈴木',
      email: 'suzuki@example.com',
      topic: 'その他',
      message: 'テスト',
    })
    expect(response.status).toBe(201)
  })

  it('returns field errors', async () => {
    const response = await post({ name: '', email: '', topic: '', message: '' })
    expect(response.status).toBe(400)
    expect(Object.keys((await response.json()).errors).sort()).toEqual([
      'email',
      'message',
      'name',
      'topic',
    ])
  })
})
