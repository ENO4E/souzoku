import SectionHead from './SectionHead.jsx'
import { faqs } from '../content/site.js'

export default function FaqSection() {
  return (
    <section id="faq" className="section faq" data-scene="4">
      <div className="container container--narrow">
        <SectionHead no="08" en="FAQ" title="よくあるご質問" />
        <div className="faq-list">
          {faqs.map((f) => (
            <details key={f.q} className="faq-item" data-reveal>
              <summary>
                <span className="faq-item__q" aria-hidden="true">Q</span>
                <span className="faq-item__text">{f.q}</span>
                <span className="faq-item__icon" aria-hidden="true" />
              </summary>
              <div className="faq-item__a"><p>{f.a}</p></div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
