// お客様の声：Googleクチコミに実際に投稿された内容（2026年8月1日時点・評価★5.0）
// 掲載名はプライバシーに配慮しイニシャル表記
const testimonials = [
  {
    name: 'A.M 様',
    avatar: 'A',
    color: '#24365C',
    source: 'Google クチコミ',
    text: '両親が亡くなった時に大変お世話になりました。相続の事で悩んでた先輩にも教えたら、とても喜んでもらえてこちらも鼻が高かったです。その後も色々と相談に乗っていただき助かっています。',
  },
  {
    name: 'T.H 様',
    avatar: 'T',
    color: '#9B4B3E',
    source: 'Google クチコミ',
    text: 'とてもわかりやすい説明で、不安が取り除かれました。ありがとうございました♪',
  },
  {
    name: 'N.A 様',
    avatar: 'N',
    color: '#2E7D4F',
    source: 'Google クチコミ',
    text: '以前、初めて贈与税に関する事で相談をさせて頂いたんですが、全く知識のない私にも、分かりやすく丁寧に説明して下さり、問題が解決しました。有難うございました。又、分からない事がありましたら、お願いしたいと考えております。その時は、宜しくお願いします。',
  },
  {
    name: 'M.H 様',
    avatar: 'M',
    color: '#B08D57',
    source: 'Google クチコミ',
    text: '初めての依頼でしたが、とても丁寧に説明していただき、安心してお任せできました。今後もお願いしたいと思います。',
  },
  {
    name: '相続でご相談のお客様',
    avatar: '相',
    color: '#5B6474',
    source: 'ご利用者アンケート',
    text: '前の税理士事務所ではレスポンスが悪かったのですが、今はすぐに返信をくれるので安心できます。すぐに答えられないときでも、期限を切ってきちんと連絡いただけますし、大変助かっています。ありがとうございます。',
  },
  {
    name: '英語でご相談のお客様',
    avatar: 'E',
    color: '#3A4E76',
    source: 'ご利用者アンケート',
    text: 'We were very satisfied with the excellent customer service and clear communication. Your kindness and professionalism made us feel confident and comfortable from start to finish.',
    translation: '（日本語訳）素晴らしいカスタマーサービスと分かりやすいコミュニケーションに大変満足しています。親切でプロフェッショナルな対応のおかげで、最初から最後まで安心してお任せできました。',
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
            実際にご相談・ご依頼いただいたお客様からのクチコミです。プライバシーに配慮しイニシャルで掲載しています。（2026年8月1日時点）
          </p>
        </div>
        <div className="testimonial-grid fade-in">
          {testimonials.map((t) => (
            <figure className="testimonial-card" key={t.name}>
              <div className="t-head">
                <span className="t-avatar" style={{ background: t.color }} aria-hidden="true">{t.avatar}</span>
                <div className="t-head-text">
                  <span className="t-name">{t.name}</span>
                  <span className="t-stars" aria-label="評価 星5つ"><span aria-hidden="true">★★★★★</span></span>
                </div>
              </div>
              <blockquote className="t-text">
                {t.text}
                {t.translation && <span className="t-translation">{t.translation}</span>}
              </blockquote>
              <figcaption className="t-meta"><span className="t-source">{t.source}</span></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
