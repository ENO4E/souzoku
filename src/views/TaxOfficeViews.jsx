import { site } from '../content/site.js'
import { TAX_OFFICE_NOTE } from '../content/taxOffices.js'
import { Arrow } from '../components/SectionHead.jsx'

/** 税務署ごとのページ（/zeimusho/<slug>/）。「〇〇税務署 相続税申告」の検索と AI 検索に、管轄区域・所在地・申告の出し方を1ページで答える。
 *  office … taxOffices.js の1件。areaLinks … 管轄区域のうち市区町村ページがあるもの [{ city, path, topic }] */
export function taxOfficeFaqs(office) {
  const n = office.name
  return [
    { q: `${n}に提出するのは、どんな場合ですか？`, a: `亡くなった方の最後の住所地が${n}の管轄区域（${[...office.areas, ...office.extra].join('・')}）にある場合です。相続人の住所地は関係ありません。相続人が遠方に住んでいても、提出先は${n}です。` },
    { q: `${n}に行かずに相続税の申告はできますか？`, a: 'できます。税理士に依頼すれば電子申告（e-Tax）で提出するので来署は不要です。ご自身で提出する場合も、郵送（通信日付印の日が提出日）や時間外収受箱への投函ができます。納税は金融機関の窓口、ダイレクト納付、クレジットカード納付などで行えます。' },
    { q: `${n}で相続税の相談はできますか？`, a: '税務署では申告書の書き方や制度の一般的な案内を受けられますが、土地の評価を下げる検討や、特例が使える分け方、二次相続まで見た設計といった個別の相談は税務署の仕事ではありません。当センターの初回相談は無料で、財産の概要が分かれば申告の要否と費用の目安をその場でお伝えします。' },
  ]
}

export function TaxOfficeView({ office, areaLinks = [] }) {
  if (!office) return null
  const faqs = taxOfficeFaqs(office)
  const allAreas = [...office.areas, ...office.extra]
  return (
    <>
      <section className="page-head page-head--article page-head--area" data-scene="2">
        <div className="container">
          <nav className="breadcrumb" aria-label="パンくず">
            <ol>
              <li><a href="/">Home</a></li>
              <li><a href="/zeimusho/">税務署から探す</a></li>
              <li aria-current="page">{office.name}</li>
            </ol>
          </nav>
          <p className="eyebrow" data-reveal>
            <span className="eyebrow__line" />
            <span data-scramble>Tax Office</span>
          </p>
          <h1 className="page-head__title page-head__title--area" data-reveal style={{ '--d': '90ms' }}>
            {office.name}で相続税申告をする方へ<br />
            <span className="gradient-text">管轄区域・所在地・申告書の出し方</span>
          </h1>
          <p className="page-head__lead area-lead" data-reveal style={{ '--d': '180ms' }}>
            {office.name}は、{allAreas.join('・')}にお住まいだった方の相続税申告書の提出先です。申告書は亡くなった方の最後の住所地を管轄する税務署に、相続の開始を知った日の翌日から10か月以内に提出します。{site.name}（大阪市北区・南森町）は{office.name}管内の相続税申告を基本報酬99,000円（税込）からお受けし、電子申告で提出するため税務署へ行く必要はありません。初回相談は無料です。
          </p>
          <div className="area-actions" data-reveal style={{ '--d': '240ms' }}>
            <a href="/contact/" className="btn btn--primary btn--lg" data-beacon="cta_click" data-beacon-label={`税務署:${office.name}`}>無料相談を予約する<Arrow /></a>
            <a href="/simulation/" className="btn btn--ghost btn--lg">相続税をシミュレーション</a>
          </div>
        </div>
      </section>

      <section className="section area-page" data-scene="2">
        <div className="container container--narrow">
          <dl className="area-facts glass" aria-label={`${office.name}の概要`}>
            <div><dt>所在地</dt><dd>〒{office.postal} {office.address}</dd></div>
            <div><dt>電話</dt><dd>{office.tel}</dd></div>
            <div><dt>管轄区域</dt><dd>{allAreas.join('、')}{office.note ? `（${office.note}）` : ''}</dd></div>
            <div><dt>提出方法</dt><dd>窓口・郵送・時間外収受箱・電子申告（e-Tax）</dd></div>
            <div><dt>申告期限</dt><dd>相続の開始を知った日の翌日から10か月以内（土日祝なら翌平日）</dd></div>
            <div><dt>当センターの対応</dt><dd>基本報酬99,000円（税込）〜。電子申告で提出。訪問・オンライン対応</dd></div>
          </dl>
          <p className="sim-guide__note">{TAX_OFFICE_NOTE}</p>

          <h2 className="area-h2">{office.name}への相続税申告書の出し方</h2>
          <div className="prose">
            <ul>
              <li><b>提出先の決まり方</b>：亡くなった方の最後の住所地で決まります。相続人がどこに住んでいても、{office.name}の管内に住んでいた方の申告は{office.name}へ提出します</li>
              <li><b>提出の方法</b>：窓口に持参するほか、郵送（通信日付印の日付が提出日）、閉庁時は時間外収受箱に投函できます。税理士に依頼すれば電子申告（e-Tax）で提出するため、来署は不要です</li>
              <li><b>添付する書類</b>：被相続人の出生から死亡までの戸籍（または法定相続情報一覧図）、遺産分割協議書か遺言の写し、相続人の印鑑証明書、マイナンバーの確認書類、財産の評価の根拠資料（残高証明書、登記事項証明書、固定資産税評価証明書など）</li>
              <li><b>納税</b>：申告期限と同じ日までに、金融機関の窓口、ダイレクト納付、クレジットカード納付、コンビニ納付（30万円以下）などで納めます。税務署の窓口でも納付できます</li>
              <li><b>税務署でできること・できないこと</b>：申告書の書き方や制度の一般的な案内は受けられますが、土地の評価を下げる検討、特例が使える分け方、二次相続まで見た設計は税務署の仕事ではありません。相続税がかかりそうな方は、申告書を作る前に税理士に相談してください</li>
            </ul>
          </div>

          {areaLinks.length > 0 && (
            <>
              <h2 className="area-h2">{office.name}管内の市区町村の相続の特徴</h2>
              <p className="sim-guide__lead">管内の市区町村ごとに、多い財産の型と評価のポイント、費用の目安をまとめたページがあります。</p>
              <ul className="area-hub__grid">
                {areaLinks.map((a) => (
                  <li key={a.path}><a href={a.path}><b>{a.city}</b><small>{a.topic}</small></a></li>
                ))}
              </ul>
            </>
          )}

          <h2 className="area-h2">よくある質問</h2>
          <div className="area-faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>

          <h2 className="area-h2">{office.name}管内の相続税申告のご相談</h2>
          <p className="sim-guide__lead">
            {site.name}（運営：{site.company}）は、相続税申告に特化した税理士法人です。{office.name}管内のご自宅への訪問とオンライン面談に対応し、来所は多くて2回程度、資料は郵送で進められます。申告の基本報酬は99,000円（税込・遺産総額4,000万円まで）からで、<a href="/service/#fee">料金表</a>に加算の単位を公開しています。相続税がかかるかどうかは<a href="/simulation/">相続税シミュレーション</a>で確かめられます。
          </p>
          <div className="sim-guide__cta">
            <a href="/contact/" className="btn btn--primary btn--lg" data-beacon="cta_click" data-beacon-label={`税務署下部:${office.name}`}>無料相談を予約する<Arrow /></a>
            <a href="/zeimusho/" className="btn btn--ghost btn--lg">ほかの税務署を見る</a>
          </div>
        </div>
      </section>
    </>
  )
}

