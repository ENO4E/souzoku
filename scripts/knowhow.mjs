// 社内ノウハウ（/knowhow/）を作る。原稿（Markdown）→ HTML → 暗号化 → public/knowhow/
//
// このリポジトリは公開なので、原稿（平文）と合言葉はコミットしない。コミットするのは暗号文だけ。
// ページを開いて合言葉を入れると、ブラウザの中で復号して表示する
// （PBKDF2-SHA256 60万回で鍵を作り、AES-256-GCM で復号。合言葉が違えば復号できない）。
//
// 使い方（合言葉は環境変数で渡す）
//   node scripts/knowhow.mjs check   <原稿フォルダ>              … 原稿の書式を確かめる（合言葉は不要）
//   node scripts/knowhow.mjs preview <原稿フォルダ> <出力フォルダ> … 暗号化しない確認用ページを作る（リポジトリの外に出す）
//   KNOWHOW_PASSWORD=... node scripts/knowhow.mjs build   <原稿フォルダ> … public/knowhow/ と content/knowhow.enc を作る
//   KNOWHOW_PASSWORD=... node scripts/knowhow.mjs extract <出力フォルダ> … content/knowhow.enc から原稿を取り出す（編集用）
//
// 原稿フォルダ
//   skills.json        … 領域とスキル項目（ID・名前・必須/発展・一人前目標）
//   pages/home.html    … トップの冒頭（見出し・リード）
//   pages/roadmap.html … ロードマップのページ
//   lessons/<ID>.md    … コンテンツ1本＝1ファイル（書き方は README の「原稿の書き方」と下の renderBlock）
//
// 直すとき：extract で取り出す → 直す → check → preview で見る → build → 取り出した原稿は消す（コミットしない）
// 合言葉を変えるとき：旧合言葉で extract → KNOWHOW_NEW=1 を付けて新合言葉で build（新しい salt になる）
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, rmSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, relative, join } from 'node:path'
import { pbkdf2Sync, createHmac, createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { Marked } from 'marked'
import { CSS, JS } from './knowhow-shell.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = resolve(root, 'public/knowhow')
const SRC_ENC = resolve(root, 'content/knowhow.enc')
const ITERATIONS = 600000 // 端末で約0.5〜1秒。総当たりを遅くするための回数
const LEVEL_NAMES = ['未経験', '知識', '補助', '自立', '指導']

const [mode, arg1, arg2] = process.argv.slice(2)
const password = process.env.KNOWHOW_PASSWORD || ''
const usage = '使い方: node scripts/knowhow.mjs check <原稿> | preview <原稿> <出力> | build <原稿> | extract <出力>'
if (!['check', 'preview', 'build', 'extract'].includes(mode)) fail(usage)
if (['build', 'extract'].includes(mode) && !password) fail('環境変数 KNOWHOW_PASSWORD に合言葉を入れてください')

function fail(msg) {
  console.error(msg)
  process.exit(1)
}

// ---------------------------------------------------------------------------------------------
//  暗号（鍵：PBKDF2 で 64 バイト → 前半 32 が AES-256-GCM の鍵、後半 32 が IV 用の HMAC 鍵）
//  IV は「名前＋本文」の HMAC から作る（同じ原稿なら同じ暗号文になり、変えていないコンテンツは git の差分が出ない）
// ---------------------------------------------------------------------------------------------
function deriveKeys(salt) {
  const bits = pbkdf2Sync(password, salt, ITERATIONS, 64, 'sha256')
  return { enc: bits.subarray(0, 32), mac: bits.subarray(32) }
}

function seal(keys, name, text) {
  const data = Buffer.from(text, 'utf-8')
  const iv = createHmac('sha256', keys.mac).update(name).update('\0').update(data).digest().subarray(0, 12)
  const c = createCipheriv('aes-256-gcm', keys.enc, iv)
  const ct = Buffer.concat([c.update(data), c.final(), c.getAuthTag()])
  return { iv: iv.toString('base64'), ct: ct.toString('base64') }
}

function open(keys, box) {
  const raw = Buffer.from(box.ct, 'base64')
  const d = createDecipheriv('aes-256-gcm', keys.enc, Buffer.from(box.iv, 'base64'))
  d.setAuthTag(raw.subarray(raw.length - 16))
  return Buffer.concat([d.update(raw.subarray(0, raw.length - 16)), d.final()]).toString('utf-8')
}

/** 今のページの salt（合言葉が合っていれば使い回す。ブラウザに記憶された鍵が切れないように） */
function currentSalt() {
  const page = resolve(OUT_DIR, 'index.html')
  if (!existsSync(page)) return null
  const m = readFileSync(page, 'utf-8').match(/<script type="application\/json" id="payload">([^<]+)<\/script>/)
  if (!m) return null
  const p = JSON.parse(m[1])
  return { salt: Buffer.from(p.salt, 'base64'), payload: p }
}

// ---------------------------------------------------------------------------------------------
//  extract：content/knowhow.enc → 原稿フォルダ
// ---------------------------------------------------------------------------------------------
if (mode === 'extract') {
  if (!arg1) fail(usage)
  const cur = currentSalt()
  if (!cur || !existsSync(SRC_ENC)) fail('public/knowhow/index.html か content/knowhow.enc がありません')
  const keys = deriveKeys(cur.salt)
  let files
  try {
    files = JSON.parse(open(keys, JSON.parse(readFileSync(SRC_ENC, 'utf-8'))))
  } catch {
    fail('合言葉が違います')
  }
  for (const [path, text] of Object.entries(files)) {
    const to = resolve(arg1, path)
    if (!to.startsWith(resolve(arg1) + '/')) fail(`不正なパス: ${path}`)
    mkdirSync(dirname(to), { recursive: true })
    writeFileSync(to, text)
  }
  console.log(`${Object.keys(files).length} ファイルを ${arg1} に取り出しました`)
  process.exit(0)
}

// ---------------------------------------------------------------------------------------------
//  原稿を読む
// ---------------------------------------------------------------------------------------------
const srcDir = arg1 ? resolve(arg1) : fail(usage)
const errors = []
const warn = []
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const lv = (l) => `<span class="lv lv${l}">L${l}</span>`

const master = JSON.parse(readFileSync(resolve(srcDir, 'skills.json'), 'utf-8'))
const domains = master.domains
const skills = Object.fromEntries(master.skills.map((s) => [s.id, s]))
const domainOf = (id) => domains.find((d) => d.id === id)
const pages = {
  home: readFileSync(resolve(srcDir, 'pages/home.html'), 'utf-8'),
  roadmap: readFileSync(resolve(srcDir, 'pages/roadmap.html'), 'utf-8'),
}

function frontMatter(text, file) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) {
    errors.push(`${file}: 先頭の --- 〜 --- がありません`)
    return { meta: {}, body: text }
  }
  const meta = {}
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-z]+):\s*(.*)$/)
    if (!kv) continue
    let v = kv[2].trim()
    if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map((x) => x.trim()).filter(Boolean)
    else v = v.replace(/^["']|["']$/g, '')
    meta[kv[1]] = v
  }
  return { meta, body: m[2] }
}

