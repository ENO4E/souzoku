/**
 * アクセス解析（beacon）。自サイトの /web/beacon/ へ閲覧・操作の記録を送る（Google アナリティクスと併用）。
 * 受け口は TaxPlan-org/php（taxplan_log に保存し、イントラの /api/beacon/stats/ で集計する）。仕様は php リポジトリの docs/beacon.md
 *
 * - pageview：ページの表示・遷移（参照元・utm・広告のクリックID の種類）
 * - leave：ページを離れた・タブを隠した（滞在時間・画面を見ていた時間・スクロールの深さ・表示速度（Core Web Vitals））
 * - event：操作（data-beacon の付いた要素・電話/メールのリンク・外部リンク・ファイルのダウンロード・フォームの入力開始/送信）
 * - 訪問者ID は localStorage、セッションID は sessionStorage のランダムな UUID。Cookie は使わない。外部サービスへ送らない
 * - 氏名・メールアドレス・電話番号・フォームの入力値は送らない（フォームは「入力を始めた」「送信した」ことだけ）
 * - 送らない：自動操作のブラウザ・追跡拒否（Do Not Track / GPC）・?tp_optout=1 で開いた端末（社員の端末など。?tp_optout=0 で戻す）
 * - 送信の失敗はページの動作に影響させない
 */
const ENDPOINT = '/web/beacon/'
const OPTOUT_KEY = 'tp_optout'
const DOWNLOAD = /\.(pdf|zip|docx?|xlsx?|pptx?|csv)$/i

const uuid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

const stored = (storage, key) => {
  try {
    let v = storage.getItem(key)
    if (!v) {
      v = uuid()
      storage.setItem(key, v)
    }
    return v
  } catch {
    return undefined; // プライベートモードなどで storage が使えない
  }
}

let disabled = null
const isDisabled = () => {
  if (disabled !== null) return disabled
  if (typeof window === 'undefined') return true
  try {
    const q = new URLSearchParams(location.search).get(OPTOUT_KEY)
    if (q === '1') localStorage.setItem(OPTOUT_KEY, '1')
    if (q === '0') localStorage.removeItem(OPTOUT_KEY)
    if (localStorage.getItem(OPTOUT_KEY) === '1') return (disabled = true)
  } catch {
    /* storage が使えなくても計測は続ける */
  }
  return (disabled = navigator.webdriver === true || navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true)
}

/* ---------- 表示1回分の状態 ---------- */
let view = null
let lastUrl = null; // SPA の遷移では、直前のページを参照元にする
let hardLoad = true

const send = (data) => {
  if (isDisabled()) return
  try {
    const body = JSON.stringify({
      visitor: stored(localStorage, 'tp_visitor'),
      session: stored(sessionStorage, 'tp_session'),
      pv: view?.id,
      ...data,
    })
    if (navigator.sendBeacon?.(ENDPOINT, body)) return
    fetch(ENDPOINT, { method: 'POST', body, keepalive: true }).catch(() => {})
  } catch {
    /* 解析の失敗はページに影響させない */
  }
}

/* ---------- 表示速度（Core Web Vitals。最初に開いたページの leave に付ける） ---------- */
const vitals = {}
let vitalsSent = false

const observe = (type, cb, opts = {}) => {
  try {
    new PerformanceObserver((list) => cb(list.getEntries())).observe({ type, buffered: true, ...opts })
  } catch {
    /* 対応していないブラウザ */
  }
}

const startVitals = () => {
  const nav = performance.getEntriesByType?.('navigation')[0]
  if (nav && nav.responseStart > 0) vitals.ttfb = nav.responseStart
  observe('paint', (es) => es.forEach((e) => e.name === 'first-contentful-paint' && (vitals.fcp = e.startTime)))
  observe('largest-contentful-paint', (es) => (vitals.lcp = es[es.length - 1].startTime))
  // CLS：1秒以内に続くずれを最大5秒までまとめ、最も大きいまとまりの値
  let win = 0
  let first = 0
  let last = 0
  observe('layout-shift', (es) =>
    es.forEach((e) => {
      const s = e
      if (s.hadRecentInput) return
      if (win && s.startTime - last < 1000 && s.startTime - first < 5000) win += s.value
      else [win, first] = [s.value, s.startTime]
      last = s.startTime
      vitals.cls = Math.max(vitals.cls ?? 0, win)
    }),
  )
  // INP：操作から次の描画までの最も長い時間
  const onInput = (es) =>
    es.forEach((e) => {
      if (e.interactionId) vitals.inp = Math.max(vitals.inp ?? 0, e.duration)
    })
  observe('first-input', onInput)
  observe('event', onInput, { durationThreshold: 40 })
}

const scrollDepth = () => {
  const height = Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight ?? 0)
  return height > 0 ? Math.min(100, Math.round(((scrollY + innerHeight) / height) * 100)) : 100
}

/**
 * スクロールの深さを測る。表示から1秒以内（遷移後のページ先頭への自動スクロール）と、
 * 画面がもう次のページに変わっているとき（SPA の遷移の直後、まだ leave を送る前）は測らない
 */
const SETTLE_MS = 1000
const onScroll = () => {
  if (!view || location.pathname !== view.path || Date.now() - view.shownAt < SETTLE_MS) return
  view.scroll = Math.max(view.scroll ?? 0, scrollDepth())
}

/**
 * そのページの滞在を送る（前回の送信からの差分。同じ pv の leave を足すと、その表示の合計になる）
 * measure：今の画面でスクロールの深さを測る（SPA の遷移では画面が次のページに変わっているので測らない）
 */
