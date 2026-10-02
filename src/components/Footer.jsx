import { nav, serviceNav, site } from '../content/site.js'
import { Arrow } from './SectionHead.jsx'

/** latest … 最新のコラム（ビルド時に全ページへ埋め込む数件だけ。読み込みを重くしない） */
export default function Footer({ latest = [] }) {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <p className="footer__name">{site.name}</p>
          <p className="footer__operator">運営：{site.company}</p>
          <p>相続のご不安に、専門家として誠実に向き合います。</p>
          <dl className="footer__org">
            <div><dt>所在地</dt><dd>{site.address}</dd></div>
            <div><dt>電話</dt><dd><a href={site.telHref}>{site.tel}</a>（受付：{site.hours}）</dd></div>
            <div><dt>登録</dt><dd>{site.license}</dd></div>
          </dl>
          <a href="/contact/" className="footer__cta" data-beacon="cta_click" data-beacon-label="フッター">
            無料相談を予約する
            <Arrow />
          </a>
        </div>
        <nav className="footer__nav" aria-label="フッターメニュー">
          <ul className="footer__nav-main">
            {nav.map((item) => (
              <li key={item.href}><a href={item.href}><span>{item.no}</span>{item.label}</a></li>
            ))}
          </ul>
          <ul>
            {serviceNav.map((item) => (
              <li key={item.href}><a href={item.href}>{item.label}</a></li>
            ))}
            <li><a href="/simulation/#report">お渡しする報告書</a></li>
            <li><a href="/contact/#office">事務所概要</a></li>
            <li><a href="https://www.nta.go.jp/" target="_blank" rel="noopener noreferrer">国税庁 ↗</a></li>
            <li><a href="https://www.kinzei.or.jp/" target="_blank" rel="noopener noreferrer">近畿税理士会 ↗</a></li>
            <li><a href="/privacy/">プライバシーポリシー</a></li>
          </ul>
        </nav>
        <div className="footer__articles">
          <p className="footer__articles-label"><a href="/articles/">相続税の基礎知識コラム</a></p>
          {latest.length > 0 && (
            <ul>
              {latest.map((a) => (
                <li key={a.path}><a href={a.path}><time dateTime={a.date}>{a.date.replace(/-/g, '.')}</time><span>{a.title}</span></a></li>
              ))}
            </ul>
          )}
          <a href="/articles/" className="footer__articles-more">コラム一覧へ <Arrow /></a>
        </div>
      </div>
      <p className="footer__mark" aria-hidden="true">Inheritance Tax</p>
      <div className="container footer__analytics">
        <p>
          <b>アクセス解析について</b>
          当サイトでは、利用状況を把握してサイトを改善するために、Google アナリティクス（Google LLC）と当法人独自の計測を利用しています。独自の計測は外部に送信せず、入力内容は記録しません。お問い合わせいただいた場合は、どのページを経てお問い合わせいただいたかを把握するために、閲覧の記録をお問い合わせと結び付けることがあります。ブラウザの「トラッキング拒否（Do Not Track）」または「グローバル・プライバシー・コントロール（GPC）」を有効にすると、独自の計測は行われません。詳しくは<a href="/privacy/#analytics">プライバシーポリシー</a>をご覧ください。
        </p>
      </div>
      <div className="container footer__bottom">
        <p>© 2026 {site.name}　All Rights Reserved.</p>
        <a href="/" className="footer__top">Home ↑</a>
      </div>
    </footer>
  )
}
