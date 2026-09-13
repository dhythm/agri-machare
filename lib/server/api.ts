import 'server-only'

import type { ValidationResult } from '@/lib/validation/shared'
import { acceptSubmission, type SubmissionKind } from './submissions'

export function badRequest(
  error: string,
  errors?: Record<string, string>,
): Response {
  return Response.json(errors ? { error, errors } : { error }, {
    status: 400,
  })
}

export function notFound(error: string): Response {
  return Response.json({ error }, { status: 404 })
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return undefined
  }
}

export async function handleSubmission<T extends Record<string, unknown>>(
  request: Request,
  kind: SubmissionKind,
  validate: (input: unknown) => ValidationResult<T>,
  refine?: (value: T) => Record<string, string> | undefined,
): Promise<Response> {
  const input = await readJson(request)
  if (input === undefined) return badRequest('JSON を読み取れませんでした。')
  const result = validate(input)
  if (!result.ok) return badRequest('入力内容に誤りがあります。', result.errors)
  const errors = refine?.(result.value)
  if (errors) return badRequest('入力内容に誤りがあります。', errors)
  return Response.json(acceptSubmission(kind, result.value), { status: 201 })
}
