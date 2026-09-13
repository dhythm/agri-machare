import 'server-only'

import { getStore, type AccountStatus } from '../store'

export type AccountStatusValue = AccountStatus['status']

export async function getAccountStatus(
  userId: string,
): Promise<{ status: AccountStatusValue; note?: string; updatedAt?: string }> {
  const row = await getStore().accountStatuses.get(userId)
  return row
    ? { status: row.status, note: row.note, updatedAt: row.updatedAt }
    : { status: 'active' }
}

export async function isSuspended(userId: string): Promise<boolean> {
  return (await getAccountStatus(userId)).status === 'suspended'
}

/** Restoring an account clears the note. */
export async function setAccountStatus(
  userId: string,
  status: AccountStatusValue,
  note?: string,
): Promise<AccountStatus> {
  const store = getStore()
  const next: AccountStatus = {
    id: userId,
    status,
    note: status === 'suspended' ? note : undefined,
    updatedAt: new Date().toISOString(),
  }
  const existing = await store.accountStatuses.get(userId)
  if (!existing) return store.accountStatuses.create(next)
  return (await store.accountStatuses.update(userId, next)) ?? next
}
