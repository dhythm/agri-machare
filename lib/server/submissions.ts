import 'server-only'

import { randomUUID } from 'node:crypto'

export type SubmissionKind =
  | 'listing'
  | 'listingInquiry'
  | 'transportRegistration'
  | 'transportApplication'
  | 'contact'

export type Receipt = {
  id: string
  receivedAt: string
}

/**
 * Boundary for persisting form submissions. Persistence is not implemented:
 * a receipt is issued so the UI can confirm acceptance, and this function is
 * where a database write belongs once storage is chosen.
 */
export function acceptSubmission(
  kind: SubmissionKind,
  payload: Record<string, unknown>,
): Receipt {
  void kind
  void payload
  return { id: randomUUID(), receivedAt: new Date().toISOString() }
}
