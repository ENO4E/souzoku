import { useState } from 'react'
import { PageHead, NextNav } from './PageParts.jsx'
import ReportSection from '../components/ReportSection.jsx'
import { Arrow } from '../components/SectionHead.jsx'
import { calcInheritanceTax } from '../lib/inheritanceTax.js'

// 金額の表示（万円・小数1桁まで。0より大きく1,000円未満は「0.1万円未満」）
const man = (yen) => {
  if (!yen) return '0'
  if (yen < 1000) return '0.1未満'
  return (Math.floor(yen / 1000) / 10).toLocaleString('ja-JP', { maximumFractionDigits: 1 })
}
const pct = (share) => `${Math.round(share * 1000) / 10}%`
const RANK_LABEL = { child: '子', parent: '父母', sibling: '兄弟姉妹' }

// 遺産総額（万円）に対する当センターの基本報酬（税込）
function feeFor(totalManEn) {
  const t = Number(totalManEn) || 0
  if (t <= 4000) return { label: '99,000円', note: '〜4,000万円' }
  if (t <= 5000) return { label: '170,500円', note: '〜5,000万円' }
  if (t <= 6000) return { label: '242,000円', note: '〜6,000万円' }
  if (t <= 7000) return { label: '308,000円', note: '〜7,000万円' }
  return { label: '別途お見積り', note: '7,000万円超' }
}

/** 人数の選択肢（0 は「いない」） */
const countOptions = (max) => Array.from({ length: max + 1 }, (_, i) => ({ value: i, label: i === 0 ? 'いない' : `${i}人` }))

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

/** 02 Simulation：相続税の簡易シミュレーション
 * 相続人は民法の順位どおりに聞く：配偶者 → 子 →（子がいなければ）父母 →（父母もいなければ）兄弟姉妹。
 * 人数はそれぞれ別の値で持つので、切り替えても前の人数が混ざらない。配偶者の取得割合は、配偶者と他の相続人がいるときだけ聞く */
