import { useState } from 'react'
import SectionHead from './SectionHead.jsx'
import { testimonials } from '../content/site.js'

const VISIBLE_COUNT = 2

export default function TestimonialsSection() {
  const [expanded, setExpanded] = useState(false)
  const hiddenCount = testimonials.length - VISIBLE_COUNT

  return (
    <section id="voice" className="section voice" data-scene="4">
      <div className="container">
        <SectionHead
          no="06"
          en="Voice"
          title={<>ご利用いただいた<br className="sp-only" />お客様の声。</>}
          lead="実際にご相談・ご依頼いただいたお客様からのクチコミです。プライバシーに配慮しイニシャルで掲載しています。（2026年8月1日時点）"
        />
        <p className="g-rating" data-reveal>
          <span className="g-rating__stars" aria-hidden="true">★★★★★</span>
          <b>Google評価 5.0</b>
        </p>
        <ul className="voice-grid" id="voice-list">
          {testimonials.map((t, i) => {
            const collapsed = !expanded && i >= VISIBLE_COUNT
            return (
              <li key={t.name} className="voice-card spotlight" data-reveal hidden={collapsed} style={{ '--d': `${(i % 2) * 90}ms` }}>
                <div className="voice-card__head">
                  <span className="voice-card__avatar" aria-hidden="true">{t.initial}</span>
                  <div>
                    <span className="voice-card__name">{t.name}</span>
                    <span className="voice-card__stars" aria-label="評価 星5つ"><span aria-hidden="true">★★★★★</span></span>
                  </div>
                  <span className="voice-card__source">{t.source}</span>
                </div>
                <blockquote className="voice-card__text">
                  {t.text}
                  {t.translation && <span className="voice-card__translation">{t.translation}</span>}
                </blockquote>
              </li>
            )
          })}
        </ul>
        <div className="voice-more" data-reveal>
          <button type="button" className="btn btn--ghost btn--lg" aria-expanded={expanded} aria-controls="voice-list" onClick={() => setExpanded((v) => !v)}>
            {expanded ? '閉じる' : `他のお客様の声を見る（あと${hiddenCount}件）`}
            <span className="voice-more__icon" aria-hidden="true">{expanded ? '−' : '+'}</span>
          </button>
        </div>
      </div>
    </section>
  )
}
