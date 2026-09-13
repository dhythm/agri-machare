// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AdminQueue } from './admin-queue'
import type { Listing, TransportJob } from '@/lib/data'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

const listing: Listing = {
  id: 'pending-listing',
  name: '審査中トラクター',
  category: 'トラクター',
  maker: 'クボタ',
  year: 2018,
  hours: 500,
  condition: '目立った傷なし',
  prefecture: '新潟県',
  city: '長岡市',
  image: '/equipment/tractor.png',
  summary: '審査中。',
  deals: ['sale'],
  salePrice: 1_000_000,
  seller: { name: '審査農園', kind: '農業法人', rating: 0, reviews: 0 },
  tags: [],
  moderationStatus: 'pending',
}

const job: TransportJob = {
  id: 'pending-job',
  item: '審査中コンバイン',
  from: '秋田県 大仙市',
  to: '山形県 天童市',
  distanceKm: 120,
  weight: '約2.4t',
  desiredDate: '相談',
  reward: 38_000,
  status: '募集中',
  moderationStatus: 'pending',
}

function setup(kind: 'listing' | 'transportJob') {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AdminQueue
        kind={kind}
        initialQueue={{ listings: [listing], transportJobs: [job] }}
      />
    </QueryClientProvider>,
  )
  return userEvent.setup()
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('AdminQueue', () => {
  it('renders only the requested kind', () => {
    setup('listing')
    expect(screen.getByText('審査中トラクター')).toBeInTheDocument()
    expect(screen.queryByText('審査中コンバイン')).toBeNull()
    expect(
      screen.getByRole('button', { name: '取り下げる' }),
    ).toBeInTheDocument()
  })

  it('approves a listing with an optional note', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return Response.json({ ...listing, moderationStatus: 'approved' })
      }
      return Response.json({ listings: [], transportJobs: [job] })
    })
    vi.stubGlobal('fetch', fetchMock)
    const user = setup('listing')
    const listingCard = screen.getByText('審査中トラクター').closest('li')
    if (!listingCard) throw new Error('listing card')
    await user.type(within(listingCard).getByLabelText('メモ'), '掲載可')
    await user.click(within(listingCard).getByRole('button', { name: '承認' }))
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/queue',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(
      JSON.parse(
        (
          fetchMock.mock.calls.find(
            (call) =>
              (call as unknown as [string, RequestInit])[1]?.method === 'POST',
          ) as unknown as [string, RequestInit]
        )[1].body as string,
      ),
    ).toEqual({
      kind: 'listing',
      id: 'pending-listing',
      status: 'approved',
      note: '掲載可',
    })
    expect(await screen.findByText('該当なし')).toBeInTheDocument()
    expect(screen.queryByText('審査中トラクター')).not.toBeInTheDocument()
  })

  it('rejects a transport job', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return Response.json({ ...job, moderationStatus: 'rejected' })
      }
      return Response.json({ listings: [listing], transportJobs: [] })
    })
    vi.stubGlobal('fetch', fetchMock)
    const user = setup('transportJob')
    const jobCard = screen.getByText('審査中コンバイン').closest('li')
    if (!jobCard) throw new Error('job card')
    await user.click(within(jobCard).getByRole('button', { name: '却下' }))
    expect(
      JSON.parse(
        (
          fetchMock.mock.calls.find(
            (call) =>
              (call as unknown as [string, RequestInit])[1]?.method === 'POST',
          ) as unknown as [string, RequestInit]
        )[1].body as string,
      ),
    ).toMatchObject({
      kind: 'transportJob',
      id: 'pending-job',
      status: 'rejected',
    })
    expect(await screen.findByText('該当なし')).toBeInTheDocument()
  })
})
