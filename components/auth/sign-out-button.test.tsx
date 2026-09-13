// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SignOutButton } from './sign-out-button'

const signOut = vi.hoisted(() => vi.fn())

vi.mock('next-auth/react', () => ({ signOut }))

describe('SignOutButton', () => {
  it('signs out to the top page', async () => {
    render(<SignOutButton />)
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'ログアウト' }))
    expect(signOut).toHaveBeenCalledWith({ redirectTo: '/' })
  })
})
