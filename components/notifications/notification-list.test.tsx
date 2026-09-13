// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { NotificationList } from './notification-list'

const { push, refresh } = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh }) }))

afterEach(() => {
  vi.unstubAllGlobals()
  push.mockReset()
  refresh.mockReset()
})

const items = [
  {
    id: 'n-1',
    userId: 'demo-user',
    kind: 'reply' as const,
    title: '返信が届きました',
    body: 'クボタ 45馬力',
    href: '/account/threads/t-1',
    createdAt: '2026-09-13T06:00:00.000Z',
  },
  {
    id: 'n-2',
    userId: 'demo-user',
    kind: 'rental' as const,
    title: 'レンタルが「レンタル中」になりました',
    href: '/account',
    createdAt: '2026-09-13T05:00:00.000Z',
    readAt: '2026-09-13T05:30:00.000Z',
  },
]

describe('NotificationList', () => {
  it('marks a notification read before following its link', async () => {
    const fetchMock = vi.fn(async () => Response.json({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)
    render(<NotificationList items={items} />)
    expect(screen.getByText('クボタ 45馬力')).toBeInTheDocument()
    expect(screen.getByText('未読')).toBeInTheDocument()
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: /返信が届きました/ }))
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/notifications/n-1',
      expect.objectContaining({ method: 'PATCH' }),
    )
    expect(push).toHaveBeenCalledWith('/account/threads/t-1')
  })

  it('marks everything read', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    render(<NotificationList items={items} />)
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'すべて既読にする' }))
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/notifications/read-all',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(refresh).toHaveBeenCalled()
  })

  it('shows an empty state', () => {
    render(<NotificationList items={[]} />)
    expect(screen.getByText('通知はまだありません')).toBeInTheDocument()
  })
})
