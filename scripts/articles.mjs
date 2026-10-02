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

function parseFrontmatter(src) {
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

export function loadArticles(dir) {
  const files = readdirSync(dir).filter((f) => extname(f) === '.md' && !f.startsWith('_'))
  const articles = files.map((file) => {
    const slug = basename(file, '.md')
    if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`記事ファイル名は英小文字・数字・ハイフンのみ: ${file}`)
    const { meta, body } = parseFrontmatter(readFileSync(resolve(dir, file), 'utf-8'))
    if (!meta.title || !meta.date) throw new Error(`記事 ${file} に title / date がありません`)
    headingNo = 0
    const html = marked.parse(body)
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
