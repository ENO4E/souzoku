import { useState } from 'react'
import ReportMockup from './ReportMockup.jsx'

// 速算表（令和6年時点の税率区分）
const taxBrackets = [
  { max: 10000000, rate: 0.10, deduction: 0 },
  { max: 30000000, rate: 0.15, deduction: 500000 },
  { max: 50000000, rate: 0.20, deduction: 2000000 },
  { max: 100000000, rate: 0.30, deduction: 7000000 },
  { max: 200000000, rate: 0.40, deduction: 17000000 },
  { max: 300000000, rate: 0.45, deduction: 27000000 },
  { max: 600000000, rate: 0.50, deduction: 42000000 },
  { max: Infinity, rate: 0.55, deduction: 72000000 },
]

function taxForAmount(amount) {
  if (amount <= 0) return 0
  for (const b of taxBrackets) {
    if (amount <= b.max) return amount * b.rate - b.deduction
  }
  return 0
}

const spouseShareOptions = ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100']

function calcTax({ totalManEn, hasSpouse, spouseShare, heirType, heirCount }) {
  const total = (Number(totalManEn) || 0) * 10000 // 万円 → 円

  let otherCount = hasSpouse ? Math.max(0, heirCount - 1) : heirCount

  // 基礎控除額
  const basicDeduction = 30000000 + 6000000 * heirCount
  const taxableTotal = Math.max(0, total - basicDeduction)

  if (heirCount <= 0) return { total: '―', reduced: '―' }
  if (taxableTotal <= 0) return { total: '0', reduced: '0' }

  // 法定相続分
  let spouseLegalShare = 0
  let otherLegalShareTotal = 0
  if (hasSpouse && otherCount > 0) {
    if (heirType === 'child') { spouseLegalShare = 1 / 2; otherLegalShareTotal = 1 / 2 }
    else if (heirType === 'parent') { spouseLegalShare = 2 / 3; otherLegalShareTotal = 1 / 3 }
    else if (heirType === 'sibling') { spouseLegalShare = 3 / 4; otherLegalShareTotal = 1 / 4 }
    else { spouseLegalShare = 1; otherLegalShareTotal = 0; otherCount = 0 }
  } else if (hasSpouse && otherCount === 0) {
    spouseLegalShare = 1
    otherLegalShareTotal = 0
  } else if (!hasSpouse && otherCount > 0) {
    spouseLegalShare = 0
    otherLegalShareTotal = 1
  }

  const perOtherHeirShare = otherCount > 0 ? otherLegalShareTotal / otherCount : 0

  // 相続税の総額（法定相続分で按分した仮の取得金額に速算表を適用）
  let totalTax = 0
  if (hasSpouse && spouseLegalShare > 0) {
    totalTax += taxForAmount(taxableTotal * spouseLegalShare)
  }
  for (let i = 0; i < otherCount; i++) {
    totalTax += taxForAmount(taxableTotal * perOtherHeirShare)
  }

  const totalTaxMan = Math.round(totalTax / 10000)

  // 配偶者の税額軽減 適用後
  let reduced = totalTaxMan.toLocaleString()
  if (hasSpouse && spouseShare !== '') {
    const spouseSharePct = Number(spouseShare) || 0
    const spouseActualAmount = total * (spouseSharePct / 100)
    const spouseLegalAmountOnTotal = total * spouseLegalShare
    const spouseExemptLimit = Math.max(160000000, spouseLegalAmountOnTotal)
    const spouseTaxShare = totalTax * (spouseSharePct / 100)

    let spouseTaxAfter = 0
    if (spouseActualAmount > 0 && spouseActualAmount > spouseExemptLimit) {
      const taxableRatio = (spouseActualAmount - spouseExemptLimit) / spouseActualAmount
      spouseTaxAfter = spouseTaxShare * taxableRatio
    }
    const othersTaxShare = totalTax - spouseTaxShare
    const reducedTotal = Math.max(0, othersTaxShare + spouseTaxAfter)
    reduced = Math.round(reducedTotal / 10000).toLocaleString()
  }

  return { total: totalTaxMan.toLocaleString(), reduced }
}

