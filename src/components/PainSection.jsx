const iconProps = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'var(--gold)', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' }

const pains = [
  {
    num: '01',
    title: '申告期限まで時間がない',
    text: '相続税は10ヶ月以内の申告・納税が必要です。相続発生から時間が経つほど、選べる対応策が狭まっていきます。',
    icon: <svg {...iconProps}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2" /><path d="M9 2h6" /><path d="M19 5l1.5 1.5" /></svg>,
  },
  {
    num: '02',
    title: '不動産の評価が分からない',
    text: '土地の評価方法次第で税額が大きく変わります。路線価・補正・特例の知識が申告の精度を左右します。',
    icon: <svg {...iconProps}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></svg>,
  },
  {
    num: '03',
    title: '遺産分割で揉めている',
    text: '分割協議が進まないと申告にも影響します。税理士だけで解決できない場合は、提携の弁護士・司法書士と連携します。',
    icon: <svg {...iconProps}><circle cx="8" cy="8" r="3" /><circle cx="16" cy="8" r="3" /><path d="M2.5 20a5.5 5.5 0 0 1 11 0" /><path d="M10.5 20a5.5 5.5 0 0 1 11 0" /></svg>,
  },
  {
    num: '04',
    title: '税務調査が心配',
    text: '相続税は税務調査の対象になりやすい税目です。根拠のある申告書と書面添付制度で、追徴のリスクを抑えます。',
    icon: <svg {...iconProps}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><circle cx="11" cy="14" r="2.5" /><path d="M13 16l2.5 2.5" /></svg>,
  },
]

export default function PainSection() {
  return (
    <section id="pain">
      <div className="wrap">
        <div className="section-head fade-in">
          <div className="eyebrow">こんなお悩みはありませんか</div>
          <h2>相続税申告で、多くの方がつまずく4つのポイント</h2>
          <p>ひとつでも当てはまる場合は、早めのご相談をおすすめします。期限が近いほど選べる選択肢が減っていきます。</p>
        </div>
        <div className="pain-grid fade-in">
          {pains.map((p) => (
            <div className="pain-card" key={p.num}>
              <div className="pain-icon">{p.icon}</div>
              <div>
                <div className="num">つまずき {p.num}</div>
                <h4>{p.title}</h4>
                <p>{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
