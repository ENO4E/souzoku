/**
 * 市ごとの相続税申告ページ（/area/<slug>/）で共通に使う文言。ページ本文と構造化データ（seo.js）の両方から使い、内容を必ず一致させる。
 * 料金は site.js の baseFees、実績は site.js の strengths と同じ表記にする（数字を勝手に作らない）
 */
import { baseFees, comparison, extraFees, site } from './site.js'

/** 「最安水準」の根拠の注記（他事務所の公表料金を当センターが調べた結果。表現を変えるときは根拠資料と合わせる） */
export const LOWEST_NOTE = '※「最安水準」は、当センターが京阪神で相続税申告を扱う他事務所の公表料金を調べた結果にもとづく表現です。'

/** 実績（site.js の「累計200件超の申告実績」と同じ） */
export const RECORD = '累計200件超'

/** 基本報酬（税込）の一覧。'〜4,000万円' → { range: '〜4,000万円', limit: '4,000万円', incl: '99,000円' } */
export const feeRows = baseFees.map((f) => {
  const incl = f.tax ? (f.tax.match(/[\d,]+円/) || [''])[0] : ''
  return { range: f.range, limit: f.range.replace('〜', ''), incl: incl || f.fee }
})

/** 料金表の文字列 '90,000円' '100,000円〜' → 数値（税抜） */
const yen = (s) => Number((s.match(/[\d,]+/) || ['0'])[0].replace(/,/g, ''))
const base = (range) => yen(baseFees.find((f) => f.range === range).fee)
const extra = (item) => yen(extraFees.find((f) => f.item.startsWith(item)).fee)
const fmt = (n) => `${n.toLocaleString('ja-JP')}円`

/** 当センターの公開料金での総額の例（税込）。基本報酬に加算を足した「実際に払う額」を市のページで見せる（一般的な相場は site.js の comparison と同じ基準）
 *  土地評価は「100,000円〜」なので1か所100,000円として計算 */
export const feeExamples = [
  { estate: '4,000万円', cond: '預貯金と上場株式3銘柄、相続人2人', items: [['基本報酬', base('〜4,000万円')], ['上場株式 3件', extra('上場株式') * 3], ['相続人加算 1人', extra('相続人加算')]] },
  { estate: '5,000万円', cond: '自宅（土地1・建物1）と預貯金、配偶者＋子2人', items: [['基本報酬', base('〜5,000万円')], ['土地評価 1か所', extra('土地評価')], ['建物評価', extra('建物評価')], ['相続人加算 2人', extra('相続人加算') * 2]] },
  { estate: '7,000万円', cond: '自宅と預貯金、上場株式5銘柄、配偶者＋子2人', items: [['基本報酬', base('〜7,000万円')], ['土地評価 1か所', extra('土地評価')], ['建物評価', extra('建物評価')], ['上場株式 5件', extra('上場株式') * 5], ['相続人加算 2人', extra('相続人加算')  * 2]] },
].map((e) => {
  const subtotal = e.items.reduce((n, [, v]) => n + v, 0)
  const total = Math.round(subtotal * 1.1)
  const market = comparison.find((c) => c.estate === e.estate)?.market || ''
  return { ...e, items: e.items.map(([k, v]) => [k, fmt(v)]), subtotal: fmt(subtotal), total: fmt(total), market }
})

/** 料金体系の型（市のページの「費用の比べ方」で使う。事務所名は出さない） */
export const feeTypes = [
  { name: '一律定額型', how: '条件の範囲内なら遺産の額や土地の数にかかわらず同じ金額', check: '条件から外れたときの料金と、条件の数え方' },
  { name: '遺産額別＋加算型', how: '遺産総額で基本報酬が決まり、土地・相続人・非上場株式などで加算（当センターもこの型）', check: '加算の対象と単位、相続人加算の上限、期限が近いときの加算' },
  { name: '遺産額別・加算なし型', how: '遺産総額だけで決まり、土地や相続人の数で増えない', check: '「遺産総額」に債務や特例を差し引く前の額を使うか' },
  { name: '個別見積型', how: '報酬の基準をもとに、財産の内容を聞いてから見積もる', check: '見積もりの前提と、見積もりから増える条件' },
]

/** 見積もりを比べるときに確かめること */
export const quoteChecks = [
  '総額で比べる：基本報酬だけでなく、土地・相続人・株式の加算を足した税込の総額',
  '土地評価の進め方：現地を確認するか、不整形地・私道・がけ地などの減額を検討するか',
  '相続税申告の年間の件数と、担当者が相続を専門にしているか',
  '税務調査への対応と書面添付（税理士法33条の2）の有無・料金',
  '申告期限までの日数で加算があるか、間に合う日程で進められるか',
]

/** ページ冒頭の要約。AI 検索や検索結果でそのまま引用されることを想定し、市名・サービス・価格・実績・対応方法を1段落に入れる */
export function areaLead(area) {
  return `${site.name}（運営：${site.company}）は、${area.city}の相続税申告を最安水準の基本報酬99,000円（税込・遺産総額4,000万円まで）からお受けしています。相続税申告に特化した税理士法人として${RECORD}の申告実績があり、事務所での面談・オンライン面談・${area.city}のご自宅への訪問でご相談いただけます。初回相談は無料です。`
}

/** よくある質問：全市共通は1問（費用と訪問をまとめる）＋その市の質問。共通の文面を減らし、市ごとの内容の割合を上げる */
export function areaFaqs(area) {
  return [
    {
      q: `${area.city}で相続税申告を依頼すると、費用はいくらですか？来てもらえますか？`,
      a: `基本報酬は99,000円（税込・遺産総額4,000万円まで）からで、土地評価などの追加料金は必ず事前にお伝えします。事務所（大阪市北区・南森町）での面談のほか、オンライン面談と${area.city}のご自宅への訪問に対応しています。初回相談は無料です。`,
    },
    ...(area.faqs || []),
  ]
}
