import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CalendarClock, MapPin, Route, Scale } from 'lucide-react'
import { PageShell } from '@/components/page-shell'
import { BackLink } from '@/components/back-link'
import { Badge } from '@/components/badge'
import { TransportApplicationForm } from '@/components/forms/transport-application-form'
import { formatYen } from '@/lib/data'
import { getTransportJob } from '@/lib/server/transport'

export const metadata: Metadata = { title: '運搬案件 | ノウキシェア' }

export const dynamic = 'force-dynamic'

export default async function TransportJobPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const job = await getTransportJob(id)
  if (!job) notFound()

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <BackLink href="/transport" label="運搬案件ボードにもどる" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <Badge variant={job.status === '募集中' ? 'default' : 'muted'}>
                  {job.status}
                </Badge>
                <span className="text-xs text-muted-foreground">{job.id}</span>
              </div>
              <h1 className="mt-3 font-display text-2xl font-bold text-foreground">
                {job.item}
              </h1>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-foreground">
                <MapPin className="size-4 text-muted-foreground" />
                {job.from}
                <span className="text-muted-foreground">→</span>
                {job.to}
              </p>
              <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Route className="size-3.5" />
                    距離
                  </dt>
                  <dd className="mt-1 font-medium">約{job.distanceKm}km</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Scale className="size-3.5" />
                    重量
                  </dt>
                  <dd className="mt-1 font-medium">{job.weight}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarClock className="size-3.5" />
                    希望日
                  </dt>
                  <dd className="mt-1 font-medium">{job.desiredDate}</dd>
                </div>
              </dl>
              <div className="mt-5 border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">報酬（税込）</p>
                <p className="font-display text-3xl font-bold text-foreground">
                  {formatYen(job.reward)}
                </p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">
              この案件に応募する
            </h2>
            <div className="mt-5">
              <TransportApplicationForm job={job} />
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
