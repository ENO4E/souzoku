// 遺留分の計算（民法1042〜1046条）。養子（婿養子・嫁養子・孫養子・その他）と代襲相続を含む
//
// 入力（calcIryubun の引数）
//   spouse            配偶者の有無（boolean）
//   children          存命の実子の数（養子を含まない）
//   deceasedChildren  先に亡くなった子の一覧 [{ grandchildren }]（その子の子＝代襲相続人の数。養子縁組した孫も含めて数える）
//   adopted           養子の一覧 [{ type, line }]
//                       type: 'spouseOfChild'（婿養子・嫁養子）/ 'grandchildAlive'（孫養子。親である子は存命）
//                             / 'grandchildDeceased'（孫養子。親である子は先に死亡＝養子と代襲の二重資格）/ 'other'
//                       line: type が grandchildDeceased のとき、deceasedChildren の何番目の子の子か（0始まり）
//   parents           直系尊属（父母など）の数。子・孫がいないときだけ相続人になる
//   siblings          兄弟姉妹の数。子・孫も直系尊属もいないときだけ相続人になる（遺留分はない）
//   estate            相続開始時の財産（円）
//   debts             債務（円）
//   giftsToOthers     相続人以外への贈与（相続開始前1年以内。円）
//   received          相続人ごとの取得額 { [heirId]: 円 }（遺言・遺産分割で実際に取得する額）
//   specialBenefit    相続人ごとの特別受益 { [heirId]: 円 }（相続開始前10年以内の贈与）
//
// 割合は分数（{ n, d }）で持ち、金額は円の整数で計算する

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))
export const frac = (n, d = 1) => {
  if (n === 0) return { n: 0, d: 1 }
  const g = gcd(Math.abs(n), Math.abs(d))
  return { n: n / g, d: d / g }
}
export const mul = (a, b) => frac(a.n * b.n, a.d * b.d)
export const add = (a, b) => frac(a.n * b.d + b.n * a.d, a.d * b.d)
export const fracText = (f) => (f.n === 0 ? '0' : f.d === 1 ? String(f.n) : `${f.n}/${f.d}`)
const ZERO = frac(0)
const ONE = frac(1)
export const fracToYen = (yen, f) => Math.floor((yen * f.n) / f.d)

const ADOPTED_LABEL = {
  spouseOfChild: '養子（子の配偶者）',
  grandchildAlive: '養子（孫）',
  grandchildDeceased: '養子（孫・代襲を兼ねる）',
  other: '養子',
}

