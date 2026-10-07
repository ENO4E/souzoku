import { site } from '../content/site.js'
import { LOWEST_NOTE, RECORD, areaFaqs, areaLead, feeExamples, feeRows, feeTypes, quoteChecks } from '../content/areaCommon.js'
import { Arrow } from '../components/SectionHead.jsx'

/** 市ごとの相続税申告のページ（/area/<slug>/）。記事ページと同じく通常のページ（SPA の切り替えはしない）
 *  1ページに「地域・サービス・価格・実績・その市の財産の特徴・よくある質問」をまとめる */
/** region … { name, slug }、areas … 同じ地域のほかの市区町村 [{ city, path }] */
export default function AreaView({ area, region = null, areas = [], columns = [] }) {
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
              <li><a href="/area/">地域から探す</a></li>
              {region && <li><a href={`/area/#${region.slug}`}>{region.name}</a></li>}
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

            <h2 className="area-h2">{area.city}で相続税申告の税理士を選ぶときの費用の比べ方</h2>
            <p className="area-note area-note--body">
              税理士の相続税申告の報酬は、料金の決め方が事務所ごとに違います。まず料金体系の型を知り、ご自身の財産の内容で<b>税込の総額</b>を見積もってもらって比べてください。
            </p>
            <table className="fee-table area-fee area-fee--types">
              <thead><tr><th>料金体系の型</th><th>決まり方</th><th>確かめること</th></tr></thead>
              <tbody>
                {feeTypes.map((t) => <tr key={t.name}><td><b>{t.name}</b></td><td>{t.how}</td><td>{t.check}</td></tr>)}
              </tbody>
            </table>
            <h3 className="area-h3">当センターの料金で計算した総額の例（税込）</h3>
            <table className="fee-table area-fee area-fee--examples">
              <thead><tr><th>遺産総額・内容</th><th>内訳（税抜）</th><th>総額（税込）</th><th>一般的な相場</th></tr></thead>
              <tbody>
                {feeExamples.map((e) => (
                  <tr key={e.estate}>
                    <td><b>{e.estate}</b><br /><small>{e.cond}</small></td>
                    <td><small>{e.items.map(([k, v]) => `${k} ${v}`).join('、')}</small></td>
                    <td className="amt"><b>{e.total}</b></td>
                    <td className="amt"><small>{e.market}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="area-note area-note--small">※一般的な相場は「税理士報酬の目安は遺産総額の0.5〜1%」という広く使われる基準で計算した参考値です。土地評価は1か所100,000円（税抜）として計算しています。7,000万円を超える場合はお見積りします。</p>
            <h3 className="area-h3">見積もりを比べるときに確かめること</h3>
            <ul className="area-checks">
              {quoteChecks.map((c) => <li key={c}>{c}</li>)}
            </ul>
            <p className="area-note area-note--body">
              費用の目安は<a href="/articles/zeirishi-hiyo-souzokuzei-sogaku-rei/">税理士費用の総額例</a>、選び方は<a href="/articles/zeirishi-mendan-shitsumon-10/">初回面談で聞く質問10</a>でも解説しています。このページは{site.company}が作成したもので、当センターの料金で相続税申告をお受けしています。
            </p>

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

          <aside className="area-others" aria-label="ほかの対応エリア">
            <p className="area-others__label">{region ? `${region.name}のほかの市区町村` : 'ほかの対応エリア'}</p>
            <ul>
              {areas.filter((a) => a.path !== area.path).map((a) => (
                <li key={a.path}><a href={a.path}>{a.city}の相続税申告</a></li>
              ))}
            </ul>
            <a href="/area/" className="area-others__more">地域から探す（すべての市区町村）<Arrow /></a>
          </aside>
        </div>
      </section>
    </>
  )
}
