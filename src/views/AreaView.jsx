import { site } from '../content/site.js'
import { LOWEST_NOTE, RECORD, areaFaqs, areaLead, feeRows } from '../content/areaCommon.js'
import { Arrow } from '../components/SectionHead.jsx'

/** 市ごとの相続税申告のページ（/area/<slug>/）。記事ページと同じく通常のページ（SPA の切り替えはしない）
 *  1ページに「地域・サービス・価格・実績・その市の財産の特徴・よくある質問」をまとめる */
export default function AreaView({ area, areas = [], columns = [] }) {
  if (!area) return null
  const faqs = areaFaqs(area)
  const facts = [
    ['対応地域', `${area.city}全域（${area.pref}）`],
    ['基本報酬', '99,000円（税込）〜 最安水準 ※遺産総額4,000万円まで'],
    ['申告実績', `${RECORD}（相続税申告に特化）`],
    ['ご相談方法', '事務所での面談・オンライン面談・ご自宅への訪問'],
    ['初回相談', '無料（ご契約まで費用はかかりません）'],
    ['事務所', `${site.address.replace(/^〒\d{3}-\d{4}\s*/, '')}（${site.company}）`],
  ]

  return (
    <>
      <section className="page-head page-head--article page-head--area" data-scene="2">
        <div className="container">
          <nav className="breadcrumb" aria-label="パンくず">
            <ol>
              <li><a href="/">Home</a></li>
              <li><a href="/service/#area">対応エリア</a></li>
              <li aria-current="page">{area.city}</li>
            </ol>
          </nav>
          <p className="eyebrow" data-reveal>
            <span className="eyebrow__line" />
            <span data-scramble>Area</span>
          </p>
          <h1 className="page-head__title page-head__title--area" data-reveal style={{ '--d': '90ms' }}>
            {area.city}の相続税申告<br />
            <span className="gradient-text">最安水準・基本報酬99,000円〜</span>
          </h1>
          <p className="page-head__lead area-lead" data-reveal style={{ '--d': '180ms' }}>{areaLead(area)}</p>
          <div className="area-actions" data-reveal style={{ '--d': '240ms' }}>
            <a href="/contact/" className="btn btn--primary btn--lg" data-beacon="cta_click" data-beacon-label={`エリア:${area.city}`}>無料相談を予約する<Arrow /></a>
            <a href={site.telHref} className="btn btn--ghost btn--lg">電話で相談 {site.tel}</a>
          </div>
        </div>
      </section>

      <section className="section area-page" data-scene="2">
        <div className="container area-page__grid">
          <div className="area-page__main">
            <dl className="area-facts glass" aria-label={`${area.city}の相続税申告の概要`}>
              {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>

            <h2 className="area-h2">{area.city}の相続税申告の料金</h2>
            <table className="fee-table area-fee">
              <thead><tr><th>遺産総額</th><th>基本報酬（税込）</th></tr></thead>
              <tbody>
                {feeRows.map((r) => <tr key={r.range}><td>{r.range}</td><td className="amt"><b>{r.incl}</b></td></tr>)}
              </tbody>
            </table>
            <p className="area-note">
              土地評価・非上場株式の評価などは追加料金がかかる場合があります。必ず事前にお見積りし、ご了承いただいてから進めます。<a href="/service/#fee">料金の詳細はこちら</a>。相続税額の目安は<a href="/simulation/">相続税シミュレーション</a>でその場で確認できます。
            </p>
            <p className="area-note area-note--small">{LOWEST_NOTE}</p>

            {area.topic && <p className="area-topic"><span>{area.city}の相続の特徴</span>{area.topic}</p>}
            <article className="prose area-prose" dangerouslySetInnerHTML={{ __html: area.html }} />

            <h2 className="area-h2">よくある質問</h2>
            <div className="area-faq">
              {faqs.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>

            {columns.length > 0 && (
              <div className="article-related area-columns">
                <p className="article-related__label">Column</p>
                <h2 className="area-h2">{area.city}の相続に関係するコラム</h2>
                <ul>
                  {columns.map((c) => <li key={c.path}><a href={c.path}>{c.title}</a></li>)}
                </ul>
              </div>
            )}

            {area.accessHtml && (
              <>
                <h2 className="area-h2">{area.city}からのご相談</h2>
                <div className="prose area-access" dangerouslySetInnerHTML={{ __html: area.accessHtml }} />
              </>
            )}

            <div className="article-cta">
              <p className="article-cta__title">{area.city}の相続税申告、まずは無料相談で費用と進め方を。</p>
              <p className="article-cta__text">ご契約まで費用はかかりません。財産の内容をうかがい、基本報酬と追加料金の見込みをその場でお伝えします。</p>
              <div className="article-cta__actions">
                <a href="/contact/" className="btn btn--primary btn--lg" data-beacon="cta_click" data-beacon-label={`エリア下部:${area.city}`}>無料相談を予約する<Arrow /></a>
                <a href="/simulation/" className="btn btn--ghost btn--lg">相続税シミュレーション</a>
              </div>
            </div>
          </div>

          {areas.length > 1 && (
            <aside className="area-others" aria-label="ほかの対応エリア">
              <p className="area-others__label">ほかの対応エリア</p>
              <ul>
                {areas.filter((a) => a.path !== area.path).map((a) => (
                  <li key={a.path}><a href={a.path}>{a.city}の相続税申告</a></li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </section>
    </>
  )
}