/** 税務署の一覧（/zeimusho/）。offices … [{ slug, name, pref, path, areas, extra }] */
export function TaxOfficeHubView({ offices = [] }) {
  const prefs = [...new Set(offices.map((o) => o.pref))]
  return (
    <>
      <section className="page-head page-head--article page-head--area" data-scene="2">
        <div className="container">
          <nav className="breadcrumb" aria-label="パンくず">
            <ol>
              <li><a href="/">Home</a></li>
              <li aria-current="page">税務署から探す</li>
            </ol>
          </nav>
          <p className="eyebrow" data-reveal>
            <span className="eyebrow__line" />
            <span data-scramble>Tax Office</span>
          </p>
          <h1 className="page-head__title page-head__title--area" data-reveal style={{ '--d': '90ms' }}>
            税務署から探す相続税申告<br />
            <span className="gradient-text">大阪・兵庫・京都の{offices.length}署の管轄区域と申告の出し方</span>
          </h1>
          <p className="page-head__lead area-lead" data-reveal style={{ '--d': '180ms' }}>
            相続税の申告書は、亡くなった方の最後の住所地を管轄する税務署に提出します。税務署ごとに管轄区域・所在地・申告書の出し方と、管内の市区町村の相続の特徴をまとめました。{site.name}は電子申告で提出するため、どの税務署が管轄でも来署は不要です。
          </p>
        </div>
      </section>

      <section className="section area-page area-hub" data-scene="2">
        <div className="container">
          {prefs.map((pref) => (
            <div key={pref} className="area-hub__region">
              <h2 className="area-h2">{pref}の税務署</h2>
              <ul className="area-hub__grid">
                {offices.filter((o) => o.pref === pref).map((o) => (
                  <li key={o.slug}><a href={o.path}><b>{o.name}</b><small>{[...o.areas, ...o.extra].join('・')}</small></a></li>
                ))}
              </ul>
            </div>
          ))}
          <p className="sim-guide__note">{TAX_OFFICE_NOTE}</p>
        </div>
      </section>
    </>
  )
}
