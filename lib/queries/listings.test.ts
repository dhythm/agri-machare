import { QueryClient } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { listingQueryOptions } from './listings'

afterEach(() => vi.unstubAllGlobals())

describe('listing query', () => {
  it('keeps separate cache entries for category and deal', () => {
    const base = listingQueryOptions({ category: 'すべて', deal: 'all' })
    expect(base.queryKey).not.toEqual(
      listingQueryOptions({ category: 'トラクター', deal: 'all' }).queryKey,
    )
    expect(base.queryKey).not.toEqual(
      listingQueryOptions({ category: 'すべて', deal: 'sale' }).queryKey,
    )
  })

  it('aborts the network request when its query is cancelled', async () => {
    let requestSignal: AbortSignal | undefined
    vi.stubGlobal(
      'fetch',
      vi.fn((_url, init: RequestInit) => {
        requestSignal = init.signal as AbortSignal
        return new Promise<Response>((_resolve, reject) => {
          requestSignal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          )
        })
      }),
    )
    const queryClient = new QueryClient()
    const option = listingQueryOptions({ category: 'すべて', deal: 'all' })
    const request = queryClient.fetchQuery(option).catch(() => undefined)
    await queryClient.cancelQueries({ queryKey: option.queryKey })
    await request
    expect(requestSignal?.aborted).toBe(true)
    queryClient.clear()
  })
})
