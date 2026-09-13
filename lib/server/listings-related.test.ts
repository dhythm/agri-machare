import { describe, expect, it, vi } from 'vitest'
import { getListing, getRelatedListings } from './listings'

vi.mock('server-only', () => ({}))

describe('getRelatedListings', () => {
  it('returns other listings in the same category, excluding itself', () => {
    const listing = getListing('trc-001')!
    const related = getRelatedListings(listing, 3)
    expect(related).toHaveLength(3)
    expect(related.map((item) => item.id)).not.toContain('trc-001')
    expect(related.every((item) => item.category === 'トラクター')).toBe(true)
  })
})
