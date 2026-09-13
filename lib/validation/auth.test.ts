import { describe, expect, it } from 'vitest'
import { readCallbackUrl, validateLogin } from './auth'

describe('validateLogin', () => {
  it('accepts an email and password', () => {
    expect(
      validateLogin({ email: ' admin@example.com ', password: 'dev-admin' }),
    ).toEqual({
      ok: true,
      value: { email: 'admin@example.com', password: 'dev-admin' },
    })
  })

  it('reports missing or malformed fields', () => {
    expect(validateLogin({ email: 'not-an-email', password: '' })).toEqual({
      ok: false,
      errors: {
        email: 'メールアドレスの形式が正しくありません。',
        password: 'パスワードを入力してください。',
      },
    })
    expect(validateLogin(null).ok).toBe(false)
  })
})

describe('readCallbackUrl', () => {
  it('keeps same-origin paths and falls back to the top page', () => {
    expect(readCallbackUrl('/admin')).toBe('/admin')
    expect(readCallbackUrl('/listings?page=2')).toBe('/listings?page=2')
    expect(readCallbackUrl(undefined)).toBe('/')
    expect(readCallbackUrl('')).toBe('/')
    expect(readCallbackUrl('https://evil.example')).toBe('/')
    expect(readCallbackUrl('//evil.example')).toBe('/')
    expect(readCallbackUrl('/\\evil.example')).toBe('/')
  })
})
