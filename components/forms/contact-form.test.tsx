// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ContactForm } from './contact-form'

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <ContactForm />
    </QueryClientProvider>,
  )
  return userEvent.setup()
}

async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('お名前'), '鈴木')
  await user.type(screen.getByLabelText('メールアドレス'), 'suzuki@example.com')
  await user.selectOptions(screen.getByLabelText('お問い合わせ種別'), 'その他')
  await user.type(screen.getByLabelText('お問い合わせ内容'), 'テストです。')
}

afterEach(() => vi.unstubAllGlobals())

describe('ContactForm', () => {
  it('shows validation errors without calling the server', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const user = setup()
    await user.click(screen.getByRole('button', { name: '送信する' }))
    expect(screen.getByLabelText('お名前')).toHaveAccessibleDescription(
      'お名前を入力してください。',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('posts the message and shows the receipt', async () => {
    const fetchMock = vi.fn(async () =>
      Response.json(
        { id: 'receipt-1', receivedAt: '2026-09-13T00:00:00.000Z' },
        { status: 201 },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)
    const user = setup()
    await fill(user)
    await user.click(screen.getByRole('button', { name: '送信する' }))
    expect(await screen.findByRole('status')).toHaveTextContent(
      '受け付けました',
    )
    expect(screen.getByText('receipt-1')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/contact',
      expect.objectContaining({ method: 'POST' }),
    )
    const body = JSON.parse(
      (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
        .body as string,
    )
    expect(body).toMatchObject({ name: '鈴木', topic: 'その他' })
  })

  it('shows server-side field errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          { error: '入力内容に誤りがあります。', errors: { email: 'NG' } },
          { status: 400 },
        ),
      ),
    )
    const user = setup()
    await fill(user)
    await user.click(screen.getByRole('button', { name: '送信する' }))
    expect(await screen.findByText('NG', { selector: 'p' })).toBeInTheDocument()
  })

  it('reports a network failure and allows retry', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 500 }))
      .mockResolvedValueOnce(
        Response.json(
          { id: 'r2', receivedAt: '2026-09-13T00:00:00.000Z' },
          { status: 201 },
        ),
      )
    vi.stubGlobal('fetch', fetchMock)
    const user = setup()
    await fill(user)
    await user.click(screen.getByRole('button', { name: '送信する' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '送信できませんでした',
    )
    await user.click(screen.getByRole('button', { name: '送信する' }))
    expect(await screen.findByRole('status')).toHaveTextContent(
      '受け付けました',
    )
  })
})
