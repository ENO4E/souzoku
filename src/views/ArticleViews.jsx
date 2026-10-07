import { useMemo, useState } from 'react'
import { Arrow } from '../components/SectionHead.jsx'

const fmt = (d) => d.replace(/-/g, '.')

/** 記事一覧（/articles/）
 * list は {slug,title,date,tags} の配列。ビルド時はデータから描画し、ブラウザでは埋め込み JSON を持たずに
 * 描画済みの一覧行（data-s / data-g）から復元する（main.jsx）。件数が多くても転送量を増やさないため */
const LATEST_CARDS = 12

export function ArticlesView({ list = [] }) {
  const [tag, setTag] = useState('')
  const tags = useMemo(() => {
    const count = new Map()
    list.forEach((a) => a.tags.forEach((t) => count.set(t, (count.get(t) || 0) + 1)))
    return [...count.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).map(([t, n]) => ({ t, n }))
  }, [list])
  const tagIndex = useMemo(() => new Map(tags.map(({ t }, i) => [t, i])), [tags])
  const shownCount = tag ? list.filter((a) => a.tags.includes(tag)).length : list.length
  const latest = list.slice(0, LATEST_CARDS)
  // 一覧の行は一度だけ描画し、絞り込みは <ol data-tag> と CSS で隠す（500行を描き直すと操作の反応が遅れる）
  const rows = useMemo(() => list.map((a) => (
    <li key={a.slug} data-s={a.slug} data-g={a.tags.map((t) => tagIndex.get(t)).join(' ')}>
      <a href={`/articles/${a.slug}/`}>
        <time dateTime={a.date}>{fmt(a.date)}</time>
        <span>{a.title}</span>
      </a>
    </li>
  )), [list, tagIndex])
  return (
    <>
      <section className="page-head" data-scene="2">
        <div className="container">
          <nav className="breadcrumb" aria-label="パンくず">
            <ol>
              <li><a href="/">Home</a></li>
              <li aria-current="page">Articles</li>
            </ol>
          </nav>
          <p className="eyebrow" data-reveal>
            <span className="eyebrow__no">04</span>
            <span className="eyebrow__line" />
            <span data-scramble>Articles</span>
          </p>
          <h1 className="page-head__title" data-reveal style={{ '--d': '90ms' }}>相続税の<br className="sp-only" />基礎知識コラム</h1>
          <p className="page-head__lead" data-reveal style={{ '--d': '180ms' }}>相続専門の税理士法人が、相続税申告でよくあるご質問や判断に迷いやすいポイントを分かりやすく解説します。全{list.length}記事。</p>
        </div>
      </section>

      {latest.length > 0 && (
        <section className="section articles articles--latest" data-scene="2">
          <div className="container">
            <h2 className="articles__sub"><span>New</span>新着記事</h2>
            <ul className="article-grid">
              {latest.map((a) => (
                <li key={a.slug} className="article-card spotlight">
                  <a href={`/articles/${a.slug}/`}>
                    <div className="article-card__meta"><time dateTime={a.date}>{fmt(a.date)}</time></div>
                    <h3>{a.title}</h3>
                    {a.tags.length > 0 && (
                      <ul className="article-card__tags">
                        {a.tags.map((t) => <li key={t}>{t}</li>)}
                      </ul>
                    )}
                    <span className="article-card__more">読む <Arrow /></span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section articles articles--index" data-scene="2">
        <div className="container">
          <h2 className="articles__sub"><span>Index</span>記事一覧</h2>
          {tags.length > 1 && (
            <div className="article-filter" role="group" aria-label="テーマで絞り込む">
              <button type="button" className={tag ? '' : 'is-active'} onClick={() => setTag('')}>すべて <span>{list.length}</span></button>
              {tags.map(({ t, n }) => (
                <button type="button" key={t} data-tag={t} className={tag === t ? 'is-active' : ''} onClick={() => setTag(tag === t ? '' : t)}>{t} <span>{n}</span></button>
              ))}
            </div>
          )}
          {list.length === 0 ? (
            <p className="articles__empty">記事は準備中です。</p>
          ) : (
            <ol className="article-index" data-count={shownCount} data-tag={tag ? tagIndex.get(tag) : undefined}>
              {rows}
            </ol>
          )}
        </div>
      </section>
    </>
  )
}

/** 記事本文（/articles/<slug>/） */
export function ArticleView({ article, related = [] }) {
  if (!article) return null
  return (
    <>
      <section className="page-head page-head--article" data-scene="2">
        <div className="container container--narrow">
          <nav className="breadcrumb" aria-label="パンくず">
            <ol>
              <li><a href="/">Home</a></li>
              <li><a href="/articles/">Articles</a></li>
              <li aria-current="page">{article.title}</li>
            </ol>
          </nav>
          <div className="article-meta" data-reveal>
            <time dateTime={article.date}>{fmt(article.date)}</time>
            <span>読了目安 約{article.readingMin}分</span>
            {article.tags.map((t) => <span key={t} className="article-meta__tag">{t}</span>)}
          </div>
          <h1 className="page-head__title page-head__title--article" data-reveal style={{ '--d': '90ms' }}>{article.title}</h1>
          <p className="page-head__lead" data-reveal style={{ '--d': '180ms' }}>{article.description}</p>
        </div>
      </section>

      <section className="section article" data-scene="2">
        <div className="container container--narrow">
          {article.headings.length > 1 && (
            <nav className="article-toc glass" aria-label="目次" data-reveal>
              <p className="article-toc__label">目次</p>
              <ol>
                {article.headings.map((h) => <li key={h.id}><a href={`#${h.id}`}>{h.text}</a></li>)}
              </ol>
            </nav>
          )}
          <article className="prose" dangerouslySetInnerHTML={{ __html: article.html }} />

          <div className="article-cta">
            <p className="article-cta__title">ご自身のケースではどうなるか、無料相談で確認できます。</p>
            <p className="article-cta__text">初回相談は無料。ご契約まで費用はかかりません。相続税額の目安はシミュレーションでもその場で確認できます。</p>
            <div className="article-cta__actions">
              <a href="/contact/" className="btn btn--primary btn--lg" data-beacon="cta_click" data-beacon-label="コラム">無料相談を予約する<Arrow /></a>
              <a href="/simulation/" className="btn btn--ghost btn--lg">相続税シミュレーション</a>
            </div>
            <p className="article-cta__links">
              <a href="/service/#fee">料金表（基本報酬99,000円〜）</a>
              <a href="/area/">お住まいの市区町村のページ</a>
              <a href="/articles/zeirishi-hiyo-souzokuzei-sogaku-rei/">税理士費用の総額例</a>
            </p>
          </div>

          {related.length > 0 && (
            <div className="article-related">
              <p className="article-related__label">他の記事</p>
              <ul>
                {related.map((a) => (
                  <li key={a.slug}><a href={a.path}><time dateTime={a.date}>{fmt(a.date)}</time><span>{a.title}</span></a></li>
                ))}
              </ul>
            </div>
          )}
          <p className="article-back"><a href="/articles/">← 記事一覧へ</a></p>
        </div>
      </section>
    </>
  )
}
