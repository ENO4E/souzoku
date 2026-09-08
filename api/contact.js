// お問い合わせフォームの送信API（Vercel Serverless Function）
//
// 送信先メールアドレス・SMTP認証情報は Vercel の環境変数で設定する（コードには書かない）。
//   CONTACT_TO   … 送信先メールアドレス
//   SMTP_USER    … 送信に使うメールアドレス（例：Gmail アカウント）
//   SMTP_PASS    … そのパスワード（Gmail の場合は「アプリ パスワード」）
//   SMTP_HOST    … 省略時 smtp.gmail.com
//   SMTP_PORT    … 省略時 465（SSL）
import nodemailer from 'nodemailer'

const MAX = { name: 100, tel: 40, email: 200, amount: 50, message: 3000 }

function clean(value, max) {
  return String(value ?? '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max)
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method_not_allowed' })
  }

  const body = typeof req.body === 'string' ? safeJson(req.body) : (req.body || {})

  // ボット対策：人間には見えない入力欄（website）に値があれば静かに成功を返す
  if (clean(body.website, 200)) return res.status(200).json({ ok: true })

  const name = clean(body.name, MAX.name)
  const tel = clean(body.tel, MAX.tel)
  const email = clean(body.email, MAX.email)
  const amount = clean(body.amount, MAX.amount)
  const message = clean(body.message, MAX.message)

  if (!name || !tel) return res.status(400).json({ ok: false, error: 'required' })

  const to = process.env.CONTACT_TO
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!to || !user || !pass) {
    console.error('contact api: CONTACT_TO / SMTP_USER / SMTP_PASS が未設定です')
    return res.status(500).json({ ok: false, error: 'not_configured' })
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user, pass },
  })

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const receivedAt = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
  const text = [
    '相続税申告相談センターのLPから無料相談のお申込みがありました。',
    '',
    `お名前　　　　：${name}`,
    `電話番号　　　：${tel}`,
    `メールアドレス：${email || '未入力'}`,
    `相続財産の概算：${amount || '未選択'}`,
    '',
    'ご相談内容：',
    message || '（未入力）',
    '',
    '----',
    `受信日時：${receivedAt}`,
    `送信元ページ：${req.headers.referer || '不明'}`,
  ].join('\n')

  try {
    await transporter.sendMail({
      from: `"相続税申告相談センター LP" <${user}>`,
      to,
      replyTo: validEmail ? email : undefined,
      subject: `【無料相談のお申込み】${name} 様`,
      text,
    })
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('contact api: send failed', err?.message || err)
    return res.status(502).json({ ok: false, error: 'send_failed' })
  }
}

function safeJson(str) {
  try { return JSON.parse(str) } catch { return {} }
}
