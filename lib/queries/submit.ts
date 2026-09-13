import { useMutation } from '@tanstack/react-query'

export type Receipt = { id: string; receivedAt: string }

export type SubmitResult =
  | { ok: true; receipt: Receipt }
  | { ok: false; message: string; errors: Record<string, string> }

export type SubmitMethod = 'POST' | 'PUT'

async function sendJson(
  url: string,
  method: SubmitMethod,
  body: Record<string, unknown>,
): Promise<SubmitResult> {
  const response = await fetch(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (response.status === 201 || response.status === 200) {
    const payload = (await response.json()) as {
      id: string
      receivedAt?: string
      updatedAt?: string
    }
    return {
      ok: true,
      receipt: {
        id: payload.id,
        receivedAt:
          payload.receivedAt ?? payload.updatedAt ?? new Date().toISOString(),
      },
    }
  }
  if (response.status === 400) {
    const payload = (await response.json()) as {
      error?: string
      errors?: Record<string, string>
    }
    return {
      ok: false,
      message: payload.error ?? '入力内容に誤りがあります。',
      errors: payload.errors ?? {},
    }
  }
  throw new Error('送信できませんでした。')
}

export function useSubmission(url: string, method: SubmitMethod = 'POST') {
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => sendJson(url, method, body),
  })
}
