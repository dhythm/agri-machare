// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AdminLogin } from './admin-login'

const refresh = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}))

function setup() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AdminLogin />
    </QueryClientProvider>,
  )
  return userEvent.setup()
}

afterEach(() => {
  vi.unstubAllGlobals()
  refresh.mockReset()
})

describe('AdminLogin', () => {
  it('submits the shared secret', async () => {
    const fetchMock = vi.fn(async () => Response.json({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)
    const user = setup()
    await user.type(screen.getByLabelText('運営キー'), 'shared-key')
    await user.click(screen.getByRole('button', { name: '入室' }))
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/session',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(
      JSON.parse(
        (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
          .body as string,
      ),
    ).toEqual({ secret: 'shared-key' })
    expect(refresh).toHaveBeenCalled()
  })

  it('shows an error when the key is wrong', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ error: '運営キーが違います。' }, { status: 401 }),
      ),
    )
    const user = setup()
    await user.type(screen.getByLabelText('運営キー'), 'nope')
    await user.click(screen.getByRole('button', { name: '入室' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '運営キーが違います。',
    )
  })
})
