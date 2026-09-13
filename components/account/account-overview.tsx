import Link from 'next/link'
import { Badge } from '@/components/badge'
import {
  formatYen,
  threadStatusLabels,
  type ModerationStatus,
} from '@/lib/data'
import type { AccountOverview } from '@/lib/server/account'
import type { Submission } from '@/lib/server/store/types'
import { CompleteJobButton } from './complete-job-button'

const moderationLabels: Record<ModerationStatus, string> = {
  pending: '審査待ち',
  approved: '公開中',
  rejected: '却下',
}

function ModerationBadge({ status }: { status?: ModerationStatus }) {
  const resolved = status ?? 'approved'
  return (
    <Badge variant={resolved === 'approved' ? 'muted' : 'default'}>
      {moderationLabels[resolved]}
    </Badge>
  )
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function ThreadMeta({
  submission,
  replyCount,
}: {
  submission: Submission
  replyCount: number
}) {
  const status = submission.status ?? 'new'
  return (
    <span className="flex flex-wrap items-center gap-2">
      <Badge variant={status === 'new' ? 'default' : 'muted'}>
        {threadStatusLabels[status]}
      </Badge>
      {replyCount > 0 && (
        <span className="text-xs text-muted-foreground">
          返信 {replyCount}件
        </span>
      )}
      <Link
        href={`/account/threads/${submission.id}`}
        className="text-xs font-medium text-primary hover:underline"
      >
        スレッドを開く
      </Link>
    </span>
  )
}

function receivedAt(submission: Submission): string {
  return new Date(submission.receivedAt).toLocaleString('ja-JP')
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={`section-${title}`}>
      <h2
        id={`section-${title}`}
        className="font-display text-lg font-bold text-foreground"
      >
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Empty({ label }: { label: string }) {
  return <p className="text-sm text-muted-foreground">{label}</p>
}

function IncomingList({
  items,
  empty,
  render,
}: {
  items: Submission[]
  empty: string
  render: (submission: Submission) => React.ReactNode
}) {
  if (items.length === 0) return <Empty label={empty} />
  return (
    <ul className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
      {items.map((submission) => (
        <li key={submission.id} className="text-sm">
          {render(submission)}
        </li>
      ))}
    </ul>
  )
}

export function AccountOverviewView({
  overview,
}: {
  overview: AccountOverview
}) {
  const replies = (submission: Submission) =>
    overview.replyCounts[submission.id] ?? 0
  return (
    <div className="flex flex-col gap-10">
      <Section title="自分の出品">
        {overview.listings.length === 0 ? (
          <Empty label="まだありません" />
        ) : (
          <ul className="flex flex-col gap-4">
            {overview.listings.map(({ listing, inquiries }) => (
              <li
                key={listing.id}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {listing.name}
                    </Link>
                    <ModerationBadge status={listing.moderationStatus} />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    問い合わせ {inquiries.length}件
                  </span>
                </div>
                {listing.moderationNote && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    運営メモ: {listing.moderationNote}
                  </p>
                )}
                <IncomingList
                  items={inquiries}
                  empty="問い合わせはまだありません"
                  render={(inquiry) => (
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                        <span className="shrink-0 text-muted-foreground">
                          {receivedAt(inquiry)}
                        </span>
                        <span className="shrink-0 font-medium">
                          {text(inquiry.payload.name)}
                        </span>
                        <span className="text-foreground">
                          {text(inquiry.payload.message)}
                        </span>
                      </div>
                      <ThreadMeta
                        submission={inquiry}
                        replyCount={replies(inquiry)}
                      />
                    </div>
                  )}
                />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="自分の運搬依頼">
        {overview.transportJobs.length === 0 ? (
          <Empty label="まだありません" />
        ) : (
          <ul className="flex flex-col gap-4">
            {overview.transportJobs.map(({ job, applications }) => (
              <li
                key={job.id}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/transport/${job.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {job.item}
                    </Link>
                    <ModerationBadge status={job.moderationStatus} />
                    <Badge variant="muted">{job.status}</Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {job.from} → {job.to}・{formatYen(job.reward)}
                  </span>
                </div>
                {job.status !== '完了' && (
                  <div className="mt-3">
                    <CompleteJobButton jobId={job.id} />
                  </div>
                )}
                <IncomingList
                  items={applications}
                  empty="応募はまだありません"
                  render={(application) => (
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                        <span className="shrink-0 text-muted-foreground">
                          {receivedAt(application)}
                        </span>
                        <span className="shrink-0 font-medium">
                          {text(application.payload.name)}
                        </span>
                        <span className="text-muted-foreground">
                          {text(application.payload.vehicle)}
                          {text(application.payload.availableDate) &&
                            `・${text(application.payload.availableDate)}`}
                        </span>
                        <span className="text-foreground">
                          {text(application.payload.message)}
                        </span>
                      </div>
                      <ThreadMeta
                        submission={application}
                        replyCount={replies(application)}
                      />
                    </div>
                  )}
                />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="送った問い合わせ">
        {overview.sentInquiries.length === 0 ? (
          <Empty label="まだありません" />
        ) : (
          <ul className="flex flex-col gap-3">
            {overview.sentInquiries.map(({ submission, listing }) => (
              <li
                key={submission.id}
                className="rounded-2xl border border-border bg-card p-4 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {listing ? (
                    <Link
                      href={`/listings/${listing.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {listing.name}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">
                      削除された農機具
                    </span>
                  )}
                  <span className="text-muted-foreground">
                    {receivedAt(submission)}
                  </span>
                </div>
                <p className="mt-1 text-foreground">
                  {text(submission.payload.message)}
                </p>
                <div className="mt-2">
                  <ThreadMeta
                    submission={submission}
                    replyCount={replies(submission)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="送った応募">
        {overview.sentApplications.length === 0 ? (
          <Empty label="まだありません" />
        ) : (
          <ul className="flex flex-col gap-3">
            {overview.sentApplications.map(({ submission, job }) => (
              <li
                key={submission.id}
                className="rounded-2xl border border-border bg-card p-4 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {job ? (
                    <Link
                      href={`/transport/${job.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {job.item}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">
                      削除された案件
                    </span>
                  )}
                  {job && <Badge variant="muted">{job.status}</Badge>}
                  <span className="text-muted-foreground">
                    {receivedAt(submission)}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">
                  {text(submission.payload.vehicle)}・
                  {text(submission.payload.availableDate)}
                </p>
                <div className="mt-2">
                  <ThreadMeta
                    submission={submission}
                    replyCount={replies(submission)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}