// ---------------------------------------------------------------------------------------------
//  Markdown → HTML（図解・Q&A・確認問題のブロック）
// ---------------------------------------------------------------------------------------------
const md = new Marked({ gfm: true })
// 日本語の括弧のすぐ外の **太字** は CommonMark の規則で太字にならないので、先に <strong> にする
const bold = (s) => String(s).replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>')
const inline = (s) => md.parseInline(bold(String(s).trim()))
const block = (s) => md.parse(bold(String(s).trim()))
const cells = (line) => line.split('|').map((c) => c.trim())
const lines = (text) => text.split('\n').map((l) => l.replace(/\s+$/, '')).filter((l) => l.trim() !== '')
let currentFile = ''

const BLOCKS = {
  // 要点：```point（Markdown）
  point: (t) => `<aside class="kb-point"><p class="kb-label">ポイント</p>${block(t)}</aside>`,
  // 注意：```warn（よくあるミスなど）
  warn: (t) => `<aside class="kb-warn"><p class="kb-label">よくあるミス・注意</p>${block(t)}</aside>`,
  // 補足：```note
  note: (t) => `<aside class="kb-note">${block(t)}</aside>`,
  // 手順の流れ：```flow  各行「見出し | 説明」
  flow: (t) => {
    const items = lines(t).map(cells)
    return `<ol class="kb-flow${items.length > 4 ? ' is-long' : ''}">${items
      .map(([h, d], i) => `<li><span class="kb-flow-n">${i + 1}</span><strong>${inline(h)}</strong>${d ? `<span>${inline(d)}</span>` : ''}</li>`)
      .join('')}</ol>`
  },
  // 判定の流れ：```decision  各行「質問 | 条件: 結果 | 条件: 次へ」（「次へ」の枝は下の質問につながる）
  decision: (t) => {
    const rows = lines(t).map(cells)
    let html = '<div class="kb-decision">'
    rows.forEach(([q, ...branches], i) => {
      const parsed = branches.map((b) => {
        const m = b.match(/^([^:：]+)[:：]\s*(.+)$/)
        if (!m) errors.push(`${currentFile}: decision の枝は「条件: 結果」で書きます → ${b}`)
        return m ? { cond: m[1].trim(), res: m[2].trim() } : { cond: '', res: b }
      })
      const next = parsed.find((b) => b.res === '次へ')
      const outs = parsed.filter((b) => b !== next)
      if (next && i === rows.length - 1) errors.push(`${currentFile}: decision の最後の行に「次へ」があります`)
      html += `<div class="kb-dz-row"><div class="kb-dz-q"><span class="kb-dz-n">Q${i + 1}</span>${inline(q)}</div><div class="kb-dz-outs">${outs
        .map((o) => `<div class="kb-dz-out"><span class="kb-dz-cond">${inline(o.cond)}</span><span class="kb-dz-res">${inline(o.res)}</span></div>`)
        .join('')}</div></div>`
      if (next) html += `<div class="kb-dz-next"><span>${inline(next.cond)}</span></div>`
    })
    return html + '</div>'
  },
  // 時系列：```timeline  各行「時期 | 見出し | 説明」
  timeline: (t) =>
    `<ol class="kb-timeline">${lines(t)
      .map(cells)
      .map(([when, h, d]) => `<li><span class="kb-tl-when">${inline(when)}</span><div><strong>${inline(h || '')}</strong>${d ? `<p>${inline(d)}</p>` : ''}</div></li>`)
      .join('')}</ol>`,
  // 区分・比較のカード：```cards  各行「見出し | 説明 | 例（任意）」
  cards: (t) =>
    `<div class="kb-cards">${lines(t)
      .map(cells)
      .map(([h, d, ex]) => `<div class="kb-card"><strong>${inline(h)}</strong>${d ? `<p>${inline(d)}</p>` : ''}${ex ? `<p class="kb-card-ex">${inline(ex)}</p>` : ''}</div>`)
      .join('')}</div>`,
  // 計算式：```formula  各行がそのまま1行（「=」から始まる行は結果として強調）
  formula: (t) =>
    `<div class="kb-formula">${lines(t)
      .map((l) => (l.trim().startsWith('=') ? `<p class="kb-f-res">${inline(l.trim().slice(1))}</p>` : `<p>${inline(l)}</p>`))
      .join('')}</div>`,
  // Q&A：```qa  「Q. 質問」の次の行から「A. 答え」（複数行可）。開閉式
  qa: (t) => {
    const items = []
    let cur = null
    for (const raw of t.split('\n')) {
      const l = raw.replace(/\s+$/, '')
      if (/^Q[.．]\s*/.test(l)) {
        cur = { q: l.replace(/^Q[.．]\s*/, ''), a: [] }
        items.push(cur)
      } else if (cur) cur.a.push(l.replace(/^A[.．]\s*/, ''))
    }
    if (!items.length) errors.push(`${currentFile}: qa に「Q.」がありません`)
    return `<div class="kb-qa">${items
      .map((it) => `<details><summary><span class="kb-qa-q">Q</span>${inline(it.q)}</summary><div class="kb-qa-a"><span class="kb-qa-mark">A</span><div>${block(it.a.join('\n'))}</div></div></details>`)
      .join('')}</div>`
  },
  // 確認問題：```check  「Q. 問題」「- 選択肢」（正解は「- *」）「> 解説」。問題の間は空行
  check: (t) => {
    const qs = []
    let cur = null
    for (const raw of t.split('\n')) {
      const l = raw.trim()
      if (/^Q[.．]\s*/.test(l)) {
        cur = { q: l.replace(/^Q[.．]\s*/, ''), opts: [], exp: [] }
        qs.push(cur)
      } else if (cur && l.startsWith('- ')) {
        const ok = l.startsWith('- *')
        cur.opts.push({ ok, text: l.replace(/^- \*?\s*/, '') })
      } else if (cur && l.startsWith('>')) cur.exp.push(l.replace(/^>\s?/, ''))
    }
    for (const q of qs) {
      if (q.opts.filter((o) => o.ok).length !== 1) errors.push(`${currentFile}: 確認問題「${q.q.slice(0, 20)}…」の正解（- *）は1つにします`)
      if (q.opts.length < 2) errors.push(`${currentFile}: 確認問題「${q.q.slice(0, 20)}…」の選択肢が足りません`)
    }
    return `<div class="kb-check"><p class="kb-label">確認問題</p>${qs
      .map(
        (q, i) =>
          `<div class="kb-cq" data-quiz><p class="kb-cq-q"><span>問${i + 1}</span>${inline(q.q)}</p><div class="kb-cq-opts">${q.opts
            .map((o) => `<button type="button" class="kb-cq-opt"${o.ok ? ' data-ok' : ''}>${inline(o.text)}</button>`)
            .join('')}</div><div class="kb-cq-exp" hidden>${block(q.exp.join('\n'))}</div></div>`,
      )
      .join('')}</div>`
  },
}

