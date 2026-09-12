import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { TransportBoard } from '@/components/transport-board'

export default function TransportPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <TransportBoard />
      </main>
      <SiteFooter />
    </div>
  )
}
