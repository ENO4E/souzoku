import SectionHead from './SectionHead.jsx'
import { pains } from '../content/site.js'

export default function PainSection() {
  return (
    <section id="pain" className="section problems" data-scene="1">
      <div className="container">
        <SectionHead
          no="01"
          en="Problems"
          title={<>相続税申告で、多くの方が<br className="sp-only" />つまずく4つのポイント。</>}
          lead="ひとつでも当てはまる場合は、早めのご相談をおすすめします。期限が近いほど選べる選択肢が減っていきます。"
        />
        <ul className="problem-grid">
          {pains.map((p, i) => (
            <li key={p.title} className="problem-card spotlight" data-reveal style={{ '--d': `${(i % 2) * 90}ms` }}>
              <span className="problem-card__no">つまずき {String(i + 1).padStart(2, '0')}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </li>
          ))}
        </ul>
        <div className="insight" data-reveal>
          <p className="insight__label">Insight</p>
          <p className="insight__text">
            相続税は、<strong>「期限」</strong>と<strong>「評価」</strong>で
            <br className="sp-only" />
            結果が変わります。
          </p>
          <p className="insight__sub">
            だからこそ、相続税申告に特化したチームが、最初のご相談から申告完了までを一気通貫で引き受けます。まずは現在の状況をお聞かせください。
          </p>
        </div>
      </div>
    </section>
  )
}