md.use({
  renderer: {
    code(token) {
      const fn = BLOCKS[(token.lang || '').trim()]
      if (fn) return fn(token.text)
      return `<pre class="kb-pre"><code>${esc(token.text)}</code></pre>`
    },
    table(token) {
      // 表は横スクロールできる枠に入れる（marked の既定の描画を使う）
      return `<div class="k-tblwrap kb-table">${md.Renderer.prototype.table.call(this, token)}</div>`
    },
  },
})

function renderBody(body, file) {
  currentFile = file
  let html = md.parse(bold(body))
  // 見出しに目次用の id を付ける
  const toc = []
  let n = 0
  html = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner) => {
    n += 1
    const text = inner.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    toc.push({ id: `s${n}`, text })
    return `<h2 id="s${n}">${inner}</h2>`
  })
  return { html, toc }
}

// ---------------------------------------------------------------------------------------------
//  コンテンツを読む
// ---------------------------------------------------------------------------------------------
const lessonDir = resolve(srcDir, 'lessons')
const lessons = readdirSync(lessonDir)
  .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
  .sort()
  .map((f) => {
    const text = readFileSync(resolve(lessonDir, f), 'utf-8')
    const { meta, body } = frontMatter(text, f)
    const id = f.replace(/\.md$/, '')
    if (meta.id && meta.id !== id) errors.push(`${f}: id（${meta.id}）とファイル名が違います`)
    if (!/^[A-Z]-\d{2}-\d{2}$/.test(id)) errors.push(`${f}: ファイル名は「スキルID-連番」（例 C-05-01.md）にします`)
    const skill = skills[meta.skill]
    if (!skill) errors.push(`${f}: skill（${meta.skill}）が skills.json にありません`)
    else if (!id.startsWith(meta.skill + '-')) errors.push(`${f}: ファイル名は skill（${meta.skill}）で始めます`)
    for (const k of ['title', 'summary', 'level', 'minutes']) if (!meta[k]) errors.push(`${f}: ${k} がありません`)
    if (meta.level && !/^L[0-4]$/.test(meta.level)) errors.push(`${f}: level は L1〜L4 で書きます`)
    const { html, toc } = renderBody(body, f)
    if (!/class="kb-(flow|decision|timeline|cards|formula)"|<svg/.test(html)) warn.push(`${f}: 図解（flow・decision・timeline・cards・formula・svg）がありません`)
    if (!html.includes('class="kb-qa"')) warn.push(`${f}: Q&A がありません`)
    if (/tax-plan\.net|info@/i.test(text)) errors.push(`${f}: tax-plan.net・メールアドレスは載せません（コンテンツ方針）`)
    return {
      id,
      skill: meta.skill,
      domain: skill ? skill.domain : '',
      title: meta.title || id,
      summary: meta.summary || '',
      level: meta.level || 'L1',
      minutes: Number(meta.minutes) || 10,
      tags: Array.isArray(meta.tags) ? meta.tags : meta.tags ? [meta.tags] : [],
      updated: meta.updated || '',
      sources: Array.isArray(meta.sources) ? meta.sources : [],
      html,
      toc,
      text,
      file: f,
    }
  })

