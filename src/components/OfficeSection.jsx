import SectionHead from './SectionHead.jsx'
import { officeRows } from '../content/site.js'

export default function OfficeSection() {
  return (
    <section id="office" className="section office" data-scene="4">
      <div className="container">
        <SectionHead
          no=""
          en="Office"
          title={<>大阪・南森町の<br className="sp-only" />相続専門税理士法人です。</>}
          lead="ご来所のほか、オンライン相談・出張相談にも対応しています。土日の面談も事前予約で承りますので、お仕事帰りや遠方の方もお気軽にご相談ください。"
        />
        <div className="office-grid">
          <dl className="office-table" data-reveal>
            {officeRows.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
          <div className="office-map" data-reveal style={{ '--d': '90ms' }}>
            <iframe
              src="https://www.google.com/maps?q=大阪府大阪市北区東天満2丁目9-4&output=embed&z=16"
              title="相続税申告相談センターの地図（大阪府大阪市北区東天満2丁目9番4号）"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
