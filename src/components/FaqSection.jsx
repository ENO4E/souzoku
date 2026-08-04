import { useState } from 'react'

const faqs = [
  {
    q: '99,000円で本当に申告できますか？',
    a: '遺産総額4,000万円までの標準的な申告であれば、税込99,000円で対応可能です。土地評価や非上場株式評価など内容によって追加料金が発生する場合は、必ず事前にご説明します。',
  },
  {
    q: '格安価格ですが、品質は大丈夫ですか？',
    a: 'ご安心ください。業務の標準化と相続税申告への特化により、無駄なコストを抑えて格安価格を実現していますが、申告書の作成・税理士による対応内容は変わりません。税理士法33条の2に基づく書面添付も標準的に活用し、税務調査に入られにくい申告書の作成を徹底しています。',
  },
  {
    q: '相談だけでも料金はかかりますか？',
    a: '初回のご相談は無料です。ご契約いただくまで費用は発生しません。',
  },
  {
    q: '申告期限が近いのですが対応できますか？',
    a: 'まずは現在の状況をお聞かせください。期限までの期間が短い案件についても、対応可否を含めてご案内します。',
  },
  {
    q: '堺・大阪以外でも依頼できますか？',
    a: '大阪府内は堺市・大阪市をはじめ全33市、京都府内は京都市をはじめ全15市に対応。兵庫県（神戸市・尼崎市・西宮市・芦屋市など）を中心に、奈良県・滋賀県・和歌山県・三重県までご相談に応じています。オンライン相談も可能です。〈対応可否は案件により異なるため無料相談時にご確認ください〉',
  },
]

export default function FaqSection() {
  const [openSet, setOpenSet] = useState(() => new Set())

  const toggle = (i) => {
    setOpenSet((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <section id="faq">
      <div className="wrap" style={{ maxWidth: 820 }}>
        <div className="section-head fade-in">
          <div className="eyebrow">よくあるご質問</div>
          <h2>ご相談前によく聞かれること</h2>
        </div>
        <div className="fade-in">
          {faqs.map((f, i) => (
            <div className={`faq-item${openSet.has(i) ? ' open' : ''}`} key={f.q}>
              <button type="button" className="faq-q" aria-expanded={openSet.has(i)} aria-controls={`faq-a-${i}`} onClick={() => toggle(i)}><span>{f.q}</span><span className="plus" aria-hidden="true">+</span></button>
              <div className="faq-a" id={`faq-a-${i}`}><p>{f.a}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
