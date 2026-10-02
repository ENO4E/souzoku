import { useEffect, useRef, useState } from 'react'

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * スクロール位置からシーン番号（連続値）を求める。
 * 各セクションの中央を通過した時点でそのセクションの data-scene に一致し、
 * セクション間ではしばらく形を保ってから次の形へ移る。
 */
function computeMorph() {
  // 表示中のビューにあるセクションだけを対象にする（hidden のビューは大きさ 0）
  const sections = Array.from(document.querySelectorAll('[data-scene]')).filter((el) => el.getClientRects().length > 0)
  if (sections.length === 0) return 0
  const probe = window.scrollY + window.innerHeight * 0.5
  const anchors = sections.map((el) => {
    const rect = el.getBoundingClientRect()
    const top = rect.top + window.scrollY
    return { scene: Number(el.dataset.scene), at: top + Math.min(rect.height, window.innerHeight) * 0.5 }
  })
  if (probe <= anchors[0].at) return anchors[0].scene
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i]
    const b = anchors[i + 1]
    if (probe < b.at) {
      const raw = (probe - a.at) / Math.max(b.at - a.at, 1)
      const t = Math.min(Math.max((raw - 0.3) / 0.4, 0), 1)
      return a.scene + (b.scene - a.scene) * t
    }
  }
  return anchors[anchors.length - 1].scene
}

/** 背景の WebGL 粒子シーン。three.js は表示後に遅延読み込みする（HP-DX の SceneCanvas を移植） */
export default function SceneCanvas() {
  const canvasRef = useRef(null)
  const [state, setState] = useState('loading')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let field = null
    let cancelled = false
    let lastWidth = window.innerWidth
    let lastHeight = window.innerHeight
    const cleanups = []

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const lowPower = coarse || window.innerWidth < 900 || (navigator.hardwareConcurrency ?? 8) <= 4

    const signalReady = () => window.dispatchEvent(new Event('scene:ready'))

    Promise.resolve()
      .then(() => {
        if (!hasWebGL()) throw new Error('WebGL unavailable')
        return import('../three/ParticleField.js')
      })
      .then(({ ParticleField }) => {
        if (cancelled) return
        try {
          field = new ParticleField(canvas, { lowPower, reducedMotion })
        } catch {
          setState('fallback')
          signalReady()
          return
        }
        const f = field
        f.setMorph(computeMorph())
        f.start()
        setState('ready')
        const onIntro = () => f.playIntro()
        window.addEventListener('intro:start', onIntro, { once: true })
        if (document.documentElement.dataset.introStarted) f.playIntro()
        cleanups.push(() => window.removeEventListener('intro:start', onIntro))
        signalReady()

        let scrollRaf = 0
        const onScroll = () => {
          cancelAnimationFrame(scrollRaf)
          f.setScrollY(window.scrollY)
          scrollRaf = requestAnimationFrame(() => f.setMorph(computeMorph()))
        }
        const onResize = () => {
          const w = window.innerWidth
          const h = window.innerHeight
          if (coarse && w === lastWidth && Math.abs(h - lastHeight) < 140) return
          lastWidth = w
          lastHeight = h
          f.resize()
          f.setMorph(computeMorph())
        }
        const onPointerMove = (e) => {
          if (e.pointerType !== 'mouse') return
          f.setPointer((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
        }
        const onPointerLeave = () => f.clearPointer()
        const onVisibility = () => (document.hidden ? f.stop() : f.start())

        const onRoute = () => requestAnimationFrame(() => f.setMorph(computeMorph()))
        window.addEventListener('route:change', onRoute)
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onResize)
        window.addEventListener('pointermove', onPointerMove, { passive: true })
        document.documentElement.addEventListener('pointerleave', onPointerLeave)
        document.addEventListener('visibilitychange', onVisibility)

        const onContextLost = (e) => {
          e.preventDefault()
          f.stop()
          setState('fallback')
        }
        canvas.addEventListener('webglcontextlost', onContextLost)

        cleanups.push(() => {
          cancelAnimationFrame(scrollRaf)
          window.removeEventListener('route:change', onRoute)
          window.removeEventListener('scroll', onScroll)
          window.removeEventListener('resize', onResize)
          window.removeEventListener('pointermove', onPointerMove)
          document.documentElement.removeEventListener('pointerleave', onPointerLeave)
          document.removeEventListener('visibilitychange', onVisibility)
          canvas.removeEventListener('webglcontextlost', onContextLost)
        })
      })
      .catch(() => {
        if (cancelled) return
        setState('fallback')
        signalReady()
      })

    return () => {
      cancelled = true
      cleanups.forEach((fn) => fn())
      if (field) field.dispose()
    }
  }, [])

  return (
    <div className="scene" data-state={state} aria-hidden="true">
      <canvas ref={canvasRef} className="scene__canvas" />
      <div className="scene__fallback" />
      <div className="scene__vignette" />
    </div>
  )
}
