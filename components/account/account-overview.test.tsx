// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Listing, TransportJob } from '@/lib/data'
import type { AccountOverview } from '@/lib/server/account'
import { AccountOverviewView } from './account-overview'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

const listing = (
  id: string,
  name: string,
  extra: Partial<Listing> = {},
): Listing => ({
  id,
  name,
  category: 'トラクター',
  maker: 'クボタ',
  year: 2019,
  hours: 620,
  condition: '目立った傷なし',
  prefecture: '新潟県',
  city: '長岡市',
  image: '/equipment/tractor.png',
  summary: '説明',
  deals: ['sale'],
  salePrice: 1_000_000,
  seller: { name: '出品者デモ', kind: '農業法人', rating: 0, reviews: 0 },
  tags: [],
  ...extra,
})

const job: TransportJob = {
  id: 'tj-01',
  item: 'コンバイン',
  from: '秋田県 大仙市',
  to: '山形県 天童市',
  distanceKm: 120,
  weight: '約2.4t',
  desiredDate: '9/28',
  reward: 38_000,
  status: '募集中',
}

const overview: AccountOverview = {
  listings: [
    {
      listing: listing('l-1', '公開中のトラクター'),
      inquiries: [
        {
          id: 'i-1',
          kind: 'listingInquiry',
          targetId: 'l-1',
          userId: 'demo-user',
          receivedAt: '2026-09-13T01:00:00.000Z',
          payload: {
            mode: 'rent',
            name: '山田',
            email: 'y@example.com',
            message: '借りたい',
          },
        },
      ],
    },
    {
      listing: listing('l-2', '審査中のコンバイン', {
        moderationStatus: 'pending',
      }),
      inquiries: [],
    },
  ],
  transportJobs: [{ job, applications: [] }],
  sentInquiries: [
    {
      submission: {
        id: 'i-2',
        kind: 'listingInquiry',
        targetId: 'trc-001',
        userId: 'me',
        receivedAt: '2026-09-13T02:00:00.000Z',
        payload: { mode: 'buy', message: '買いたい' },
      },
      listing: listing('trc-001', 'クボタ 45馬力'),
    },
  ],
  sentApplications: [],
  replyCounts: { 'i-1': 2 },
}

describe('AccountOverviewView', () => {
  it('lists owned rows with status and what came in', () => {
    render(<AccountOverviewView overview={overview} />)
    const mine = screen.getByRole('region', { name: '自分の出品' })
    expect(within(mine).getByText('公開中のトラクター')).toBeInTheDocument()
    expect(within(mine).getByText('審査待ち')).toBeInTheDocument()
    expect(within(mine).getByText('借りたい')).toBeInTheDocument()
    expect(within(mine).getByText('山田')).toBeInTheDocument()
    expect(
      within(mine).getByRole('link', { name: 'スレッドを開く' }),
    ).toHaveAttribute('href', '/account/threads/i-1')
    expect(within(mine).getByText('返信 2件')).toBeInTheDocument()
    expect(within(mine).getByText('未対応')).toBeInTheDocument()
    const jobs = screen.getByRole('region', { name: '自分の運搬依頼' })
    expect(within(jobs).getByText('コンバイン')).toBeInTheDocument()
    expect(within(jobs).getByText('応募はまだありません')).toBeInTheDocument()
    expect(
      within(jobs).getByRole('button', { name: '完了にする' }),
    ).toBeInTheDocument()
    const sent = screen.getByRole('region', { name: '送った問い合わせ' })
    expect(
      within(sent).getByRole('link', { name: 'クボタ 45馬力' }),
    ).toHaveAttribute('href', '/listings/trc-001')
    expect(within(sent).getByText('買いたい')).toBeInTheDocument()
    expect(
      within(sent).getByRole('link', { name: 'スレッドを開く' }),
    ).toHaveAttribute('href', '/account/threads/i-2')
    expect(
      within(screen.getByRole('region', { name: '送った応募' })).getByText(
        'まだありません',
      ),
    ).toBeInTheDocument()
  })
})
