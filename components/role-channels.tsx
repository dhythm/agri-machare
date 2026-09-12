import Link from 'next/link'
import { Tag, ShoppingCart, Repeat2, Truck, ArrowRight } from 'lucide-react'

const channels = [
  {
    icon: Tag,
    title: '売る・貸す',
    kicker: '出品者',
    desc: '使わない期間だけ貸したい、買い替えで手放したい。売買もレンタルも1つの出品でまとめて募集できます。',
    href: '/#marketplace',
    action: '出品する',
  },
  {
    icon: Repeat2,
    title: '借りる',
    kicker: '借り手',
    desc: '繁忙期や試したい機種だけ短期レンタル。使ってみて良ければそのまま購入に切り替えられます。',
    href: '/#marketplace',
    action: 'レンタルを探す',
  },
  {
    icon: ShoppingCart,
    title: '買う',
    kicker: '買い手',
    desc: '相場のわかる中古農機具を、状態・稼働時間・整備記録つきで。まず借りてから判断する買い方も。',
    href: '/#marketplace',
    action: '販売品を探す',
  },
  {
    icon: Truck,
    title: '運ぶ',
    kicker: '運搬者',
    desc: '大型農機具の輸送はハードルのひとつ。空きトラックや帰り便で運搬を手伝い、報酬を受け取れます。',
    href: '/transport',
    action: '運搬案件を見る',
  },
]

export function RoleChannels() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="max-w-2xl">
        <h2 className="text-balance font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          4つの立場をひとつにつなぐ
        </h2>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
          売り手・借り手・買い手に加えて「運ぶ人」のチャネルを用意。高額な農機具ならではの、輸送まで含めたやり取りがスムーズになります。
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {channels.map(({ icon: Icon, title, kicker, desc, href, action }) => (
          <Link
            key={title}
            href={href}
            className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-sm"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="size-5" />
            </span>
            <p className="mt-5 text-xs font-medium text-accent-foreground">{kicker}</p>
            <h3 className="mt-1 font-display text-lg font-bold text-foreground">{title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              {action}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
