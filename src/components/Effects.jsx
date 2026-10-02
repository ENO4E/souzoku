import { useEffect } from 'react'

/**
 * ページ全体の小さな演出をまとめて管理する（TaxPlan-org/HP-DX の Effects を移植）。
 * - [data-reveal]   画面に入ったらフェードイン
 * - [data-progress] 要素内のスクロール進捗を --progress (0〜1) に反映
 * - .spotlight      マウス位置を --mx / --my に反映（カードの光彩）
 * - .progress-bar   ページ全体の読了率
 * - [data-scramble] 表示時に英字がランダムな文字から確定していく
 * JS が動かない環境では .js クラスが付かないため、何も隠れない
 */

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>'

function scramble(el) {
  const text = el.dataset.text ?? el.textContent ?? ''
  el.dataset.text = text
  const start = performance.now()
  const duration = 700 + text.length * 25
  const step = (now) => {
    const p = Math.min((now - start) / duration, 1)
    const fixed = Math.floor(p * text.length)
    let out = text.slice(0, fixed)
    for (let i = fixed; i < text.length; i++) {
      out += text[i] === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
    }
    el.textContent = out
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

export default function Effects() {
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('js')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const reveals = document.querySelectorAll('[data-reveal]')
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            if (!reducedMotion) entry.target.querySelectorAll('[data-scramble]').forEach(scramble)
            io.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    )
    reveals.forEach((el) => io.observe(el))

    // ヒーローの要素は画面の高さに関わらず必ず表示する（ローダーの幕が上がった時点で順に出す）
    // ホームの3パネルは IntersectionObserver に頼らず、幕が上がった時点で全て表示扱いにする
    const showHero = () => document.querySelectorAll('.hero [data-reveal], .panel [data-reveal]').forEach((el) => el.classList.add('is-visible'))
    // ページ切り替え直後は、画面上部の見出しとパネルを待たずに表示する
    const onRoute = () => window.setTimeout(() => {
      document.querySelectorAll('.view:not([hidden]) .page-head [data-reveal], .view:not([hidden]) .page-head__actions, .view:not([hidden]) .panel--first [data-reveal]').forEach((el) => el.classList.add('is-visible'))
    }, 30)
    window.addEventListener('route:change', onRoute)
    if (root.dataset.introStarted) showHero()
    window.addEventListener('intro:start', showHero, { once: true })
    const heroFailsafe = window.setTimeout(showHero, 8500)

    const progressEls = Array.from(document.querySelectorAll('[data-progress]'))
    const bar = document.querySelector('.progress-bar')
    let raf = 0
    const revealInView = () => {
      const vh = window.innerHeight
      document.querySelectorAll('.view:not([hidden]) [data-reveal]:not(.is-visible)').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.height > 0 && r.top < vh * 0.95 && r.bottom > 0) el.classList.add('is-visible')
      })
    }
    const update = () => {
      revealInView()
      const vh = window.innerHeight
      for (const el of progressEls) {
        const r = el.getBoundingClientRect()
        const p = Math.min(Math.max((vh * 0.6 - r.top) / r.height, 0), 1)
        el.style.setProperty('--progress', p.toFixed(4))
      }
      if (bar) {
        const max = document.documentElement.scrollHeight - vh
        bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`
      }
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    const onPointer = (e) => {
      const target = e.target && e.target.closest ? e.target.closest('.spotlight') : null
      if (!target) return
      const r = target.getBoundingClientRect()
      target.style.setProperty('--mx', `${e.clientX - r.left}px`)
      target.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    document.addEventListener('pointermove', onPointer, { passive: true })

    // 電話番号リンクのタップを計測（広告のコンバージョン指標）
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('a[href^="tel:"]')
      if (a && typeof window.gtag === 'function') window.gtag('event', 'phone_click', { link_url: a.getAttribute('href') })
    }
    document.addEventListener('click', onClick)

    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('intro:start', showHero)
      window.removeEventListener('route:change', onRoute)
      clearTimeout(heroFailsafe)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      document.removeEventListener('pointermove', onPointer)
      document.removeEventListener('click', onClick)
    }
  }, [])

  return null
}
