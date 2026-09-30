import { useState } from 'react'

// ===== お問い合わせフォーム送信 =====
// 送信はサーバー側のプログラムが行い、送信先メールアドレスはページやJSには一切含めない。
//   お名前.com 等の PHP サーバー … /web/contact/（server/onamae/web/contact/index.php）＋ contact-config.php
//   Vercel                      … /web/contact/ を api/contact.js に書き換え（vercel.json）＋ 環境変数
const CONTACT_ENDPOINT = '/web/contact/'

const amountOptions = ['選択してください', '〜5,000万円', '5,000万円〜1億円', '1億円〜2億円', '2億円〜3億円', '3億円以上', 'まだわからない']

export default function ContactSection() {
  const [name, setName] = useState('')
  const [tel, setTel] = useState('')
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState(amountOptions[0])
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('') // ボット対策用の非表示項目（人間は入力しない）
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState({ color: '', text: '' })
  // 送信完了情報（サーバーからのメッセージ・受付番号）。null の間はフォームを表示
  const [done, setDone] = useState(null)

  const submitContactForm = async () => {
    if (!name.trim() || !tel.trim()) {
      setStatus({ color: '#9B4B3E', text: 'お名前と電話番号は必須項目です。' })
      return
    }

    setSending(true)
    setStatus({ color: '', text: '' })

    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          tel: tel.trim(),
          email: email.trim(),
          amount: amount === amountOptions[0] ? '' : amount,
          message: message.trim(),
          website,
        }),
      })
      const data = await res.json().catch(() => ({}))
      // 成功判定：HTTP 2xx（200 / 201 など）で、サーバーが明示的に失敗を返していないこと
      //   例）{"ok":true} / {"message":"送信が完了しました","id":829}
      const failed = !res.ok || data.ok === false || (data.error && data.ok !== true)
      if (failed) throw new Error(data.error || data.message || `HTTP ${res.status}`)

      if (typeof window.gtag === 'function') window.gtag('event', 'contact_submit', { form: 'free_consultation' })
      setDone({
        message: typeof data.message === 'string' && data.message.trim() ? data.message.trim() : '送信が完了しました',
        id: data.id !== undefined && data.id !== null && data.id !== '' ? String(data.id) : '',
      })
      setName('')
      setTel('')
      setEmail('')
      setAmount(amountOptions[0])
      setMessage('')
      // 完了メッセージが見えるようにスクロール
      setTimeout(() => {
        const el = document.getElementById('contact-done')
        if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
    } catch (error) {
      setStatus({ color: '#9B4B3E', text: '送信に失敗しました。恐れ入りますがお電話でもご連絡ください。' })
      console.error('contact form error:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="contact" style={{ background: '#EEF0F3' }}>
      <div className="wrap contact-wrap">
        <div className="contact-side fade-in">
          <div className="eyebrow">お問い合わせ</div>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>無料相談のご予約はこちらから</h2>
          <div className="info-item">
            <div className="ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
            <div><h4>お電話でのご相談</h4><p>06-6354-8220<br />受付（平日9:00〜18:00）<br />土日の面談は事前予約で対応可能です</p></div>
          </div>
          <div className="info-item">
            <div className="ico"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg></div>
            <div><h4>フォームでのご相談</h4><p>24時間受付。1営業日以内にご連絡します。</p></div>
          </div>
          <div className="info-item">
            <div className="ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
            <div><h4>拠点</h4><p>〒530-0044　大阪府大阪市北区東天満2丁目9番4号5階</p></div>
          </div>
        </div>

        {done ? (
          <div className="form-card form-done fade-in" id="contact-done" role="status" aria-live="polite">
            <div className="form-done-icon" aria-hidden="true">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            </div>
            <h3>{done.message}</h3>
            <p>ご入力いただいた内容を受け付けました。<br />担当者より<b>1営業日以内</b>にご連絡いたしますので、しばらくお待ちください。</p>
            {done.id && <div className="form-done-id">受付番号：<b>{done.id}</b></div>}
            <p className="form-done-note">お急ぎの場合は、お電話（<a href="tel:0663548220">06-6354-8220</a>／平日9:00〜18:00）でもご連絡いただけます。</p>
            <button type="button" className="form-done-again" onClick={() => { setDone(null); setStatus({ color: '', text: '' }) }}>続けて別のお問い合わせをする</button>
          </div>
        ) : (
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
          {/* ボット対策（ハニーポット）：画面には表示されず、人間は入力しない */}
          <div className="form-hp" aria-hidden="true">
            <label htmlFor="f-website">Website</label>
            <input type="text" id="f-website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
          <button type="button" className="btn btn-primary form-submit" disabled={sending} onClick={submitContactForm}>
            {sending ? '送信中…' : '無料相談を予約する'}
          </button>
          <p role="alert" style={{ fontSize: 13, marginTop: 12, textAlign: 'center', color: status.color || undefined }}>{status.text}</p>
        </div>
        )}
      </div>
    </section>
  )
}
