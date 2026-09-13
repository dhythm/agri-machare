import 'server-only'

import type { Listing } from '@/lib/data'

type Template = {
  prefix: string
  category: Listing['category']
  image: string
  makers: string[]
  models: string[]
  hours: [number, number]
  salePrice: [number, number]
  rentPerDay: [number, number]
  tags: string[]
  summaries: string[]
}

const templates: Template[] = [
  {
    prefix: 'trc',
    category: 'トラクター',
    image: '/equipment/tractor.png',
    makers: ['クボタ', 'ヤンマー', 'イセキ', '三菱マヒンドラ', 'ジョンディア'],
    models: [
      '25馬力 MRシリーズ',
      '33馬力 スラッガー',
      '50馬力 REXIA',
      '60馬力 BIG-T',
      '75馬力 ジーニアス',
      '100馬力 大型キャビン',
    ],
    hours: [150, 2400],
    salePrice: [1_200_000, 19_000_000],
    rentPerDay: [9_000, 34_000],
    tags: [
      'キャビン付',
      'ロータリー付',
      '4WD',
      '倍速ターン',
      'クイックヒッチ',
      '整備記録あり',
    ],
    summaries: [
      '水田・畑作の両方で使用。定期点検済みで、繁忙期の短期レンタルにも対応します。',
      '買い替えに伴い出品。ロータリーとセットで貸し出し可能。まず借りて相性を試せます。',
      '稼働時間少なめの保管品。近隣なら納車の相談もできます。',
    ],
  },
  {
    prefix: 'cmb',
    category: 'コンバイン',
    image: '/equipment/combine.png',
    makers: ['クボタ', 'ヤンマー', 'イセキ', '三菱マヒンドラ'],
    models: [
      '2条刈 小型',
      '3条刈 ER',
      '4条刈 AGシリーズ',
      '5条刈 大型グレンタンク',
      '6条刈 ハイスペック',
    ],
    hours: [200, 1600],
    salePrice: [1_500_000, 26_000_000],
    rentPerDay: [18_000, 58_000],
    tags: [
      'グレンタンク',
      '整備記録あり',
      'シーズン貸し可',
      'ワイド刈刃',
      'オートクラッチ',
    ],
    summaries: [
      '稲刈りシーズン限定で貸し出し。刈取り後の清掃・点検を毎年実施しています。',
      '大規模圃場向け。輸送はトレーラー手配が必要なため運搬チャネルの利用を推奨します。',
      '乾燥機との組み合わせ相談可。試用後にそのまま購入する流れにも対応します。',
    ],
  },
  {
    prefix: 'rpl',
    category: '田植機',
    image: '/equipment/rice-planter.png',
    makers: ['クボタ', 'ヤンマー', 'イセキ'],
    models: [
      '4条植 歩行型',
      '5条植 乗用',
      '6条植 施肥機付',
      '8条植 高速',
      '10条植 大型',
    ],
    hours: [40, 900],
    salePrice: [380_000, 12_000_000],
    rentPerDay: [6_000, 26_000],
    tags: ['施肥機付', '低稼働', '直進アシスト', '側条施肥', '軽トラ積載可'],
    summaries: [
      '年に数日しか使わないため、田植えシーズン中心に貸し出します。',
      '直進アシスト付きで初めての方にも扱いやすい一台。試乗歓迎です。',
      '規模縮小のため売却希望。レンタルで試したあと購入いただけます。',
    ],
  },
  {
    prefix: 'til',
    category: '耕運機',
    image: '/equipment/tiller.png',
    makers: ['ホンダ', 'クボタ', 'ヤンマー', 'マキタ'],
    models: [
      '管理機 プチな',
      '管理機 サラダ',
      '耕運機 こまめ',
      '管理機 中型ディーゼル',
      '畝立て機付 家庭菜園用',
    ],
    hours: [20, 600],
    salePrice: [60_000, 480_000],
    rentPerDay: [1_500, 6_000],
    tags: ['小型', '軽トラ積載可', '初心者向け', '畝立て', '培土器付'],
    summaries: [
      '家庭菜園〜小規模農地向け。週末だけ借りたい方に人気です。',
      '軽トラに積めるサイズで輸送も手軽。ご近所なら配達も相談できます。',
      'アタッチメント一式付き。まず使ってみて合えば購入もできます。',
    ],
  },
  {
    prefix: 'drn',
    category: 'ドローン',
    image: '/equipment/drone.png',
    makers: ['DJI系', 'ヤマハ', 'ナイルワークス', 'クボタ'],
    models: [
      '5Lタンク 小型',
      '10Lタンク 防除・散布用',
      '16Lタンク 中型',
      '30Lタンク 大型',
      '粒剤散布装置付',
    ],
    hours: [30, 500],
    salePrice: [900_000, 4_800_000],
    rentPerDay: [8_000, 28_000],
    tags: [
      '防除',
      'スマート農業',
      '短期OK',
      '資格者限定',
      'バッテリー予備あり',
    ],
    summaries: [
      '農薬・肥料散布用。オペレーター資格をお持ちの方への貸出が中心です。',
      '導入検討中の方向けに短期レンタルをご用意。操作講習の相談も可能です。',
      '更新に伴い売却。バッテリーと充電器をセットで引き渡します。',
    ],
  },
]

