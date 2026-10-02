import { useMemo, useState } from 'react'
import { site } from '../content/site.js'
import { Arrow } from '../components/SectionHead.jsx'

const fmt = (d) => d.replace(/-/g, '.')

/** 記事一覧（/articles/） */
export function ArticlesView({ list = [] }) {
  const [tag, setTag] = useState('')
  const tags = useMemo(() => {
    const count = new Map()
    list.forEach((a) => a.tags.forEach((t) => count.set(t, (count.get(t) || 0) + 1)))
    return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([t, n]) => ({ t, n }))
  }, [list])
  const shown = tag ? list.filter((a) => a.tags.includes(tag)) : list
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
          <p className="page-head__lead" data-reveal style={{ '--d': '180ms' }}>相続専門の税理士法人が、相続税申告でよくあるご質問や判断に迷いやすいポイントを分かりやすく解説します。</p>
        </div>
      </section>
      <section className="section articles" data-scene="2">
        <div className="container">
          {tags.length > 1 && (
            <div className="article-filter" role="group" aria-label="テーマで絞り込む">
              <button type="button" className={tag ? '' : 'is-active'} onClick={() => setTag('')}>すべて <span>{list.length}</span></button>
              {tags.map(({ t, n }) => (
                <button type="button" key={t} className={tag === t ? 'is-active' : ''} onClick={() => setTag(tag === t ? '' : t)}>{t} <span>{n}</span></button>
              ))}
            </div>
          )}
          {shown.length === 0 ? (
            <p className="articles__empty" data-reveal>記事は準備中です。</p>
          ) : (
            <ul className="article-grid">
              {shown.map((a) => (
                <li key={a.slug} className="article-card spotlight">
                  <a href={a.path}>
                    <div className="article-card__meta">
                      <time dateTime={a.date}>{fmt(a.date)}</time>
                      <span>約{a.readingMin}分</span>
                    </div>
                    <h2>{a.title}</h2>
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

          <aside className="article-author glass">
            <p className="article-author__label">この記事について</p>
            <p className="article-author__name">{site.name}（運営：{site.company}）</p>
            <p>相続税申告に専門特化した税理士法人です。記事の内容は執筆時点の法令にもとづく一般的な情報提供であり、個別の税務判断ではありません。実際の申告の要否や税額は、財産の内容や分割の仕方によって変わります。</p>
          </aside>

          <div className="article-cta">
            <p className="article-cta__title">ご自身のケースではどうなるか、無料相談で確認できます。</p>
            <p className="article-cta__text">初回相談は無料。ご契約まで費用はかかりません。相続税額の目安はシミュレーションでもその場で確認できます。</p>
            <div className="article-cta__actions">
              <a href="/contact/" className="btn btn--primary btn--lg">無料相談を予約する<Arrow /></a>
              <a href="/simulation/" className="btn btn--ghost btn--lg">相続税シミュレーション</a>
            </div>
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
