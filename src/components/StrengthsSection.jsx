import SectionHead from './SectionHead.jsx'
import { strengths } from '../content/site.js'

export default function StrengthsSection() {
  return (
    <section id="reasons" className="section strengths" data-scene="2">
      <div className="container">
        <SectionHead
          no="02"
          en="Why Us"
          title={<>相続税申告相談センターが<br />
            <span className="gradient-text">選ばれる理由。</span></>}
          lead="法人税や決算業務と兼任せず、相続税申告に専門特化したチームで対応します。"
        />
        <ul className="strength-list">
          {strengths.map((s, i) => (
            <li key={s.en} className="strength" data-reveal style={{ '--d': `${i * 70}ms` }}>
              <span className="strength__index">{String(i + 1).padStart(2, '0')}</span>
              <div className="strength__head">
                <p className="strength__en">{s.en}</p>
                <h3>{s.title}</h3>
              </div>
              <p className="strength__text">{s.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
