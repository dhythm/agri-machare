import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-lg bg-primary px-5 py-3 text-primary-foreground focus:translate-y-0"
      >
        本文へ移動
      </a>
      <SiteHeader />
      <main id="main-content" className="min-w-0 flex-1" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}

export function PageIntro({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <div className="max-w-2xl border-l-[3px] border-primary pl-5">
      <h1 className="text-balance font-display text-3xl font-bold leading-snug sm:text-4xl tracking-tight text-foreground">
        {title}
      </h1>
      {description && (
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {children}
    </div>
  )
}
