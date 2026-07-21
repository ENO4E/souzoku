const steps = [
  { num: '01', title: '無料相談予約', text: '電話・フォームから日程を調整します。オンライン相談も可能です。' },
  { num: '02', title: 'お見積り・ご契約', text: '財産状況をヒアリングし、報酬額と対応範囲をご提示します。' },
  { num: '03', title: '財産調査・評価', text: '不動産・有価証券等を調査し、適正な評価額を算定します。' },
  { num: '04', title: '申告書作成・提出', text: '内容をご確認いただいたうえで税務署へ申告書を提出します。' },
]

export default function FlowSection() {
  return (
    <section style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="section-head fade-in">
          <div className="eyebrow">ご相談の流れ</div>
          <h2>初回相談から申告完了まで</h2>
        </div>
        <div className="flow fade-in">
          {steps.map((s) => (
            <div className="flow-step" key={s.num}>
              <div className="fn">{s.num}</div>
              <h4>{s.title}</h4>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