// コンテンツ間のリンク（#/l/<ID>）が実在するか
const ids = new Set(lessons.map((l) => l.id))
for (const l of lessons) {
  for (const m of l.html.matchAll(/href="#\/l\/([^"]+)"/g)) if (!ids.has(m[1])) errors.push(`${l.file}: リンク先のコンテンツ ${m[1]} がありません`)
}

for (const w of warn) console.warn('注意: ' + w)
if (errors.length) {
  for (const e of errors) console.error('エラー: ' + e)
  process.exit(1)
}

// ---------------------------------------------------------------------------------------------
//  ページを組み立てる（トップ・一覧・スキルマップ・各コンテンツ）
// ---------------------------------------------------------------------------------------------
const byDomain = (d) => lessons.filter((l) => l.domain === d)
const bySkill = (s) => lessons.filter((l) => l.skill === s)

function lessonCard(l) {
  const sk = skills[l.skill]
  return `<a class="k-lcard" href="#/l/${l.id}" data-domain="${l.domain}" data-search="${esc(
    [l.id, l.title, l.summary, sk?.name, ...l.tags].join(' ').toLowerCase(),
  )}"><span class="k-lcard-top"><span class="k-mono">${l.skill}</span><span class="k-lcard-skill">${esc(sk?.name || '')}</span></span><strong>${esc(
    l.title,
  )}</strong><span class="k-lcard-sum">${esc(l.summary)}</span><span class="k-lcard-meta"><span class="k-tag">${l.level} 向け</span><span>${l.minutes}分</span></span></a>`
}

