// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AdminShell } from './admin-shell'

vi.mock('next/navigation', () => ({ usePathname: () => '/admin' }))
vi.mock('next-auth/react', () => ({ signOut: vi.fn() }))

describe('AdminShell', () => {
  it('shows the operator, navigation, and content', () => {
    render(
      <AdminShell user={{ name: '運営デモ' }}>
        <p>本文</p>
      </AdminShell>,
    )
    expect(screen.getByText('運営デモ')).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: '運営メニュー' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'サイトを表示' })).toHaveAttribute(
      'href',
      '/',
    )
    expect(
      screen.getByRole('button', { name: 'ログアウト' }),
    ).toBeInTheDocument()
    expect(screen.getByText('本文')).toBeInTheDocument()
  })
})
