import { useState } from 'react'
import emailjs from '@emailjs/browser'

// ===== EmailJS お問い合わせフォーム送信 =====
// 以下3つの値を、EmailJSのダッシュボードで取得したものに書き換えてください。
//   1) YOUR_PUBLIC_KEY  … Account > General > Public Key
//   2) YOUR_SERVICE_ID  … Email Services で作成したサービスのID
//   3) YOUR_TEMPLATE_ID … Email Templates で作成したテンプレートのID
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'

emailjs.init(EMAILJS_PUBLIC_KEY)

const amountOptions = ['選択してください', '〜5,000万円', '5,000万円〜1億円', '1億円〜2億円', '2億円〜3億円', '3億円以上', 'まだわからない']

export default function ContactSection() {
  const [name, setName] = useState('')
  const [tel, setTel] = useState('')
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState(amountOptions[0])
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState({ color: '', text: '' })

  const submitContactForm = () => {
    if (!name.trim() || !tel.trim()) {
      setStatus({ color: '#9B4B3E', text: 'お名前と電話番号は必須項目です。' })
      return
    }

    setSending(true)
    setStatus({ color: '', text: '' })

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      from_name: name.trim(),
      from_tel: tel.trim(),
      from_email: email.trim() || '未入力',
      amount: amount,
      message: message.trim(),
      to_email: 'info@tax-plan.net',
    }).then(() => {
      setStatus({ color: '#2E7D4F', text: '送信しました。1営業日以内に担当者よりご連絡いたします。' })
      setName('')
      setTel('')
      setEmail('')
      setMessage('')
      setSending(false)
    }, (error) => {
      setStatus({ color: '#9B4B3E', text: '送信に失敗しました。恐れ入りますがお電話でもご連絡ください。' })
      setSending(false)
      console.error('EmailJS error:', error)
    })
  }

  return (
    <section id="contact" style={{ background: '#EEF0F3' }}>
      <div className="wrap contact-wrap">
        <div className="contact-side fade-in">
          <div className="eyebrow">お問い合わせ</div>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>無料相談のご予約はこちらから</h2>
          <div className="info-item">
            <div className="ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
            <div><h4>お電話でのご相談</h4><p>06-6354-8220<br />受付（平日9:00〜18:00）</p></div>
          </div>
          <div className="info-item">
            <div className="ico"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg></div>
            <div><h4>フォームでのご相談</h4><p>info@tax-plan.net<br />24時間受付。1営業日以内にご連絡します。</p></div>
          </div>
          <div className="info-item">
            <div className="ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
            <div><h4>拠点</h4><p>〒530-0044　大阪府大阪市北区東天満2丁目9番4号5階</p></div>
          </div>
        </div>

        <div className="form-card fade-in">
          <div className="form-row">
            <label htmlFor="f-name">お名前<span className="req">必須</span></label>
            <input type="text" id="f-name" placeholder="山田 太郎" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-row">
            <label htmlFor="f-tel">電話番号<span className="req">必須</span></label>
            <input type="tel" id="f-tel" placeholder="090-0000-0000" value={tel} onChange={(e) => setTel(e.target.value)} />
          </div>
          <div className="form-row">
            <label htmlFor="f-email">メールアドレス</label>
            <input type="email" id="f-email" placeholder="example@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-row">
            <label htmlFor="f-amount">相続財産の概算総額</label>
            <select id="f-amount" value={amount} onChange={(e) => setAmount(e.target.value)}>
              {amountOptions.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="f-message">ご相談内容</label>
            <textarea id="f-message" placeholder="相続の状況や気になる点をご記入ください" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <button type="button" className="btn btn-primary form-submit" disabled={sending} onClick={submitContactForm}>
            {sending ? '送信中…' : '無料相談を予約する'}
          </button>
          <p style={{ fontSize: 13, marginTop: 12, textAlign: 'center', color: status.color || undefined }}>{status.text}</p>
        </div>
      </div>
    </section>
  )
}