const catalog = `<section class="k-sec" id="catalog"><div class="k-sechead"><p class="k-num">LIBRARY</p><h2>コンテンツ一覧</h2><span class="k-count">${lessons.length}本</span></div>
<div class="k-filter"><div class="k-seg" role="tablist"><button type="button" class="is-on" data-filter="">すべて</button>${domains
  .map((d) => `<button type="button" data-filter="${d.id}">${esc(d.name)}<span>${byDomain(d.id).length}</span></button>`)
  .join('')}</div><input type="search" class="k-search" placeholder="キーワードで探す（例：小規模宅地、インボイス）" aria-label="キーワードで探す"></div>
<div class="k-lgrid">${lessons.map(lessonCard).join('')}</div><p class="k-empty" hidden>該当するコンテンツがありません。</p></section>`

const domainCards = `<div class="k-domains">${domains
  .map(
    (d) =>
      `<a class="k-domain" href="#/skills/${d.id}"><span class="k-code">${d.id}</span><strong>${esc(d.name)}</strong><span class="k-sub">${byDomain(d.id).length}本 ・ 一人前時 ${lv(
        d.target,
      )}</span></a>`,
  )
  .join('')}</div>`

const homeHtml = pages.home.replace('</section>', `${domainCards}</section>`) + catalog

