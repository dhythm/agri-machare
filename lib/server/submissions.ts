import 'server-only'

import { randomUUID } from 'node:crypto'
import { getStore, type Submission, type SubmissionKind } from './store'

export type { SubmissionKind }

export type Receipt = {
  id: string
  receivedAt: string
}

/**
 * Store a validated form submission and issue a receipt. `targetId` links
 * the submission to the listing or transport job it refers to.
 */
export async function acceptSubmission(
  kind: SubmissionKind,
  payload: Record<string, unknown>,
  targetId?: string,
): Promise<Receipt> {
  const submission: Submission = {
    id: randomUUID(),
    kind,
    targetId,
    receivedAt: new Date().toISOString(),
    payload,
  }
  await getStore().submissions.create(submission)
  return { id: submission.id, receivedAt: submission.receivedAt }
}

export async function listSubmissions(
  kind: SubmissionKind,
  targetId?: string,
): Promise<Submission[]> {
  const submissions = await getStore().submissions.list()
  return submissions.filter(
    (submission) =>
      submission.kind === kind &&
      (targetId === undefined || submission.targetId === targetId),
  )
}

export async function deleteSubmissionsFor(targetId: string): Promise<void> {
  const submissions = await getStore().submissions.list()
  await Promise.all(
    submissions
      .filter((submission) => submission.targetId === targetId)
      .map((submission) => getStore().submissions.delete(submission.id)),
  )
}
