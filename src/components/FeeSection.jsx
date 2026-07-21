const baseFees = [
  { range: '〜4,000万円', fee: '90,000円 ', tax: '（99,000円）' },
  { range: '〜5,000万円', fee: '155,000円 ', tax: '（170,500円）' },
  { range: '〜6,000万円', fee: '220,000円 ', tax: '（242,000円）' },
  { range: '〜7,000万円', fee: '280,000円 ', tax: '（308,000円）' },
  { range: '〜8,000万円', fee: '345,000円 ', tax: '（379,500円）' },
  { range: '〜9,000万円', fee: '410,000円 ', tax: '（451,000円）' },
  { range: '〜1億円', fee: '470,000円 ', tax: '（517,000円）' },
  { range: '1億円超', fee: '別途お見積り', tax: null },
]

const extraFees = [
  { item: '土地評価', fee: '80,000円 ', tax: '（88,000円）／1利用区分' },
  { item: '非上場株式評価', fee: '100,000円 ', tax: '（110,000円）／1社' },
  { item: '相続人加算', fee: '基本報酬の10% ', tax: '（2人目以降1名につき）' },
  { item: '書面添付（税理士法33条の2）', fee: '50,000円 ', tax: '（55,000円）' },
]

const included = [
  '相続税申告書作成', '財産評価', '税額計算', '税務署提出',
  '節税アドバイス', '二次相続シミュレーション', '遺産分割アドバイス', '必要書類のご案内',
]

export default function FeeSection() {
  return (
    <section id="fee">
      <div className="wrap">
        <div className="section-head fade-in">
          <div className="eyebrow">料金体系</div>
          <h2>相続税申告 基本報酬<span style={{ display: 'block', fontSize: 14, fontWeight: 400, color: 'var(--text-sub)', marginTop: 8 }}>業界最安水準の明快な料金表です。税抜価格を太字で、税込価格は右側に小さく表示しています。</span></h2>
        </div>
        <table className="fee-table fade-in">
          <thead>
            <tr><th>遺産総額</th><th>申告料金</th></tr>
          </thead>
          <tbody>
            {baseFees.map((f) => (
              <tr key={f.range}><td>{f.range}</td><td className="amt">{f.fee}{f.tax && <span className="tax-incl">{f.tax}</span>}</td></tr>
            ))}
          </tbody>
        </table>

        <h3 className="serif" style={{ fontSize: 18, margin: '40px 0 16px' }}>追加料金</h3>
        <table className="fee-table fade-in">
          <thead>
            <tr><th>内容</th><th>料金</th></tr>
          </thead>
          <tbody>
            {extraFees.map((f) => (
              <tr key={f.item}><td>{f.item}</td><td className="amt">{f.fee}<span className="tax-incl">{f.tax}</span></td></tr>
            ))}
          </tbody>
        </table>

        <h3 className="serif" style={{ fontSize: 18, margin: '40px 0 16px' }}>基本料金に含まれるサービス</h3>
        <ul className="included-list fade-in">
          {included.map((item) => <li key={item}>{item}</li>)}
        </ul>

        <div className="fee-note">
          ※上記は基本報酬の目安です。土地評価・非上場株式評価・相続人加算・書面添付など、内容に応じて追加料金が発生する場合がありますが、必ず事前にご説明し、ご了承いただいた上で進めます。正式な金額は無料相談時にお見積りいたします。
        </div>
      </div>
    </section>
  )
}
