import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
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
    <div className="max-w-2xl">
      <h1 className="text-balance font-display text-3xl font-black tracking-tight text-foreground">
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