/** 相続人の一覧と法定相続分・遺留分を返す */
export function calcIryubun(input) {
  const spouse = Boolean(input.spouse)
  const children = Math.max(0, Math.floor(Number(input.children) || 0))
  const deceased = (input.deceasedChildren || []).map((l) => ({ grandchildren: Math.max(0, Math.floor(Number(l.grandchildren) || 0)) }))
  const adopted = (input.adopted || []).map((a) => ({ type: ADOPTED_LABEL[a.type] ? a.type : 'other', line: Number(a.line) || 0 }))
  const parents = Math.min(2, Math.max(0, Math.floor(Number(input.parents) || 0)))
  const siblings = Math.max(0, Math.floor(Number(input.siblings) || 0))

  // 代襲相続人がいる先に亡くなった子だけが「子1人分」として数える
  const lines = deceased.map((l, i) => ({ ...l, index: i, adoptedCount: adopted.filter((a) => a.type === 'grandchildDeceased' && a.line === i).length }))
  const activeLines = lines.filter((l) => l.grandchildren > 0)
  const childUnits = children + adopted.length + activeLines.length
  const hasRank1 = childUnits > 0
  const rank = hasRank1 ? 'child' : parents > 0 ? 'parent' : siblings > 0 ? 'sibling' : spouse ? 'spouseOnly' : 'none'

  // 配偶者の法定相続分と、残りの割合
  let spouseShare = ZERO
  if (spouse) spouseShare = rank === 'child' ? frac(1, 2) : rank === 'parent' ? frac(2, 3) : rank === 'sibling' ? frac(3, 4) : ONE
  const rest = spouse ? frac(spouseShare.d - spouseShare.n, spouseShare.d) : ONE

  const heirs = []
  if (spouse) heirs.push({ id: 'spouse', label: '配偶者', kind: 'spouse', legal: spouseShare, hasIryubun: true, surcharge: false })

  if (rank === 'child') {
    const unit = mul(rest, frac(1, childUnits))
    for (let i = 0; i < children; i++) heirs.push({ id: `child${i}`, label: `実子${children > 1 ? i + 1 : ''}`, kind: 'child', legal: unit, hasIryubun: true, surcharge: false })
    adopted.forEach((a, i) => {
      let legal = unit
      let label = ADOPTED_LABEL[a.type]
      if (a.type === 'grandchildDeceased') {
        const line = lines[a.line]
        if (line && line.grandchildren > 0) {
          // 養子としての相続分に、亡くなった親（子）の相続分をその子の数で分けた代襲分を足す（二重資格）
          legal = add(unit, mul(unit, frac(1, line.grandchildren)))
          label = `養子（孫・亡くなった子${lines.length > 1 ? a.line + 1 : ''}の代襲を兼ねる）`
        } else {
          label = '養子（孫）'
        }
      }
      heirs.push({
        id: `adopted${i}`,
        label: `${label}${adopted.length > 1 ? ` ${i + 1}` : ''}`,
        kind: a.type,
        legal,
        hasIryubun: true,
        // 孫養子は相続税の2割加算の対象。ただし代襲相続人を兼ねる場合は加算されない。子の配偶者である養子は一親等の養子として加算なし
        surcharge: a.type === 'grandchildAlive',
      })
    })
    activeLines.forEach((line) => {
      const eachGrand = mul(unit, frac(1, line.grandchildren))
      const plain = line.grandchildren - line.adoptedCount
      for (let j = 0; j < plain; j++) {
        heirs.push({
          id: `grand${line.index}_${j}`,
          label: `孫（亡くなった子${lines.length > 1 ? line.index + 1 : ''}の代襲）${plain > 1 ? ` ${j + 1}` : ''}`,
          kind: 'grandchild',
          legal: eachGrand,
          hasIryubun: true,
          surcharge: false,
        })
      }
    })
  } else if (rank === 'parent') {
    const each = mul(rest, frac(1, parents))
    for (let i = 0; i < parents; i++) heirs.push({ id: `parent${i}`, label: `直系尊属${parents > 1 ? i + 1 : ''}`, kind: 'parent', legal: each, hasIryubun: true, surcharge: false })
  } else if (rank === 'sibling') {
    const each = mul(rest, frac(1, siblings))
    for (let i = 0; i < siblings; i++) heirs.push({ id: `sibling${i}`, label: `兄弟姉妹${siblings > 1 ? i + 1 : ''}`, kind: 'sibling', legal: each, hasIryubun: false, surcharge: true })
  }

  // 総体的遺留分：直系尊属だけが相続人なら1/3、それ以外は1/2（民法1042条）
  const totalFrac = rank === 'parent' && !spouse ? frac(1, 3) : frac(1, 2)

  // 遺留分を算定するための財産（民法1043条）＝相続開始時の財産＋贈与（相続人以外は1年以内、相続人の特別受益は10年以内）−債務
  const estate = Math.max(0, Math.round(Number(input.estate) || 0))
  const debts = Math.max(0, Math.round(Number(input.debts) || 0))
  const giftsToOthers = Math.max(0, Math.round(Number(input.giftsToOthers) || 0))
  const received = input.received || {}
  const benefit = input.specialBenefit || {}
  const benefitTotal = heirs.reduce((s, h) => s + Math.max(0, Math.round(Number(benefit[h.id]) || 0)), 0)
  const base = Math.max(0, estate + giftsToOthers + benefitTotal - debts)

  for (const h of heirs) {
    h.iryubun = h.hasIryubun ? mul(totalFrac, h.legal) : ZERO
    h.iryubunYen = fracToYen(base, h.iryubun)
    const got = Math.max(0, Math.round(Number(received[h.id]) || 0))
    const own = Math.max(0, Math.round(Number(benefit[h.id]) || 0))
    // 遺留分侵害額（民法1046条2項）＝遺留分額−特別受益−相続で取得した財産＋相続分に応じて負担する債務
    h.debtShare = fracToYen(debts, h.legal)
    h.received = got
    h.benefit = own
    h.shortfall = h.hasIryubun ? Math.max(0, h.iryubunYen - own - got + h.debtShare) : 0
  }

  // 相続税の法定相続人の数（相続税法15条）：養子は実子がいれば1人、いなければ2人まで。代襲相続人である孫は実子として数える
  const realChildCount = children + activeLines.reduce((s, l) => s + (l.grandchildren - l.adoptedCount), 0)
  const adoptedAsReal = adopted.filter((a) => a.type === 'grandchildDeceased' && lines[a.line] && lines[a.line].grandchildren > 0).length
  const hasReal = realChildCount + adoptedAsReal > 0
  const adoptedLimit = hasReal ? 1 : 2
  const adoptedForTax = Math.min(adopted.length - adoptedAsReal, adoptedLimit)
  let taxHeirs = (spouse ? 1 : 0)
  if (rank === 'child') taxHeirs += realChildCount + adoptedAsReal + adoptedForTax
  else if (rank === 'parent') taxHeirs += parents
  else if (rank === 'sibling') taxHeirs += siblings
  const basicDeduction = taxHeirs > 0 ? 30_000_000 + 6_000_000 * taxHeirs : 0

  return {
    rank,
    spouse,
    heirs,
    totalFrac,
    base,
    estate,
    debts,
    giftsToOthers,
    benefitTotal,
    tax: { heirs: taxHeirs, adoptedCounted: adoptedForTax, adoptedTotal: adopted.length - adoptedAsReal, adoptedLimit, basicDeduction },
  }
}
