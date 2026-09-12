import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Hero } from '@/components/hero'
import { RoleChannels } from '@/components/role-channels'
import { HowItWorks } from '@/components/how-it-works'
import { Marketplace } from '@/components/marketplace'
import { TransportPreview } from '@/components/transport-preview'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <RoleChannels />
        <HowItWorks />
        <Marketplace />
        <TransportPreview />
      </main>
      <SiteFooter />
    </div>
  )
}
