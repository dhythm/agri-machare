// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './pagination'

describe('Pagination', () => {
  it('moves between pages and disables the edges', async () => {
    const onChange = vi.fn()
    render(<Pagination page={1} pageCount={3} onChange={onChange} />)
    expect(screen.getByRole('button', { name: /前/ })).toBeDisabled()
    await userEvent.setup().click(screen.getByRole('button', { name: /次/ }))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('renders nothing for a single page', () => {
    const { container } = render(
      <Pagination page={1} pageCount={1} onChange={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
