import SectionHead from './SectionHead.jsx'
import { areaRegions, prefectures } from '../content/site.js'

export default function AreaSection() {
  return (
    <section id="area" className="section area" data-scene="4">
      <div className="container">
        <SectionHead
          no="07"
          en="Area"
          title={<>大阪府・兵庫県・京都府<br className="sp-only" />一円に対応。</>}
          lead="大阪市北区の事務所を拠点に、大阪府・兵庫県・京都府の全域でご相談を承っています。オンライン相談・出張相談にも対応していますので、事務所から離れた地域の方もお気軽にご相談ください。"
        />
        <ul className="area-grid">
          {prefectures.map((p, i) => (
            <li key={p.name} className="area-card spotlight" data-reveal style={{ '--d': `${i * 90}ms` }}>
              <div className="area-card__head">
                <span className="area-card__en">{p.en}</span>
                <h3>{p.name}</h3>
                <span className="area-card__tag">{p.note}</span>
              </div>
              {areaRegions.some((r) => r.pref === p.name) ? (
                areaRegions.filter((r) => r.pref === p.name).map((r) => (
                  <div key={r.slug} className="area-card__region">
                    <p className="area-card__label"><a href={r.slug === 'osaka-city' ? '/area/osaka-city/' : `/area/#${r.slug}`}>{r.name}</a></p>
                    <ul className="area-card__chips">
                      {r.cities.map(([c, slug]) => <li key={slug}><a href={`/area/${slug}/`}>{c.replace(/^大阪市/, '')}</a></li>)}
                    </ul>
                  </div>
                ))
              ) : (
                <p className="area-card__label area-card__label--plain">京都市をはじめ府内全域でご相談を承ります。</p>
              )}
            </li>
          ))}
        </ul>
        <p className="area-note" data-reveal>
          <a href="/area/">地域から探す（市区町村ごとの相続税申告のページ一覧）→</a>
        </p>
        <p className="area-note" data-reveal>
          土地の相続税評価は「路線価」が基準になります。
          <a href="https://www.rosenka.nta.go.jp/" target="_blank" rel="noopener noreferrer">国税庁 路線価図・評価倍率表（最新年分）を見る ↗</a>
        </p>
      </div>
    </section>
  )
}
