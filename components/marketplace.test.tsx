// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Marketplace } from './marketplace'
import type { Listing } from '@/lib/data'

const initialListings: Listing[] = [
  {
    id: 'initial',
    name: '初期トラクター',
    category: 'トラクター',
    maker: 'メーカー',
    year: 2020,
    hours: 100,
    condition: '目立った傷なし',
    prefecture: '新潟県',
    city: '長岡市',
    image: '/equipment/tractor.png',
    summary: '説明',
    deals: ['sale'],
    salePrice: 100000,
    seller: { name: '農家', kind: '個人農家', rating: 4, reviews: 1 },
    tags: [],
  },
]

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <Marketplace initialListings={initialListings} />
    </QueryClientProvider>,
  )
  return userEvent.setup()
}

afterEach(() => vi.unstubAllGlobals())

describe('Marketplace', () => {
  it('renders server-provided initial data without fetching again', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    setup()
    expect(
      screen.getByRole('heading', { name: '初期トラクター' }),
    ).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sends both filters to the server and renders the server result', async () => {
    const fetchMock = vi.fn().mockImplementation(
      async () =>
        new Response(
          JSON.stringify([
            {
              ...initialListings[0],
              id: 'remote',
              name: 'サーバーの検索結果',
            },
          ]),
        ),
    )
    vi.stubGlobal('fetch', fetchMock)
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'トラクター' }))
    await user.click(screen.getByRole('button', { name: '購入できる' }))
    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        '/api/listings?category=%E3%83%88%E3%83%A9%E3%82%AF%E3%82%BF%E3%83%BC&deal=sale',
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      ),
    )
    expect(
      await screen.findByRole('heading', { name: 'サーバーの検索結果' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: '初期トラクター' }),
    ).not.toBeInTheDocument()
  })

  it('shows loading, then empty results when the server returns no matches', async () => {
    let resolveResponse!: (response: Response) => void
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveResponse = resolve
          }),
      ),
    )
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'ドローン' }))
    expect(screen.getByRole('status')).toHaveTextContent('読み込み中')
    resolveResponse(new Response('[]'))
    expect(
      await screen.findByText(/条件に合う農機具が見つかりませんでした/),
    ).toBeInTheDocument()
  })

  it('distinguishes an error from an empty result and allows retry', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 500 }))
      .mockResolvedValueOnce(new Response('[]'))
    vi.stubGlobal('fetch', fetchMock)
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'ドローン' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '農機具を取得できませんでした',
    )
    expect(
      screen.queryByText(/条件に合う農機具が見つかりませんでした/),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '再試行' }))
    expect(
      await screen.findByText(/条件に合う農機具が見つかりませんでした/),
    ).toBeInTheDocument()
  })
})
