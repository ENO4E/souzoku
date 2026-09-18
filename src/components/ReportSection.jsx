import ReportMockup from './ReportMockup.jsx'

// 無料相談でお渡しする「相続税額計算結果報告書」の紹介
export default function ReportSection() {
  return (
    <section id="report" className="report-section" style={{ background: 'var(--bg-off)' }}>
      <div className="wrap">
        <div className="report-showcase fade-in">
          <ReportMockup size="large" />
          <div className="report-showcase-text">
            <div className="eyebrow">無料相談でお渡しする報告書</div>
            <h3 className="serif">無料相談で、あなた専用の<br />「相続税額計算結果報告書」をお渡しします。</h3>
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
