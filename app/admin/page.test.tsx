// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AdminDashboardPage from './page'

vi.mock('next/navigation', () => ({ usePathname: () => '/admin' }))
vi.mock('@/lib/server/admin-overview', () => ({
  getAdminCounts: vi.fn(async () => ({
    pendingListings: 2,
    pendingTransportJobs: 3,
    requestedRentals: 4,
    openThreads: 6,
    carriers: 8,
  })),
}))

describe('AdminDashboardPage', () => {
  it('prioritizes pending review work and provides access to every operation', async () => {
    render(await AdminDashboardPage())
    expect(
      screen.getByRole('heading', { name: '審査を待っている案件' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('審査待ち 5 件')).toBeInTheDocument()
    for (const path of [
      '/admin/deals',
      '/admin/deals/rentals',
      '/admin/deals/inquiries',
      '/admin/deals/reviews',
      '/admin/transport',
      '/admin/transport/applications',
      '/admin/transport/carriers',
      '/admin/accounts',
    ]) {
      expect(
        screen
          .getAllByRole('link')
          .some((link) => link.getAttribute('href') === path),
      ).toBe(true)
    }
  })
})
