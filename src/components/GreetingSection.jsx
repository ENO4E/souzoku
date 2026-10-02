import { representative, site } from '../content/site.js'

// 代表挨拶：写真はサーバーの assets/ceo1.jpg を使用
export default function GreetingSection() {
  const { name, title, photo } = representative
  const alt = name ? `${site.company} ${title} ${name}` : `${site.company} ${title}`

  return (
    <section id="greeting" className="section greeting" data-scene="3">
      <div className="container greeting__inner">
        <figure className="greeting__photo" data-reveal>
          <div className="greeting__frame">
            <img src={photo} alt={alt} width="480" height="600" loading="lazy" decoding="async" />
          </div>
          <figcaption>
            {name && <b>{name}</b>}
            {site.company}　{title}
          </figcaption>
        </figure>
        <div className="greeting__text">
          <p className="eyebrow" data-reveal>
            <span className="eyebrow__no">05</span>
            <span className="eyebrow__line" />
            <span data-scramble>Message</span>
          </p>
          <h2 className="section-title" data-reveal>
            相続のご不安に、
            <br />
            専門家として誠実に向き合います。
          </h2>
          <div className="greeting__body" data-reveal>
            <p>相続税の申告は、多くの方にとって一生に一度あるかないかの出来事です。大切なご家族を亡くされた直後に、慣れない書類や期限に追われるご負担は決して小さくありません。</p>
            <p>私たちは相続税申告に特化し、大阪を中心に累計200件を超える申告をお手伝いしてきました。料金は最初にすべてご説明し、追加が必要な場合も必ず事前にご相談します。「安さ」だけでなく、税務調査に強い申告書の作成と、分かりやすい説明を大切にしています。</p>
            <p>まずは無料相談で、いまの状況をお聞かせください。何から始めればよいか、私たちが一緒に整理いたします。</p>
          </div>
          <div className="greeting__sign" data-reveal>
            {site.company}
            <b>{name ? `${title}　${name}` : title}</b>
          </div>
        </div>
      </div>
    </section>
  )
}
