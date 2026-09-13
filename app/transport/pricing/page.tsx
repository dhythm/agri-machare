import type { Metadata } from 'next'
import Link from 'next/link'
import { PageIntro, PageShell } from '@/components/page-shell'
import { formatYen } from '@/lib/data'
import {
  distanceBands,
  transportBaseRates,
  transportDefaultRate,
} from '@/lib/transport-fee'

export const metadata: Metadata = { title: '運搬料金のめやす | ノウキシェア' }

export default function TransportPricingPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <PageIntro
          title="運搬料金のめやす"
          description="農機具の種類と距離から算出した基準額です。実際の報酬は依頼者が案件ごとに設定し、応募時に相談できます。"
        />

        <section className="mt-10">
          <h2 className="font-display text-xl font-bold text-foreground">
            種類別の基準額（50km まで）
          </h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">種類</th>
                  <th className="px-4 py-3 font-medium">基準額</th>
                  <th className="px-4 py-3 font-medium">想定車両</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(transportBaseRates).map(([category, rate]) => (
                  <tr key={category} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {category}
                    </td>
                    <td className="px-4 py-3">{formatYen(rate)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {vehicleFor(category)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-foreground">
                    その他
                  </td>
                  <td className="px-4 py-3">
                    {formatYen(transportDefaultRate)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">相談</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-bold text-foreground">
            距離による倍率
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {distanceBands.map((guide) => (
              <div
                key={guide.label}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <p className="text-xs text-muted-foreground">{guide.label}</p>
                <p className="mt-1 font-display text-2xl font-bold text-foreground">
                  ×{guide.rate.toFixed(1)}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            例: トラクターを 120km 運ぶ場合は{' '}
            {formatYen(transportBaseRates['トラクター'])} × 1.8 ={' '}
            {formatYen(transportBaseRates['トラクター'] * 1.8)}{' '}
            が基準額です。高速料金・フェリー代は依頼者負担です。
          </p>
        </section>

        <section className="mt-10 rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold text-foreground">
            報酬の受け取り
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            依頼者が受け取りを確認した後、登録口座へ振り込みます。案件に応募すると、依頼者とチャットで積み込み方法や立ち会いを調整できます。
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium text-primary">
            <Link href="/transport">募集中の案件を見る</Link>
            <Link href="/transport/register">運搬者として登録する</Link>
          </div>
        </section>
      </div>
    </PageShell>
  )
}

function vehicleFor(category: string): string {
  switch (category) {
    case 'トラクター':
    case 'コンバイン':
      return '4tトラック・トレーラー'
    case '田植機':
      return '2t〜4tトラック'
    default:
      return '軽トラック・2tトラック'
  }
}
