export type DealType = 'sale' | 'rent'

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

export const listings: Listing[] = [
  {
    id: 'trc-001',
    name: 'クボタ トラクター 45馬力 GLシリーズ',
    category: 'トラクター',
    maker: 'クボタ',
    year: 2019,
    hours: 620,
    condition: '目立った傷なし',
    prefecture: '新潟県',
    city: '長岡市',
    image: '/equipment/tractor.png',
    summary:
      'キャビン付き45馬力。田畑両用で稼働時間も少なめ。ロータリー付き。まずはレンタルで相性を試してからの購入もOKです。',
    deals: ['sale', 'rent'],
    salePrice: 18_800_000,
    rentPerDay: 22_000,
    rentToOwn: true,
    seller: { name: '中村ファーム', kind: '農業法人', rating: 4.8, reviews: 34 },
    tags: ['キャビン付', 'ロータリー付', '4WD'],
  },
  {
    id: 'cmb-002',
    name: 'ヤンマー コンバイン 4条刈 AGシリーズ',
    category: 'コンバイン',
    maker: 'ヤンマー',
    year: 2017,
    hours: 410,
    condition: '使用感あり',
    prefecture: '秋田県',
    city: '大仙市',
    image: '/equipment/combine.png',
    summary:
      '稲刈りシーズンだけ使いたい方に。1シーズン単位のレンタルにも対応。整備記録あり、乾燥機との組み合わせ相談可。',
    deals: ['sale', 'rent'],
    salePrice: 24_500_000,
    rentPerDay: 45_000,
    rentToOwn: true,
    seller: { name: '佐藤農機', kind: '販売店', rating: 4.6, reviews: 58 },
    tags: ['4条刈', '整備記録あり', 'シーズン貸し可'],
  },
  {
    id: 'rpl-003',
    name: 'イセキ 田植機 6条植 さなえ',
    category: '田植機',
    maker: 'イセキ',
    year: 2020,
    hours: 180,
    condition: '未使用に近い',
    prefecture: '富山県',
    city: '砺波市',
    image: '/equipment/rice-planter.png',
    summary:
      '施肥機付きの6条植。年数回しか使わないため貸し出し中心。使ってみて良ければそのまま買い取りも歓迎します。',
    deals: ['sale', 'rent'],
    salePrice: 9_600_000,
    rentPerDay: 18_000,
    rentToOwn: true,
    seller: { name: '田村さん', kind: '個人農家', rating: 4.9, reviews: 21 },
    tags: ['施肥機付', '6条植', '低稼働'],
  },
  {
    id: 'til-004',
    name: 'ホンダ 管理機・耕運機 こまめ',
    category: '耕運機',
    maker: 'ホンダ',
    year: 2022,
    hours: 60,
    condition: '未使用に近い',
    prefecture: '長野県',
    city: '松本市',
    image: '/equipment/tiller.png',
    summary:
      '家庭菜園〜小規模農地向けの小型管理機。週末だけ借りたい方に人気。軽トラに載る size なので輸送も手軽です。',
    deals: ['sale', 'rent'],
    salePrice: 128_000,
    rentPerDay: 2_500,
    rentToOwn: false,
    seller: { name: '小林園芸', kind: '法人', rating: 4.7, reviews: 12 },
    tags: ['小型', '軽トラ積載可', '初心者向け'],
  },
  {
    id: 'drn-005',
    name: '農業用ドローン 10Lタンク 防除・散布用',
    category: 'ドローン',
    maker: 'DJI系',
    year: 2023,
    hours: 90,
    condition: '目立った傷なし',
    prefecture: '福岡県',
    city: '筑後市',
    image: '/equipment/drone.png',
    summary:
      '農薬・肥料散布用ドローン。オペレーター資格保有者への貸出中心。導入検討中の方向けに短期レンタルもご用意。',
    deals: ['rent'],
    rentPerDay: 12_000,
    rentToOwn: false,
    seller: { name: 'スカイアグリ', kind: '法人', rating: 4.5, reviews: 27 },
    tags: ['防除', 'スマート農業', '短期OK'],
  },
  {
    id: 'trc-006',
    name: 'ジョンディア トラクター 90馬力 大規模向け',
    category: 'トラクター',
    maker: 'ジョンディア',
    year: 2016,
    hours: 1_450,
    condition: '使用感あり',
    prefecture: '北海道',
    city: '帯広市',
    image: '/equipment/tractor.png',
    summary:
      '大規模畑作向けの90馬力。売却希望。遠方のため輸送手配のサポート歓迎。運搬チャネルでの相乗せ相談可能です。',
    deals: ['sale'],
    salePrice: 21_000_000,
    rentToOwn: false,
    seller: { name: '十勝アグリ', kind: '農業法人', rating: 4.4, reviews: 41 },
    tags: ['大規模向け', '90馬力', '要輸送手配'],
  },
]

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

export const transportJobs: TransportJob[] = [
  {
    id: 'tj-01',
    item: 'コンバイン 4条刈',
    from: '秋田県 大仙市',
    to: '山形県 天童市',
    distanceKm: 120,
    weight: '約2.4t',
    desiredDate: '9/28 午前',
    reward: 38_000,
    status: '募集中',
  },
  {
    id: 'tj-02',
    item: 'トラクター 45馬力',
    from: '新潟県 長岡市',
    to: '新潟県 上越市',
    distanceKm: 75,
    weight: '約1.8t',
    desiredDate: '10/3 終日',
    reward: 22_000,
    status: '募集中',
  },
  {
    id: 'tj-03',
    item: '田植機 6条植',
    from: '富山県 砺波市',
    to: '石川県 白山市',
    distanceKm: 55,
    weight: '約0.9t',
    desiredDate: '10/6 午後',
    reward: 15_000,
    status: '調整中',
  },
  {
    id: 'tj-04',
    item: '管理機（軽トラ積載可）',
    from: '長野県 松本市',
    to: '長野県 諏訪市',
    distanceKm: 40,
    weight: '約120kg',
    desiredDate: '相談',
    reward: 6_000,
    status: '募集中',
  },
]

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

export function getListing(id: string): Listing | undefined {
  return listings.find((l) => l.id === id)
}
