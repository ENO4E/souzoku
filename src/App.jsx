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
import { ArticlesView, ArticleView } from './views/ArticleViews.jsx'
import { MAIN_ROUTES, matchInternalLink, parseLegacyHash, parsePath, routePath } from './router.js'
import { pages } from './content/seo.js'

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

/**
 * initialRoute … プリレンダリングされたページ（home / service / simulation / contact / articles / article）
 * pageData     … 記事ページ用のデータ（{ article, related } または { list }）。ビルド時に HTML に埋め込まれる
 */
export default function App({ initialRoute = 'home', pageData = null }) {
  const [route, setRoute] = useState(initialRoute)
  const [mountAll, setMountAll] = useState(false)
  const [phase, setPhase] = useState('')
  const routeRef = useRef(initialRoute)
  const timers = useRef([])
  const isMain = MAIN_ROUTES.includes(initialRoute)

  useEffect(() => {
    const root = document.documentElement
    root.dataset.route = initialRoute
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
    // 記事ページでは通常のリンク遷移のみ（SPA の切り替えはしない）
    if (!isMain) {
      if (window.location.hash) requestAnimationFrame(() => scrollToAnchor(window.location.hash.slice(1), 'smooth'))
      return undefined
    }
    setMountAll(true)

    const apply = (r) => {
      routeRef.current = r
      setRoute(r)
      root.dataset.route = r
      document.title = pages[r].title
      window.dispatchEvent(new CustomEvent('route:change', { detail: { route: r } }))
    }

    const go = (next, anchor = '', { push = true, animate = true } = {}) => {
      const path = routePath(next, anchor)
      if (push) window.history.pushState({ route: next }, '', path)
      if (next === routeRef.current) {
        if (anchor) scrollToAnchor(anchor, 'smooth')
        return
      }
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      timers.current.forEach(clearTimeout)
      if (reduced || !animate) {
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

    // 旧URL（#/service/fee）で開かれたら新URLに置き換える
    const legacy = parseLegacyHash(window.location.hash)
    if (legacy) {
      window.history.replaceState({ route: legacy.route }, '', routePath(legacy.route, legacy.anchor))
      if (legacy.route !== routeRef.current) go(legacy.route, legacy.anchor, { push: false, animate: false })
      else if (legacy.anchor) scrollToAnchor(legacy.anchor)
    } else if (window.location.hash) {
      // /service/#fee のように位置指定付きで開かれた場合
      requestAnimationFrame(() => scrollToAnchor(window.location.hash.slice(1)))
    }

    // サイト内リンクのクリックを横取りして、幕のアニメーション付きで切り替える
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = e.target && e.target.closest ? e.target.closest('a[href]') : null
      const hit = matchInternalLink(a)
      if (!hit) return
      e.preventDefault()
      go(hit.route, hit.anchor)
    }
    document.addEventListener('click', onClick)

    // 戻る・進む
    const onPop = () => {
      const next = parsePath(window.location.pathname)
      if (!MAIN_ROUTES.includes(next)) {
        window.location.reload()
        return
      }
      const anchor = window.location.hash.replace(/^#/, '')
      go(next, anchor, { push: false })
    }
    window.addEventListener('popstate', onPop)

    return () => {
      document.removeEventListener('click', onClick)
      window.removeEventListener('popstate', onPop)
      timers.current.forEach(clearTimeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const show = (r) => isMain && (mountAll || route === r)

  return (
    <>
      <a href="#main" className="skip-link">本文へスキップ</a>
      <div className="progress-bar" aria-hidden="true" />
      <Loader enabled={initialRoute === 'home'} />
      <SceneCanvas />
      <Header route={route} />
      {isMain && <SideNav route={route} />}
      <Effects />
      <PageTransition phase={phase} />

      <main id="main" data-route={route}>
        {isMain ? (
          <>
            <div className="view view--home" hidden={route !== 'home'}>{show('home') && <HomeView />}</div>
            <div className="view view--service" hidden={route !== 'service'}>{show('service') && <ServiceView />}</div>
            <div className="view view--simulation" hidden={route !== 'simulation'}>{show('simulation') && <SimulationView />}</div>
            <div className="view view--contact" hidden={route !== 'contact'}>{show('contact') && <ContactView />}</div>
          </>
        ) : (
          <div className={`view view--${route}`}>
            {route === 'articles' && <ArticlesView list={pageData?.list || []} />}
            {route === 'article' && <ArticleView article={pageData?.article} related={pageData?.related || []} />}
          </div>
        )}
      </main>

      <Footer latest={pageData?.latest || []} />
      <CtaBottom />
    </>
  )
}