const skillsHtml = `<section class="k-hero k-hero-sm"><p class="k-eyebrow">SKILL MAP</p><h1>スキルマップと教材</h1><p class="k-lead">一人前の条件は、各領域の「必須」項目が一人前目標に届いていること。「発展」は一人前以降に伸ばす項目です。各項目の教材から学べます。</p></section>
<nav class="k-seg k-seg-sticky">${domains.map((d) => `<a href="#/skills/${d.id}" data-jump="d-${d.id}">${esc(d.short)}<span>${master.skills.filter((s) => s.domain === d.id).length}</span></a>`).join('')}</nav>
${domains
  .map(
    (d) => `<section class="k-sec k-domainblock" id="d-${d.id}"><h2 class="k-h2"><span class="k-code">${d.id}</span>${esc(d.name)}<span class="k-sub">一人前時の領域目標 ${lv(
      d.target,
    )}</span></h2><p class="k-note">${esc(d.desc)}</p>
<div class="k-tblwrap"><table class="k-tbl k-skilltbl"><thead><tr><th>ID</th><th>スキル項目</th><th>内容</th><th>区分</th><th class="k-center">一人前目標</th><th>教材</th></tr></thead><tbody>${master.skills
      .filter((s) => s.domain === d.id)
      .map((s) => {
        const ls = bySkill(s.id)
        return `<tr class="${s.req ? '' : 'is-adv'}"><td class="k-mono k-nowrap">${s.id}</td><td class="k-nowrap"><strong>${esc(s.name)}</strong></td><td>${esc(
          s.desc,
        )}</td><td class="k-nowrap"><span class="k-tag ${s.req ? 'is-req' : ''}">${s.req ? '必須' : '発展'}</span></td><td class="k-center">${lv(s.target)}</td><td class="k-lessons">${
          ls.length ? ls.map((l) => `<a href="#/l/${l.id}">${esc(l.title)}</a>`).join('') : '<span class="k-mute">準備中</span>'
        }</td></tr>`
      })
      .join('')}</tbody></table></div></section>`,
  )
  .join('')}`

