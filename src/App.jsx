import { useEffect } from 'react'
import CtaBottom from './components/CtaBottom.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import PainSection from './components/PainSection.jsx'
import TaxCalcSection from './components/TaxCalcSection.jsx'
import StrengthsSection from './components/StrengthsSection.jsx'
import AreaSection from './components/AreaSection.jsx'
import FeeSection from './components/FeeSection.jsx'
import FlowSection from './components/FlowSection.jsx'
import FaqSection from './components/FaqSection.jsx'
import ContactSection from './components/ContactSection.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.12 })
    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <CtaBottom />
      <div className="disclaimer-banner">※本ページはLPドラフトです。代表者写真・対応エリア（奈良・滋賀・和歌山・三重）の対応可否は最終確認をお願いします。</div>
      <Header />
      <Hero />
      <PainSection />
      <TaxCalcSection />
      <StrengthsSection />
      <AreaSection />
      <FeeSection />
      <FlowSection />
      <FaqSection />
      <ContactSection />
      <Footer />
    </>
  )
}
