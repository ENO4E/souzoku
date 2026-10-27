import { useMemo, useState } from 'react'
import { calcIryubun, fracText } from '../lib/iryubun.js'

// 遺留分シミュレーション（コラム「遺留分シミュレーション」に埋め込む計算ツール）
// 記事本文の <div data-tool="iryubun"> に main.jsx が描画する。入力は万円、計算は src/lib/iryubun.js

const man = (v) => Math.round((Number(v) || 0) * 10_000)
const yen = (v) => `${Math.floor(v / 10_000).toLocaleString('ja-JP')}万円`
const pct = (f) => (f.n === 0 ? '—' : `${fracText(f)}（${((f.n / f.d) * 100).toFixed(1).replace(/\.0$/, '')}%）`)

const ADOPTED_TYPES = [
  ['spouseOfChild', '子の配偶者（婿養子・嫁養子）'],
  ['grandchildAlive', '孫（親である子は存命）'],
  ['grandchildDeceased', '孫（親である子は先に死亡。代襲を兼ねる）'],
  ['other', 'その他の養子'],
]

export default function IryubunTool() {
  const [spouse, setSpouse] = useState('yes')
  const [children, setChildren] = useState('2')
  const [deceased, setDeceased] = useState([])
  const [adopted, setAdopted] = useState([])
  const [parents, setParents] = useState('0')
  const [siblings, setSiblings] = useState('0')
  const [estate, setEstate] = useState('8000')
  const [debts, setDebts] = useState('0')
  const [gifts, setGifts] = useState('0')
  const [received, setReceived] = useState({})
  const [benefit, setBenefit] = useState({})

  const result = useMemo(() => calcIryubun({
    spouse: spouse === 'yes',
    children,
    deceasedChildren: deceased,
    adopted,
    parents,
    siblings,
    estate: man(estate),
    debts: man(debts),
    giftsToOthers: man(gifts),
    received: Object.fromEntries(Object.entries(received).map(([k, v]) => [k, man(v)])),
    specialBenefit: Object.fromEntries(Object.entries(benefit).map(([k, v]) => [k, man(v)])),
  }), [spouse, children, deceased, adopted, parents, siblings, estate, debts, gifts, received, benefit])

  const hasChildLine = result.rank === 'child'
  const setDeceasedAt = (i, v) => setDeceased((d) => d.map((l, j) => (j === i ? { grandchildren: v } : l)))
  const setAdoptedAt = (i, patch) => setAdopted((a) => a.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const num = (value, onChange, max = 10) => (
    <select className="calc__select" value={value} onChange={(e) => onChange(e.target.value)}>
      {Array.from({ length: max + 1 }, (_, i) => <option key={i} value={i}>{i}人</option>)}
    </select>
  )
  const money = (value, onChange, label) => (
    <div className="calc__amount">
      <input type="number" min="0" max="10000000" step="100" inputMode="numeric" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} />
      <span>万円</span>
    </div>
  )

  return (
    <div className="tool">
      <div className="tool__block">
        <p className="tool__head">1. 相続人</p>
        <div className="tool__grid">
          <label className="tool__field"><span>配偶者</span>
            <select className="calc__select" value={spouse} onChange={(e) => setSpouse(e.target.value)}><option value="yes">いる</option><option value="no">いない</option></select>
          </label>
          <label className="tool__field"><span>存命の実子（養子を除く）</span>{num(children, setChildren)}</label>
          <label className="tool__field"><span>直系尊属（父母など。子・孫がいないときだけ相続人）</span>{num(parents, setParents, 2)}</label>
          <label className="tool__field"><span>兄弟姉妹（子・孫も父母もいないときだけ相続人。遺留分なし）</span>{num(siblings, setSiblings)}</label>
        </div>

        <div className="tool__list">
          <div className="tool__list-head"><span>先に亡くなった子（その子＝孫が代襲相続）</span>
            {deceased.length < 3 && <button type="button" className="tool__add" onClick={() => setDeceased((d) => [...d, { grandchildren: '1' }])}>＋ 追加</button>}
          </div>
          {deceased.map((l, i) => (
            <div className="tool__row" key={i}>
              <span>亡くなった子{deceased.length > 1 ? i + 1 : ''}の子（孫）の数 <small>養子縁組した孫も含めて数えます</small></span>
              {num(l.grandchildren, (v) => setDeceasedAt(i, v), 6)}
              <button type="button" className="tool__remove" aria-label="この行を削除" onClick={() => setDeceased((d) => d.filter((_, j) => j !== i))}>×</button>
            </div>
          ))}
        </div>

        <div className="tool__list">
          <div className="tool__list-head"><span>養子</span>
            {adopted.length < 4 && <button type="button" className="tool__add" onClick={() => setAdopted((a) => [...a, { type: 'spouseOfChild', line: 0 }])}>＋ 追加</button>}
          </div>
          {adopted.map((a, i) => (
            <div className="tool__row" key={i}>
              <span>養子{adopted.length > 1 ? i + 1 : ''}</span>
              <select className="calc__select" value={a.type} onChange={(e) => setAdoptedAt(i, { type: e.target.value })}>
                {ADOPTED_TYPES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
              </select>
              {a.type === 'grandchildDeceased' && (
                deceased.length > 0 ? (
                  <select className="calc__select" value={a.line} onChange={(e) => setAdoptedAt(i, { line: Number(e.target.value) })} aria-label="どの亡くなった子の子か">
                    {deceased.map((_, j) => <option key={j} value={j}>亡くなった子{deceased.length > 1 ? j + 1 : ''}の子</option>)}
                  </select>
                ) : <small className="tool__warn">上の「先に亡くなった子」を追加し、孫の数にこの養子も含めてください</small>
              )}
              <button type="button" className="tool__remove" aria-label="この行を削除" onClick={() => setAdopted((x) => x.filter((_, j) => j !== i))}>×</button>
            </div>
          ))}
        </div>
      </div>

      <div className="tool__block">
        <p className="tool__head">2. 財産（相続税評価額ではなく時価で入れます）</p>
        <div className="tool__grid">
          <label className="tool__field"><span>相続開始時の財産の合計</span>{money(estate, setEstate, '相続開始時の財産の合計（万円）')}</label>
          <label className="tool__field"><span>債務（借入金・未払金など）</span>{money(debts, setDebts, '債務（万円）')}</label>
          <label className="tool__field"><span>相続人以外への贈与（相続開始前1年以内）</span>{money(gifts, setGifts, '相続人以外への贈与（万円）')}</label>
        </div>
      </div>

      <div className="tool__block tool__block--result">
        <p className="tool__head">3. 結果</p>
        {result.heirs.length === 0 ? (
          <p className="tool__empty">相続人を入れてください。</p>
        ) : (
          <>
            <p className="tool__base">遺留分を算定するための財産：<b>{yen(result.base)}</b>
              <small>（財産{yen(result.estate)}＋相続人以外への贈与{yen(result.giftsToOthers)}＋相続人の特別受益{yen(result.benefitTotal)}−債務{yen(result.debts)}）。総体的遺留分は{fracText(result.totalFrac)}</small>
            </p>
            <div className="tool__table-wrap">
              <table className="tool__table">
                <thead>
                  <tr><th>相続人</th><th>法定相続分</th><th>遺留分の割合</th><th>遺留分の額</th><th>取得する額</th><th>特別受益</th><th>侵害額（請求できる目安）</th></tr>
                </thead>
                <tbody>
                  {result.heirs.map((h) => (
                    <tr key={h.id}>
                      <td>{h.label}{h.surcharge && h.kind !== 'sibling' && <small>相続税2割加算</small>}</td>
                      <td>{pct(h.legal)}</td>
                      <td>{h.hasIryubun ? pct(h.iryubun) : <small>なし</small>}</td>
                      <td><b>{h.hasIryubun ? yen(h.iryubunYen) : '—'}</b></td>
                      <td>{h.hasIryubun ? <input type="number" min="0" step="100" inputMode="numeric" aria-label={`${h.label}が取得する額（万円）`} placeholder="万円" value={received[h.id] ?? ''} onChange={(e) => setReceived((r) => ({ ...r, [h.id]: e.target.value }))} /> : '—'}</td>
                      <td>{h.hasIryubun ? <input type="number" min="0" step="100" inputMode="numeric" aria-label={`${h.label}の特別受益（万円）`} placeholder="万円" value={benefit[h.id] ?? ''} onChange={(e) => setBenefit((b) => ({ ...b, [h.id]: e.target.value }))} /> : '—'}</td>
                      <td>{h.hasIryubun ? <b className={h.shortfall > 0 ? 'is-short' : ''}>{h.shortfall > 0 ? yen(h.shortfall) : '0円'}</b> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="tool__notes">
              <li>侵害額＝遺留分の額−その人の特別受益−取得する額＋その人が法定相続分で負担する債務（民法1046条2項）。「取得する額」が空欄のときは0として計算します（＝その人に何も渡さない遺言のとき）</li>
              {hasChildLine && result.tax.adoptedTotal > 0 && (
                <li>相続税の基礎控除で数えられる養子は{result.tax.adoptedLimit}人まで（{result.tax.adoptedLimit === 1 ? '実子がいるため' : '実子がいないため'}）。今回は養子{result.tax.adoptedTotal}人のうち{result.tax.adoptedCounted}人を数え、法定相続人の数は{result.tax.heirs}人、基礎控除は{yen(result.tax.basicDeduction)}です。遺留分の計算では養子の人数に制限はありません</li>
              )}
              {hasChildLine && result.tax.adoptedTotal === 0 && <li>相続税の法定相続人の数は{result.tax.heirs}人、基礎控除は{yen(result.tax.basicDeduction)}です</li>}
              {result.heirs.some((h) => h.kind === 'grandchildAlive') && <li>孫養子は、相続税が2割加算されます（代襲相続人を兼ねる孫養子は加算されません）。婿養子・嫁養子は一親等の養子として加算されません</li>}
              {result.rank === 'sibling' && <li>兄弟姉妹には遺留分がありません。兄弟姉妹に渡さない遺言を書けば、その内容がそのまま通ります</li>}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
