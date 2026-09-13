'use client'

import { useState, type FormEvent } from 'react'
import { useSubmission } from '@/lib/queries/submit'
import type { FieldErrors, ValidationResult } from '@/lib/validation/shared'

export function useSubmissionForm<T extends Record<string, unknown>>({
  url,
  validate,
  initialValues,
}: {
  url: string
  validate: (input: unknown) => ValidationResult<unknown>
  initialValues: T
}) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FieldErrors>({})
  const mutation = useSubmission(url)

  const setValue = <K extends keyof T>(key: K, value: T[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!(key in current)) return current
      const next = { ...current }
      delete next[key as string]
      return next
    })
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const result = validate(values)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    setErrors({})
    try {
      const response = await mutation.mutateAsync(values)
      if (!response.ok) setErrors(response.errors)
    } catch {
      // mutation.isError carries the failure to the UI
    }
  }

  return {
    values,
    setValue,
    errors,
    submit,
    isSubmitting: mutation.isPending,
    failed: mutation.isError,
    receipt: mutation.data?.ok ? mutation.data.receipt : undefined,
  }
}
