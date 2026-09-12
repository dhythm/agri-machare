type DealType = 'sale' | 'rent'

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
