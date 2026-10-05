import ReportMockup from './ReportMockup.jsx'
import { Arrow } from './SectionHead.jsx'
import { reportPoints } from '../content/site.js'

// 有料（ご希望の方）でお渡しする「相続税額計算結果報告書」の紹介。二次相続や分け方の比較などの詳細シミュレーション
export default function ReportSection() {
  return (
    <section id="report" className="section report" data-scene="2">
      <div className="container">
        <div className="report-card" data-reveal>
          <div className="report-card__visual">
            <ReportMockup size="large" />
          </div>
          <div className="report-card__text">
            <p className="eyebrow">
              <span className="eyebrow__line" />
              <span data-scramble>Report</span>
            </p>
            <h3>二次相続や分け方の比較まで。<br />「相続税額計算結果報告書」で詳しくお示しします。</h3>
            <p className="report-card__lead">二次相続を見据えた試算や、相続人ごとの取得額が法定相続分と異なる場合の税額など、詳細なシミュレーション結果を報告書にまとめてお渡しできます。土地の路線価評価から税額の算出まで、数字の根拠が一目で分かる資料です。ご希望の方はお気軽にご相談ください。</p>
            <ul className="report-points">
              {reportPoints.map((p) => <li key={p}>{p}</li>)}
            </ul>
            <a href="/contact/" className="btn btn--primary" data-beacon="cta_click" data-beacon-label="報告書">
              報告書について相談する
              <Arrow />
            </a>
            <p className="report-card__note">報告書の作成費用：30,000円（税込 33,000円）。初回の無料相談とは別に、ご希望の方のみ作成します。<br />※画像はサンプルです。実際の報告書はご相談内容にもとづき個別に作成します。</p>
          </div>
        </div>
      </div>
    </section>
  )
}
