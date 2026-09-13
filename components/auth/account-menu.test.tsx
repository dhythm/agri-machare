// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AccountMenu } from './account-menu'

const { useSession, signOut } = vi.hoisted(() => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('next-auth/react', () => ({ useSession, signOut }))

afterEach(() => {
  useSession.mockReset()
  signOut.mockReset()
})

describe('AccountMenu', () => {
  it('renders nothing while the session loads', () => {
    useSession.mockReturnValue({ status: 'loading', data: null })
    const { container } = render(<AccountMenu />)
    expect(container).toBeEmptyDOMElement()
  })

  it('links to the login page when signed out', () => {
    useSession.mockReturnValue({ status: 'unauthenticated', data: null })
    render(<AccountMenu />)
    expect(screen.getByRole('link', { name: 'ログイン' })).toHaveAttribute(
      'href',
      '/login',
    )
  })

  it('shows the admin link and signs out', async () => {
    useSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { name: '運営デモ', role: 'admin' } },
    })
    render(<AccountMenu />)
    expect(screen.getByRole('link', { name: '運営審査' })).toHaveAttribute(
      'href',
      '/admin',
    )
    expect(screen.getByText('運営デモ')).toBeInTheDocument()
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'ログアウト' }))
    expect(signOut).toHaveBeenCalledWith({ redirectTo: '/' })
  })

  it('hides the admin link for a regular user', () => {
    useSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { name: '利用者デモ', role: 'user' } },
    })
    render(<AccountMenu />)
    expect(screen.queryByRole('link', { name: '運営審査' })).toBeNull()
  })
})
