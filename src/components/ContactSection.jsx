import { useEffect, useState } from 'react'
import { Arrow } from './SectionHead.jsx'
import { amountOptions, site } from '../content/site.js'
import { event } from '../beacon.js'

// ===== お問い合わせフォーム送信 =====
// 送信はサーバー側のプログラムが行い、送信先メールアドレスはページやJSには一切含めない。
//   本番（お名前.com） … /web/contact/ はサーバー上の既存バックエンド（backend/v1.php）が処理（このリポジトリの管理外）
//                        成功時: 201 {"message":"送信が完了しました","id":829}
//   Vercel（プレビュー）… /web/contact/ を api/contact.js に書き換え（vercel.json）＋ 環境変数
const CONTACT_ENDPOINT = '/web/contact/'

// 面談のご希望日時（任意・3つまで）。受付時間は平日9:00〜18:00、土日は事前予約で対応
const TIME_SLOTS = ['9:00〜12:00', '12:00〜15:00', '15:00〜18:00', '時間はいつでも可']
const EMPTY_SLOTS = [{ date: '', time: '' }, { date: '', time: '' }, { date: '', time: '' }]
const WEEK = ['日', '月', '火', '水', '木', '金', '土']

/** '2026-10-10' → '2026年10月10日（土）' */
function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  const w = WEEK[new Date(y, m - 1, d).getDay()]
  return `${y}年${m}月${d}日（${w}）`
}

/** 入力された希望日時を、ご相談内容の末尾に付ける文章にする（サーバー側の項目を増やさずにメールへ載せるため） */
function slotsText(slots) {
  const lines = slots
    .map((x, i) => (x.date || x.time ? `第${i + 1}希望：${x.date ? formatDate(x.date) : '日付指定なし'}${x.time ? `　${x.time}` : ''}` : ''))
    .filter(Boolean)
  return lines.length ? `【面談のご希望日時】\n${lines.join('\n')}` : ''
}

/** 明日の日付（YYYY-MM-DD）。日付欄で今日以前を選べないようにする */
function tomorrowIso() {
  const t = new Date()
  t.setDate(t.getDate() + 1)
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}

export default function ContactSection() {
  const [name, setName] = useState('')
  const [tel, setTel] = useState('')
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [slots, setSlots] = useState(EMPTY_SLOTS)
  // 日付の下限はブラウザで決める（ビルド時の日付を HTML に焼き込まない）
  const [minDate, setMinDate] = useState(undefined)
  useEffect(() => { setMinDate(tomorrowIso()) }, [])
  const setSlot = (i, key, value) => setSlots((prev) => prev.map((x, j) => (j === i ? { ...x, [key]: value } : x)))
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
        body: JSON.stringify({
          name: name.trim(),
          tel: tel.trim(),
          email: email.trim(),
          amount,
          // 面談の希望日時はご相談内容の末尾に付けて送る（受け取り側の項目は変えない）
          message: [message.trim(), slotsText(slots)].filter(Boolean).join('\n\n'),
        }),
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
      // 自前のアクセス解析。受付番号（client_data の id）を付けると、イントラでこのお問い合わせに至った閲覧の流れを見られる（プライバシーポリシーの「3.」「7.」に記載）
      const id = Number(result.id)
      event('form_submit', Number.isInteger(id) && id > 0 ? { form: 'contact', id } : { form: 'contact' })
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
    setSlots(EMPTY_SLOTS)
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
              <fieldset className="field slots">
                <legend className="field__label">面談のご希望日時<span className="field__opt">任意・3つまで</span></legend>
                <p className="slots__note">平日9:00〜18:00。土日のご面談も事前予約で承ります。来所・オンライン・ご自宅への訪問のご希望はご相談内容にお書きください。</p>
                {slots.map((x, i) => (
                  <div className="slots__row" key={i}>
                    <span className="slots__no">第{i + 1}希望</span>
                    <input
                      type="date"
                      name={`date${i + 1}`}
                      aria-label={`第${i + 1}希望の日付`}
                      min={minDate}
                      value={x.date}
                      onChange={(e) => setSlot(i, 'date', e.target.value)}
                    />
                    <select
                      name={`time${i + 1}`}
                      aria-label={`第${i + 1}希望の時間帯`}
                      value={x.time}
                      onChange={(e) => setSlot(i, 'time', e.target.value)}
                    >
                      <option value="">時間帯</option>
                      {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                ))}
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
              <p className="form__privacy">ご入力いただいた情報は、<a href="/privacy/">プライバシーポリシー</a>に従い、ご相談への回答・ご連絡のために使用します（あわせて、お問い合わせに至るまでの当サイトの閲覧状況を、ご提案とサイトの改善に役立てます）。</p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
