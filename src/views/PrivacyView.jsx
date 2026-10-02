import { site } from '../content/site.js'
import { ESTABLISHED, MANAGER, REVISED, WINDOW, sections } from '../content/privacy.js'

/** 箇条書きの先頭の【見出し】を太字にする */
function Item({ text }) {
  const m = text.match(/^【([^】]+)】(.*)$/)
  return <li>{m ? <><strong>{m[1]}</strong>：{m[2]}</> : text}</li>
}

/** プライバシーポリシー（/privacy/）。記事ページと同じく通常のページ（SPA の切り替えはしない） */
export default function PrivacyView() {
  return (
    <>
      <section className="page-head page-head--article" data-scene="2">
        <div className="container container--narrow">
          <nav className="breadcrumb" aria-label="パンくず">
            <ol>
              <li><a href="/">Home</a></li>
              <li aria-current="page">Privacy Policy</li>
            </ol>
          </nav>
          <p className="eyebrow" data-reveal>
            <span className="eyebrow__line" />
            <span data-scramble>Privacy Policy</span>
          </p>
          <h1 className="page-head__title page-head__title--article" data-reveal style={{ '--d': '90ms' }}>プライバシーポリシー</h1>
          <p className="page-head__lead" data-reveal style={{ '--d': '180ms' }}>
            {site.name}（運営：{site.company}）における個人情報の取扱いについて定めます。
          </p>
        </div>
      </section>

      <section className="section article" data-scene="2">
        <div className="container container--narrow">
          <nav className="article-toc glass" aria-label="目次" data-reveal>
            <p className="article-toc__label">目次</p>
            {/* 番号は目次の装飾で付くので、章の見出しの「1.」などは外す */}
            <ol>
              {sections.map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.title.replace(/^\d+\.\s*/, '')}</a></li>)}
            </ol>
          </nav>

          <article className="prose privacy">
            {sections.map((s) => (
              <section key={s.id} aria-labelledby={s.id}>
                <h2 id={s.id}>{s.title}</h2>
                {s.intro && <p>{s.intro}</p>}
                {s.items && <ul>{s.items.map((t) => <Item key={t} text={t} />)}</ul>}
                {s.links && (
                  <ul className="privacy__links">
                    {s.links.map((l) => <li key={l.href}><a href={l.href} target="_blank" rel="noopener noreferrer">{l.label} ↗</a></li>)}
                  </ul>
                )}
                {s.id === 'window' && (
                  <dl className="privacy__window">
                    <div><dt>個人情報保護管理者</dt><dd>{MANAGER}</dd></div>
                    <div><dt>窓口</dt><dd>{WINDOW.name}</dd></div>
                    <div><dt>所在地</dt><dd>{WINDOW.address}<br />（大阪の事務所：{WINDOW.osaka}）</dd></div>
                    <div>
                      <dt>電話</dt>
                      <dd>{WINDOW.tels.map((t, i) => <span key={t.tel}>{i > 0 && ' / '}<a href={t.href}>{t.tel}</a>（{t.label}）</span>)}</dd>
                    </div>
                    <div><dt>受付時間</dt><dd>{WINDOW.hours}</dd></div>
                    <div><dt>フォーム</dt><dd><a href="/contact/">当サイトのお問い合わせフォーム</a>（「個人情報の取扱いについて」とご記入ください）</dd></div>
                  </dl>
                )}
              </section>
            ))}
            <p className="privacy__dates">制定日：{ESTABLISHED}　／　最終改定日：{REVISED}<br />{site.company}</p>
          </article>
        </div>
      </section>
    </>
  )
}
