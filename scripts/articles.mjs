// content/articles/*.md を読み込んで記事データにする（ビルド時に scripts/prerender.mjs が使う）
//
// 記事ファイルの書き方（先頭に --- で囲んだ見出し情報、その下に本文を Markdown で）
//   ---
//   title: 記事のタイトル
//   description: 検索結果に出る説明文（100〜120文字）
//   date: 2026-10-02
//   tags: [相続税の基礎, 基礎控除]
//   ---
//   本文…
// ファイル名（拡張子を除く）が URL になる：content/articles/souzokuzei-kiso-kojo.md → /articles/souzokuzei-kiso-kojo/
import { readdirSync, readFileSync } from 'node:fs'
import { basename, extname, resolve } from 'node:path'
import { marked } from 'marked'

export function parseFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) return { meta: {}, body: src }
  const meta = {}
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':')
    if (i < 0) continue
    const key = line.slice(0, i).trim()
    let value = line.slice(i + 1).trim()
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean)
    } else {
      value = value.replace(/^["']|["']$/g, '')
    }
    meta[key] = value
  }
  return { meta, body: m[2] }
}

// 見出しに id を付ける（目次・ページ内リンク用）
let headingNo = 0
marked.use({
  gfm: true,
  breaks: false,
  renderer: {
    heading({ depth, tokens }) {
      const inner = this.parser.parseInline(tokens)
      const id = `h-${++headingNo}`
      return `<h${depth} id="${id}">${inner}</h${depth}>\n`
    },
  },
})

/** Markdown を HTML にする（見出しに h-1, h-2 … の id を付ける。ページごとに番号を振り直す） */
export function renderMarkdown(body) {
  headingNo = 0
  return marked.parse(body)
}

const NOTE = '※この記事は一般的な情報提供を目的としたもので、個別の事案に対する税務判断ではありません。実際の取り扱いは財産の内容や分割の仕方によって変わります。'

/** 今日の日付（日本時間、YYYY-MM-DD）。BUILD_DATE=2026-10-12 のように環境変数で固定できる（予約公開の確認用） */
export function todayJst() {
  if (process.env.BUILD_DATE) return process.env.BUILD_DATE
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' })
}

// 予約公開：date が今日（日本時間）より後の記事はビルドに含めない（一覧・sitemap・feed にも出ない）。
// GitHub Actions（build.yml）が毎日 0:05 JST にビルドして dist/ を更新するので、日付が来れば自動で公開される。
// ARTICLES_INCLUDE_FUTURE=1 を付けると未来の記事も含める（下書きの確認用）
export function loadArticles(dir) {
  const today = todayJst()
  const allFiles = readdirSync(dir).filter((f) => extname(f) === '.md' && !f.startsWith('_'))
  const future = []
  const files = allFiles.filter((file) => {
    if (process.env.ARTICLES_INCLUDE_FUTURE) return true
    const m = readFileSync(resolve(dir, file), 'utf-8').match(/^date:\s*(\d{4}-\d{2}-\d{2})/m)
    if (m && m[1] > today) {
      future.push(`${file}（${m[1]}）`)
      return false
    }
    return true
  })
  if (future.length) console.log(`記事の予約公開：${today} より後の日付の ${future.length} 本はまだ出しません → ${future.join('、')}`)
  const articles = files.map((file) => {
    const slug = basename(file, '.md')
    if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`記事ファイル名は英小文字・数字・ハイフンのみ: ${file}`)
    const { meta, body } = parseFrontmatter(readFileSync(resolve(dir, file), 'utf-8'))
    if (!meta.title || !meta.date) throw new Error(`記事 ${file} に title / date がありません`)
    headingNo = 0
    // 末尾の免責はここで自動付与する（記事ファイルには書かない）
    const html = marked.parse(body) + `<p class="prose__note">${NOTE}</p>\n`
    const text = body.replace(/[#>*`\-|[\]()]/g, '')
    const headings = [...html.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)].map((h) => ({ id: h[1], text: h[2].replace(/<[^>]+>/g, '') }))
    return {
      slug,
      path: `/articles/${slug}/`,
      title: meta.title,
      description: meta.description || text.slice(0, 110).replace(/\s+/g, ' ').trim(),
      date: meta.date,
      tags: Array.isArray(meta.tags) ? meta.tags : meta.tags ? [meta.tags] : [],
      readingMin: Math.max(1, Math.round(text.length / 500)),
      headings,
      html,
    }
  })
  return articles.sort((a, b) => (a.date < b.date ? 1 : -1))
}
