// 代表挨拶：写真はサーバーの assets/ceo1.jpg を使用
// 氏名・肩書きが決まったら REPRESENTATIVE を更新する（name が空の間は肩書きだけを表示）
const REPRESENTATIVE = {
  name: '',
  title: '代表社員 税理士',
  office: 'タックス・プラン税理士法人',
}

export default function GreetingSection() {
  const { name, title, office } = REPRESENTATIVE
  const alt = name ? `${office} ${title} ${name}` : `${office} ${title}`

  return (
    <section id="greeting" className="greeting-section">
      <div className="wrap">
        <div className="greeting-grid">
          <figure className="greeting-photo fade-in">
            <div className="greeting-photo-frame">
              <img src="/assets/ceo1.jpg" alt={alt} width="480" height="600" loading="lazy" decoding="async" />
            </div>
            <figcaption>
              {name && <b>{name}</b>}
              {office}　{title}
            </figcaption>
          </figure>
          <div className="greeting-text fade-in">
            <div className="eyebrow">代表よりご挨拶</div>
            <h2>相続のご不安に、専門家として<br />誠実に向き合います。</h2>
            <p>相続税の申告は、多くの方にとって一生に一度あるかないかの出来事です。大切なご家族を亡くされた直後に、慣れない書類や期限に追われるご負担は決して小さくありません。</p>
            <p>私たちは相続税申告に特化し、大阪を中心に累計200件を超える申告をお手伝いしてきました。料金は最初にすべてご説明し、追加が必要な場合も必ず事前にご相談します。「安さ」だけでなく、税務調査に強い申告書の作成と、分かりやすい説明を大切にしています。</p>
            <p>まずは無料相談で、いまの状況をお聞かせください。何から始めればよいか、私たちが一緒に整理いたします。</p>
            <div className="greeting-sign">
              {office}
              <b>{name ? `${title}　${name}` : title}</b>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
