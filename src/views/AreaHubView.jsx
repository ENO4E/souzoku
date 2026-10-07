import { site } from '../content/site.js'
import { Arrow } from '../components/SectionHead.jsx'

/** 地域から探す（/area/）。市区町村ごとの相続税申告のページを地域ごとに並べる。記事ページと同じく通常のページ（SPA の切り替えはしない）
 *  regions … [{ name, slug, pref, cities: [{ city, path, topic }] }]（scripts/prerender.mjs が site.js の areaRegions と content/areas から作る） */
export default function AreaHubView({ regions = [] }) {
  const total = regions.reduce((n, r) => n + r.cities.length, 0)
  return (
    <>
      <section className="page-head page-head--article page-head--area" data-scene="2">
        <div className="container">
          <nav className="breadcrumb" aria-label="パンくず">
            <ol>
              <li><a href="/">Home</a></li>
              <li aria-current="page">地域から探す</li>
            </ol>
          </nav>
          <p className="eyebrow" data-reveal>
            <span className="eyebrow__line" />
            <span data-scramble>Area</span>
          </p>
          <h1 className="page-head__title page-head__title--area" data-reveal style={{ '--d': '90ms' }}>
            地域から探す相続税申告<br />
            <span className="gradient-text">基本報酬99,000円〜・{total}の市区町村</span>
          </h1>
          <p className="page-head__lead area-lead" data-reveal style={{ '--d': '180ms' }}>
            {site.name}（運営：{site.company}）は、大阪市北区・南森町の事務所を拠点に、大阪府・兵庫県・京都府の全域で相続税申告をお受けしています。市区町村ごとのページでは、料金のほかに、その地域に多い財産（住宅地・マンション・農地・町工場など）の評価のポイントと、よくある質問をまとめています。お住まいの地域を選んでください。
          </p>
          <nav className="area-hub__jump" aria-label="地域" data-reveal style={{ '--d': '240ms' }}>
            {regions.map((r) => <a key={r.slug} href={`#${r.slug}`}>{r.name}<small>{r.cities.length}</small></a>)}
          </nav>
        </div>
      </section>

      <section className="section area-page area-hub" data-scene="2">
        <div className="container">
          {regions.map((r) => (
            <div key={r.slug} id={r.slug} className="area-hub__region">
              <h2 className="area-h2">{r.name}<span className="area-hub__pref">{r.pref}</span></h2>
              <ul className="area-hub__grid">
                {r.cities.map((c) => (
                  <li key={c.path} className="spotlight">
                    <a href={c.path}>
                      <span className="area-hub__city">{c.city}の相続税申告</span>
                      {c.topic && <span className="area-hub__topic">{c.topic}</span>}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="area-note">
            一覧にない市区町村（京都府を含む）も、大阪府・兵庫県・京都府の全域でお受けしています。オンライン面談・ご自宅への訪問に対応していますので、<a href="/contact/">お問い合わせ</a>ください。
          </p>
          <div className="article-cta">
            <p className="article-cta__title">料金は全地域共通。基本報酬99,000円（税込・遺産総額4,000万円まで）から。</p>
            <p className="article-cta__text">初回相談は無料です。財産の内容をうかがい、基本報酬と追加料金の見込みをその場でお伝えします。</p>
            <div className="article-cta__actions">
              <a href="/contact/" className="btn btn--primary btn--lg" data-beacon="cta_click" data-beacon-label="地域から探す">無料相談を予約する<Arrow /></a>
              <a href="/service/#fee" className="btn btn--ghost btn--lg">料金表を見る</a>
              <a href="/simulation/" className="btn btn--ghost btn--lg">相続税シミュレーション</a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
