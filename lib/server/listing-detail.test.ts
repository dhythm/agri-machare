import { describe, expect, it, vi } from 'vitest'
import { getListing } from './listings'
import { buildModes, estimateTransport } from './listing-detail'

vi.mock('server-only', () => ({}))

describe('listing detail business rules', () => {
  it('offers rental, rent-to-own, and purchase for eligible equipment', async () => {
    const listing = (await getListing('trc-001'))!
    const modes = buildModes(listing)
    expect(modes.map((mode) => mode.id)).toEqual(['rent', 'rentToOwn', 'buy'])
    expect(modes[0].price).toBe('¥22,000/日')
    expect(modes[2].price).toBe('¥18,800,000')
    expect(JSON.parse(JSON.stringify(modes))).toEqual(modes)
  })

  it('only offers supported transactions', async () => {
    expect(
      buildModes((await getListing('drn-005'))!).map((mode) => mode.id),
    ).toEqual(['rent'])
    expect(
      buildModes((await getListing('trc-006'))!).map((mode) => mode.id),
    ).toEqual(['buy'])
  })

  it('estimates transport by category, with a fallback for new categories', async () => {
    const listing = (await getListing('trc-001'))!
    expect(estimateTransport(listing)).toBe(30_000)
    expect(estimateTransport({ ...listing, category: 'その他' })).toBe(20_000)
  })
})
