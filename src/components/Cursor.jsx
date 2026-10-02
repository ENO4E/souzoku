import { useEffect, useRef } from 'react'

const INTERACTIVE = 'a, button, summary, label, [data-cursor]'

/** マウス操作の端末でだけ表示する、遅れて追従するリング型カーソル（HP-DX の Cursor を移植） */
export default function Cursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dot = dotRef.current
    const ring = ringRef.current
    if (!fine || reduced || !dot || !ring) return

    const root = document.documentElement
    root.classList.add('has-cursor')
    let x = -100
    let y = -100
    let rx = x
    let ry = y
    let raf = 0

    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return
      x = e.clientX
      y = e.clientY
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`
      root.classList.add('cursor-visible')
      const target = e.target
      const field = target && target.closest ? target.closest('input, textarea, select') : null
      ring.dataset.state = field ? 'text' : target && target.closest && target.closest(INTERACTIVE) ? 'hover' : ''
    }
    const onLeave = () => root.classList.remove('cursor-visible')
    const onDown = () => ring.classList.add('is-down')
    const onUp = () => ring.classList.remove('is-down')

    const loop = () => {
      rx += (x - rx) * 0.16
      ry += (y - ry) * 0.16
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    return () => {
      cancelAnimationFrame(raf)
      root.classList.remove('has-cursor', 'cursor-visible')
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  return (
    <div className="cursor" aria-hidden="true">
      <div className="cursor__ring" ref={ringRef}><span /></div>
      <div className="cursor__dot" ref={dotRef} />
    </div>
  )
}
