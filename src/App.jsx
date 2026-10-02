import { useEffect, useRef, useState } from 'react'
import Loader from './components/Loader.jsx'
import SceneCanvas from './components/SceneCanvas.jsx'
import Header from './components/Header.jsx'
import SideNav from './components/SideNav.jsx'
import Effects from './components/Effects.jsx'
import Footer from './components/Footer.jsx'
import CtaBottom from './components/CtaBottom.jsx'
import PageTransition from './components/PageTransition.jsx'
import HomeView from './views/HomeView.jsx'
import ServiceView from './views/ServiceView.jsx'
import SimulationView from './views/SimulationView.jsx'
import ContactView from './views/ContactView.jsx'
import { parseHash } from './router.js'

const WIPE_IN = 520
const WIPE_OUT = 620

// ページ切り替え時は幕の裏で一瞬で移動（instant）、同じページ内の移動はなめらかに（smooth）
function scrollToAnchor(anchor, behavior = 'instant') {
  if (!anchor) {
    window.scrollTo({ top: 0, behavior })
    return
  }
  const el = document.getElementById(anchor)
  if (el) el.scrollIntoView({ behavior, block: 'start' })
  else window.scrollTo({ top: 0, behavior })
}

export default function App() {
  // プリレンダリングと一致させるため、初期表示は常にホーム。マウント後にハッシュから切り替える
  const [route, setRoute] = useState('home')
  const [phase, setPhase] = useState('')
  const routeRef = useRef('home')
  const timers = useRef([])

  useEffect(() => {
    const root = document.documentElement
    const apply = (r) => {
      routeRef.current = r
      setRoute(r)
      root.dataset.route = r
      window.dispatchEvent(new CustomEvent('route:change', { detail: { route: r } }))
    }

    // 初回：ハッシュに従って幕なしで切り替える
    const first = parseHash(window.location.hash)
    if (first.route !== 'home') {
      apply(first.route)
      requestAnimationFrame(() => scrollToAnchor(first.anchor))
    } else {
      root.dataset.route = 'home'
    }

    const onHash = () => {
      const { route: next, anchor } = parseHash(window.location.hash)
      if (next === routeRef.current) {
        if (anchor) scrollToAnchor(anchor, 'smooth')
        return
      }
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      timers.current.forEach(clearTimeout)
      if (reduced) {
        apply(next)
        scrollToAnchor(anchor)
        return
      }
      setPhase('in')
      timers.current = [
        window.setTimeout(() => {
          apply(next)
          scrollToAnchor(anchor)
          setPhase('out')
        }, WIPE_IN),
        window.setTimeout(() => setPhase(''), WIPE_IN + WIPE_OUT),
      ]
    }
    window.addEventListener('hashchange', onHash)
    return () => {
      window.removeEventListener('hashchange', onHash)
      timers.current.forEach(clearTimeout)
    }
  }, [])

  return (
    <>
      <a href="#main" className="skip-link">本文へスキップ</a>
      <div className="progress-bar" aria-hidden="true" />
      <Loader />
      <SceneCanvas />
      <Header route={route} />
      <SideNav route={route} />
      <Effects />
      <PageTransition phase={phase} />

      <main id="main" data-route={route}>
        <div className="view view--home" hidden={route !== 'home'}><HomeView /></div>
        <div className="view view--service" hidden={route !== 'service'}><ServiceView /></div>
        <div className="view view--simulation" hidden={route !== 'simulation'}><SimulationView /></div>
        <div className="view view--contact" hidden={route !== 'contact'}><ContactView /></div>
      </main>

      <Footer />
      <CtaBottom />
    </>
  )
}
