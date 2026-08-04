const officeRows = [
  ['名称', '相続税申告相談センター'],
  ['運営', 'タックス・プラン税理士法人（税理士登録番号：5469）'],
  ['所在地', '〒530-0044　大阪府大阪市北区東天満2丁目9番4号 5階'],
  ['電話番号', '06-6354-8220（受付：平日9:00〜18:00）'],
  ['最寄駅', 'Osaka Metro 谷町線・堺筋線「南森町」駅／JR東西線「大阪天満宮」駅'],
  ['対応地域', '大阪府・兵庫県・京都府・奈良県・滋賀県・和歌山県・三重県'],
  ['相談方法', '来所相談・オンライン相談・出張相談'],
]

export default function OfficeSection() {
  return (
    <section id="office" style={{ background: 'var(--bg-off)', paddingTop: 0 }}>
      <div className="wrap">
        <div className="section-head fade-in">
          <div className="eyebrow">事務所概要</div>
          <h2>大阪・南森町の相続専門税理士事務所です</h2>
          <p>ご来所のほか、オンライン相談・出張相談にも対応しています。お仕事帰りや遠方の方もお気軽にご相談ください。</p>
        </div>
        <div className="office-grid fade-in">
          <table className="office-table">
            <tbody>
              {officeRows.map(([label, value]) => (
                <tr key={label}><th>{label}</th><td>{value}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="office-map">
            <iframe
              src="https://www.google.com/maps?q=大阪府大阪市北区東天満2丁目9-4&output=embed&z=16"
              title="相続税申告相談センターの地図（大阪府大阪市北区東天満2丁目9番4号）"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
