import SectionHead from './SectionHead.jsx'
import { steps } from '../content/site.js'

export default function FlowSection() {
  return (
    <section id="flow" className="section process" data-scene="3">
      <div className="container">
        <SectionHead
          no="04"
          en="Process"
          title={<>初回相談から、<br className="sp-only" />申告完了まで。</>}
          lead="電話・フォームでご予約いただいた後は、ヒアリングから申告書の提出まで、当センターが窓口となって進めます。"
        />
        <ol className="timeline" data-progress>
          <span className="timeline__rail" aria-hidden="true"><span className="timeline__fill" /></span>
          {steps.map((s, i) => (
            <li key={s.no} className="timeline__item" data-reveal style={{ '--d': `${i * 60}ms` }}>
              <span className="timeline__dot" aria-hidden="true" />
              <div className="timeline__card">
                <p className="timeline__step">STEP <b>{s.no}</b></p>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                <p className="timeline__output"><span>Output</span>{s.output}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