function lessonPage(l, i) {
  const sk = skills[l.skill]
  const d = domainOf(l.domain)
  const same = byDomain(l.domain)
  const pos = same.indexOf(l)
  const prev = same[pos - 1]
  const next = same[pos + 1]
  const related = bySkill(l.skill).filter((x) => x !== l)
  const nav = (x, label) =>
    x ? `<a class="k-pn" href="#/l/${x.id}"><span>${label}</span><strong>${esc(x.title)}</strong></a>` : '<span class="k-pn is-none"></span>'
  return `<article class="k-lesson">
<nav class="k-crumb"><a href="#/">ホーム</a><span>/</span><a href="#/skills/${l.domain}">${esc(d.name)}</a><span>/</span><span>${l.skill} ${esc(sk.name)}</span></nav>
<header class="k-lhead"><p class="k-eyebrow">${l.skill} ・ ${esc(sk.name)}</p><h1>${esc(l.title)}</h1><p class="k-lead">${esc(l.summary)}</p>
<div class="k-lmeta"><span class="k-tag">${l.level}（${LEVEL_NAMES[Number(l.level.slice(1))]}）向け</span><span>読む時間 ${l.minutes}分</span><span>スキルの一人前目標 ${lv(sk.target)}</span>${
    l.updated ? `<span>更新 ${esc(l.updated)}</span>` : ''
  }</div></header>
<div class="k-lbody">${
    l.toc.length > 1
      ? `<nav class="k-toc"><p class="kb-label">この記事の内容</p><ol>${l.toc.map((t) => `<li><a href="#/l/${l.id}" data-jump="${t.id}">${esc(t.text)}</a></li>`).join('')}</ol></nav>`
      : ''
  }<div class="k-prose">${l.html}${
    l.sources.length
      ? `<section class="k-sources"><p class="kb-label">参考（一次情報）</p><ul>${l.sources
          .map((s) => {
            const [title, url] = s.split(/\s+(?=https?:\/\/)/)
            return url ? `<li><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(title)}</a></li>` : `<li>${esc(s)}</li>`
          })
          .join('')}</ul></section>`
      : ''
  }<p class="k-disclaimer">社内研修用の資料です。税制は毎年改正されるため、申告・助言の前には最新の法令・通達・国税庁の情報で確かめてください。</p></div></div>
${related.length ? `<section class="k-related"><p class="kb-label">同じスキルの教材</p><div class="k-lgrid">${related.map(lessonCard).join('')}</div></section>` : ''}
<nav class="k-prevnext">${nav(prev, '← 前の教材')}${nav(next, '次の教材 →')}</nav></article>`
}

const index = {
  built: new Date().toISOString().slice(0, 10),
  pages: { home: homeHtml, roadmap: pages.roadmap, skills: skillsHtml },
  lessons: lessons.map((l) => ({ id: l.id, title: l.title })),
}
const lessonPages = Object.fromEntries(lessons.map((l, i) => [l.id, lessonPage(l, i)]))

console.log(`原稿 OK：コンテンツ ${lessons.length}本（${domains.map((d) => `${d.short}${byDomain(d.id).length}`).join('・')}）`)
if (mode === 'check') process.exit(0)

// ---------------------------------------------------------------------------------------------
//  preview：暗号化しない確認用（リポジトリの外に出す）
// ---------------------------------------------------------------------------------------------
if (mode === 'preview') {
  if (!arg2) fail(usage)
  const out = resolve(arg2)
  if (out.startsWith(root + '/')) fail('preview はリポジトリの外に出してください（平文のため）')
  mkdirSync(out, { recursive: true })
  writeFileSync(resolve(out, 'index.html'), shell(null, { index, lessons: lessonPages }))
  console.log(`確認用ページ：${relative(process.cwd(), resolve(out, 'index.html'))}`)
  process.exit(0)
}

// ---------------------------------------------------------------------------------------------
//  build：暗号化して public/knowhow/ と content/knowhow.enc に置く
// ---------------------------------------------------------------------------------------------
let salt = randomBytes(16)
const cur = process.env.KNOWHOW_NEW ? null : currentSalt()
if (cur) {
  const keys = deriveKeys(cur.salt)
  try {
    // v1（1ページ版）は PBKDF2 の先頭 32 バイトを鍵にしていたので、どちらでも開ける
    const m = cur.payload
    const d = createDecipheriv('aes-256-gcm', keys.enc, Buffer.from(m.iv, 'base64'))
    const raw = Buffer.from(m.ct, 'base64')
    d.setAuthTag(raw.subarray(raw.length - 16))
    d.update(raw.subarray(0, raw.length - 16))
    d.final()
    salt = cur.salt
  } catch {
    fail('今のページを KNOWHOW_PASSWORD で開けません。合言葉を変えるときは KNOWHOW_NEW=1 を付けてください')
  }
}
const keys = deriveKeys(salt)
const indexBox = seal(keys, 'index', JSON.stringify(index))
const payload = JSON.stringify({ v: 2, iter: ITERATIONS, salt: salt.toString('base64'), ...indexBox })

