import { calcInheritanceTax } from '../lib/inheritanceTax.js'
import { BRACKET_ROWS, INPUT_TIPS, NOT_INCLUDED, QUICK_CASES, QUICK_TOTALS, SIM_FAQS, STEPS } from '../content/simulationGuide.js'
import { Arrow } from './SectionHead.jsx'

/** 早見表：相続人の組み合わせ × 遺産総額 の納付税額（万円）。計算機と同じ関数で出すので結果と必ず一致する */
function quickTable() {
  return QUICK_TOTALS.map((total) => ({
    total,
    cells: QUICK_CASES.map((c) => {
      const r = calcInheritanceTax({ totalManEn: total, hasSpouse: c.hasSpouse, children: c.children, parents: 0, siblings: 0, spouseShare: 'legal' })
      return Math.round(r.totalPay / 10_000)
    }),
  }))
}

const man = (n) => (n >= 10_000 ? `${n / 10_000}億円` : `${n.toLocaleString('ja-JP')}万円`)

/** シミュレーションの解説（計算の仕組み・速算表・早見表・入力の集め方・含まれないもの・FAQ）。/simulation/ の計算機の下に出す */
export default function SimulationGuide() {
  const rows = quickTable()
  return (
    <section id="guide" className="section sim-guide" data-scene={3}>
      <div className="container container--narrow">
        <h2 className="sim-guide__h2" data-reveal>相続税はこう計算する（5ステップ）</h2>
        <p className="sim-guide__lead" data-reveal>上のシミュレーションは、相続税法のとおり次の手順で計算しています。手計算で確かめたい方のために、手順と税率表を載せます。</p>
        <ol className="sim-steps" data-reveal>
          {STEPS.map((s, i) => (
            <li key={s.t}><b>{i + 1}. {s.t}</b><span>{s.d}</span></li>
          ))}
        </ol>

        <h3 className="sim-guide__h3" data-reveal>相続税の速算表（各人の法定相続分に応じた取得金額）</h3>
        <table className="fee-table sim-table" data-reveal>
          <thead><tr><th>取得金額</th><th>税率</th><th>控除額</th></tr></thead>
          <tbody>
            {BRACKET_ROWS.map(([range, pct, ded]) => <tr key={range}><td>{range}</td><td className="amt"><b>{pct}</b></td><td>{ded}</td></tr>)}
          </tbody>
        </table>
        <p className="sim-guide__note">税額＝取得金額×税率−控除額。例：取得金額4,000万円なら 4,000万円×20%−200万円＝600万円。これを相続人ごとに計算して足したものが「相続税の総額」です。</p>

        <h2 className="sim-guide__h2" data-reveal>相続税の早見表（法定相続分どおりに分けた場合）</h2>
        <p className="sim-guide__lead" data-reveal>配偶者の税額軽減を使い、法定相続分どおりに分けた場合の相続税の合計（万円）です。上のシミュレーションと同じ計算です。小規模宅地等の特例などは含みません。</p>
        <div className="sim-table-wrap" data-reveal>
          <table className="fee-table sim-table sim-table--quick">
            <thead><tr><th>遺産総額</th>{QUICK_CASES.map((c) => <th key={c.label}>{c.label}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.total}>
                  <td>{man(r.total)}</td>
                  {r.cells.map((v, i) => <td key={i} className="amt">{v === 0 ? <span className="sim-zero">0</span> : <b>{v.toLocaleString('ja-JP')}</b>}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="sim-guide__note">単位：万円。配偶者がいる場合は配偶者が法定相続分（1/2）を取得し、配偶者の税額軽減でその分の税額がゼロになる前提です。配偶者と子1人・遺産総額4,000万円は基礎控除4,200万円以下のため0円、子1人だけなら基礎控除3,600万円を超えるため40万円になります。</p>

        <h2 className="sim-guide__h2" data-reveal>入力する数字の集め方</h2>
        <ul className="sim-tips" data-reveal>
          {INPUT_TIPS.map((t) => <li key={t.t}><b>{t.t}</b><span>{t.d}</span></li>)}
        </ul>
        <p className="sim-guide__note">財産を一度書き出して基礎控除と比べる手順は、<a href="/articles/seizen-ni-souzokuzei-kakaruka-tashikameru/">相続税がかかるかを生前に確かめる方法</a>にまとめています。</p>

        <h2 className="sim-guide__h2" data-reveal>シミュレーションに含まれていないもの</h2>
        <p className="sim-guide__lead" data-reveal>次の4つは個別の事情で金額が決まるため含めていません。いずれも実際の税額を下げる方向に働くので、結果は「上限に近い目安」と考えてください。</p>
        <ul className="sim-tips" data-reveal>
          {NOT_INCLUDED.map((t) => <li key={t.t}><b><a href={t.href}>{t.t}</a></b><span>{t.d}</span></li>)}
        </ul>

        <h2 className="sim-guide__h2" data-reveal>税理士費用の見積もりも、この場で</h2>
        <p className="sim-guide__lead" data-reveal>結果の下に、遺産総額に応じた当センターの基本報酬（99,000円〜・税込）を表示しています。土地の評価・相続人の人数などの加算は<a href="/service/#fee">料金表</a>で単位を公開しており、初回の無料相談で財産の内容を伺えば、その場で税込の総額をお伝えします。シミュレーションの結果の画面を保存して、ご相談のときにお見せください。</p>
        <div className="sim-guide__cta" data-reveal>
          <a href="/contact/" className="btn btn--primary btn--lg" data-beacon="cta_click" data-beacon-label="シミュレーション解説">無料相談を予約する<Arrow /></a>
          <a href="/service/#fee" className="btn btn--ghost btn--lg">料金表を見る</a>
        </div>

        <h2 className="sim-guide__h2" data-reveal>よくある質問</h2>
        <div className="faq-list" data-reveal>
          {SIM_FAQS.map((f) => (
            <details key={f.q} className="faq-item">
              <summary>
                <span className="faq-item__q" aria-hidden="true">Q</span>
                <span className="faq-item__text">{f.q}</span>
                <span className="faq-item__icon" aria-hidden="true" />
              </summary>
              <div className="faq-item__a"><p>{f.a}</p></div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
