import { useState } from 'react'
import ReportMockup from './ReportMockup.jsx'
import { calcInheritanceTax } from '../lib/inheritanceTax.js'

const man = (yen) => Math.round(yen / 10_000).toLocaleString()
const pct = (share) => `${Math.round(share * 1000) / 10}%`

const heirTypeLabels = { child: '子', parent: '父母', sibling: '兄弟姉妹' }

export default function TaxCalcSection() {
  const [totalManEn, setTotalManEn] = useState('10000')
  const [hasSpouse, setHasSpouse] = useState(true)
  const [heirType, setHeirType] = useState('child')
  const [heirCount, setHeirCount] = useState(2)
  const [spouseShare, setSpouseShare] = useState('legal')

  const r = calcInheritanceTax({ totalManEn, hasSpouse, heirType, heirCount, spouseShare })
  const noHeirs = !r.computable

  return (
    <section id="tax-calc" style={{ background: 'var(--bg-off)' }}>
      <div className="wrap">
        <div className="section-head fade-in" style={{ marginBottom: 36, maxWidth: 680 }}>
          <div className="eyebrow">無料 相続税シミュレーター</div>
          <h2>あなたの相続税額を概算してみましょう</h2>
          <p>遺産総額と相続人の状況を入力すると、相続税額の目安がその場で表示されます。</p>
        </div>

        <div className="calc-card fade-in">
          {/* 1. 遺産総額 */}
          <div className="calc-row">
            <div className="calc-label">
              <div className="calc-num">1</div>
              <div className="calc-label-text"><b>おおよその遺産総額はどのくらいですか？</b><span>現預金のほか、土地・建物・有価証券・生命保険金など、被相続人の財産すべての合計（基礎控除前）です。</span></div>
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

          {/* 2. 配偶者の有無 */}
          <div className="calc-row">
            <div className="calc-label">
              <div className="calc-num">2</div>
              <div className="calc-label-text"><b>配偶者はいらっしゃいますか？</b><span>亡くなられた方（被相続人）の配偶者です。</span></div>
            </div>
            <div className="calc-radio-group">
              <label><input type="radio" name="calc-spouse" value="yes" checked={hasSpouse} onChange={() => setHasSpouse(true)} />いる</label>
              <label><input type="radio" name="calc-spouse" value="no" checked={!hasSpouse} onChange={() => setHasSpouse(false)} />いない</label>
            </div>
          </div>

          {/* 3. 配偶者以外の相続人 */}
          <div className="calc-row">
            <div className="calc-label">
              <div className="calc-num">3</div>
              <div className="calc-label-text"><b>配偶者以外の法定相続人はどなたですか？</b><span>子がいれば「子」、子がいなければ「父母」、父母もいなければ「兄弟姉妹」が相続人になります。</span></div>
            </div>
            <div className="calc-radio-group">
              <label><input type="radio" name="calc-heir-type" value="child" checked={heirType === 'child'} onChange={() => setHeirType('child')} />子</label>
              <label><input type="radio" name="calc-heir-type" value="parent" checked={heirType === 'parent'} onChange={() => setHeirType('parent')} />父母</label>
              <label><input type="radio" name="calc-heir-type" value="sibling" checked={heirType === 'sibling'} onChange={() => setHeirType('sibling')} />兄弟姉妹</label>
              <label><input type="radio" name="calc-heir-type" value="none" checked={heirType === 'none'} onChange={() => setHeirType('none')} />いない</label>
            </div>
          </div>

          {/* 4. 人数（配偶者以外） */}
          {heirType !== 'none' && (
            <div className="calc-row">
              <div className="calc-label">
                <div className="calc-num">4</div>
                <div className="calc-label-text"><b>{heirTypeLabels[heirType]}の人数（配偶者を除く）</b><span>{heirType === 'parent' ? '父母がともに健在なら2人、どちらか一方なら1人です。' : `${heirTypeLabels[heirType]}が複数いる場合は人数を選んでください。`}</span></div>
              </div>
              <div className="calc-input-wrap">
                <select aria-label={`${heirTypeLabels[heirType]}の人数`} value={heirCount} onChange={(e) => setHeirCount(Number(e.target.value))}>
                  {Array.from({ length: heirType === 'parent' ? 2 : 8 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n}人</option>
                  ))}
                </select>
                <span style={{ fontSize: 13 }}>人</span>
              </div>
            </div>
          )}

          {/* 5. 配偶者の取得割合（配偶者がいる場合のみ） */}
          {hasSpouse && (
            <div className="calc-row">
              <div className="calc-label">
                <div className="calc-num">{heirType === 'none' ? 4 : 5}</div>
                <div className="calc-label-text"><b>配偶者が実際に取得する遺産の割合</b><span>未定の場合は「法定相続分どおり」のままで構いません。配偶者の取得分は1億6,000万円（または法定相続分）まで非課税になります。</span></div>
              </div>
              <div className="calc-input-wrap">
                <select aria-label="配偶者の遺産取得割合" value={spouseShare} onChange={(e) => setSpouseShare(e.target.value === 'legal' ? 'legal' : Number(e.target.value))}>
                  <option value="legal">法定相続分どおり（{pct(r.spouseLegalShare)}）</option>
                  {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((v) => (
                    <option key={v} value={v}>{v}%</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <p className="calc-summary">
            {noHeirs
              ? '法定相続人がいない条件のため計算できません。配偶者または相続人を選んでください。'
              : <>法定相続人 <b>{r.heirs}人</b>　／　基礎控除 <b>{man(r.basicDeduction)}万円</b>　／　課税遺産総額 <b>{man(r.taxableEstate)}万円</b></>}
          </p>

          <div className="calc-arrow">▼</div>

          {/* 配偶者がいない場合は軽減がないので、2割加算まで反映した最終額をここに表示する */}
          <div className="calc-result-row">
            <div className="r-label">{hasSpouse ? '相続税の総額' : '相続税額の合計'}<span className="r-note">{hasSpouse ? '（配偶者の税額軽減を使う前）' : (heirType === 'sibling' ? '（兄弟姉妹の2割加算を含む）' : '')}</span></div>
            <div className="r-amount"><span>{noHeirs ? '―' : man(hasSpouse ? r.totalTax : r.totalAfterRelief)}</span><span className="unit">万円</span></div>
          </div>
          {hasSpouse && (
            <div className="calc-result-row alt">
              <div className="r-label">配偶者の税額軽減を使うと…<span className="r-note">{noHeirs ? '' : `配偶者 ${man(r.spouseTaxAfter)}万円＋その他の相続人 ${man(r.othersTax)}万円`}</span></div>
              <div className="r-amount"><span>{noHeirs ? '―' : man(r.totalAfterRelief)}</span><span className="unit">万円</span></div>
            </div>
          )}
          {heirType === 'sibling' && !noHeirs && r.othersTax > 0 && (
            <p className="calc-footnote">※兄弟姉妹が相続する分には税額の2割加算を反映しています。</p>
          )}

          <div className="calc-warning">
            <div className="w-icon">⚠️</div>
            <p><b>相続税の申告は相続開始から10ヶ月以内です。</b><br />期限を過ぎた場合、ペナルティ（加算税等）がかかる場合もあります。期限が迫っている方はなるべく早めにご相談ください。</p>
          </div>

          <div style={{ marginTop: 20 }}>
            <a href="#contact" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>この結果をもとに無料相談する</a>
          </div>
        </div>

        <div className="fee-note fade-in" style={{ maxWidth: 720, margin: '20px auto 0' }}>
          ※法定相続分どおりに取得したものとして相続税の総額を求め、配偶者の税額軽減（1億6,000万円または法定相続分まで非課税）と兄弟姉妹の2割加算を反映した簡易試算です。生命保険金の非課税枠、小規模宅地等の特例、生前贈与加算、未成年者・障害者控除などは考慮していません。正確な金額は無料相談にてご確認ください。
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
