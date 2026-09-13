import 'server-only'

import { randomUUID } from 'node:crypto'
import { getStore, type Submission, type SubmissionKind } from './store'
import { deleteMessagesFor } from './threads'

export type { SubmissionKind }

export type Receipt = {
  id: string
  receivedAt: string
}

export type SubmissionOptions = {
  /** Listing or transport job the submission refers to. */
  targetId?: string
  /** Signed-in sender, when the form requires login. */
  userId?: string
}

/** Store a validated form submission and issue a receipt. */
export async function acceptSubmission(
  kind: SubmissionKind,
  payload: Record<string, unknown>,
  options: SubmissionOptions = {},
): Promise<Receipt> {
  const submission: Submission = {
    id: randomUUID(),
    kind,
    targetId: options.targetId,
    userId: options.userId,
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

export async function listSubmissionsByUser(
  userId: string,
): Promise<Submission[]> {
  const submissions = await getStore().submissions.list()
  return submissions.filter((submission) => submission.userId === userId)
}

export async function deleteSubmissionsFor(targetId: string): Promise<void> {
  const submissions = await getStore().submissions.list()
  const related = submissions.filter(
    (submission) => submission.targetId === targetId,
  )
  await deleteMessagesFor(related.map((submission) => submission.id))
  await Promise.all(
    related.map((submission) => getStore().submissions.delete(submission.id)),
  )
}
