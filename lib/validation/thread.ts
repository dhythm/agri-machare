import { threadStatuses, type ThreadStatus } from '@/lib/data'
import {
  asRecord,
  finish,
  invalidInput,
  requireChoice,
  requireText,
  type FieldErrors,
  type ValidationResult,
} from './shared'

export type MessageInput = { body: string }

export function validateMessage(
  input: unknown,
): ValidationResult<MessageInput> {
  const source = asRecord(input)
  if (!source) return invalidInput
  const errors: FieldErrors = {}
  const value: MessageInput = {
    body: requireText(errors, source, 'body', 'メッセージ', 2000),
  }
  return finish(errors, value)
}

export type ThreadStatusInput = { status: ThreadStatus }

export function validateThreadStatus(
  input: unknown,
): ValidationResult<ThreadStatusInput> {
  const source = asRecord(input)
  if (!source) return invalidInput
  const errors: FieldErrors = {}
  const value: ThreadStatusInput = {
    status: requireChoice(
      errors,
      source,
      'status',
      '状態',
      threadStatuses,
    ) as ThreadStatus,
  }
  return finish(errors, value)
}
