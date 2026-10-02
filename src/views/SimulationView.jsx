import { useState } from 'react'
import { PageHead, NextNav } from './PageParts.jsx'
import ReportSection from '../components/ReportSection.jsx'
import { Arrow } from '../components/SectionHead.jsx'
import { calcInheritanceTax } from '../lib/inheritanceTax.js'

const man = (yen) => Math.round(yen / 10_000).toLocaleString()
const pct = (share) => `${Math.round(share * 1000) / 10}%`
const heirTypeLabels = { child: '子', parent: '父母', sibling: '兄弟姉妹' }

// 遺産総額（万円）に対する当センターの基本報酬（税込）
function feeFor(totalManEn) {
  const t = Number(totalManEn) || 0
  if (t <= 4000) return { label: '99,000円', note: '〜4,000万円' }
  if (t <= 5000) return { label: '170,500円', note: '〜5,000万円' }
  if (t <= 6000) return { label: '242,000円', note: '〜6,000万円' }
  if (t <= 7000) return { label: '308,000円', note: '〜7,000万円' }
  return { label: '別途お見積り', note: '7,000万円超' }
}

function Chips({ name, value, options, onChange }) {
  return (
    <div className="chips">
      {options.map((o) => (
        <label key={String(o.value)} className="chip">
          <input type="radio" name={name} value={String(o.value)} checked={value === o.value} onChange={() => onChange(o.value)} />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  )
}

/** 02 Simulation：相続税の簡易シミュレーション */
export default function SimulationView() {
  const [totalManEn, setTotalManEn] = useState('6000')
  const [hasSpouse, setHasSpouse] = useState(true)
  const [heirType, setHeirType] = useState('child')
  const [heirCount, setHeirCount] = useState(2)
  const [spouseShare, setSpouseShare] = useState('legal')

  const r = calcInheritanceTax({ totalManEn, hasSpouse, heirType, heirCount, spouseShare })
  const fee = feeFor(totalManEn)
  const noHeirs = !r.computable
  const presets = [3000, 4000, 5000, 6000, 8000, 10000]

  return (
    <>
      <PageHead
        no="02"
        en="Simulation"
        scene={3}
        title={<>相続税額を、<br />その場で<em className="gradient-text">試算</em>。</>}
        lead="遺産総額と相続人の状況を入力すると、相続税額の目安と当センターの基本報酬がその場で表示されます。計算は法定相続分で按分した仮の取得金額に速算表を適用する簡易方式です。"
      />

      <section id="calc" className="section calc" data-scene={3}>
        <div className="container calc__inner">
          <div className="calc__form glass" data-reveal>
            <div className="calc__row">
              <div className="calc__label">
                <span className="calc__num">1</span>
                <div>
                  <b>おおよその遺産総額</b>
                  <span>現預金のほか、土地・建物・有価証券・生命保険金など、被相続人の財産すべての合計（基礎控除前）です。</span>
                </div>
              </div>
              <div className="calc__control">
                <div className="calc__amount">
                  <input type="number" min="0" step="100" inputMode="numeric" aria-label="おおよその遺産総額（万円）" value={totalManEn} onChange={(e) => setTotalManEn(e.target.value)} />
                  <span>万円</span>
                </div>
                <div className="chips chips--small">
                  {presets.map((v) => (
                    <label key={v} className="chip">
                      <input type="radio" name="preset" value={v} checked={Number(totalManEn) === v} onChange={() => setTotalManEn(String(v))} />
                      <span>{v >= 10000 ? `${v / 10000}億円` : `${v.toLocaleString()}万円`}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="calc__row">
              <div className="calc__label">
                <span className="calc__num">2</span>
                <div>
                  <b>配偶者の有無</b>
                  <span>亡くなられた方（被相続人）の配偶者です。</span>
                </div>
              </div>
              <div className="calc__control">
                <Chips name="spouse" value={hasSpouse} onChange={setHasSpouse} options={[{ value: true, label: 'いる' }, { value: false, label: 'いない' }]} />
              </div>
            </div>

            <div className="calc__row">
              <div className="calc__label">
                <span className="calc__num">3</span>
                <div>
                  <b>配偶者以外の法定相続人</b>
                  <span>子がいれば「子」、子がいなければ「父母」、父母もいなければ「兄弟姉妹」が相続人になります。</span>
                </div>
              </div>
              <div className="calc__control">
                <Chips name="heirType" value={heirType} onChange={setHeirType} options={[{ value: 'child', label: '子' }, { value: 'parent', label: '父母' }, { value: 'sibling', label: '兄弟姉妹' }, { value: 'none', label: 'いない' }]} />
              </div>
            </div>

            {heirType !== 'none' && (
              <div className="calc__row">
                <div className="calc__label">
                  <span className="calc__num">4</span>
                  <div>
                    <b>{heirTypeLabels[heirType]}の人数（配偶者を除く）</b>
                    <span>{heirType === 'parent' ? '父母がともに健在なら2人、どちらか一方なら1人です。' : `${heirTypeLabels[heirType]}が複数いる場合は人数を選んでください。`}</span>
                  </div>
                </div>
                <div className="calc__control">
                  <Chips
                    name="heirCount"
                    value={heirCount}
                    onChange={setHeirCount}
                    options={Array.from({ length: heirType === 'parent' ? 2 : 6 }, (_, i) => ({ value: i + 1, label: `${i + 1}人` }))}
                  />
                </div>
              </div>
            )}

            {hasSpouse && (
              <div className="calc__row">
                <div className="calc__label">
                  <span className="calc__num">{heirType === 'none' ? 4 : 5}</span>
                  <div>
                    <b>配偶者が実際に取得する遺産の割合</b>
                    <span>未定の場合は「法定相続分どおり」のままで構いません。配偶者の取得分は1億6,000万円（または法定相続分）まで非課税になります。</span>
                  </div>
                </div>
                <div className="calc__control">
                  <select className="calc__select" aria-label="配偶者の遺産取得割合" value={spouseShare} onChange={(e) => setSpouseShare(e.target.value === 'legal' ? 'legal' : Number(e.target.value))}>
                    <option value="legal">法定相続分どおり（{pct(r.spouseLegalShare)}）</option>
                    {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((v) => <option key={v} value={v}>{v}%</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          <aside className="calc__result" data-reveal style={{ '--d': '120ms' }}>
            <p className="calc__result-label">Result</p>
            {noHeirs ? (
              <p className="calc__empty">法定相続人がいない条件のため計算できません。配偶者または相続人を選んでください。</p>
            ) : (
              <>
                <dl className="calc__summary">
                  <div><dt>法定相続人</dt><dd>{r.heirs}人</dd></div>
                  <div><dt>基礎控除</dt><dd>{man(r.basicDeduction)}万円</dd></div>
                  <div><dt>課税遺産総額</dt><dd>{man(r.taxableEstate)}万円</dd></div>
                </dl>
                <div className="calc__big">
                  <span className="calc__big-label">相続税額の目安{hasSpouse ? '（配偶者の税額軽減後）' : '（2割加算まで反映）'}</span>
                  <span className="calc__big-value"><b>{man(r.totalAfterRelief)}</b>万円</span>
                  {hasSpouse && r.totalTax > 0 && (
                    <span className="calc__big-sub">軽減前の相続税の総額 {man(r.totalTax)}万円（配偶者 {man(r.spouseTaxBefore)}万円 → {man(r.spouseTaxAfter)}万円）</span>
                  )}
                  {r.taxableEstate === 0 && <span className="calc__big-sub">基礎控除の範囲内のため、相続税はかからない見込みです。</span>}
                </div>
                <div className="calc__fee">
                  <span className="calc__fee-label">当センターの基本報酬（税込・{fee.note}）</span>
                  <span className="calc__fee-value">{fee.label}</span>
                  <span className="calc__fee-sub">土地評価などの追加料金は別途。正式な金額は無料相談時にお見積りします。</span>
                </div>
                <a href="/contact/" className="btn btn--primary btn--lg calc__cta" data-beacon="cta_click" data-beacon-label="シミュレーション">
                  この条件で無料相談を予約する
                  <Arrow />
                </a>
              </>
            )}
            <p className="calc__note">※簡易シミュレーションのため、小規模宅地等の特例・生命保険の非課税枠・債務控除などは考慮していません。実際の税額は財産の評価や分割の内容によって変わります。</p>
          </aside>
        </div>
      </section>

      <ReportSection />

      <NextNav
        items={[
          { href: '/contact/', no: '03', en: 'Contact', title: '無料相談を予約する' },
          { href: '/service/', no: '01', en: 'Service', title: 'サービスと料金を見る' },
        ]}
      />
    </>
  )
}
