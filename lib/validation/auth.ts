import {
  asRecord,
  finish,
  invalidInput,
  requireEmail,
  requireText,
  type FieldErrors,
  type ValidationResult,
} from './shared'

export type LoginInput = {
  email: string
  password: string
}

export function validateLogin(input: unknown): ValidationResult<LoginInput> {
  const source = asRecord(input)
  if (!source) return invalidInput
  const errors: FieldErrors = {}
  const value: LoginInput = {
    email: requireEmail(errors, source, 'email'),
    password: requireText(errors, source, 'password', 'パスワード', 200),
  }
  return finish(errors, value)
}

/** Accept only same-origin paths so the login redirect cannot leave the site. */
export function readCallbackUrl(value: string | undefined): string {
  if (!value || !value.startsWith('/')) return '/'
  if (value.startsWith('//') || value.startsWith('/\\')) return '/'
  return value
}
