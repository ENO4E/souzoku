// 相続税の簡易シミュレーション
//
// 計算の手順（相続税法・相続税法基本通達の計算方法どおり）
//   1. 課税価格の合計額（千円未満切り捨て）
//   2. 課税遺産総額 ＝ 課税価格の合計額 − 基礎控除（3,000万円＋600万円×法定相続人の数）
//   3. 課税遺産総額を法定相続分どおりに分けたと仮定した各人の取得金額（千円未満切り捨て）に速算表を適用
//   4. 3を合計して「相続税の総額」（百円未満切り捨て）
//   5. 相続税の総額を、実際の取得割合で各人に按分（算出税額。円未満切り捨て）
//   6. 兄弟姉妹（代襲相続人の甥・姪を含む）は算出税額に2割加算
//   7. 配偶者の税額軽減：相続税の総額 × min(配偶者の課税価格, max(課税価格の合計×配偶者の法定相続分, 1億6,000万円)) ÷ 課税価格の合計
//      （配偶者の算出税額が上限）
//   8. 各人の納付税額は百円未満切り捨て
//
// 相続人の順位（民法887条・889条・890条）
//   配偶者は常に相続人。ほかは 第1順位：子（亡くなった子の代わりの孫を含む）→ 第2順位：父母 → 第3順位：兄弟姉妹（甥・姪を含む）
//   先の順位の人が1人でもいれば、後の順位の人は相続人にならない。この関数は入力の人数からこの順位で自動的に判定する
//
// 簡易計算のため、次は考慮しない（画面の注記に記載）
//   小規模宅地等の特例・生命保険金等の非課税枠・債務控除・生前贈与加算・未成年者控除・障害者控除・相次相続控除、
//   代襲相続や半血兄弟姉妹で相続分が異なる場合（同順位の相続人は等しく取得する前提）、養子の数の制限、祖父母が相続人になる場合
//
// 入力
//   totalManEn  : 遺産総額（万円・基礎控除前の課税価格の合計）
//   hasSpouse   : 配偶者の有無
//   children    : 子の人数（亡くなった子の代わりの孫を含む）
//   parents     : 父母の人数（0〜2）。children が 1 以上なら無視
//   siblings    : 兄弟姉妹の人数（甥・姪を含む）。children か parents が 1 以上なら無視
//   spouseShare : 配偶者の実際の取得割合。'legal'（法定相続分どおり）または 0〜100（%）。
//                 配偶者がいない／配偶者だけが相続人の場合は無視（それぞれ 0%／100%）
//
// 出力（金額はすべて円）
//   computable, rank（'child' | 'parent' | 'sibling' | 'spouseOnly' | 'none'）, otherCount, heirs,
//   total（課税価格の合計）, basicDeduction, taxableEstate, spouseLegalShare, spouseActualShare,
//   totalTax（相続税の総額）, spouse { calc, relief, pay }, other { calcEach, surchargeEach, payEach, count },
//   totalPay（納付税額の合計）, surcharge（2割加算の有無）

// 相続税の速算表（税率は%の整数で持ち、整数で計算する）
export const TAX_BRACKETS = [
  { max: 10_000_000, pct: 10, deduction: 0 },
  { max: 30_000_000, pct: 15, deduction: 500_000 },
  { max: 50_000_000, pct: 20, deduction: 2_000_000 },
  { max: 100_000_000, pct: 30, deduction: 7_000_000 },
  { max: 200_000_000, pct: 40, deduction: 17_000_000 },
  { max: 300_000_000, pct: 45, deduction: 27_000_000 },
  { max: 600_000_000, pct: 50, deduction: 42_000_000 },
  { max: Infinity, pct: 55, deduction: 72_000_000 },
]

export const SPOUSE_RELIEF_FLOOR = 160_000_000 // 配偶者の税額軽減：1億6,000万円

const floorTo = (yen, unit) => Math.floor(yen / unit) * unit
const toCount = (v, max) => Math.min(max, Math.max(0, Math.floor(Number(v) || 0)))
// 割合は分数 { n, d } で持ち、金額 × n ÷ d を整数で計算する（2/3 などを小数で掛けると千円単位の切り捨てで誤差が出るため）
const mulFrac = (yen, f) => Number((BigInt(Math.floor(yen)) * BigInt(f.n)) / BigInt(f.d))
const ZERO = { n: 0, d: 1 }
const ONE = { n: 1, d: 1 }

/** 法定相続分に応ずる取得金額（千円未満切り捨て後）に速算表を当てた税額（端数処理前） */
export function taxOnShare(amount) {
  const base = floorTo(amount, 1000)
  if (base <= 0) return 0
  const b = TAX_BRACKETS.find((x) => base <= x.max)
  return (base / 100) * b.pct - b.deduction // base は千円単位なので base/100 は整数
}

