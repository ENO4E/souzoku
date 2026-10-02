import SectionHead, { Arrow } from './SectionHead.jsx'
import { baseFees, comparison, extraFees, included } from '../content/site.js'

export default function FeeSection() {
  return (
    <section id="fee" className="section fee" data-scene="2">
      <div className="container">
        <SectionHead
          no="03"
          en="Fee"
          title={<>大阪で最安クラスの、<br /><span className="gradient-text">明快な料金水準。</span></>}
          lead="相続税申告の基本報酬は99,000円（税込）から。税抜価格を大きく、税込価格を横に小さく表示しています。追加が必要な場合も、必ず事前にご説明します。"
        />

        <div className="fee-grid">
          <div className="fee-panel spotlight" data-reveal>
            <div className="fee-panel__head">
              <span className="fee-panel__no">A</span>
              <h3>相続税申告 基本報酬</h3>
              <span className="fee-panel__en">Base fee</span>
            </div>
            <table className="fee-table">
              <thead>
                <tr><th>遺産総額</th><th>申告料金</th></tr>
              </thead>
              <tbody>
                {baseFees.map((f) => (
                  <tr key={f.range}>
                    <td>{f.range}</td>
                    <td className="amt"><b>{f.fee}</b>{f.tax && <span className="tax-incl">{f.tax}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="fee-panel fee-panel--compare spotlight" data-reveal style={{ '--d': '90ms' }}>
            <div className="fee-panel__head">
              <span className="fee-panel__no">B</span>
              <h3>一般的な相場との比較</h3>
              <span className="fee-panel__en">Comparison</span>
            </div>
            <table className="fee-table fee-table--compare">
              <thead>
                <tr>
                  <th>遺産総額</th>
                  <th>一般的な相場<span className="th-sub">遺産総額の0.5〜1.0%</span></th>
                  <th className="ours">当センター<span className="th-sub">基本報酬・税込</span></th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((c) => (
                  <tr key={c.estate}>
                    <td>{c.estate}</td>
                    <td className="market">{c.market}</td>
                    <td className="amt ours"><b>{c.ours}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="fee-panel__note">※相場は、税理士報酬の目安として一般的に用いられる「遺産総額の0.5〜1.0%」で算出した参考値です。実際の報酬は事務所や案件内容により異なります。当センターの金額は基本報酬（税込）で、土地評価などの追加料金は別途です。</p>
          </div>

          <div className="fee-panel spotlight" data-reveal>
            <div className="fee-panel__head">
              <span className="fee-panel__no">C</span>
              <h3>追加料金</h3>
              <span className="fee-panel__en">Options</span>
            </div>
            <table className="fee-table">
              <thead>
                <tr><th>内容</th><th>料金</th></tr>
              </thead>
              <tbody>
                {extraFees.map((f) => (
                  <tr key={f.item}>
                    <td>{f.item}</td>
                    <td className="amt"><b>{f.fee}</b><span className="tax-incl">{f.tax}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="fee-panel fee-panel--included spotlight" data-reveal style={{ '--d': '90ms' }}>
            <div className="fee-panel__head">
              <span className="fee-panel__no">D</span>
              <h3>基本料金に含まれるサービス</h3>
              <span className="fee-panel__en">Included</span>
            </div>
            <ul className="included-list">
              {included.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <a href="#/contact" className="btn btn--primary fee-panel__cta">
              無料相談でお見積りを依頼する
              <Arrow />
            </a>
          </div>
        </div>

        <p className="fee-note" data-reveal>
          ※上記は基本報酬の目安です。土地評価・非上場株式評価・相続人加算・書面添付など、内容に応じて追加料金が発生する場合がありますが、必ず事前にご説明し、ご了承いただいた上で進めます。正式な金額は無料相談時にお見積りいたします。
        </p>
      </div>
    </section>
  )
}
