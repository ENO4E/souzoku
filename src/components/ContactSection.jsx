import { useState } from 'react'
import { Arrow } from './SectionHead.jsx'
import { amountOptions, site } from '../content/site.js'
import { event } from '../beacon.js'

// ===== お問い合わせフォーム送信 =====
// 送信はサーバー側のプログラムが行い、送信先メールアドレスはページやJSには一切含めない。
//   本番（お名前.com） … /web/contact/ はサーバー上の既存バックエンド（backend/v1.php）が処理（このリポジトリの管理外）
//                        成功時: 201 {"message":"送信が完了しました","id":829}
//   Vercel（プレビュー）… /web/contact/ を api/contact.js に書き換え（vercel.json）＋ 環境変数
const CONTACT_ENDPOINT = '/web/contact/'

export default function ContactSection() {
  const [name, setName] = useState('')
  const [tel, setTel] = useState('')
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  // 送信完了情報（サーバーからのメッセージ・受付番号）。null の間はフォームを表示
  const [done, setDone] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !tel.trim()) {
      setError('お名前と電話番号は必須項目です。')
      return
    }
    setSending(true)
    setError('')

    let result = null
    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: name.trim(), tel: tel.trim(), email: email.trim(), amount, message: message.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      // 成功判定：HTTP 2xx（200 / 201 など）で、サーバーが明示的に失敗を返していないこと
      //   例）{"ok":true} / {"message":"送信が完了しました","id":829}
      const failed = !res.ok || data.ok === false || (data.error && data.ok !== true)
      if (failed) throw new Error(`HTTP ${res.status}${data.error || data.message ? `: ${data.error || data.message}` : ''}`)
      result = data
    } catch (err) {
      // 原因の切り分けができるよう、ステータスやエラー種別を小さく添える
      const detail = err && err.message ? String(err.message).slice(0, 60) : ''
      setError(`送信に失敗しました。恐れ入りますがお電話でもご連絡ください。${detail ? `（${detail}）` : ''}`)
      console.error('contact form error:', err)
      setSending(false)
      return
    }

    // ここから下はサーバーが成功を返した後の画面更新。万一例外が出ても「失敗」とは表示しない
    setSending(false)
    try {
      if (typeof window.gtag === 'function') window.gtag('event', 'contact_submit', { form: 'free_consultation' })
      // 自前のアクセス解析。このサイトではお問い合わせの内容と閲覧の記録を結び付けないので、受付番号（id）は送らない
      event('form_submit', { form: 'contact' })
    } catch { /* 計測の失敗は無視 */ }
    setDone({
      message: typeof result.message === 'string' && result.message.trim() ? result.message.trim() : '送信が完了しました',
      id: result.id !== undefined && result.id !== null && result.id !== '' ? String(result.id) : '',
    })
    setName('')
    setTel('')
    setEmail('')
    setAmount('')
    setMessage('')
    setTimeout(() => {
      const el = document.getElementById('contact-done')
      if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)
  }

  return (
    <section id="contact" className="section contact" data-scene="4">
      <div className="container contact__inner">
        <div className="contact__intro">
          <p className="eyebrow" data-reveal>
            <span className="eyebrow__line" />
            <span data-scramble>Free consultation</span>
          </p>
          <h2 className="section-title" data-reveal>
            まずは無料相談で、
            <br />
            費用と進め方を。
          </h2>
          <p className="section-lead" data-reveal>
            初回相談は無料。ご契約いただくまで費用は一切かかりません。申告期限が迫っている方も、まずは現在の状況をお聞かせください。
          </p>
          <ul className="contact__points" data-reveal>
            <li>初回のご相談は無料です</li>
            <li>フォームは24時間受付・1営業日以内にご連絡します</li>
            <li>オンライン相談・出張相談に対応しています</li>
            <li>土日の面談は事前予約で承ります</li>
          </ul>
          <a href={site.telHref} className="contact__tel" data-reveal>
            <span className="contact__tel-label">お電話でのご相談（{site.hours}）</span>
            <b>{site.tel}</b>
          </a>
        </div>

        <div className="contact__form glass" data-reveal>
          {done ? (
            <div className="form-done" id="contact-done" role="status" aria-live="polite">
              <div className="form-done__icon" aria-hidden="true">
                <svg viewBox="0 0 48 48" width="56" height="56">
                  <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M15 24.5l6 6 12-13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>{done.message}</h3>
              <p>ご入力いただいた内容を受け付けました。<br />担当者より<b>1営業日以内</b>にご連絡いたしますので、しばらくお待ちください。</p>
              {done.id && <p className="form-done__id">受付番号：<b>{done.id}</b></p>}
              <p className="form-done__note">お急ぎの場合は、お電話（<a href={site.telHref}>{site.tel}</a>／{site.hours}）でもご連絡いただけます。</p>
              <button type="button" className="form-done__again" onClick={() => { setDone(null); setError('') }}>続けて別のお問い合わせをする</button>
            </div>
          ) : (
            <form className="form" onSubmit={submit} noValidate data-beacon-form="contact">
              <div className="form__row">
                <label className="field">
                  <span className="field__label">お名前<em>必須</em></span>
                  <input type="text" name="name" autoComplete="name" placeholder="山田 太郎" value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label className="field">
                  <span className="field__label">電話番号<em>必須</em></span>
                  <input type="tel" name="tel" autoComplete="tel" inputMode="tel" placeholder="090-0000-0000" value={tel} onChange={(e) => setTel(e.target.value)} />
                </label>
              </div>
              <label className="field">
                <span className="field__label">メールアドレス</span>
                <input type="email" name="email" autoComplete="email" inputMode="email" placeholder="example@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <fieldset className="field">
                <legend className="field__label">相続財産の概算総額</legend>
                <div className="chips">
                  {amountOptions.map((o) => (
                    <label key={o} className="chip">
                      <input type="radio" name="amount" value={o} checked={amount === o} onChange={() => setAmount(o)} />
                      <span>{o}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="field">
                <span className="field__label">ご相談内容</span>
                <textarea name="message" rows={5} placeholder="相続の状況や気になる点をご記入ください。まとまっていなくても構いません。" value={message} onChange={(e) => setMessage(e.target.value)} />
              </label>
              {error && <p className="form__alert" role="alert">{error}</p>}
              <button type="submit" className="btn btn--primary btn--lg form__submit" disabled={sending}>
                {sending ? '送信しています…' : '無料相談を予約する'}
                <Arrow />
              </button>
              <p className="form__privacy">ご入力いただいた情報は、ご相談への回答・ご連絡のためにのみ使用します。</p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
