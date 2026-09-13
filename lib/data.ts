type DealType = 'sale' | 'rent'

export const moderationStatuses = ['pending', 'approved', 'rejected'] as const

export type ModerationStatus = (typeof moderationStatuses)[number]

/** Seeded rows omit a status and stay public. Create flows set `pending`. */
export function isApproved(entity: {
  moderationStatus?: ModerationStatus
}): boolean {
  return (
    entity.moderationStatus === undefined ||
    entity.moderationStatus === 'approved'
  )
}

export type Listing = {
  id: string
  name: string
  category: string
  maker: string
  year: number
  hours: number
  condition: '未使用に近い' | '目立った傷なし' | '使用感あり' | '要整備'
  prefecture: string
  city: string
  image: string
  summary: string
  deals: DealType[]
  salePrice?: number
  rentPerDay?: number
  rentToOwn?: boolean
  seller: {
    name: string
    kind: '個人農家' | '法人' | '農業法人' | '販売店'
    rating: number
    reviews: number
  }
  tags: string[]
  createdAt?: string
  updatedAt?: string
  moderationStatus?: ModerationStatus
  moderationNote?: string
  moderatedAt?: string
}

export type TransportJob = {
  id: string
  item: string
  from: string
  to: string
  distanceKm: number
  weight: string
  desiredDate: string
  reward: number
  status: '募集中' | '調整中'
  createdAt?: string
  updatedAt?: string
  moderationStatus?: ModerationStatus
  moderationNote?: string
  moderatedAt?: string
}

export const categories = [
  'すべて',
  'トラクター',
  'コンバイン',
  '田植機',
  '耕運機',
  'ドローン',
] as const

export function formatYen(value: number): string {
  return '¥' + value.toLocaleString('ja-JP')
}

export type DealFilter = 'all' | 'sale' | 'rent' | 'rentToOwn'

export type ListingFilter = {
  category: string
  deal: DealFilter
  keyword?: string
}

export type PageRequest = {
  page: number
  pageSize: number
}

export type ModerationQueueFilter = ModerationStatus | 'all'

export type ModerationQueue = {
  listings: Listing[]
  transportJobs: TransportJob[]
}

export type ListingPage = {
  items: Listing[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}

const dealFilters = ['all', 'sale', 'rent', 'rentToOwn'] as const

export const listingPageSize = 12

export const featuredListingCount = 6

export function isDealFilter(value: string): value is DealFilter {
  return (dealFilters as readonly string[]).includes(value)
}

export function isCategory(
  value: string,
): value is (typeof categories)[number] {
  return (categories as readonly string[]).includes(value)
}

export type ListingMode = 'buy' | 'rent' | 'rentToOwn'

export type ListingModeConfig = {
  id: ListingMode
  title: string
  price: string
  desc: string
  cta: string
  note?: string
}
