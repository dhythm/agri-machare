import { useMutation } from '@tanstack/react-query'

export type Receipt = { id: string; receivedAt: string }

export type SubmitResult =
  | { ok: true; receipt: Receipt }
  | { ok: false; message: string; errors: Record<string, string> }

async function postJson(
  url: string,
  body: Record<string, unknown>,
): Promise<SubmitResult> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (response.status === 201) {
    return { ok: true, receipt: (await response.json()) as Receipt }
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

export function useSubmission(url: string) {
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => postJson(url, body),
  })
}
