// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LoginForm } from './login-form'

const { signIn, push, refresh } = vi.hoisted(() => ({
  signIn: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock('next-auth/react', () => ({ signIn }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
}))

afterEach(() => {
  signIn.mockReset()
  push.mockReset()
  refresh.mockReset()
})

async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('メールアドレス'), 'admin@example.com')
  await user.type(screen.getByLabelText('パスワード'), 'dev-admin')
}

describe('LoginForm', () => {
  it('signs in and moves to the callback url', async () => {
    signIn.mockResolvedValue({ ok: true, error: null })
    render(<LoginForm callbackUrl="/admin" />)
    const user = userEvent.setup()
    await fill(user)
    await user.click(screen.getByRole('button', { name: 'ログイン' }))
    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'admin@example.com',
      password: 'dev-admin',
      redirect: false,
    })
    expect(push).toHaveBeenCalledWith('/admin')
    expect(refresh).toHaveBeenCalled()
  })

  it('shows field errors without calling signIn', async () => {
    render(<LoginForm callbackUrl="/" />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'ログイン' }))
    expect(
      await screen.findByText('メールアドレスを入力してください。'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('パスワードを入力してください。'),
    ).toBeInTheDocument()
    expect(signIn).not.toHaveBeenCalled()
  })

  it('shows an error when the credentials are rejected', async () => {
    signIn.mockResolvedValue({ ok: false, error: 'CredentialsSignin' })
    render(<LoginForm callbackUrl="/" />)
    const user = userEvent.setup()
    await fill(user)
    await user.click(screen.getByRole('button', { name: 'ログイン' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'メールアドレスまたはパスワードが違います。',
    )
    expect(push).not.toHaveBeenCalled()
  })
})
