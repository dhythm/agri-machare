// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AccountStatusButton } from './account-status-button'

const refresh = vi.hoisted(() => vi.fn())
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))

afterEach(() => vi.unstubAllGlobals())

describe('AccountStatusButton', () => {
  it('suspends with a note', async () => {
    const fetchMock = vi.fn(async () => Response.json({ status: 'suspended' }))
    vi.stubGlobal('fetch', fetchMock)
    render(<AccountStatusButton userId="demo-user" status="active" />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('メモ'), '規約違反')
    await user.click(screen.getByRole('button', { name: '停止する' }))
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/accounts/demo-user',
      expect.objectContaining({ method: 'PATCH' }),
    )
    expect(
      JSON.parse(
        (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
          .body as string,
      ),
    ).toEqual({ status: 'suspended', note: '規約違反' })
    expect(refresh).toHaveBeenCalled()
  })

  it('restores a suspended account', async () => {
    const fetchMock = vi.fn(async () => Response.json({ status: 'active' }))
    vi.stubGlobal('fetch', fetchMock)
    render(<AccountStatusButton userId="demo-user" status="suspended" />)
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: '停止を解除' }))
    expect(
      JSON.parse(
        (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
          .body as string,
      ),
    ).toEqual({ status: 'active' })
  })

  it('is disabled for the signed-in admin', () => {
    render(<AccountStatusButton userId="demo-admin" status="active" self />)
    expect(screen.getByRole('button', { name: '停止する' })).toBeDisabled()
  })
})
