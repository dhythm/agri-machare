'use client'

import { Button } from '@/components/ui/button'

export function SubmitButton({
  label,
  isSubmitting,
}: {
  label: string
  isSubmitting: boolean
}) {
  return (
    <Button type="submit" className="h-11 px-6" disabled={isSubmitting}>
      {isSubmitting ? '送信中…' : label}
    </Button>
  )
}
