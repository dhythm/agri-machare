// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RentalActions } from './rental-actions'

const refresh = vi.hoisted(() => vi.fn())
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))

afterEach(() => vi.unstubAllGlobals())

describe('RentalActions', () => {
  it('offers the owner approve and decline on a request', async () => {
    const fetchMock = vi.fn(async () => Response.json({ status: 'active' }))
    vi.stubGlobal('fetch', fetchMock)
    render(
      <RentalActions
        rentalId="r-1"
        status="requested"
        party="owner"
        canConvert={false}
      />,
    )
    expect(screen.getByRole('button', { name: '辞退する' })).toBeInTheDocument()
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: '承認する' }))
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/rentals/r-1',
      expect.objectContaining({ method: 'PATCH' }),
    )
    expect(
      JSON.parse(
        (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
          .body as string,
      ),
    ).toEqual({ status: 'active' })
    expect(refresh).toHaveBeenCalled()
  })

  it('offers the renter conversion only when allowed', () => {
    render(
      <RentalActions
        rentalId="r-1"
        status="active"
        party="renter"
        canConvert
      />,
    )
    expect(
      screen.getByRole('button', { name: '購入に切り替える' }),
    ).toBeInTheDocument()
    render(
      <RentalActions
        rentalId="r-2"
        status="active"
        party="renter"
        canConvert={false}
      />,
    )
    expect(
      screen.getAllByRole('button', { name: '購入に切り替える' }),
    ).toHaveLength(1)
  })

  it('renders nothing when no action applies', () => {
    const { container } = render(
      <RentalActions
        rentalId="r-1"
        status="completed"
        party="owner"
        canConvert={false}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