mkdirSync(resolve(OUT_DIR, 'l'), { recursive: true })
writeFileSync(resolve(OUT_DIR, 'index.html'), shell(payload))
const keep = new Set()
for (const [id, html] of Object.entries(lessonPages)) {
  writeFileSync(resolve(OUT_DIR, 'l', `${id}.json`), JSON.stringify(seal(keys, `l/${id}`, html)) + '\n')
  keep.add(`${id}.json`)
}
for (const f of readdirSync(resolve(OUT_DIR, 'l'))) if (!keep.has(f)) rmSync(resolve(OUT_DIR, 'l', f))

// 原稿一式（編集用。ブラウザでは読まない。公開フォルダの外）
const files = {}
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) walk(p)
    else if (!f.startsWith('.')) files[relative(srcDir, p)] = readFileSync(p, 'utf-8')
  }
}
walk(srcDir)
mkdirSync(dirname(SRC_ENC), { recursive: true })
writeFileSync(SRC_ENC, JSON.stringify(seal(keys, 'src', JSON.stringify(files))) + '\n')
console.log(`public/knowhow/ を作りました（コンテンツ ${lessons.length}本・原稿 ${Object.keys(files).length}ファイルを content/knowhow.enc に保存）`)

// ---------------------------------------------------------------------------------------------
//  ページの外枠（ログイン画面・画面の切り替え・スタイル）。原稿の中身はここに書かない（公開されるため）
// ---------------------------------------------------------------------------------------------
function shell(payloadJson, preview) {
  const data = preview
    ? `<script>window.__KNOWHOW_PREVIEW__ = ${JSON.stringify(preview).replace(/</g, '\\u003c')}</script>`
    : `<script type="application/json" id="payload">${payloadJson}</script>`
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
<meta name="referrer" content="no-referrer">
<meta name="color-scheme" content="dark">
<title>社内ノウハウ</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;800&family=Inter+Tight:wght@500;600;700&display=swap">
<style>${CSS}</style>
</head>
<body>
<div id="login" class="k-gate-screen"${preview ? ' hidden' : ''}>
  <div class="k-login">
    <span class="k-mark">TP</span>
    <h1>社内ノウハウ</h1>
    <p>社員専用のページです。共通の合言葉を入力してください。</p>
    <form id="loginform" autocomplete="off">
      <label class="k-field"><span>合言葉</span><input type="password" id="pw" required autocomplete="current-password" autofocus></label>
      <label class="k-check"><input type="checkbox" id="remember" checked> このブラウザで30日間記憶する</label>
      <p class="k-err" id="err" role="alert"></p>
      <button class="k-btn" id="go" type="submit">表示する</button>
    </form>
    <p class="k-small">共有のパソコンでは「記憶する」を外してください。</p>
    <noscript><p>JavaScript を有効にしてください。</p></noscript>
  </div>
</div>
<div id="app" hidden>
  <header class="k-top"><div class="k-wrap k-topin">
    <a class="k-brand" href="#/"><span class="k-mark">TP</span><span>社内ノウハウ</span></a>
    <nav class="k-nav"><a href="#/" data-nav="home">コンテンツ</a><a href="#/skills" data-nav="skills">スキルマップ</a><a href="#/roadmap" data-nav="roadmap">ロードマップ</a><button type="button" class="k-out" id="logout">ログアウト</button></nav>
  </div></header>
  <main class="k-wrap" id="view" tabindex="-1"></main>
  <footer class="k-wrap k-foot">社内限定ページ｜URL・合言葉を社外に共有しないでください</footer>
</div>
${data}
<script>${JS}</script>
</body>
</html>
`
}
