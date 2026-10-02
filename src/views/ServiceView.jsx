import { PageHead, NextNav } from './PageParts.jsx'
import PainSection from '../components/PainSection.jsx'
import StrengthsSection from '../components/StrengthsSection.jsx'
import FeeSection from '../components/FeeSection.jsx'
import FlowSection from '../components/FlowSection.jsx'
import GreetingSection from '../components/GreetingSection.jsx'
import TestimonialsSection from '../components/TestimonialsSection.jsx'
import AreaSection from '../components/AreaSection.jsx'
import FaqSection from '../components/FaqSection.jsx'
import { keywords } from '../content/site.js'

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

/** 01 Service：サービス・料金（従来のLP本文） */
export default function ServiceView() {
  return (
    <>
      <PageHead
        no="01"
        en="Service"
        scene={0}
        title={<>相続税申告を、<br /><em className="gradient-text">99,000円から。</em><br />明快に、専門家が。</>}
        lead="「何から手をつければいいか分からない」「税理士費用が高そう」。そんな不安からでも大丈夫です。累計200件超の相続税申告実績を持つ相続専門の税理士法人が、初回無料相談から申告完了まで丁寧にサポートします。"
      />
      <div className="page-head__actions container" data-reveal>
        <a href="/contact/" className="btn btn--primary btn--lg">無料相談を予約する</a>
        <a href="/service/#fee" className="btn btn--ghost btn--lg">料金表を見る</a>
        <a href="/simulation/" className="btn btn--ghost btn--lg">税額シミュレーション</a>
      </div>
      <Marquee />
      <PainSection />
      <StrengthsSection />
      <FeeSection />
      <FlowSection />
      <GreetingSection />
      <TestimonialsSection />
      <AreaSection />
      <FaqSection />
      <NextNav
        items={[
          { href: '/simulation/', no: '02', en: 'Simulation', title: '相続税額をその場で試算する' },
          { href: '/contact/', no: '03', en: 'Contact', title: '無料相談を予約する' },
        ]}
      />
    </>
  )
}
