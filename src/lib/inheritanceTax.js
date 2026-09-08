// 相続税の簡易シミュレーション（法定相続分どおりに按分した仮の取得金額に速算表を適用する方式）
//
// 入力
//   totalManEn : 遺産総額（万円・基礎控除前の課税価格合計）
//   hasSpouse  : 配偶者の有無
//   heirType   : 配偶者以外の法定相続人の種類 'child' | 'parent' | 'sibling' | 'none'
//   heirCount  : 配偶者以外の法定相続人の人数（heirType が 'none' のときは 0 扱い）
//   spouseShare: 配偶者の実際の取得割合 'legal'（法定相続分どおり）| 0〜100 の数値（%）
//
// 出力（すべて円。表示側で万円に丸める）
//   heirs, basicDeduction, taxableEstate, spouseLegalShare,
//   totalTax（相続税の総額・軽減前）, spouseTaxBefore, spouseTaxAfter, othersTax, totalAfterRelief,
//   computable（法定相続人がいない等で計算できない場合 false）

export const TAX_BRACKETS = [
  { max: 10_000_000, rate: 0.10, deduction: 0 },
  { max: 30_000_000, rate: 0.15, deduction: 500_000 },
  { max: 50_000_000, rate: 0.20, deduction: 2_000_000 },
  { max: 100_000_000, rate: 0.30, deduction: 7_000_000 },
  { max: 200_000_000, rate: 0.40, deduction: 17_000_000 },
  { max: 300_000_000, rate: 0.45, deduction: 27_000_000 },
  { max: 600_000_000, rate: 0.50, deduction: 42_000_000 },
  { max: Infinity, rate: 0.55, deduction: 72_000_000 },
]

const SPOUSE_RELIEF_FLOOR = 160_000_000 // 配偶者の税額軽減：1億6,000万円まで非課税

// 速算表による税額（取得金額は千円未満切り捨て、税額は百円未満切り捨て）
export function taxForAmount(amount) {
  const base = Math.floor(amount / 1000) * 1000
  if (base <= 0) return 0
  const b = TAX_BRACKETS.find((x) => base <= x.max)
  return Math.floor((base * b.rate - b.deduction) / 100) * 100
}

// 配偶者の法定相続分
export function spouseLegalShareOf(heirType, otherCount) {
  if (otherCount <= 0) return 1
  if (heirType === 'child') return 1 / 2
  if (heirType === 'parent') return 2 / 3
  if (heirType === 'sibling') return 3 / 4
  return 1
}

export function calcInheritanceTax({ totalManEn, hasSpouse, heirType, heirCount, spouseShare }) {
  const total = Math.max(0, Math.floor(Number(totalManEn) || 0)) * 10_000
  const otherCount = heirType === 'none' ? 0 : Math.max(0, Math.floor(Number(heirCount) || 0))
  const heirs = (hasSpouse ? 1 : 0) + otherCount

  const result = {
    computable: heirs > 0,
    heirs,
    otherCount,
    basicDeduction: 30_000_000 + 6_000_000 * heirs,
    taxableEstate: 0,
    spouseLegalShare: hasSpouse ? spouseLegalShareOf(heirType, otherCount) : 0,
    spouseActualShare: 0,
    totalTax: 0,
    spouseTaxBefore: 0,
    spouseTaxAfter: 0,
    othersTax: 0,
    totalAfterRelief: 0,
  }
  if (!result.computable) return result

  result.taxableEstate = Math.max(0, total - result.basicDeduction)
  if (result.taxableEstate === 0) return result

  // 相続税の総額：法定相続分で按分した仮の取得金額それぞれに速算表を適用して合算
  let totalTax = 0
  if (hasSpouse) totalTax += taxForAmount(result.taxableEstate * result.spouseLegalShare)
  if (otherCount > 0) {
    const perOther = (result.taxableEstate * (1 - result.spouseLegalShare)) / otherCount
    totalTax += taxForAmount(perOther) * otherCount
  }
  result.totalTax = totalTax

  // 実際の取得割合で各人に按分
  const spouseActualShare = !hasSpouse ? 0
    : spouseShare === 'legal' ? result.spouseLegalShare
    : Math.min(1, Math.max(0, (Number(spouseShare) || 0) / 100))
  result.spouseActualShare = spouseActualShare

  let spouseTax = Math.floor(totalTax * spouseActualShare)
  let othersTax = totalTax - spouseTax

  // 兄弟姉妹は2割加算
  if (heirType === 'sibling' && otherCount > 0) othersTax = Math.floor(othersTax * 1.2)

  result.spouseTaxBefore = spouseTax
  result.othersTax = othersTax

  // 配偶者の税額軽減：実際の取得額のうち「1億6,000万円」と「法定相続分相当額」の大きい方までは非課税
  if (hasSpouse && spouseTax > 0) {
    const spouseActualAmount = total * spouseActualShare
    const reliefLimit = Math.max(SPOUSE_RELIEF_FLOOR, total * result.spouseLegalShare)
    const reliefBase = Math.min(spouseActualAmount, reliefLimit)
    const relief = Math.floor((totalTax * reliefBase) / total)
    spouseTax = Math.max(0, spouseTax - relief)
  }
  result.spouseTaxAfter = spouseTax
  result.totalAfterRelief = spouseTax + othersTax
  return result
}
