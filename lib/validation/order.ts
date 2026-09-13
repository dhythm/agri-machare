import { orderStatuses, type OrderStatus } from '@/lib/data'
import {
  asRecord,
  finish,
  invalidInput,
  optionalText,
  requireChoice,
  type FieldErrors,
  type ValidationResult,
} from './shared'

export type OrderRequestInput = { message?: string }

export function validateOrderRequest(
  input: unknown,
): ValidationResult<OrderRequestInput> {
  const source = asRecord(input)
  if (!source) return invalidInput
  const errors: FieldErrors = {}
  const message = optionalText(errors, source, 'message', 'メッセージ', 1000)
  const value: OrderRequestInput = message === undefined ? {} : { message }
  return finish(errors, value)
}

export type OrderStatusInput = { status: OrderStatus }

export function validateOrderStatus(
  input: unknown,
): ValidationResult<OrderStatusInput> {
  const source = asRecord(input)
  if (!source) return invalidInput
  const errors: FieldErrors = {}
  const value: OrderStatusInput = {
    status: requireChoice(
      errors,
      source,
      'status',
      '状態',
      orderStatuses,
    ) as OrderStatus,
  }
  return finish(errors, value)
}
