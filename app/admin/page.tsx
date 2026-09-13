import type { Metadata } from 'next'
import { AdminQueue } from '@/components/admin/admin-queue'
import { getModerationQueue } from '@/lib/server/moderation'

export const metadata: Metadata = { title: '審査 | ノウキシェア 運営' }

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  return (
    <>
      <h1 className="font-display text-2xl font-black tracking-tight text-foreground">
        審査
      </h1>
      <div className="mt-6">
        <AdminQueue initialQueue={await getModerationQueue('pending')} />
      </div>
    </>
  )
}