export default function TaxCalcSection() {
  const [totalManEn, setTotalManEn] = useState('10000')
  const [hasSpouse, setHasSpouse] = useState(true)
  const [spouseShare, setSpouseShare] = useState('50')
  const [heirType, setHeirType] = useState('child')
  const [heirCount, setHeirCount] = useState(2)

  // 配偶者の有無・法定相続人の種類に応じて「人数」選択肢を整合させる
  const isFixedCount = heirType === 'none'
  const fixedCount = hasSpouse ? 1 : 0
  const minCount = hasSpouse ? 2 : 1
  const effectiveCount = isFixedCount
    ? fixedCount
    : (heirCount >= minCount && heirCount <= 8 ? heirCount : minCount)

  const countNote = isFixedCount
    ? (hasSpouse ? '配偶者のみのため自動的に1人になります' : '法定相続人がいないため計算できません')
    : '子・父母・兄弟姉妹が複数いる場合はここで調整してください'

  const countOptions = isFixedCount
    ? [fixedCount]
    : Array.from({ length: 8 - minCount + 1 }, (_, i) => minCount + i)

  const result = calcTax({
    totalManEn,
    hasSpouse,
    spouseShare,
    heirType,
    heirCount: effectiveCount,
  })

  return (
    <section id="tax-calc" style={{ background: 'var(--bg-off)' }}>
      <div className="wrap">
        <div className="section-head fade-in" style={{ marginBottom: 36, maxWidth: 680 }}>
          <div className="eyebrow">無料 相続税シミュレーター</div>
          <h2>あなたの相続税額を概算してみましょう</h2>
          <p>遺産総額と相続人の状況を入力すると、相続税額の目安がその場で表示されます。</p>
        </div>

        <div className="calc-card fade-in">
          <div className="calc-row">
            <div className="calc-label">
              <div className="calc-num">1</div>
              <div className="calc-label-text"><b>おおよその遺産総額はどのくらいですか？</b><span>（基礎控除前の課税価格合計）現預金の他、土地、有価証券、借地など被相続人の全ての遺産を含みます。</span></div>
            </div>
            <div className="calc-input-wrap">
              <input
                type="number"
                min="0"
                step="100"
                aria-label="おおよその遺産総額（万円）"
                value={totalManEn}
                onChange={(e) => setTotalManEn(e.target.value)}
              />
              <span style={{ fontSize: 13 }}>万円</span>
            </div>
          </div>

          <div className="calc-row">
            <div className="calc-label">
              <div className="calc-num">2</div>
              <div className="calc-label-text"><b>被相続人に配偶者はいますか？</b><span>（「被相続人」とは亡くなられた方です）</span></div>
            </div>
            <div className="calc-radio-group">
              <label><input type="radio" name="calc-spouse" value="yes" checked={hasSpouse} onChange={() => setHasSpouse(true)} />いる</label>
              <label><input type="radio" name="calc-spouse" value="no" checked={!hasSpouse} onChange={() => setHasSpouse(false)} />いない</label>
            </div>
          </div>

          <div className="calc-row">
            <div className="calc-label">
              <div className="calc-num">3</div>
              <div className="calc-label-text"><b>配偶者の遺産取得割合</b><span>実際に配偶者が取得する割合の目安です</span></div>
            </div>
            <div className="calc-input-wrap">
              <select aria-label="配偶者の遺産取得割合" value={spouseShare} onChange={(e) => setSpouseShare(e.target.value)}>
                <option value="">お選びください</option>
                {spouseShareOptions.map((v) => (
                  <option key={v} value={v}>{v}%</option>
                ))}
              </select>
              <span style={{ fontSize: 13 }}>%</span>
            </div>
          </div>

          <div className="calc-row">
            <div className="calc-label">
              <div className="calc-num">4</div>
              <div className="calc-label-text"><b>配偶者以外に法定相続人はいらっしゃいますか？</b></div>
            </div>
            <div className="calc-radio-group">
              <label><input type="radio" name="calc-heir-type" value="child" checked={heirType === 'child'} onChange={() => setHeirType('child')} />子</label>
              <label><input type="radio" name="calc-heir-type" value="parent" checked={heirType === 'parent'} onChange={() => setHeirType('parent')} />父母</label>
              <label><input type="radio" name="calc-heir-type" value="sibling" checked={heirType === 'sibling'} onChange={() => setHeirType('sibling')} />兄弟姉妹</label>
              <label><input type="radio" name="calc-heir-type" value="none" checked={heirType === 'none'} onChange={() => setHeirType('none')} />いない</label>
            </div>
          </div>

          <div className="calc-row" id="calc-heir-count-row">
            <div className="calc-label">
              <div className="calc-num">5</div>
              <div className="calc-label-text"><b>法定相続人の人数（配偶者を含む）</b><span>{countNote}</span></div>
            </div>
            <div className="calc-input-wrap">
              <select
                aria-label="法定相続人の人数"
                value={effectiveCount}
                disabled={isFixedCount}
                onChange={(e) => setHeirCount(Number(e.target.value))}
              >
                {countOptions.map((n) => (
                  <option key={n} value={n}>{n}人</option>
                ))}
              </select>
              <span style={{ fontSize: 13 }}>人</span>
            </div>
          </div>

          <div className="calc-arrow">▼</div>

          <div className="calc-result-row">
            <div className="r-label">相続税額合計</div>
            <div className="r-amount"><span>{result.total}</span><span className="unit">万円</span></div>
          </div>
          <div className="calc-result-row alt">
            <div className="r-label">配偶者の税額軽減を使うと…</div>
            <div className="r-amount"><span>{result.reduced}</span><span className="unit">万円</span></div>
          </div>

          <div className="calc-warning">
            <div className="w-icon">⚠️</div>
            <p><b>相続税の申告は相続開始から10ヶ月以内です。</b><br />期限を過ぎた場合、ペナルティ（加算税等）がかかる場合もあります。期限が迫っている方はなるべく早めにご相談ください。</p>
          </div>

          <div style={{ marginTop: 20 }}>
            <a href="#contact" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>この結果をもとに無料相談する</a>
          </div>
        </div>

        <div className="fee-note fade-in" style={{ maxWidth: 720, margin: '20px auto 0' }}>
          ※これは簡易的な概算シミュレーションです。生命保険の非課税枠、小規模宅地等の特例、生前贈与加算などは考慮していません。正確な金額は無料相談にてご確認ください。
        </div>

        <div className="report-showcase fade-in">
          <ReportMockup size="large" />
          <div className="report-showcase-text">
            <div className="eyebrow">無料相談でお渡しする報告書</div>
            <h3 className="serif">概算の先は、あなた専用の<br />「相続税額計算結果報告書」で。</h3>
            <p>無料相談でお伺いした財産の内容をもとに、税理士法人が正式な試算報告書を作成してお渡しします。土地の路線価評価から税額の算出まで、数字の根拠が一目で分かる資料です。</p>
            <ul className="report-points">
              <li>土地・建物・預貯金・生命保険などの財産一覧表</li>
              <li>基礎控除を差し引いた課税遺産総額</li>
              <li>法定相続分にもとづく相続人ごとの取得金額と税額</li>
              <li>配偶者の税額軽減を反映した相続税額の合計</li>
            </ul>
            <a href="#contact" className="btn btn-primary">無料相談で報告書を依頼する</a>
            <p className="report-note">※画像はサンプルです。実際の報告書はご相談内容にもとづき個別に作成します。</p>
          </div>
        </div>
      </div>
    </section>
  )
}
