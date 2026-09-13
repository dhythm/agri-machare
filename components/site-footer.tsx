import Link from 'next/link'
import { Sprout } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sprout className="size-4" />
              </span>
              <span className="font-display text-base font-bold text-foreground">
                ノウキシェア
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              高額な農機具を、売る・買う・借りる・運ぶ。地域で農機具をシェアし、レンタルから購入までなめらかにつなぐプラットフォームです。
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <FooterCol
              title="使う"
              links={[
                { label: '農機具を探す', href: '/listings' },
                { label: '出品する', href: '/listings/new' },
                { label: '借りる', href: '/listings?deal=rent' },
                { label: 'レンタル購入', href: '/listings?deal=rentToOwn' },
              ]}
            />
            <FooterCol
              title="運搬"
              links={[
                { label: '運搬案件を見る', href: '/transport' },
                { label: '運搬者登録', href: '/transport/register' },
                { label: '料金のめやす', href: '/transport/pricing' },
              ]}
            />
            <FooterCol
              title="サポート"
              links={[
                { label: 'はじめての方へ', href: '/guide' },
                { label: 'よくある質問', href: '/faq' },
                { label: 'お問い合わせ', href: '/contact' },
              ]}
            />
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            これはコンセプト検証用のモックアップです。実際の取引は行われません。
          </p>
          <p>© 2026 ノウキシェア</p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string }[]
}) {
  return (
    <div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
