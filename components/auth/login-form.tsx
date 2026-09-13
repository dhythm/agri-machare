'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { FormAlert, TextField } from '@/components/forms/fields'
import { SubmitButton } from '@/components/forms/submit-button'
import { validateLogin } from '@/lib/validation/auth'

const rejectedMessage = 'メールアドレスまたはパスワードが違います。'
const failedMessage = 'ログインできませんでした。'

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError(undefined)
    const parsed = validateLogin({ email, password })
    if (!parsed.ok) {
      setErrors(parsed.errors)
      return
    }
    setErrors({})
    setIsSubmitting(true)
    try {
      const result = await signIn('credentials', {
        ...parsed.value,
        redirect: false,
      })
      if (!result || result.error) {
        setError(result?.error ? rejectedMessage : failedMessage)
        return
      }
      router.push(callbackUrl)
      router.refresh()
    } catch {
      setError(failedMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex max-w-md flex-col gap-5">
      <FormAlert error={error} />
      <TextField
        id="email"
        label="メールアドレス"
        type="email"
        autoComplete="email"
        value={email}
        error={errors.email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <TextField
        id="password"
        label="パスワード"
        type="password"
        autoComplete="current-password"
        value={password}
        error={errors.password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <div>
        <SubmitButton label="ログイン" isSubmitting={isSubmitting} />
      </div>
    </form>
  )
}
