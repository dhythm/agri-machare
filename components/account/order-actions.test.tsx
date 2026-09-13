// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { OrderActions } from './order-actions'

const refresh = vi.hoisted(() => vi.fn())
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))

afterEach(() => vi.unstubAllGlobals())

describe('OrderActions', () => {
  it('offers the seller accept and decline on a request', async () => {
    const fetchMock = vi.fn(async () => Response.json({ status: 'accepted' }))
    vi.stubGlobal('fetch', fetchMock)
    render(<OrderActions orderId="o-1" status="requested" party="seller" />)
    expect(screen.getByRole('button', { name: '辞退する' })).toBeInTheDocument()
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: '承諾する' }))
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/orders/o-1',
      expect.objectContaining({ method: 'PATCH' }),
    )
    expect(
      JSON.parse(
        (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
          .body as string,
      ),
    ).toEqual({ status: 'accepted' })
    expect(refresh).toHaveBeenCalled()
  })

  it('offers delivery to the seller and receipt confirmation to the buyer', () => {
    render(<OrderActions orderId="o-1" status="accepted" party="seller" />)
    expect(
      screen.getByRole('button', { name: '引き渡し済みにする' }),
    ).toBeInTheDocument()
    render(<OrderActions orderId="o-2" status="delivered" party="buyer" />)
    expect(
      screen.getByRole('button', { name: '受け取りを確認' }),
    ).toBeInTheDocument()
    const { container } = render(
      <OrderActions orderId="o-3" status="completed" party="buyer" />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
