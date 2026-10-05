import { Arrow } from '../components/SectionHead.jsx'
import { site } from '../content/site.js'

const panels = [
  {
    route: 'service',
    no: '01',
    en: 'Service',
    scene: 0,
    title: <>大阪・京都・兵庫の相続税申告を、<br /><em className="gradient-text">基本報酬 99,000円</em>から。</>,
    lead: '京阪神で最安水準の料金。相続専門の税理士法人が、初回無料相談から申告完了まで一気通貫で対応します。料金表・選ばれる理由・お客様の声はこちら。',
    cta: 'サービスと料金を見る',
    tags: ['料金表', '選ばれる理由', 'ご相談の流れ', 'お客様の声', '対応エリア'],
  },
  {
    route: 'simulation',
    no: '02',
    en: 'Simulation',
    scene: 3,
    title: <>相続税額を、<br />その場で<em className="gradient-text">試算</em>。</>,
    lead: '遺産総額と相続人の状況を入れるだけで、相続税額の目安と当センターの基本報酬がすぐに分かります。二次相続まで含めた詳しい試算は、報告書（ご希望の方）でお渡しします。',
    cta: 'シミュレーションする',
    tags: ['基礎控除', '相続税の総額', '配偶者の税額軽減', '報告書サンプル'],
  },
  {
    route: 'contact',
    no: '03',
    en: 'Contact',
    scene: 4,
    title: <>まずは、<br /><em className="gradient-text">無料相談</em>から。</>,
    lead: '初回相談は無料、ご契約まで費用はかかりません。フォームは24時間受付、1営業日以内にご連絡します。お電話・オンライン・出張相談にも対応。',
    cta: '無料相談を予約する',
    tags: ['初回相談無料', '1営業日以内に返信', 'オンライン相談', `電話 ${site.tel}`],
  },
]

/** ホーム：3つの全画面パネル。クリックで各ページへ遷移する */
export default function HomeView() {
  return (
    <div className="home">
      {panels.map((p, i) => (
        <section key={p.route} id={`p-${p.route}`} className={`panel panel--${p.route}${i === 0 ? ' panel--first' : ''}`} data-scene={p.scene}>
          <a href={`/${p.route}/`} className="panel__link" aria-label={`${p.en}：${p.cta}`}>
            <span className="panel__index" aria-hidden="true">{p.no}</span>
            <div className="container panel__inner">
              <p className="eyebrow" data-reveal>
                <span className="eyebrow__no">{p.no}</span>
                <span className="eyebrow__line" />
                <span data-scramble>{p.en}</span>
              </p>
              <span className="panel__en" aria-hidden="true" data-reveal>{p.en}</span>
              {i === 0
                ? <h1 className="panel__title" data-reveal style={{ '--d': '90ms' }}>{p.title}</h1>
                : <h2 className="panel__title" data-reveal style={{ '--d': '90ms' }}>{p.title}</h2>}
              <p className="panel__lead" data-reveal style={{ '--d': '180ms' }}>{p.lead}</p>
              <ul className="panel__tags" data-reveal style={{ '--d': '240ms' }}>
                {p.tags.map((t) => <li key={t}>{t}</li>)}
              </ul>
              <span className="panel__cta" data-reveal style={{ '--d': '300ms' }}>
                <span className="panel__cta-circle"><Arrow /></span>
                {p.cta}
              </span>
            </div>
          </a>
          {i === 0 && (
            <span className="scroll-cue" aria-hidden="true">
              <span>Scroll</span>
              <i />
            </span>
          )}
        </section>
      ))}
    </div>
  )
}
