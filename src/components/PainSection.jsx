const pains = [
  { num: '01', title: '申告期限まで時間がない', text: '10ヶ月以内の申告・納税が必要。相続発生から時間が経つほど、対応できる選択肢が狭まります。' },
  { num: '02', title: '不動産の評価が分からない', text: '土地の評価方法次第で税額が大きく変わります。評価の専門知識が申告の精度を左右します。' },
  { num: '03', title: '遺産分割で揉めている', text: '分割協議が進まないと申告にも影響します。税理士だけで解決できない場合は提携士業と連携します。' },
  { num: '04', title: '税務調査が心配', text: '相続税は税務調査の対象になりやすい税目です。根拠のある申告書の作成で追徴リスクを抑えます。' },
]

export default function PainSection() {
  return (
    <section id="pain">
      <div className="wrap">
        <div className="section-head fade-in">
          <div className="eyebrow">こんなお悩みはありませんか</div>
          <h2>相続税申告で、多くの方がつまずくポイントです</h2>
          <p>ひとつでも当てはまる場合は、早めのご相談をおすすめします。期限が近いほど選べる選択肢が減っていきます。</p>
        </div>
        <div className="pain-grid fade-in">
          {pains.map((p) => (
            <div className="pain-card" key={p.num}>
              <div className="num">{p.num}</div>
              <h4>{p.title}</h4>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
