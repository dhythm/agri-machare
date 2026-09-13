'use client'

import { useState, type FormEvent } from 'react'
import { useSubmission, type SubmitMethod } from '@/lib/queries/submit'
import type { FieldErrors, ValidationResult } from '@/lib/validation/shared'

export function useSubmissionForm<T extends Record<string, unknown>>({
  url,
  method = 'POST',
  validate,
  initialValues,
}: {
  url: string
  method?: SubmitMethod
  validate: (input: unknown) => ValidationResult<unknown>
  initialValues: T
}) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FieldErrors>({})
  const mutation = useSubmission(url, method)

  const setValue = <K extends keyof T>(key: K, value: T[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!(key in current)) return current
      const next = { ...current }
      delete next[key as string]
      return next
    })
  }

  /** `overrides` lets a form add values computed right before sending. */
  const submit = async (event: FormEvent, overrides?: Partial<T>) => {
    event.preventDefault()
    const payload = { ...values, ...overrides }
    const result = validate(payload)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    setErrors({})
    try {
      const response = await mutation.mutateAsync(payload)
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
