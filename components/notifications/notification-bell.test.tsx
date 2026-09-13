// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { NotificationBell } from './notification-bell'

afterEach(() => vi.unstubAllGlobals())

function setup() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <NotificationBell />
    </QueryClientProvider>,
  )
}

describe('NotificationBell', () => {
  it('shows the unread count', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ items: [], unreadCount: 3 })),
    )
    setup()
    const link = screen.getByRole('link', { name: /通知/ })
    expect(link).toHaveAttribute('href', '/account/notifications')
    expect(await screen.findByText('3')).toBeInTheDocument()
  })

  it('hides the badge when everything is read', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ items: [], unreadCount: 0 })),
    )
    setup()
    await screen.findByRole('link', { name: '通知' })
    expect(screen.queryByText('0')).toBeNull()
  })
})
