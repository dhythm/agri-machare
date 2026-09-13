import { QueryClient } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { listingQueryOptions } from './listings'

afterEach(() => vi.unstubAllGlobals())

const page = { page: 1, pageSize: 12 }

describe('listing query', () => {
  it('keeps separate cache entries for every search condition', () => {
    const base = listingQueryOptions({ category: 'すべて', deal: 'all' }, page)
    expect(base.queryKey).not.toEqual(
      listingQueryOptions({ category: 'トラクター', deal: 'all' }, page)
        .queryKey,
    )
    expect(base.queryKey).not.toEqual(
      listingQueryOptions({ category: 'すべて', deal: 'sale' }, page).queryKey,
    )
    expect(base.queryKey).not.toEqual(
      listingQueryOptions(
        { category: 'すべて', deal: 'all', keyword: 'クボタ' },
        page,
      ).queryKey,
    )
    expect(base.queryKey).not.toEqual(
      listingQueryOptions(
        { category: 'すべて', deal: 'all' },
        { ...page, page: 2 },
      ).queryKey,
    )
  })

  it('builds the request URL and omits an empty keyword', async () => {
    const fetchMock = vi.fn<(input: string) => Promise<Response>>(async () =>
      Response.json({
        items: [],
        total: 0,
        page: 1,
        pageSize: 12,
        pageCount: 0,
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const queryClient = new QueryClient()
    await queryClient.fetchQuery(
      listingQueryOptions(
        { category: 'すべて', deal: 'all', keyword: '' },
        page,
      ),
    )
    await queryClient.fetchQuery(
      listingQueryOptions(
        { category: 'ドローン', deal: 'rent', keyword: 'DJI' },
        { page: 2, pageSize: 6 },
      ),
    )
    expect(fetchMock.mock.calls[0][0]).toBe(
      '/api/listings?category=%E3%81%99%E3%81%B9%E3%81%A6&deal=all&page=1&pageSize=12',
    )
    expect(fetchMock.mock.calls[1][0]).toBe(
      '/api/listings?category=%E3%83%89%E3%83%AD%E3%83%BC%E3%83%B3&deal=rent&page=2&pageSize=6&q=DJI',
    )
    queryClient.clear()
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
    const option = listingQueryOptions(
      { category: 'すべて', deal: 'all' },
      page,
    )
    const request = queryClient.fetchQuery(option).catch(() => undefined)
    await queryClient.cancelQueries({ queryKey: option.queryKey })
    await request
    expect(requestSignal?.aborted).toBe(true)
    queryClient.clear()
  })
})
