import { rentalStatuses, type RentalStatus } from '@/lib/rent-to-own'
import {
  asRecord,
  finish,
  invalidInput,
  readDate,
  requireChoice,
  type FieldErrors,
  type ValidationResult,
} from './shared'

export type RentalRequestInput = { startDate: string; endDate: string }

export function validateRentalRequest(
  input: unknown,
): ValidationResult<RentalRequestInput> {
  const source = asRecord(input)
  if (!source) return invalidInput
  const errors: FieldErrors = {}
  const value: RentalRequestInput = {
    startDate: readDate(errors, source, 'startDate', '開始日', true) as string,
    endDate: readDate(errors, source, 'endDate', '終了日', true) as string,
  }
  return finish(errors, value)
}

export type RentalStatusInput = { status: RentalStatus }

export function validateRentalStatus(
  input: unknown,
): ValidationResult<RentalStatusInput> {
  const source = asRecord(input)
  if (!source) return invalidInput
  const errors: FieldErrors = {}
  const value: RentalStatusInput = {
    status: requireChoice(
      errors,
      source,
      'status',
      '状態',
      rentalStatuses,
    ) as RentalStatus,
  }
  return finish(errors, value)
}
