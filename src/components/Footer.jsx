import { nav, serviceNav, site } from '../content/site.js'
import { Arrow } from './SectionHead.jsx'

export default function Footer() {
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
          <a href="/contact/" className="footer__cta">
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
          </ul>
        </nav>
      </div>
      <p className="footer__mark" aria-hidden="true">Inheritance Tax</p>
      <div className="container footer__bottom">
        <p>© 2026 {site.name}　All Rights Reserved.</p>
        <a href="/" className="footer__top">Home ↑</a>
      </div>
    </footer>
  )
}
