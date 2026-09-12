import { Repeat2 } from 'lucide-react'
import { Badge } from '@/components/badge'

const steps = [
  {
    n: '01',
    title: 'まず借りて試す',
    desc: '気になる機種を短期レンタル。自分の農地・作業に本当に合うかを、購入前に実機で確かめられます。',
  },
  {
    n: '02',
    title: '気に入ったら購入へ',
    desc: 'レンタル期間中でも購入に切り替え可能。出品者とチャットで条件を相談し、そのまま買い取りへ進めます。',
  },
  {
    n: '03',
    title: 'レンタル料を一部充当',
    desc: '支払い済みのレンタル料の一部を購入価格に充当。「試したのに無駄にならない」買い方ができます。',
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <Badge variant="accent">
            <Repeat2 className="size-3.5" />
            レンタル → 購入
          </Badge>
          <h2 className="mt-4 text-balance font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            「借りて、良ければ買う」がひとつの流れに
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            数百万円の買い物を勘で決めない。試用と購入を分断せず、レンタルからそのまま購入へつなげる仕組みです。
          </p>
        </div>

        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <li
              key={step.n}
              className="relative flex flex-col rounded-2xl border border-border bg-card p-6"
            >
              <span className="font-display text-sm font-bold text-accent-foreground">{step.n}</span>
              <h3 className="mt-2 font-display text-lg font-bold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute -right-2 top-1/2 z-10 hidden size-4 -translate-y-1/2 rotate-45 border-r border-t border-border bg-card md:block"
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
