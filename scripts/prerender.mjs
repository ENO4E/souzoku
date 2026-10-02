// ビルド後に dist/ の HTML を仕上げる
//   1) ページごと（/ ・ /service/ ・ /simulation/ ・ /contact/）にアプリをプリレンダリングし、
//      そのページの title / description / canonical / OGP / 構造化データを <head> に書き込む
//      （検索エンジンに各ページを別の URL として評価させる。クライアントは hydrate）
//   2) CSS / JS は外部ファイルのまま。ファイル名は固定なので ?v=内容のハッシュ を付ける
//      （内容が同じなら同じ値になる＝ビルド結果が決定的で、dist/ を git 管理しても差分が出ない）
//   3) sitemap.xml を生成する
// 使い方: vite build && vite build --ssr src/prerender.jsx --outDir dist-ssr && node scripts/prerender.mjs
import { readFileSync, writeFileSync, rmSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(root, 'dist')

const { render, pages, jsonLdFor, webPageLd, ORIGIN, OG_IMAGE } = await import(resolve(root, 'dist-ssr/prerender.js'))

const template = readFileSync(resolve(distDir, 'index.html'), 'utf-8')
const marker = '<div id="root"></div>'
if (!template.includes(marker)) throw new Error('dist/index.html に <div id="root"></div> が見つかりません')
if (!template.includes('<!--SEO_HEAD_START-->') || !template.includes('<!--SEO_HEAD_END-->')) {
  throw new Error('index.html に <!--SEO_HEAD_START--> 〜 <!--SEO_HEAD_END--> がありません')
}

// キャッシュ対策：CSS / JS の URL に内容のハッシュを付ける（例 /assets/css/index.css?v=3f2a9c1d）
const versionOf = (path) => {
  const file = resolve(distDir, path)
  if (!existsSync(file)) return null
  return createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 8)
}
const versions = []
let base = template.replace(/(href="|src=")\/(assets\/(?:css|js)\/[^"?]+\.(?:css|js))"/g, (tag, attr, path) => {
  const v = versionOf(path)
  if (!v) return tag
  versions.push(`${path}?v=${v}`)
  return `${attr}/${path}?v=${v}"`
})
base = base.replace(/<link rel="modulepreload"[^>]*>\n?/g, '')

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
// JSON-LD 内の "</script" を無害化
const ld = (obj) => `<script type="application/ld+json">\n${JSON.stringify(obj, null, 1).replace(/<\//g, '<\\/')}\n</script>`

function headFor(route) {
  const p = pages[route]
  const url = `${ORIGIN}${p.path}`
  const tags = [
    `<title>${esc(p.title)}</title>`,
    `<meta name="description" content="${esc(p.description)}">`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="相続税申告相談センター">`,
    `<meta property="og:locale" content="ja_JP">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:title" content="${esc(p.title)}">`,
    `<meta property="og:description" content="${esc(p.ogDescription)}">`,
    `<meta property="og:image" content="${OG_IMAGE}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="800">`,
    `<meta property="og:image:type" content="image/jpeg">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(p.title)}">`,
    `<meta name="twitter:description" content="${esc(p.ogDescription)}">`,
    `<meta name="twitter:image" content="${OG_IMAGE}">`,
    ...jsonLdFor(route).map(ld),
    ld(webPageLd(route)),
  ]
  return tags.join('\n')
}

const written = []
for (const route of Object.keys(pages)) {
  const p = pages[route]
  const appHtml = render(route)
  let html = base.replace(marker, `<div id="root">${appHtml}</div>`)
  html = html.replace(/<!--SEO_HEAD_START-->[\s\S]*?<!--SEO_HEAD_END-->/, headFor(route))
  // ホーム以外はパスを <html data-route> の初期値にする（スクロールスナップ等の CSS 用）
  html = html.replace('<html lang="ja">', `<html lang="ja" data-route="${route}">`)
  const dir = resolve(distDir, p.path.replace(/^\//, ''))
  mkdirSync(dir, { recursive: true })
  const file = resolve(dir, 'index.html')
  writeFileSync(file, html)
  written.push(`${p.path}index.html（${Math.round(appHtml.length / 1024)}KB）`)
}

// sitemap.xml（lastmod は付けない：ビルドのたびに差分が出ないようにする）
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...Object.values(pages).map((p) => `  <url>\n    <loc>${ORIGIN}${p.path}</loc>\n    <changefreq>${p.path === '/' ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${p.path === '/' ? '1.0' : '0.8'}</priority>\n  </url>`),
  '</urlset>',
  '',
].join('\n')
writeFileSync(resolve(distDir, 'sitemap.xml'), sitemap)

rmSync(resolve(root, 'dist-ssr'), { recursive: true, force: true })

console.log(`prerender: ${written.join(' / ')} を出力し、sitemap.xml を生成しました（${versions.join(', ')}）`)