/** 相続人の順位と配偶者以外の人数を決める */
export function resolveHeirs({ hasSpouse, children, parents, siblings }) {
  const c = toCount(children, 50)
  const p = toCount(parents, 2)
  const s = toCount(siblings, 50)
  if (c > 0) return { rank: 'child', otherCount: c }
  if (p > 0) return { rank: 'parent', otherCount: p }
  if (s > 0) return { rank: 'sibling', otherCount: s }
  return { rank: hasSpouse ? 'spouseOnly' : 'none', otherCount: 0 }
}

/** 配偶者の法定相続分（分数） */
export function spouseLegalFracOf(rank) {
  if (rank === 'child') return { n: 1, d: 2 }
  if (rank === 'parent') return { n: 2, d: 3 }
  if (rank === 'sibling') return { n: 3, d: 4 }
  if (rank === 'spouseOnly') return ONE
  return ZERO
}

export function calcInheritanceTax({ totalManEn, hasSpouse, children, parents, siblings, spouseShare }) {
  const spouse = Boolean(hasSpouse)
  const { rank, otherCount } = resolveHeirs({ hasSpouse: spouse, children, parents, siblings })
  const heirs = (spouse ? 1 : 0) + otherCount
  const total = floorTo(Math.max(0, Math.floor(Number(totalManEn) || 0)) * 10_000, 1000)
  const legalFrac = spouse ? spouseLegalFracOf(rank) : ZERO

  // 配偶者の実際の取得割合：配偶者がいなければ0、配偶者だけが相続人なら必ず100%
  let actualFrac = ZERO
  if (spouse && otherCount === 0) actualFrac = ONE
  else if (spouse) {
    const useLegal = spouseShare === 'legal' || spouseShare === undefined || spouseShare === null || spouseShare === ''
    actualFrac = useLegal ? legalFrac : { n: Math.min(100, Math.max(0, Math.round(Number(spouseShare) || 0))), d: 100 }
  }
  const spouseLegalShare = legalFrac.n / legalFrac.d
  const spouseActualShare = actualFrac.n / actualFrac.d

  const basicDeduction = heirs > 0 ? 30_000_000 + 6_000_000 * heirs : 0
  const result = {
    computable: heirs > 0,
    rank,
    otherCount,
    heirs,
    total,
    basicDeduction,
    taxableEstate: 0,
    spouseLegalShare,
    spouseActualShare,
    totalTax: 0,
    spouse: { calc: 0, relief: 0, pay: 0 },
    other: { count: otherCount, calcEach: 0, surchargeEach: 0, payEach: 0 },
    surcharge: rank === 'sibling',
    totalPay: 0,
  }
  if (!result.computable) return result

  result.taxableEstate = Math.max(0, total - basicDeduction)
  if (result.taxableEstate === 0) return result

  // 3〜4. 相続税の総額
  let sum = 0
  if (spouse) sum += taxOnShare(mulFrac(result.taxableEstate, legalFrac))
  if (otherCount > 0) {
    const perOther = mulFrac(result.taxableEstate, { n: legalFrac.d - legalFrac.n, d: legalFrac.d * otherCount })
    sum += taxOnShare(perOther) * otherCount
  }
  const totalTax = floorTo(sum, 100)
  result.totalTax = totalTax

  // 5〜8. 配偶者
  if (spouse) {
    const calc = mulFrac(totalTax, actualFrac)
    const spouseAmount = floorTo(mulFrac(total, actualFrac), 1000) // 配偶者の課税価格（千円未満切り捨て）
    const reliefBase = Math.min(spouseAmount, Math.max(mulFrac(total, legalFrac), SPOUSE_RELIEF_FLOOR))
    // 相続税の総額 × 軽減の基礎 ÷ 課税価格の合計（積が大きくなるため BigInt で正確に計算）
    const relief = Math.min(calc, Number((BigInt(totalTax) * BigInt(reliefBase)) / BigInt(total)))
    result.spouse = { calc, relief, pay: floorTo(calc - relief, 100) }
  }

  // 5〜8. 配偶者以外（同順位の相続人は等しく取得する前提）
  if (otherCount > 0) {
    const calcEach = mulFrac(totalTax, { n: actualFrac.d - actualFrac.n, d: actualFrac.d * otherCount })
    const surchargeEach = result.surcharge ? Math.floor(calcEach / 5) : 0 // 2割加算（整数で計算）
    result.other = { count: otherCount, calcEach, surchargeEach, payEach: floorTo(calcEach + surchargeEach, 100) }
  }

  result.totalPay = result.spouse.pay + result.other.payEach * otherCount
  return result
}
