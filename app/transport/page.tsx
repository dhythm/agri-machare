import { PageShell } from '@/components/page-shell'
import { TransportBoard } from '@/components/transport-board'

export const dynamic = 'force-dynamic'

export default function TransportPage() {
  return (
    <PageShell>
      <TransportBoard />
    </PageShell>
  )
}
