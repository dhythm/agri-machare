import type { Metadata } from 'next'
import Link from 'next/link'
import { PageIntro, PageShell } from '@/components/page-shell'

export const metadata: Metadata = { title: 'よくある質問 | ノウキシェア' }

const groups = [
  {
    title: '取引について',
    items: [
      {
        q: 'レンタル購入では、レンタル料はいくら充当されますか？',
        a: '支払い済みレンタル料のうち、出品者が設定した割合（多くは 50%）を購入価格に充当します。割合と上限は詳細ページの「レンタルして試す → 購入」に表示され、日数を入れると充当額と購入価格を確認できます。',
      },
      {
        q: '支払いはいつ出品者に渡りますか？',
        a: 'エスクロー決済のため、買い手・借り手が受け取りを確認したあとに出品者へ入金されます。',
      },
      {
        q: 'レンタル中に故障した場合はどうなりますか？',
        a: '通常使用による故障は出品者負担、過失による損傷は借り手負担が原則です。出品者への連絡フォームから状況を共有してください。',
      },
    ],
  },
  {
    title: '出品について',
    items: [
      {
        q: '出品に費用はかかりますか？',
        a: '掲載は無料です。取引が成立した場合に、成約額の一部を手数料としていただきます。',
      },
      {
        q: '販売とレンタルの両方で出品できますか？',
        a: 'できます。出品フォームで両方を選ぶと、レンタル購入の受け付けも設定できます。',
      },
    ],
  },
  {
    title: '運搬について',
    items: [
      {
        q: '運搬者になるには資格が必要ですか？',
        a: '車両に応じた運転免許が必要です。大型農機具を扱う案件では、積み下ろしの経験を応募時にお知らせください。',
      },
      {
        q: '運搬の報酬はどのように決まりますか？',
        a: '依頼者が種類と距離をもとに設定します。基準額は「料金のめやす」を参照してください。',
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <PageIntro title="よくある質問" />
        {groups.map((group) => (
          <section key={group.title} className="mt-10">
            <h2 className="font-display text-lg font-bold text-foreground">
              {group.title}
            </h2>
            <div className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card">
              {group.items.map((item) => (
                <details key={item.q} className="group px-5 py-4">
                  <summary className="cursor-pointer list-none font-medium text-foreground marker:hidden">
                    {item.q}
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}
        <p className="mt-10 text-sm text-muted-foreground">
          解決しない場合は
          <Link href="/contact" className="mx-1 text-primary">
            お問い合わせ
          </Link>
          からご連絡ください。
        </p>
      </div>
    </PageShell>
  )
}
