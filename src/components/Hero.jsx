import { useState } from 'react'
import ReportMockup from './ReportMockup.jsx'

// Fee simulator — actual base fee schedule
const tiers = [
  { label: '〜4,000万円', fee: '90,000円〜', tax: '（税込99,000円）' },
  { label: '〜5,000万円', fee: '155,000円〜', tax: '（税込170,500円）' },
  { label: '〜6,000万円', fee: '220,000円〜', tax: '（税込242,000円）' },
  { label: '〜7,000万円', fee: '280,000円〜', tax: '（税込308,000円）' },
  { label: '7,000万円超', fee: '要お見積り', tax: '（正式な金額は無料相談時にご提示します）' },
]

export default function Hero() {
  const [simIndex, setSimIndex] = useState(1)
  const tier = tiers[simIndex]

  return (
    <section className="hero">
      <div className="hero-photo" aria-hidden="true" />
      <div className="wrap hero-grid">
        <div>
          <div className="eyebrow">相続税申告 専門｜基本料99,000円〜</div>
          <h1 className="serif">相続税申告を、<br /><span className="accent">99,000円からの</span>明快な料金で。<br />実績豊富な専門税理士法人が対応します。</h1>
          <p className="lead">「何から手をつければいいか分からない」「税理士費用が高そう」——そんな不安からでも大丈夫です。累計200件超の相続税申告実績を持つ相続専門の税理士が、初回無料相談から申告完了まで丁寧にサポートします。</p>
          <div className="hero-actions">
            <a href="#contact" className="btn btn-primary btn-lg">無料相談を予約する</a>
            <a href="#fee" className="btn btn-outline btn-lg">料金表を見る</a>
          </div>
          <div className="hero-badge-row">
            <svg className="laurel-badge" viewBox="0 0 140 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="申告件数200件以上の実績">
              <g fill="var(--gold)">
                <ellipse cx="25" cy="122" rx="7" ry="16" transform="rotate(-55 25 122)" />
                <ellipse cx="17" cy="102" rx="7" ry="16" transform="rotate(-38 17 102)" />
                <ellipse cx="13" cy="80" rx="7" ry="16" transform="rotate(-18 13 80)" />
                <ellipse cx="14" cy="58" rx="7" ry="16" transform="rotate(4 14 58)" />
                <ellipse cx="21" cy="38" rx="7" ry="16" transform="rotate(24 21 38)" />
                <ellipse cx="33" cy="24" rx="7" ry="15" transform="rotate(44 33 24)" />
                <ellipse cx="115" cy="122" rx="7" ry="16" transform="rotate(55 115 122)" />
                <ellipse cx="123" cy="102" rx="7" ry="16" transform="rotate(38 123 102)" />
                <ellipse cx="127" cy="80" rx="7" ry="16" transform="rotate(18 127 80)" />
                <ellipse cx="126" cy="58" rx="7" ry="16" transform="rotate(-4 126 58)" />
                <ellipse cx="119" cy="38" rx="7" ry="16" transform="rotate(-24 119 38)" />
                <ellipse cx="107" cy="24" rx="7" ry="15" transform="rotate(-44 107 24)" />
              </g>
              <text x="70" y="72" textAnchor="middle" fontFamily="'Shippori Mincho',serif" fontWeight="700" fontSize="15" fill="var(--gold-soft)">申告件数</text>
              <text x="70" y="108" textAnchor="middle" fontFamily="'Shippori Mincho',serif" fontWeight="800" fontSize="40" fill="#fff">200</text>
              <text x="70" y="126" textAnchor="middle" fontFamily="'Noto Sans JP',sans-serif" fontWeight="700" fontSize="13" fill="var(--gold-soft)">件以上の実績</text>
              <text x="70" y="142" textAnchor="middle" fontSize="14" fill="var(--gold)">★ ★ ★</text>
            </svg>
            <div className="hero-badge-text">
              <span className="k">相続専門の税理士が</span>
              <span className="k">安心価格でサポート</span>
            </div>
          </div>

          <div className="trust-row">
            <div className="trust-item"><b>200件超</b>累計相続税申告実績</div>
            <div className="trust-item"><b>総相談件数</b>2,000件以上</div>
            <div className="trust-item"><b>関西一円</b>大阪・兵庫・京都・奈良・滋賀・和歌山・三重</div>
          </div>

          <div className="feature-icons">
            <div className="feature-icon"><span className="fi-glyph">¥0</span><span className="fi-label">初回相談<br />無料</span></div>
            <div className="feature-icon"><span className="fi-glyph"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold-soft)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></svg></span><span className="fi-label">明朗会計<br />追加料金は事前説明</span></div>
            <div className="feature-icon"><span className="fi-glyph"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold-soft)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></span><span className="fi-label">専門家が<br />直接対応</span></div>
            <div className="feature-icon"><span className="fi-glyph"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold-soft)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg></span><span className="fi-label">関西一円<br />対応</span></div>
          </div>
        </div>

        <div className="hero-side">
        <div className="simulator">
          <h3>かんたん料金シミュレーター</h3>
          <p className="note">相続財産の概算額を選ぶと、報酬の目安レンジが表示されます</p>
          <div className="sim-value">
            <span>相続財産の総額（目安）</span>
            <b>{tier.label}</b>
          </div>
          <input
            type="range"
            min="0"
            max="4"
            step="1"
            aria-label="相続財産の総額（目安）"
            value={simIndex}
            onChange={(e) => setSimIndex(Number(e.target.value))}
          />
          <div className="sim-result">
            <div className="label">基本報酬の目安</div>
            <div className="amount">{tier.fee}</div>
            <div className="sim-tax">{tier.tax}</div>
          </div>
          <div className="sim-disclaimer">※基本報酬の目安です。土地評価・非上場株式評価・相続人加算等は別途料金となります。正式な金額は無料相談時にお見積りいたします。</div>
        </div>

        <a href="#tax-calc" className="hero-report">
          <ReportMockup size="compact" />
          <div className="hero-report-text">
            <span className="hero-report-label">無料相談でお渡し</span>
            <b>相続税額計算結果報告書</b>
            <span>財産一覧・一次相続の試算・二次相続シミュレーションまで、あなた専用の報告書を作成します。</span>
          </div>
        </a>
        </div>
      </div>
    </section>
  )
}
