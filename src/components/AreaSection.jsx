const prefectures = [
  {
    name: '大阪府',
    note: '府内全域に対応',
    focus: ['松原市', '吹田市', '茨木市', '高槻市', '摂津市', '東大阪市', '大阪市'],
  },
  {
    name: '兵庫県',
    note: '県内全域に対応',
    focus: ['西宮市', '芦屋市', '神戸市'],
  },
  {
    name: '京都府',
    note: '府内全域に対応',
    focus: [],
  },
]

export default function AreaSection() {
  return (
    <section id="area">
      <div className="wrap">
        <div className="section-head fade-in">
          <div className="eyebrow">対応エリア</div>
          <h2>大阪府・兵庫県・京都府 一円に対応</h2>
          <p>大阪市北区の事務所を拠点に、大阪府・兵庫県・京都府の全域でご相談を承っています。オンライン相談・出張相談にも対応していますので、事務所から離れた地域の方もお気軽にご相談ください。</p>
        </div>

        <div className="area-cards fade-in">
          {prefectures.map((p) => (
            <div className="area-card" key={p.name}>
              <div className="area-card-head">
                <h3>{p.name}</h3>
                <span className="area-tag">{p.note}</span>
              </div>
              {p.focus.length > 0 && (
                <>
                  <div className="area-focus-label">重点対応エリア</div>
                  <div className="area-chips">
                    {p.focus.map((c) => <span key={c}>{c}</span>)}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <p className="rosenka-note fade-in">
          土地の相続税評価は「路線価」が基準になります。
          <a href="https://www.rosenka.nta.go.jp/" target="_blank" rel="noopener noreferrer">国税庁 路線価図・評価倍率表（最新年分）を見る ↗</a>
        </p>
      </div>
    </section>
  )
}
