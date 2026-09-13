'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { FormAlert, TextField } from '@/components/forms/fields'
import { SubmitButton } from '@/components/forms/submit-button'

export function AdminLogin() {
  const router = useRouter()
  const [secret, setSecret] = useState('')
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(undefined)
    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ secret }),
      })
      if (response.ok) {
        router.refresh()
        return
      }
      const body = (await response.json()) as { error?: string }
      setError(body.error ?? '入室できませんでした。')
    } catch {
      setError('入室できませんでした。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex max-w-md flex-col gap-5">
      <FormAlert error={error} />
      <TextField
        id="secret"
        label="運営キー"
        type="password"
        autoComplete="current-password"
        value={secret}
        onChange={(event) => setSecret(event.target.value)}
      />
      <div>
        <SubmitButton label="入室" isSubmitting={isSubmitting} />
      </div>
    </form>
  )
}
