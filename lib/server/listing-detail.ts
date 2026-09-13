import 'server-only'

import { formatYen, type Listing, type ListingModeConfig } from '@/lib/data'

export function buildModes(listing: Listing): ListingModeConfig[] {
  const modes: ListingModeConfig[] = []
  if (listing.rentPerDay) {
    modes.push({
      id: 'rent',
      title: 'レンタルする',
      price: `${formatYen(listing.rentPerDay)}/日`,
      desc: '繁忙期や試したい期間だけ。日単位・シーズン単位で相談できます。',
      cta: 'レンタルを申し込む',
    })
  }
  if (listing.rentToOwn && listing.rentPerDay && listing.rentToOwnCreditRate) {
    const cap = listing.rentToOwnCreditCap
    modes.push({
      id: 'rentToOwn',
      title: 'レンタルして試す → 購入',
      price: 'まず試す',
      desc: '借りて使ってみて、良ければそのまま購入。支払ったレンタル料の一部を購入価格に充当します。',
      cta: 'お試しレンタルを始める',
      note: `レンタル料の${listing.rentToOwnCreditRate}%${cap ? `（上限 ${formatYen(cap)}）` : ''}を購入価格に充当します。試してから決められるので、高額な買い物でも安心です。`,
    })
  }
  if (listing.salePrice) {
    modes.push({
      id: 'buy',
      title: '購入する',
      price: formatYen(listing.salePrice),
      desc: '状態・整備記録を確認のうえ購入。エスクロー決済で安全に取引できます。',
      cta: '購入手続きへ進む',
    })
  }
  return modes
}

export const transportBaseRates: Record<string, number> = {
  トラクター: 30_000,
  コンバイン: 42_000,
  田植機: 18_000,
  耕運機: 6_000,
  ドローン: 4_000,
}

export const transportDefaultRate = 20_000

export function estimateTransport(listing: Listing): number {
  return transportBaseRates[listing.category] ?? transportDefaultRate
}