const locations: [string, string][] = [
  ['北海道', '旭川市'],
  ['北海道', '帯広市'],
  ['青森県', '弘前市'],
  ['岩手県', '花巻市'],
  ['宮城県', '登米市'],
  ['秋田県', '横手市'],
  ['山形県', '鶴岡市'],
  ['福島県', '会津若松市'],
  ['茨城県', '筑西市'],
  ['栃木県', '大田原市'],
  ['群馬県', '前橋市'],
  ['千葉県', '香取市'],
  ['新潟県', '長岡市'],
  ['新潟県', '上越市'],
  ['富山県', '砺波市'],
  ['石川県', '白山市'],
  ['長野県', '松本市'],
  ['静岡県', '掛川市'],
  ['愛知県', '豊橋市'],
  ['滋賀県', '長浜市'],
  ['兵庫県', '丹波篠山市'],
  ['岡山県', '真庭市'],
  ['広島県', '東広島市'],
  ['香川県', '観音寺市'],
  ['愛媛県', '西条市'],
  ['福岡県', '筑後市'],
  ['佐賀県', '武雄市'],
  ['熊本県', '菊池市'],
  ['宮崎県', '都城市'],
  ['鹿児島県', '鹿屋市'],
]

const sellers: Listing['seller'][] = [
  { name: '中村ファーム', kind: '農業法人', rating: 4.8, reviews: 34 },
  { name: '佐藤農機', kind: '販売店', rating: 4.6, reviews: 58 },
  { name: '田村さん', kind: '個人農家', rating: 4.9, reviews: 21 },
  { name: '小林園芸', kind: '法人', rating: 4.7, reviews: 12 },
  { name: 'スカイアグリ', kind: '法人', rating: 4.5, reviews: 27 },
  { name: '十勝アグリ', kind: '農業法人', rating: 4.4, reviews: 41 },
  { name: '高橋さん', kind: '個人農家', rating: 4.3, reviews: 9 },
  { name: '山田農産', kind: '農業法人', rating: 4.7, reviews: 63 },
  { name: 'みどり機械', kind: '販売店', rating: 4.5, reviews: 88 },
  { name: '渡辺さん', kind: '個人農家', rating: 5.0, reviews: 4 },
]

const conditions: Listing['condition'][] = [
  '未使用に近い',
  '目立った傷なし',
  '使用感あり',
  '要整備',
]

/** Deterministic pseudo-random sequence so the sample data is stable. */
function createSequence(seed: number) {
  let state = seed
  return () => {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648
    return state / 2_147_483_648
  }
}

function roundTo(value: number, unit: number): number {
  return Math.round(value / unit) * unit
}

export function generateListings(count: number, startId: number): Listing[] {
  const next = createSequence(20_260_913)
  const pick = <T>(values: T[]): T => values[Math.floor(next() * values.length)]
  const between = (range: [number, number]) =>
    range[0] + next() * (range[1] - range[0])

  return Array.from({ length: count }, (_, index) => {
    const template = templates[index % templates.length]
    const number = startId + index
    const maker = pick(template.makers)
    const model = pick(template.models)
    const deals: Listing['deals'] =
      next() < 0.15 ? ['sale'] : next() < 0.2 ? ['rent'] : ['sale', 'rent']
    const rentPerDay = deals.includes('rent')
      ? roundTo(between(template.rentPerDay), 500)
      : undefined
    const salePrice = deals.includes('sale')
      ? roundTo(between(template.salePrice), 10_000)
      : undefined
    const [prefecture, city] = pick(locations)
    const tags = [...new Set([pick(template.tags), pick(template.tags)])]

    return {
      id: `${template.prefix}-${String(number).padStart(3, '0')}`,
      name: `${maker} ${template.category} ${model}`,
      category: template.category,
      maker,
      year: 2012 + Math.floor(next() * 13),
      hours: roundTo(between(template.hours), 10),
      condition: pick(conditions),
      prefecture,
      city,
      image: template.image,
      summary: pick(template.summaries),
      deals,
      salePrice,
      rentPerDay,
      rentToOwn: deals.length === 2 && next() < 0.6,
      seller: pick(sellers),
      tags,
    }
  })
}
