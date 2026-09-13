// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoginPrompt } from './login-prompt'

describe('LoginPrompt', () => {
  it('explains and links to login with the return path', () => {
    render(<LoginPrompt action="出品する" callbackUrl="/listings/new" />)
    expect(
      screen.getByText('出品するにはログインが必要です。'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ログイン' })).toHaveAttribute(
      'href',
      '/login?callbackUrl=%2Flistings%2Fnew',
    )
  })
})
