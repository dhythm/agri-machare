import { describe, expect, it, vi } from 'vitest'
import { POST } from './route'

vi.mock('server-only', () => ({}))

const application = {
  name: '高橋 健',
  email: 'ken@example.com',
  vehicle: '2tトラック',
  availableDate: '2026-10-03',
}

function post(id: string, body: unknown) {
  return POST(
    new Request(`http://localhost/api/transport/jobs/${id}/applications`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) },
  )
}

describe('POST /api/transport/jobs/[id]/applications', () => {
  it('accepts an application for an open job', async () => {
    expect((await post('tj-01', application)).status).toBe(201)
  })

  it('rejects an unknown job', async () => {
    expect((await post('missing', application)).status).toBe(404)
  })

  it('returns field errors', async () => {
    const response = await post('tj-01', { ...application, availableDate: '' })
    expect(response.status).toBe(400)
    expect((await response.json()).errors).toHaveProperty('availableDate')
  })
})