export default function SimulationView() {
  const [totalManEn, setTotalManEn] = useState('6000')
  const [hasSpouse, setHasSpouse] = useState(true)
  const [children, setChildren] = useState(2)
  const [parents, setParents] = useState(0)
  const [siblings, setSiblings] = useState(0)
  const [spouseShare, setSpouseShare] = useState('legal')

  const r = calcInheritanceTax({ totalManEn, hasSpouse, children, parents, siblings, spouseShare })
  const fee = feeFor(totalManEn)
  const presets = [3000, 4000, 5000, 6000, 8000, 10000]
  const askParents = children === 0
  const askSiblings = children === 0 && parents === 0
  const askShare = hasSpouse && r.otherCount > 0
  let no = 0
  const next = () => ++no

  const heirsText = [
    hasSpouse ? '配偶者' : '',
    r.otherCount > 0 ? `${RANK_LABEL[r.rank]}${r.otherCount}人` : '',
  ].filter(Boolean).join('・')

  return (
    <>
      <PageHead
        no="02"
        en="Simulation"
        scene={3}
        title={<>相続税額を、<br />その場で<em className="gradient-text">試算</em>。</>}
        lead="遺産総額と相続人の状況を入力すると、相続税額の目安と当センターの基本報酬がその場で表示されます。計算は国税庁の方法（法定相続分で按分して相続税の総額を出し、実際の取得割合で各人に配分）にもとづく簡易試算です。"
      />

      <section id="calc" className="section calc" data-scene={3}>
        <div className="container calc__inner">
          <div className="calc__form glass" data-reveal>
            <div className="calc__row">
              <div className="calc__label">
                <span className="calc__num">{next()}</span>
                <div>
                  <b>おおよその遺産総額</b>
                  <span>現預金のほか、土地・建物・有価証券・生命保険金など、被相続人の財産すべての合計（基礎控除前）です。</span>
                </div>
              </div>
              <div className="calc__control">
                <div className="calc__amount">
                  <input type="number" min="0" max="10000000" step="100" inputMode="numeric" aria-label="おおよその遺産総額（万円）" value={totalManEn} onChange={(e) => setTotalManEn(e.target.value)} />
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
                <span className="calc__num">{next()}</span>
                <div>
                  <b>配偶者</b>
                  <span>亡くなられた方（被相続人）の配偶者です。配偶者は常に相続人になります。</span>
                </div>
              </div>
              <div className="calc__control">
                <Chips name="spouse" value={hasSpouse} onChange={setHasSpouse} options={[{ value: true, label: 'いる' }, { value: false, label: 'いない' }]} />
              </div>
            </div>

            <div className="calc__row">
              <div className="calc__label">
                <span className="calc__num">{next()}</span>
                <div>
                  <b>子の人数</b>
                  <span>養子を含みます。亡くなった子に子（孫）がいる場合は、その孫の人数を数えてください。</span>
                </div>
              </div>
              <div className="calc__control">
                <Chips name="children" value={children} onChange={setChildren} options={countOptions(6)} />
              </div>
            </div>

            {askParents && (
              <div className="calc__row">
                <div className="calc__label">
                  <span className="calc__num">{next()}</span>
                  <div>
                    <b>父母の人数</b>
                    <span>子がいない場合は、亡くなられた方の父母が相続人になります。健在な方の人数を選んでください。</span>
                  </div>
                </div>
                <div className="calc__control">
                  <Chips name="parents" value={parents} onChange={setParents} options={countOptions(2)} />
                </div>
              </div>
            )}

            {askSiblings && (
              <div className="calc__row">
                <div className="calc__label">
                  <span className="calc__num">{next()}</span>
                  <div>
                    <b>兄弟姉妹の人数</b>
                    <span>子も父母もいない場合は、兄弟姉妹が相続人になります。亡くなった兄弟姉妹に子（甥・姪）がいる場合は、その人数を数えてください。</span>
                  </div>
                </div>
                <div className="calc__control">
                  <Chips name="siblings" value={siblings} onChange={setSiblings} options={countOptions(6)} />
                </div>
              </div>
            )}

            {askShare && (
              <div className="calc__row">
                <div className="calc__label">
                  <span className="calc__num">{next()}</span>
                  <div>
                    <b>配偶者が実際に取得する遺産の割合</b>
                    <span>未定の場合は「法定相続分どおり」のままで構いません。配偶者の取得分は1億6,000万円または法定相続分のどちらか多い額まで非課税になります。</span>
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

          <aside className="calc__result" data-reveal style={{ '--d': '120ms' }} aria-live="polite">
            <p className="calc__result-label">Result</p>
            {!r.computable ? (
              <p className="calc__empty">配偶者・子・父母・兄弟姉妹のいずれもいない場合は、相続人がいない（相続人不存在）ため、この試算はできません。家庭裁判所での相続財産清算人の手続きになります。<a href="/articles/tetsuzuki-souzoku-zaisan-hojin-shinkoku/">手続きの流れはこちら</a></p>
            ) : (
              <>
                <dl className="calc__summary">
                  <div><dt>法定相続人</dt><dd>{r.heirs}人</dd></div>
                  <div><dt>基礎控除</dt><dd>{man(r.basicDeduction)}万円</dd></div>
                  <div><dt>課税遺産総額</dt><dd>{man(r.taxableEstate)}万円</dd></div>
                </dl>
                <p className="calc__heirs">相続人：{heirsText}</p>
                <div className="calc__big">
                  <span className="calc__big-label">相続税額の目安（相続人全員の合計）</span>
                  <span className="calc__big-value"><b>{man(r.totalPay)}</b>万円</span>
                  {r.taxableEstate === 0 ? (
                    <span className="calc__big-sub">遺産総額が基礎控除（{man(r.basicDeduction)}万円）以下のため、相続税はかからない見込みです。</span>
                  ) : (
                    <>
                      <span className="calc__big-sub">相続税の総額 {man(r.totalTax)}万円{hasSpouse ? '。配偶者の税額軽減' : ''}{hasSpouse && r.surcharge ? 'と' : ''}{r.surcharge ? '兄弟姉妹の2割加算' : ''}{hasSpouse || r.surcharge ? 'を反映しています。' : ''}</span>
                      <ul className="calc__breakdown">
                        {hasSpouse && (
                          <li>
                            <span>配偶者（取得割合 {pct(r.spouseActualShare)}）</span>
                            <b>{man(r.spouse.pay)}万円</b>
                            {r.spouse.relief > 0 && <small>税額軽減 −{man(r.spouse.relief)}万円</small>}
                          </li>
                        )}
                        {r.otherCount > 0 && (
                          <li>
                            <span>{RANK_LABEL[r.rank]} 1人あたり（{r.otherCount}人）</span>
                            <b>{man(r.other.payEach)}万円</b>
                            {r.other.surchargeEach > 0 && <small>2割加算 +{man(r.other.surchargeEach)}万円を含む</small>}
                          </li>
                        )}
                      </ul>
                    </>
                  )}
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
            <p className="calc__note">※簡易シミュレーションです。小規模宅地等の特例・生命保険金の非課税枠・債務や葬式費用・生前贈与の加算・未成年者控除や障害者控除などは考慮していません。同じ順位の相続人は等しく取得する前提で、代襲相続や半血の兄弟姉妹で相続分が異なる場合、養子の人数の制限、祖父母が相続人になる場合も反映していません。実際の税額は財産の評価や分け方によって変わります。</p>
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
