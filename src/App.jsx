import { useEffect } from 'react'
import CtaBottom from './components/CtaBottom.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import PainSection from './components/PainSection.jsx'
import TaxCalcSection from './components/TaxCalcSection.jsx'
import StrengthsSection from './components/StrengthsSection.jsx'
import TestimonialsSection from './components/TestimonialsSection.jsx'
import AreaSection from './components/AreaSection.jsx'
import FeeSection from './components/FeeSection.jsx'
import FlowSection from './components/FlowSection.jsx'
import MidCtaSection from './components/MidCtaSection.jsx'
import FaqSection from './components/FaqSection.jsx'
import OfficeSection from './components/OfficeSection.jsx'
import ContactSection from './components/ContactSection.jsx'
import Footer from './components/Footer.jsx'

// GA4 イベント送信（gtag 未ロード時は何もしない）
function track(eventName, params) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params)
  }
}

export default function App() {
  // 電話番号リンクのタップを計測（広告のコンバージョン指標）
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('a[href^="tel:"]')
      if (a) track('phone_click', { link_url: a.getAttribute('href') })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  // Scroll reveal：画面外の要素だけを一旦隠し、画面に入ったら表示する。
  // 初期表示中の要素は一度も隠さない（ちらつき防止）。JSが動かない環境では何も隠れない
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.remove('pending')
          e.target.classList.add('visible')
          observer.unobserve(e.target)
        } else if (!e.target.classList.contains('visible')) {
          e.target.classList.add('pending')
        }
      })
    }, { threshold: 0.12 })
    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <CtaBottom />
      <Header />
      <Hero />
      <PainSection />
      <TaxCalcSection />
      <StrengthsSection />
      <TestimonialsSection />
      <AreaSection />
      <FeeSection />
      <FlowSection />
      <MidCtaSection />
      <FaqSection />
      <OfficeSection />
      <ContactSection />
      <Footer />
    </>
  )
}
