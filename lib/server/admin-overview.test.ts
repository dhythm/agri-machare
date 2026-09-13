import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getAdminCounts,
  listAccountSummaries,
  listAllRentals,
  listCarriers,
  listThreadSummaries,
  listTransportApplications,
} from './admin-overview'
import { getListing } from './listings'
import { requestRental } from './rentals'
import { resetStore } from './store'
import { acceptSubmission } from './submissions'
import { addMessage } from './threads'
import { createListing } from './listings'
import { setAccountStatus } from './auth/account-status'
import { upsertCarrierProfile } from './carriers'
import { demoSeller, demoUser } from '@/test/mock-auth'

vi.mock('server-only', () => ({}))

beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'test')
  return resetStore()
})

async function seedActivity() {
  const inquiry = await acceptSubmission(
    'listingInquiry',
    { mode: 'rent', name: '利用者デモ', message: '借りたい' },
    { targetId: 'trc-001', userId: 'demo-user' },
  )
  await addMessage(inquiry.id, demoSeller, '在庫あります')
  await acceptSubmission(
    'transportApplication',
    { name: '利用者デモ', vehicle: '2tトラック', availableDate: '2026-10-03' },
    { targetId: 'tj-01', userId: 'demo-user' },
  )
  await upsertCarrierProfile(demoUser, {
    name: '高橋運送',
    kind: '法人',
    prefecture: '秋田県',
    vehicles: ['4tトラック'],
    serviceAreas: ['秋田県'],
  })
  await acceptSubmission('contact', { message: 'hello' })
  await requestRental((await getListing('trc-001'))!, demoUser, {
    startDate: '2026-10-01',
    endDate: '2026-10-07',
  })
  await createListing(
    {
      name: '審査中',
      category: 'トラクター',
      maker: 'クボタ',
      year: 2018,
      hours: 500,
      condition: '目立った傷なし',
      prefecture: '新潟県',
      city: '長岡市',
      deals: ['sale'],
      salePrice: 1_000_000,
      rentToOwn: false,
      images: [],
      summary: '説明',
      sellerName: '出品者デモ',
      sellerKind: '農業法人',
      contactEmail: 'seller@example.com',
    },
    'demo-seller',
  )
  return inquiry.id
}

describe('getAdminCounts', () => {
  it('counts what needs attention', async () => {
    await seedActivity()
    expect(await getAdminCounts()).toEqual({
      pendingListings: 1,
      pendingTransportJobs: 0,
      requestedRentals: 1,
      openThreads: 2,
      carriers: 1,
    })
  })
})

describe('lists', () => {
  it('lists every rental with its listing', async () => {
    await seedActivity()
    const rentals = await listAllRentals()
    expect(rentals).toHaveLength(1)
    expect(rentals[0].listing?.id).toBe('trc-001')
    expect(rentals[0].rental.status).toBe('requested')
  })

  it('summarizes threads with target, sender, status, and reply count', async () => {
    const id = await seedActivity()
    const threads = await listThreadSummaries('listingInquiry')
    expect(threads).toHaveLength(1)
    expect(threads[0]).toMatchObject({
      id,
      targetName: expect.stringContaining('クボタ'),
      senderName: '利用者デモ',
      status: 'new',
      replyCount: 1,
    })
    expect(await listThreadSummaries('transportApplication')).toHaveLength(1)
  })

  it('lists applications with the job and carriers from registrations', async () => {
    await seedActivity()
    const applications = await listTransportApplications()
    expect(applications[0].targetName).toContain('コンバイン')
    const carriers = await listCarriers()
    expect(carriers).toHaveLength(1)
    expect(carriers[0].name).toBe('高橋運送')
  })

  it('summarizes accounts with their activity', async () => {
    await seedActivity()
    const accounts = await listAccountSummaries()
    expect(accounts.map((account) => account.id)).toEqual([
      'demo-admin',
      'demo-seller',
      'demo-user',
    ])
    const seller = accounts.find((account) => account.id === 'demo-seller')
    expect(seller).toMatchObject({
      role: 'user',
      listingCount: 7,
      rentalCount: 0,
    })
    const user = accounts.find((account) => account.id === 'demo-user')
    expect(user).toMatchObject({ listingCount: 0, rentalCount: 1 })
    expect(JSON.stringify(accounts)).not.toContain('password')
    expect(user?.status).toBe('active')
    await setAccountStatus('demo-user', 'suspended', '規約違反')
    const after = await listAccountSummaries()
    expect(after.find((account) => account.id === 'demo-user')).toMatchObject({
      status: 'suspended',
      note: '規約違反',
    })
  })
})
