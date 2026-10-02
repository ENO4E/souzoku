import { useEffect, useRef, useState } from 'react'
import { site } from '../content/site.js'

const MIN_DURATION = 800
const MAX_WAIT = 6000

/**
 * 初回表示のローディング演出（HP-DX の Loader を移植）。
 * フォントと WebGL シーンの準備ができたら 100% にして幕を上げ、粒子の集合演出を始める。
 * JS が動かない環境では CSS 側で非表示（.js .loader でのみ表示）
 */
export default function Loader({ enabled = true }) {
  const [phase, setPhase] = useState(enabled ? 'loading' : 'done')
  const countRef = useRef(null)
  const barRef = useRef(null)

  useEffect(() => {
    const root = document.documentElement
    if (!enabled) {
      // ローダー無しのページ：幕が無いので、粒子の集合演出とヒーローの表示をすぐ始める
      root.classList.remove('is-loading')
      root.dataset.introStarted = '1'
      window.dispatchEvent(new Event('intro:start'))
      return undefined
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = performance.now()
    let target = 0.15
    let shown = 0
    let last = start
    let raf = 0
    let finished = false
    let sceneReady = false
    let fontsReady = false

    const bump = () => {
      target = Math.max(target, 0.15 + (fontsReady ? 0.35 : 0) + (sceneReady ? 0.5 : 0))
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        fontsReady = true
        bump()
      })
    } else {
      fontsReady = true
      bump()
    }
    const onReady = () => {
      sceneReady = true
      bump()
    }
    window.addEventListener('scene:ready', onReady)
    const failsafe = window.setTimeout(() => {
      sceneReady = fontsReady = true
      bump()
    }, MAX_WAIT)

    const finish = () => {
      finished = true
      setPhase('leaving')
      root.classList.remove('is-loading')
      root.dataset.introStarted = '1'
      window.dispatchEvent(new Event('intro:start'))
      window.setTimeout(() => setPhase('done'), 1300)
    }

    const tick = (now) => {
      const elapsed = now - start
      const idle = Math.min(elapsed / 9000, 0.12)
      const goal = Math.min(target + idle, 1)
      const dt = Math.min((now - last) / 1000, 0.25)
      last = now
      shown += (goal - shown) * (reduced ? 1 : 1 - Math.exp(-dt * 5))
      if (goal >= 1 && 1 - shown < 0.004) shown = 1
      const pct = Math.round(shown * 100)
      if (countRef.current) countRef.current.textContent = String(pct).padStart(3, '0')
      if (barRef.current) barRef.current.style.transform = `scaleX(${shown})`
      if (shown >= 1 && elapsed >= (reduced ? 0 : MIN_DURATION) && !finished) {
        finish()
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(failsafe)
      window.removeEventListener('scene:ready', onReady)
    }
  }, [enabled])

  if (phase === 'done') return null

  return (
    <div className="loader" data-phase={phase} aria-hidden="true">
      <div className="loader__top">
        <span>{site.company}</span>
        <span>{site.name}</span>
      </div>
      <div className="loader__center">
        <span className="loader__count" ref={countRef}>000</span>
        <span className="loader__bar"><span ref={barRef} /></span>
        <span className="loader__caption">Preparing the experience</span>
      </div>
      <div className="loader__bottom">
        <span>Osaka</span>
        <span className="loader__arrow" />
        <span>Inheritance Tax</span>
      </div>
    </div>
  )
}
