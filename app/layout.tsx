import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Noto_Sans_JP, Zen_Kaku_Gothic_New } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import './globals.css'
import { QueryProvider } from '@/components/query-provider'

const notoSansJp = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-jp',
})

const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ['latin'],
  weight: ['500', '700', '900'],
  variable: '--font-zen-kaku',
})

export const metadata: Metadata = {
  title: 'ノウキシェア | 農機具の売買・レンタル・レンタル購入プラットフォーム',
  description:
    'トラクター・コンバイン・田植機などの農機具を、売る・買う・借りる・運ぶ。高額な農機具をシェアして、レンタルから購入までスムーズに。',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#3d6b3a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJp.variable} ${zenKaku.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <SessionProvider>
          <QueryProvider>{children}</QueryProvider>
        </SessionProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
