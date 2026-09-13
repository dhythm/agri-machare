import {
  asRecord,
  finish,
  invalidInput,
  optionalText,
  requireChoice,
  type FieldErrors,
  type ValidationResult,
} from './shared'

const accountStatuses = ['active', 'suspended'] as const

export type AccountStatusInput = {
  status: (typeof accountStatuses)[number]
  note?: string
}

export function validateAccountStatus(
  input: unknown,
): ValidationResult<AccountStatusInput> {
  const source = asRecord(input)
  if (!source) return invalidInput
  const errors: FieldErrors = {}
  const value: AccountStatusInput = {
    status: requireChoice(
      errors,
      source,
      'status',
      '状態',
      accountStatuses,
    ) as AccountStatusInput['status'],
    note: optionalText(errors, source, 'note', 'メモ', 500),
  }
  return finish(errors, value)
}
