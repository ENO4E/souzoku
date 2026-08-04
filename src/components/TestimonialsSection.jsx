// お客様の声：Googleクチコミに実際に投稿された内容（2026年8月1日時点・評価★5.0）
const testimonials = [
  {
    name: 'akikazu mizoguchi 様',
    source: 'Google クチコミ',
    text: '両親が亡くなった時に大変お世話になりました。相続の事で悩んでた先輩にも教えたら、とても喜んでもらえてこちらも鼻が高かったです。その後も色々と相談に乗っていただき助かっています。',
  },
  {
    name: 'takako hayashi 様',
    source: 'Google クチコミ',
    text: 'とてもわかりやすい説明で、不安が取り除かれました。ありがとうございました♪',
  },
  {
    name: '明石のり子 様',
    source: 'Google クチコミ',
    text: '以前、初めて贈与税に関する事で相談をさせて頂いたんですが、全く知識のない私にも、分かりやすく丁寧に説明して下さり、問題が解決しました。有難うございました。又、分からない事がありましたら、お願いしたいと考えております。その時は、宜しくお願いします。',
  },
  {
    name: '細谷真知子 様',
    source: 'Google クチコミ',
    text: '初めての依頼でしたが、とても丁寧に説明していただき、安心してお任せできました。今後もお願いしたいと思います。',
  },
  {
    name: '相続でご相談のお客様',
    source: 'ご利用者アンケート',
    text: 'すぐに答えられないときでも、期限を切ってきちんと連絡いただけますし、大変助かっています。ありがとうございます。',
  },
]

export default function TestimonialsSection() {
  return (
    <section id="voice">
      <div className="wrap">
        <div className="section-head fade-in">
          <div className="eyebrow">お客様の声</div>
          <h2>ご利用いただいたお客様の声</h2>
          <p>
            <span className="g-rating"><span className="g-stars" aria-hidden="true">★★★★★</span><b>Google評価 5.0</b></span>
            実際にご相談・ご依頼いただいたお客様からのクチコミです。（2026年8月1日時点）
          </p>
        </div>
        <div className="testimonial-grid fade-in">
          {testimonials.map((t) => (
            <figure className="testimonial-card" key={t.name}>
              <div className="t-stars" aria-label="評価 星5つ"><span aria-hidden="true">★★★★★</span></div>
              <blockquote className="t-text">{t.text}</blockquote>
              <figcaption className="t-meta">{t.name}<span className="t-source">{t.source}</span></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
