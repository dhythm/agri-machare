// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ListingForm } from './listing-form'

function setup() {
  const queryClient = new QueryClient()
  render(
    <QueryClientProvider client={queryClient}>
      <ListingForm />
    </QueryClientProvider>,
  )
  return userEvent.setup()
}

afterEach(() => vi.unstubAllGlobals())

describe('ListingForm', () => {
  it('only asks for prices of the selected deals', async () => {
    const user = setup()
    expect(screen.getByLabelText('販売価格')).toBeInTheDocument()
    expect(screen.getByLabelText('レンタル料（1日）')).toBeInTheDocument()
    await user.click(screen.getByLabelText('販売する'))
    expect(screen.queryByLabelText('販売価格')).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText('レンタル購入を受け付ける'),
    ).not.toBeInTheDocument()
  })

  it('submits the listing with numbers as entered', async () => {
    const fetchMock = vi.fn(async () =>
      Response.json(
        { id: 'r1', receivedAt: '2026-09-13T00:00:00.000Z' },
        { status: 201 },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)
    const user = setup()
    await user.type(screen.getByLabelText('農機具名'), 'クボタ トラクター')
    await user.selectOptions(screen.getByLabelText('カテゴリ'), 'トラクター')
    await user.type(screen.getByLabelText('メーカー'), 'クボタ')
    await user.type(screen.getByLabelText('年式'), '2018')
    await user.type(screen.getByLabelText('稼働時間'), '500')
    await user.selectOptions(screen.getByLabelText('状態'), '使用感あり')
    await user.type(screen.getByLabelText('都道府県'), '新潟県')
    await user.type(screen.getByLabelText('市区町村'), '長岡市')
    await user.type(screen.getByLabelText('販売価格'), '1500000')
    await user.type(screen.getByLabelText('レンタル料（1日）'), '12000')
    await user.click(screen.getByLabelText('レンタル購入を受け付ける'))
    await user.type(screen.getByLabelText('説明'), 'キャビン付き。')
    await user.type(screen.getByLabelText('出品者名'), 'テスト農園')
    await user.selectOptions(screen.getByLabelText('出品者の区分'), '農業法人')
    await user.type(
      screen.getByLabelText('メールアドレス'),
      'seller@example.com',
    )
    await user.click(screen.getByRole('button', { name: '出品を申し込む' }))
    expect(await screen.findByRole('status')).toHaveTextContent(
      '受け付けました',
    )
    expect(
      screen.getByRole('link', { name: '出品した農機具を見る' }),
    ).toHaveAttribute('href', '/listings/r1')
    const body = JSON.parse(
      (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
        .body as string,
    )
    expect(body).toMatchObject({
      name: 'クボタ トラクター',
      deals: ['sale', 'rent'],
      salePrice: '1500000',
      rentToOwn: true,
      sellerName: 'テスト農園',
      sellerKind: '農業法人',
    })
  })
})
