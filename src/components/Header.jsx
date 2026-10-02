import { useEffect, useState } from 'react'
import { nav, site } from '../content/site.js'

function Logo() {
  return (
    <span className="logo">
      <span className="logo__mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="30" height="30">
          <circle cx="16" cy="16" r="14.5" fill="none" stroke="url(#logo-g)" strokeWidth="1.2" />
          <path d="M9 21.5 16 9l7 12.5" fill="none" stroke="url(#logo-g)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12.3 17.5h7.4" stroke="url(#logo-g)" strokeWidth="1.4" strokeLinecap="round" />
          <defs>
            <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#e6c47a" />
              <stop offset="1" stopColor="#8fb3ff" />
            </linearGradient>
          </defs>
        </svg>
      </span>
      <span className="logo__type">
        <span className="logo__company">運営：{site.company}</span>
        <b className="logo__service">{site.name}</b>
      </span>
    </span>
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      setHidden(y > 480 && y > last + 4)
      if (y < last - 4) setHidden(false)
      last = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="header" data-scrolled={scrolled || undefined} data-hidden={(hidden && !open) || undefined} data-open={open || undefined}>
      <div className="header__inner">
        <a href="#top" className="header__logo" aria-label={`${site.name} トップへ`} onClick={() => setOpen(false)}>
          <Logo />
        </a>
        <nav className="header__nav" aria-label="メインメニュー">
          <ul>
            {nav.map((item) => (
              <li key={item.href}><a href={item.href}>{item.label}</a></li>
            ))}
          </ul>
        </nav>
        <a href={site.telHref} className="header__tel">
          <span className="header__tel-label">受付（{site.hours}）</span>
          <b>{site.tel}</b>
        </a>
        <a href="#contact" className="btn btn--primary btn--sm header__cta">無料相談</a>
        <button
          type="button"
          className="header__toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'メニューを閉じる' : 'メニューを開く'}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>
      <div id="mobile-menu" className="mobile-menu" hidden={!open}>
        <ul>
          {nav.map((item, i) => (
            <li key={item.href} style={{ '--i': i }}>
              <a href={item.href} onClick={() => setOpen(false)}>
                <span className="mobile-menu__no">{String(i + 1).padStart(2, '0')}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mobile-menu__actions">
          <a href={site.telHref} className="btn btn--ghost btn--lg" onClick={() => setOpen(false)}>電話で相談する　{site.tel}</a>
          <a href="#contact" className="btn btn--primary btn--lg" onClick={() => setOpen(false)}>無料相談を予約する</a>
        </div>
      </div>
    </header>
  )
}
