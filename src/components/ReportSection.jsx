import ReportMockup from './ReportMockup.jsx'
import { Arrow } from './SectionHead.jsx'
import { reportPoints } from '../content/site.js'

// 無料相談でお渡しする「相続税額計算結果報告書」の紹介
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
            <h3>無料相談で、あなた専用の<br />「相続税額計算結果報告書」をお渡しします。</h3>
            <p className="report-card__lead">無料相談でお伺いした財産の内容をもとに、税理士法人が正式な試算報告書を作成してお渡しします。土地の路線価評価から税額の算出まで、数字の根拠が一目で分かる資料です。</p>
            <ul className="report-points">
              {reportPoints.map((p) => <li key={p}>{p}</li>)}
            </ul>
            <a href="/contact/" className="btn btn--primary">
              無料相談で報告書を依頼する
              <Arrow />
            </a>
            <p className="report-card__note">※画像はサンプルです。実際の報告書はご相談内容にもとづき個別に作成します。</p>
          </div>
        </div>
      </div>
    </section>
  )
}
