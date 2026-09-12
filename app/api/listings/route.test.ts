import { describe, expect, it, vi } from 'vitest'
import { GET } from './route'

vi.mock('server-only', () => ({}))

describe('GET /api/listings', () => {
  it('returns all listings when filters are omitted', async () => {
    const response = GET(new Request('http://localhost/api/listings'))
    expect(response.status).toBe(200)
    expect(await response.json()).toHaveLength(6)
  })

  it('returns filtered listings', async () => {
    const response = GET(
      new Request(
        'http://localhost/api/listings?category=トラクター&deal=rent',
      ),
    )
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual([
      expect.objectContaining({ id: 'trc-001' }),
    ])
  })

  it.each([
    'deal=buy',
    'category=unknown',
    'deal=',
    'category=',
    'deal=rent&deal=sale',
    'category=すべて&category=ドローン',
  ])('rejects invalid or ambiguous filters: %s', async (query) => {
    const response = GET(new Request(`http://localhost/api/listings?${query}`))
    expect(response.status).toBe(400)
    expect(await response.json()).toHaveProperty('error')
  })
})
