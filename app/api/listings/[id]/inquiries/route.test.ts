import { describe, expect, it, vi } from 'vitest'
import { POST } from './route'

vi.mock('server-only', () => ({}))

const inquiry = {
  mode: 'rent',
  name: '山田 太郎',
  email: 'taro@example.com',
  preferredDate: '2026-10-01',
  message: '1週間ほど借りたいです。',
}

function post(id: string, body: unknown) {
  return POST(
    new Request(`http://localhost/api/listings/${id}/inquiries`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) },
  )
}

describe('POST /api/listings/[id]/inquiries', () => {
  it('accepts an inquiry for an existing listing', async () => {
    const response = await post('trc-001', inquiry)
    expect(response.status).toBe(201)
    expect(await response.json()).toHaveProperty('id')
  })

  it('rejects an inquiry for an unknown listing', async () => {
    const response = await post('missing', inquiry)
    expect(response.status).toBe(404)
  })

  it('rejects a mode the listing does not offer', async () => {
    const response = await post('trc-006', { ...inquiry, mode: 'rent' })
    expect(response.status).toBe(400)
    expect((await response.json()).errors).toHaveProperty('mode')
  })

  it('returns field errors', async () => {
    const response = await post('trc-001', { ...inquiry, email: 'bad' })
    expect(response.status).toBe(400)
    expect((await response.json()).errors).toHaveProperty('email')
  })
})
