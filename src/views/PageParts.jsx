import { Arrow } from '../components/SectionHead.jsx'

/** 各ページ先頭の見出し（パンくず・番号・英語ラベル・タイトル・リード） */
export function PageHead({ no, en, title, lead, scene = 0 }) {
  return (
    <section className="page-head" data-scene={scene}>
      <div className="container">
        <nav className="breadcrumb" aria-label="パンくず">
          <ol>
            <li><a href="/">Home</a></li>
            <li aria-current="page">{en}</li>
          </ol>
        </nav>
        <p className="eyebrow" data-reveal>
          <span className="eyebrow__no">{no}</span>
          <span className="eyebrow__line" />
          <span data-scramble>{en}</span>
        </p>
        <h1 className="page-head__title" data-reveal style={{ '--d': '90ms' }}>{title}</h1>
        {lead && <p className="page-head__lead" data-reveal style={{ '--d': '180ms' }}>{lead}</p>}
      </div>
    </section>
  )
}

/** ページ末尾の「次へ」。waaark 風に次のページを大きく示す */
export function NextNav({ items }) {
  return (
    <section className="next-nav" data-scene={4}>
      <div className="container">
        <p className="next-nav__label" data-reveal>Next</p>
        <ul>
          {items.map((it, i) => (
            <li key={it.href} data-reveal style={{ '--d': `${i * 80}ms` }}>
              <a href={it.href} className="next-nav__link">
                <span className="next-nav__no">{it.no}</span>
                <span className="next-nav__text">
                  <span className="next-nav__en">{it.en}</span>
                  <span className="next-nav__title">{it.title}</span>
                </span>
                <span className="next-nav__arrow"><Arrow /></span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
