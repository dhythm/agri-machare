import Link from 'next/link'
import {
  ChevronLeft,
  Truck,
  Route,
  Scale,
  CalendarClock,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/badge'
import { formatYen } from '@/lib/data'
import { transportJobs } from '@/lib/server/data'

const steps = [
  '運びたい荷物・区間・希望日を出品者が登録',
  '空きトラックや帰り便を持つ運搬者が応募',
  '受け取り確認後、報酬をお支払い',
]

export function TransportBoard() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        トップにもどる
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.6fr]">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <span className="flex size-11 items-center justify-center rounded-xl bg-accent/15 text-accent-foreground">
            <Truck className="size-5" />
          </span>
          <h1 className="mt-5 text-balance font-display text-3xl font-black tracking-tight text-foreground">
            運搬案件ボード
          </h1>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            高額な農機具の輸送費は大きな負担。空きトラックや帰り便を活かして運搬を手伝い、報酬を受け取れます。運びたい人と運べる人をつなぐチャネルです。
          </p>

          <ol className="mt-6 space-y-3">
            {steps.map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground">
                  {step}
                </span>
              </li>
            ))}
          </ol>

          <Button className="mt-6 h-11 w-full sm:w-auto">
            運搬者として登録する
          </Button>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground">
              募集中の案件
            </h2>
            <span className="text-sm text-muted-foreground">
              {transportJobs.length}件
            </span>
          </div>

          <ul className="mt-4 flex flex-col gap-4">
            {transportJobs.map((job) => (
              <li
                key={job.id}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">
                        {job.item}
                      </h3>
                      <Badge
                        variant={job.status === '募集中' ? 'default' : 'muted'}
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-foreground">
                      <MapPin className="size-4 text-muted-foreground" />
                      {job.from}
                      <span className="text-muted-foreground">→</span>
                      {job.to}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-bold text-foreground">
                      {formatYen(job.reward)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      報酬（税込）
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Route className="size-3.5" />約{job.distanceKm}km
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Scale className="size-3.5" />
                    {job.weight}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="size-3.5" />
                    希望日 {job.desiredDate}
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" className="h-9 flex-1 sm:flex-none">
                    この案件に応募する
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
