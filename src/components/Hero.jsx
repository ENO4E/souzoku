import { Arrow } from './SectionHead.jsx'

export default function Hero() {
  return (
    <section id="top" className="hero" data-scene="0">
      <div className="container hero__inner">
        <p className="hero__eyebrow" data-reveal>
          <span className="pulse" aria-hidden="true" />
          大阪の相続税申告 専門<span className="pc-only">&nbsp;／ Inheritance Tax Filing</span>
        </p>
        <h1 className="hero__title">
          <span className="line" data-reveal style={{ '--d': '80ms' }}>
            <span>相続税申告を、</span>
          </span>
          <span className="line" data-reveal style={{ '--d': '200ms' }}>
            <span><em className="gradient-text">99,000円から。</em></span>
          </span>
          <span className="line" data-reveal style={{ '--d': '320ms' }}>
            <span>明快に、専門家が。</span>
          </span>
        </h1>
        <p className="hero__lead" data-reveal style={{ '--d': '460ms' }}>
          「何から手をつければいいか分からない」「税理士費用が高そう」。そんな不安からでも大丈夫です。
          <br className="pc-only" />
          累計200件超の相続税申告実績を持つ相続専門の税理士法人が、初回無料相談から申告完了まで丁寧にサポートします。
        </p>
        <div className="hero__actions" data-reveal style={{ '--d': '580ms' }}>
          <a href="#contact" className="btn btn--primary btn--lg">
            無料相談を予約する
            <Arrow />
          </a>
          <a href="#fee" className="btn btn--ghost btn--lg">料金表を見る</a>
        </div>
        <ul className="hero__meta" data-reveal style={{ '--d': '700ms' }}>
          <li>初回相談無料</li>
          <li>追加料金は事前説明</li>
          <li>大阪・兵庫・京都 一円対応</li>
          <li>オンライン相談可</li>
        </ul>
        <dl className="hero__stats" data-reveal style={{ '--d': '820ms' }}>
          <div>
            <dt>相続税申告 実績</dt>
            <dd><b>200</b><span>件超</span></dd>
          </div>
          <div>
            <dt>総相談件数</dt>
            <dd><b>2,000</b><span>件以上</span></dd>
          </div>
          <div>
            <dt>基本報酬（税込）</dt>
            <dd><b>99,000</b><span>円〜</span></dd>
          </div>
        </dl>
      </div>
      <a href="#pain" className="scroll-cue" aria-label="下へスクロール">
        <span>Scroll</span>
        <i aria-hidden="true" />
      </a>
    </section>
  )
}
