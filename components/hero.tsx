import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Repeat2, Truck, ShieldCheck } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
        <div className="flex flex-col items-start">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            <span className="size-1.5 rounded-full bg-accent" />
            農機具の売買 × レンタル × 運搬マッチング
          </span>
          <h1 className="mt-5 text-pretty font-display text-4xl font-black leading-tight tracking-tight text-foreground sm:text-5xl">
            高い農機具、
            <br className="hidden sm:block" />
            買うだけが選択肢じゃない。
          </h1>
          <p className="mt-5 max-w-md text-balance text-base leading-relaxed text-muted-foreground">
            1台数百万〜数千万円のトラクターやコンバイン。ローンで買う前に、まず借りて試す。気に入ればそのまま購入。地域の農家どうしで農機具をシェアできる場所です。
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="#marketplace"
              className={cn(buttonVariants(), 'h-11 px-5 text-sm')}
            >
              農機具を探す
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="#how"
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-11 px-5 text-sm',
              )}
            >
              レンタル購入のしくみ
            </Link>
          </div>

          <dl className="mt-10 grid w-full max-w-md grid-cols-3 gap-4 border-t border-border pt-6">
            <Feature
              icon={<Repeat2 className="size-4" />}
              label="借りて試せる"
            />
            <Feature
              icon={<ShieldCheck className="size-4" />}
              label="そのまま購入OK"
            />
            <Feature
              icon={<Truck className="size-4" />}
              label="運搬もマッチング"
            />
          </dl>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border shadow-sm">
            <Image
              src="/hero-field.png"
              alt="棚田でトラクターが作業する夕暮れの農村風景"
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-4 -left-4 hidden max-w-[220px] rounded-2xl border border-border bg-card p-4 shadow-md sm:block">
            <p className="text-xs text-muted-foreground">レンタルなら</p>
            <p className="mt-1 font-display text-2xl font-bold text-foreground">
              1日 ¥22,000
              <span className="ml-1 text-sm font-medium text-muted-foreground">
                〜
              </span>
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              45馬力トラクターを購入前にお試し
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <dt className="text-sm font-medium text-foreground">{label}</dt>
    </div>
  )
}
