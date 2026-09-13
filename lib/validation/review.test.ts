import { describe, expect, it } from 'vitest'
import { validateReview } from './review'

describe('validateReview', () => {
  it('accepts a rating with an optional comment', () => {
    expect(
      validateReview({
        sourceKind: 'rental',
        sourceId: 'r-1',
        rating: '5',
        comment: ' 助かりました ',
      }),
    ).toEqual({
      ok: true,
      value: {
        sourceKind: 'rental',
        sourceId: 'r-1',
        rating: 5,
        comment: '助かりました',
      },
    })
    const bare = validateReview({
      sourceKind: 'thread',
      sourceId: 't',
      rating: 3,
    })
    expect(bare.ok && bare.value.comment).toBeUndefined()
  })

  it('rejects unknown sources and ratings outside 1-5', () => {
    expect(
      validateReview({ sourceKind: 'x', sourceId: 'r', rating: 3 }).ok,
    ).toBe(false)
    expect(
      validateReview({ sourceKind: 'rental', sourceId: 'r', rating: 6 }).ok,
    ).toBe(false)
    expect(
      validateReview({ sourceKind: 'rental', sourceId: '', rating: 1 }).ok,
    ).toBe(false)
  })
})
