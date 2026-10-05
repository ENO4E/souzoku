/**
 * 市ごとの相続税申告ページ（/area/<slug>/）で共通に使う文言。ページ本文と構造化データ（seo.js）の両方から使い、内容を必ず一致させる。
 * 料金は site.js の baseFees、実績は site.js の strengths と同じ表記にする（数字を勝手に作らない）
 */
import { baseFees, site } from './site.js'

/** 実績（site.js の「累計200件超の申告実績」と同じ） */
export const RECORD = '累計200件超'

/** 基本報酬（税込）の一覧。'〜4,000万円' → { range: '〜4,000万円', limit: '4,000万円', incl: '99,000円' } */
export const feeRows = baseFees.map((f) => {
  const incl = f.tax ? (f.tax.match(/[\d,]+円/) || [''])[0] : ''
  return { range: f.range, limit: f.range.replace('〜', ''), incl: incl || f.fee }
})

/** ページ冒頭の要約。AI 検索や検索結果でそのまま引用されることを想定し、市名・サービス・価格・実績・対応方法を1段落に入れる */
export function areaLead(area) {
  return `${site.name}（運営：${site.company}）は、${area.city}の相続税申告を基本報酬99,000円（税込・遺産総額4,000万円まで）からお受けしています。相続税申告に特化した税理士法人として${RECORD}の申告実績があり、事務所での面談・オンライン面談・${area.city}のご自宅への訪問でご相談いただけます。初回相談は無料です。`
}

/** よくある質問：全市共通の2問（費用・訪問）＋その市の質問 */
export function areaFaqs(area) {
  const priced = feeRows.filter((r) => /円$/.test(r.incl) && r.range.startsWith('〜'))
  const feeText = priced.map((r) => `遺産総額${r.limit}まで${r.incl}`).join('、')
  return [
    {
      q: `${area.city}で相続税申告を依頼すると、費用はいくらですか？`,
      a: `基本報酬（税込）は、${feeText}です。7,000万円を超える場合はお見積りします。土地評価などの追加料金がかかる場合も、必ず事前にお伝えします。初回相談は無料です。`,
    },
    {
      q: `${area.city}まで来てもらえますか？`,
      a: `事務所は大阪市北区（南森町）にあります。事務所での面談のほか、オンライン面談や、${area.city}のご自宅への訪問にも対応しています。`,
    },
    ...(area.faqs || []),
  ]
}
