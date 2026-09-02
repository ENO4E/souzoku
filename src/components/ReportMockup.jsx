// 実際にお渡しする「相続税額計算結果報告書」のサンプル画像を重ねて見せるモックアップ
// size: 'compact'（ヒーロー用）| 'large'（シミュレーターセクション用）
export default function ReportMockup({ size = 'large' }) {
  return (
    <div className={`report-mockup report-mockup--${size}`}>
      <img
        className="report-page report-page--back"
        src="/report-simulation.webp"
        alt="相続税試算表のサンプル（一次相続・二次相続の試算結果）"
        width="1400"
        height="990"
        loading="lazy"
        decoding="async"
      />
      <img
        className="report-page report-page--front"
        src="/report-cover.webp"
        alt="相続税額計算結果報告書の表紙サンプル"
        width="1400"
        height="990"
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}
