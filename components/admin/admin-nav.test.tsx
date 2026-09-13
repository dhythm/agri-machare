// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AdminNav } from './admin-nav'

const usePathname = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({ usePathname }))

describe('AdminNav', () => {
  it('marks the current section', () => {
    usePathname.mockReturnValue('/admin')
    render(<AdminNav />)
    const review = screen.getByRole('link', { name: '審査' })
    expect(review).toHaveAttribute('href', '/admin')
    expect(review).toHaveAttribute('aria-current', 'page')
  })

  it('treats nested paths as the same section', () => {
    usePathname.mockReturnValue('/admin/listings/abc')
    render(<AdminNav />)
    expect(screen.getByRole('link', { name: '審査' })).not.toHaveAttribute(
      'aria-current',
    )
  })
})
