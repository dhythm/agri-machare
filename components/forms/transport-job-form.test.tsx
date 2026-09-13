// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TransportJobForm } from './transport-job-form'

function setup() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <TransportJobForm />
    </QueryClientProvider>,
  )
  return userEvent.setup()
}

afterEach(() => vi.unstubAllGlobals())

describe('TransportJobForm', () => {
  it('validates before posting', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const user = setup()
    await user.click(screen.getByRole('button', { name: '運搬を依頼する' }))
    expect(screen.getByLabelText('運ぶもの')).toHaveAccessibleDescription(
      '運ぶものを入力してください。',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('posts the job and links to it', async () => {
    const fetchMock = vi.fn(async () =>
      Response.json(
        { id: 'job-1', receivedAt: '2026-09-13T00:00:00.000Z' },
        { status: 201 },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)
    const user = setup()
    await user.type(screen.getByLabelText('運ぶもの'), 'トラクター 25馬力')
    await user.type(screen.getByLabelText('出発地'), '長野県 松本市')
    await user.type(screen.getByLabelText('届け先'), '長野県 諏訪市')
    await user.type(screen.getByLabelText('距離（km）'), '40')
    await user.type(screen.getByLabelText('重量'), '約1.2t')
    await user.type(screen.getByLabelText('希望日'), '相談')
    await user.type(screen.getByLabelText('報酬（円）'), '14000')
    await user.type(
      screen.getByLabelText('メールアドレス'),
      'owner@example.com',
    )
    await user.click(screen.getByRole('button', { name: '運搬を依頼する' }))
    expect(await screen.findByRole('status')).toHaveTextContent(
      '受け付けました',
    )
    expect(screen.getByRole('link', { name: '案件を見る' })).toHaveAttribute(
      'href',
      '/transport/job-1',
    )
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/transport/jobs',
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
