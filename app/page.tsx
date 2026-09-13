import { PageShell } from '@/components/page-shell'
import { Hero } from '@/components/hero'
import { RoleChannels } from '@/components/role-channels'
import { HowItWorks } from '@/components/how-it-works'
import { Marketplace } from '@/components/marketplace'
import { TransportPreview } from '@/components/transport-preview'
import { featuredListingCount } from '@/lib/data'
import { paginateListings } from '@/lib/server/listings'

export default function Page() {
  return (
    <PageShell>
      <Hero />
      <RoleChannels />
      <HowItWorks />
      <Marketplace
        initialPage={paginateListings(
          { category: 'すべて', deal: 'all' },
          { page: 1, pageSize: featuredListingCount },
        )}
      />
      <TransportPreview />
    </PageShell>
  )
}
