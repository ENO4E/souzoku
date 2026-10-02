import { useEffect, useState } from 'react'
import { nav, serviceNav } from '../content/site.js'

const HOME = [
  { id: 'p-service', label: 'Service', scene: 'Core' },
  { id: 'p-simulation', label: 'Simulation', scene: 'Helix' },
  { id: 'p-contact', label: 'Contact', scene: 'Network' },
]
const SERVICE = serviceNav.map((s) => ({ id: s.id, label: s.en, scene: s.id === 'pain' ? 'Silos' : s.id === 'flow' ? 'Helix' : ['reasons', 'fee'].includes(s.id) ? 'Grid' : 'Network' }))
const SIMULATION = [
  { id: 'calc', label: 'Simulation', scene: 'Helix' },
  { id: 'report', label: 'Report', scene: 'Grid' },
]
const CONTACT = [
  { id: 'contact', label: 'Contact', scene: 'Network' },
  { id: 'office', label: 'Office', scene: 'Network' },
]
const LISTS = { home: HOME, service: SERVICE, simulation: SIMULATION, contact: CONTACT }

/** 画面右の現在地インジケーターと、左下の HUD（デスクトップのみ表示）。ルートごとに項目が変わる */
export default function SideNav({ route }) {
  const [active, setActive] = useState(0)
  const sections = LISTS[route] || HOME

  useEffect(() => {
    setActive(0)
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(sections.findIndex((s) => s.id === e.target.id))
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [route, sections])

  // ルートが変わった直後は active が前のページの番号のままなので、範囲内に丸める
  const index = Math.min(Math.max(active, 0), sections.length - 1)
  const current = sections[index]
  const pageNo = route === 'home' ? '' : nav.find((n) => n.href === `#/${route}`)?.no

  return (
    <>
      <nav className="sidenav" aria-label="セクション">
        <ol>
          {sections.map((s, i) => (
            <li key={s.id} data-active={i === index || undefined}>
              <a href={route === 'home' ? `#${s.id}` : `#/${route}/${s.id}`} aria-current={i === index ? "true" : undefined}>
                <span className="sidenav__label">{s.label}</span>
                <span className="sidenav__tick" />
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="hud" aria-hidden="true">
        <span className="hud__index">
          {pageNo && <span className="hud__page">{pageNo} — </span>}
          <b key={`${route}-${index}`}>{String(index + 1).padStart(2, "0")}</b> / {String(sections.length).padStart(2, '0')}
        </span>
        <span className="hud__line" />
        <span className="hud__scene">Scene — {current.scene}</span>
      </div>
    </>
  )
}
