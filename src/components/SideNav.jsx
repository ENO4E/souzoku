import { useEffect, useState } from 'react'

const SECTIONS = [
  { id: 'top', label: 'Intro', scene: 'Core' },
  { id: 'pain', label: 'Problems', scene: 'Silos' },
  { id: 'reasons', label: 'Why Us', scene: 'Grid' },
  { id: 'fee', label: 'Fee', scene: 'Grid' },
  { id: 'flow', label: 'Process', scene: 'Helix' },
  { id: 'voice', label: 'Voice', scene: 'Network' },
  { id: 'area', label: 'Area', scene: 'Network' },
  { id: 'faq', label: 'FAQ', scene: 'Network' },
  { id: 'contact', label: 'Contact', scene: 'Network' },
]

/** 画面右の現在地インジケーターと、左下の HUD（デスクトップのみ表示） */
export default function SideNav() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(SECTIONS.findIndex((s) => s.id === e.target.id))
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const current = SECTIONS[Math.max(active, 0)]

  return (
    <>
      <nav className="sidenav" aria-label="セクション">
        <ol>
          {SECTIONS.map((s, i) => (
            <li key={s.id} data-active={i === active || undefined}>
              <a href={`#${s.id}`} aria-current={i === active ? 'true' : undefined}>
                <span className="sidenav__label">{s.label}</span>
                <span className="sidenav__tick" />
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="hud" aria-hidden="true">
        <span className="hud__index">
          <b key={active}>{String(active + 1).padStart(2, '0')}</b> / {String(SECTIONS.length).padStart(2, '0')}
        </span>
        <span className="hud__line" />
        <span className="hud__scene">Scene — {current.scene}</span>
      </div>
    </>
  )
}
