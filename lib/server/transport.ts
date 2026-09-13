import 'server-only'

import { randomUUID } from 'node:crypto'
import { isApproved, type TransportJob } from '@/lib/data'
import type { TransportJobInput } from '@/lib/validation/transport'
import { getStore } from './store'
import { deleteSubmissionsFor } from './submissions'

/** Public board: approved jobs that are not finished. */
export async function getTransportJobs(): Promise<TransportJob[]> {
  return (await getStore().transportJobs.list()).filter(
    (job) => isApproved(job) && job.status !== '完了',
  )
}

export function getTransportJob(id: string): Promise<TransportJob | undefined> {
  return getStore().transportJobs.get(id)
}

export async function getTransportJobIds(): Promise<string[]> {
  return (await getTransportJobs()).map((job) => job.id)
}

/** Public job fields; the requester's contact email is not published. */
function jobFields(input: TransportJobInput) {
  return {
    item: input.item,
    from: input.from,
    to: input.to,
    distanceKm: input.distanceKm,
    weight: input.weight,
    desiredDate: input.desiredDate,
    reward: input.reward,
  }
}

export function createTransportJob(
  input: TransportJobInput,
  ownerUserId: string,
): Promise<TransportJob> {
  const now = new Date().toISOString()
  return getStore().transportJobs.create({
    id: randomUUID(),
    ...jobFields(input),
    ownerUserId,
    status: '募集中',
    createdAt: now,
    updatedAt: now,
    moderationStatus: 'pending',
  })
}

export function updateTransportJob(
  id: string,
  input: TransportJobInput,
): Promise<TransportJob | undefined> {
  return getStore().transportJobs.update(id, {
    ...jobFields(input),
    updatedAt: new Date().toISOString(),
  })
}

export async function completeTransportJob(
  id: string,
): Promise<TransportJob | undefined> {
  return getStore().transportJobs.update(id, {
    status: '完了',
    updatedAt: new Date().toISOString(),
  })
}

export async function deleteTransportJob(id: string): Promise<boolean> {
  const deleted = await getStore().transportJobs.delete(id)
  if (deleted) await deleteSubmissionsFor(id)
  return deleted
}
