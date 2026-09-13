// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CompleteJobButton } from './complete-job-button'

const refresh = vi.hoisted(() => vi.fn())
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))

afterEach(() => vi.unstubAllGlobals())

describe('CompleteJobButton', () => {
  it('marks the job as completed', async () => {
    const fetchMock = vi.fn(async () => Response.json({ status: '完了' }))
    vi.stubGlobal('fetch', fetchMock)
    render(<CompleteJobButton jobId="tj-01" />)
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: '完了にする' }))
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/transport/jobs/tj-01/status',
      expect.objectContaining({ method: 'PATCH' }),
    )
    expect(refresh).toHaveBeenCalled()
  })
})