const flush = (measure = true) => {
  if (!view) return
  const now = Date.now()
  const duration = now - view.flushedAt
  if (duration < 300) return; // 直前に送ったばかり（visibilitychange の直後の pagehide など）
  const engaged = view.engaged + (view.visibleSince !== null ? now - view.visibleSince : 0)
  if (measure) onScroll()
  const data = { type: 'leave', path: view.path, duration, engaged }
  if (view.scroll !== null) data.scroll = view.scroll
  if (view.first && !vitalsSent && Object.keys(vitals).length > 0) {
    data.vitals = { ...vitals }
    vitalsSent = true
  }
  send(data)
  view.flushedAt = now
  view.engaged = 0
  view.visibleSince = document.visibilityState === 'visible' ? now : null
}

/** ページの表示・遷移のたびに呼ぶ */
export const pageview = () => {
  if (view) flush(false)
  const now = Date.now()
  const params = new URLSearchParams(location.search)
  const utm = {}
  for (const key of ['source', 'medium', 'campaign', 'term', 'content']) {
    const v = params.get(`utm_${key}`)
    if (v) utm[key] = v
  }
  const clid = ['gclid', 'yclid', 'msclkid', 'fbclid'].find((k) => params.has(k)); // 種類だけ。値は送らない

  view = {
    id: uuid(),
    path: location.pathname,
    shownAt: now,
    flushedAt: now,
    visibleSince: document.visibilityState === 'visible' ? now : null,
    engaged: 0,
    scroll: null, // スクロールしたとき・表示から少し後・離れるときに測る
    forms: new Set(),
    first: hardLoad,
  }
  hardLoad = false
  send({
    type: 'pageview',
    path: view.path,
    title: document.title,
    referrer: lastUrl ?? document.referrer,
    screen: `${screen.width}x${screen.height}`,
    lang: navigator.language,
    ...(Object.keys(utm).length > 0 && { utm }),
    ...(clid && { clid }),
  })
  lastUrl = location.origin + location.pathname
  const current = view
  setTimeout(() => view === current && onScroll(), SETTLE_MS + 500); // スクロールしなくても、最初に見えている範囲を記録する
}

/** 次のページへ移る直前に呼ぶ（SPA の遷移。src/main.jsx が route:change で呼ぶ） */
export const leave = () => {
  flush(false)
  view = null
}

export const event = (name, props) => {
  send({ type: 'event', path: view?.path ?? location.pathname, name, props })
}

/* ---------- 操作の自動計測 ---------- */
const labelOf = (el) =>
  (el.dataset.beaconLabel ?? el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 100)

/**
 * クリック
 * - data-beacon 属性の付いた要素 → event(属性の値, { label: data-beacon-label })（サーバーコンポーネントでも属性を付けるだけで計測できる）
 *     <a href='#contact' data-beacon='cta_click' data-beacon-label='ヒーロー'>…</a>
 * - tel:・mailto: のリンク → tel_click・mail_click（電話番号・メールアドレスそのものは送らない）
 * - PDF などのファイル → file_download { file: パス }、外部サイトへのリンク → outbound_click { host: ホスト名 }
 */
const onClick = (e) => {
  const target = e.target
  if (!target?.closest) return

  const marked = target.closest('[data-beacon]')
  if (marked?.dataset.beacon) {
    const label = labelOf(marked)
    event(marked.dataset.beacon, label ? { label } : undefined)
    return
  }

  const link = target.closest('a[href]')
  if (!link) return
  if (link.protocol === 'tel:' || link.protocol === 'mailto:') {
    const label = labelOf(link)
    event(link.protocol === 'tel:' ? 'tel_click' : 'mail_click', label ? { label } : undefined)
    return
  }
  if (link.protocol !== 'https:' && link.protocol !== 'http:') return
  const own = link.hostname === location.hostname
  if (DOWNLOAD.test(link.pathname)) {
    event('file_download', { file: own ? link.pathname : link.hostname + link.pathname })
  } else if (!own) {
    event('outbound_click', { host: link.hostname })
  }
}

/**
 * フォームの入力開始（表示1回・フォームごとに1回）。名前は <form data-beacon-form='contact'> → id → name の順
 * 送信成功は各フォームで event('form_submit', { form: 'contact', id: 登録番号 }) を送る
 */
const onFocusIn = (e) => {
  const form = e.target?.closest?.('form')
  if (!form || !view) return
  const name = form.dataset.beaconForm || form.id || form.getAttribute('name') || 'form'
  if (view.forms.has(name)) return
  view.forms.add(name)
  event('form_start', { form: name })
}

const onVisibility = () => {
  if (!view) return
  if (document.visibilityState === 'hidden') {
    flush(); // スマホでアプリを切り替えたまま閉じられても、ここまでの滞在は届く
    view.visibleSince = null
  } else {
    view.visibleSince = Date.now()
  }
}

let started = false

/** 1回だけ呼ぶ（src/main.jsx） */
export const start = () => {
  if (started || typeof window === 'undefined' || isDisabled()) return
  started = true
  startVitals()
  let ticking = false
  addEventListener(
    'scroll',
    () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        onScroll()
      })
    },
    { passive: true },
  )
  document.addEventListener('click', onClick, { capture: true })
  document.addEventListener('focusin', onFocusIn, { capture: true })
  document.addEventListener('visibilitychange', onVisibility)
  addEventListener('pagehide', () => flush())
}
