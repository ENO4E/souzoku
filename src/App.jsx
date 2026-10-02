import Loader from './components/Loader.jsx'
import SceneCanvas from './components/SceneCanvas.jsx'
import Header from './components/Header.jsx'
import SideNav from './components/SideNav.jsx'
import Cursor from './components/Cursor.jsx'
import Effects from './components/Effects.jsx'
import Hero from './components/Hero.jsx'
import PainSection from './components/PainSection.jsx'
import StrengthsSection from './components/StrengthsSection.jsx'
import FeeSection from './components/FeeSection.jsx'
import FlowSection from './components/FlowSection.jsx'
import ReportSection from './components/ReportSection.jsx'
import GreetingSection from './components/GreetingSection.jsx'
import TestimonialsSection from './components/TestimonialsSection.jsx'
import AreaSection from './components/AreaSection.jsx'
import FaqSection from './components/FaqSection.jsx'
import OfficeSection from './components/OfficeSection.jsx'
import ContactSection from './components/ContactSection.jsx'
import Footer from './components/Footer.jsx'
import CtaBottom from './components/CtaBottom.jsx'
import { keywords } from './content/site.js'

function Marquee() {
  return (
    <div className="marquee" aria-label="対応内容">
      <div className="marquee__track">
        {[0, 1].map((k) => (
          <ul key={k} aria-hidden={k === 1 || undefined}>
            {keywords.map((w) => <li key={w}>{w}</li>)}
          </ul>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <a href="#main" className="skip-link">本文へスキップ</a>
      <div className="progress-bar" aria-hidden="true" />
      <Loader />
      <SceneCanvas />
      <Header />
      <SideNav />
      <Cursor />
      <Effects />

      <main id="main">
        <Hero />
        <Marquee />
        <PainSection />
        <StrengthsSection />
        <FeeSection />
        <FlowSection />
        <ReportSection />
        <GreetingSection />
        <TestimonialsSection />
        <AreaSection />
        <FaqSection />
        <OfficeSection />
        <ContactSection />
      </main>

      <Footer />
      <CtaBottom />
    </>
  )
}
