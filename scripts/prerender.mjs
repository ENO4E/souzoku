// ビルド後に dist/ の HTML を仕上げる
//   1) ページごと（/ ・ /service/ ・ /simulation/ ・ /contact/ ・ /articles/ ・ /articles/<slug>/ ・ /privacy/）にアプリをプリレンダリングし、
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
import { loadArticles } from './articles.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(root, 'dist')

const ssr = await import(resolve(root, 'dist-ssr/prerender.js'))
const { render, pages, jsonLdFor, webPageLd, articlesPage, articlePage, articlesLd, articleLd, privacyPage, privacyLd, ORIGIN, OG_IMAGE, SITE_NAME } = ssr

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
// JSON-LD / 埋め込みデータ内の "</script" を無害化
const safeJson = (obj, pretty) => JSON.stringify(obj, null, pretty ? 1 : 0).replace(/<\//g, '<\\/').replace(/<!--/g, '<\\!--')
const ld = (obj) => `<script type="application/ld+json">\n${safeJson(obj, true)}\n</script>`

function headTags(meta, jsonLds) {
  const url = `${ORIGIN}${meta.path}`
  return [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}">`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="${meta.ogType || 'website'}">`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}">`,
    `<meta property="og:locale" content="ja_JP">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:title" content="${esc(meta.title)}">`,
    `<meta property="og:description" content="${esc(meta.ogDescription || meta.description)}">`,
    `<meta property="og:image" content="${OG_IMAGE}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="800">`,
    `<meta property="og:image:type" content="image/jpeg">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(meta.title)}">`,
    `<meta name="twitter:description" content="${esc(meta.ogDescription || meta.description)}">`,
    `<meta name="twitter:image" content="${OG_IMAGE}">`,
    ...jsonLds.map(ld),
  ].join('\n')
}

function writePage(path, route, html, head, pageData) {
  let out = base.replace(marker, `<div id="root">${html}</div>`)
  out = out.replace(/<!--SEO_HEAD_START-->[\s\S]*?<!--SEO_HEAD_END-->/, head)
  out = out.replace('<html lang="ja">', `<html lang="ja" data-route="${route}">`)
  if (pageData) out = out.replace('<script type="module"', `<script>window.__PAGE_DATA__=${safeJson(pageData)}</script>\n<script type="module"`)
  const dir = resolve(distDir, path.replace(/^\//, ''))
  mkdirSync(dir, { recursive: true })
  writeFileSync(resolve(dir, 'index.html'), out)
}

const written = []
const sitemapEntries = []

// 記事（フッターの「最新コラム」に使うので先に読む）
const articles = loadArticles(resolve(root, 'content/articles'))
const listMeta = articles.map(({ html, headings, ...rest }) => rest)
const latest = listMeta.slice(0, 4).map(({ title, path, date }) => ({ title, path, date }))

// 1) 主要4ページ（埋め込むデータは最新コラムの数件だけ）
for (const route of Object.keys(pages)) {
  const p = pages[route]
  const data = { latest }
  const html = render(route, data)
  writePage(p.path, route, html, headTags(p, [...jsonLdFor(route), webPageLd(route)]), data)
  written.push(`${p.path}（${Math.round(html.length / 1024)}KB）`)
  sitemapEntries.push({ loc: p.path, changefreq: p.path === '/' ? 'weekly' : 'monthly', priority: p.path === '/' ? '1.0' : '0.8' })
}

// 2) 記事一覧と記事
{
  // 一覧は 100 件以上になるので、カードに必要な項目だけ埋め込んで軽くする
  // 一覧は埋め込まない（ブラウザは描画済みの行から復元する。main.jsx）。描画にだけ全件を渡す
  const list = listMeta.map(({ slug, title, date, tags }) => ({ slug, title, date, tags }))
  const data = { list, latest }
  const html = render('articles', data)
  writePage(articlesPage.path, 'articles', html, headTags(articlesPage, articlesLd(listMeta)), { latest })
  written.push(`${articlesPage.path}（${articles.length}記事・${Math.round(html.length / 1024)}KB）`)
  sitemapEntries.push({ loc: articlesPage.path, changefreq: 'weekly', priority: '0.7', lastmod: articles[0]?.date })
}
for (const a of articles) {
  // 関連記事：同じタグを多く持つ順（同点なら新しい順）に4件
  const score = (x) => x.tags.filter((t) => a.tags.includes(t)).length
  const related = listMeta
    .filter((x) => x.slug !== a.slug)
    .map((x, i) => ({ x, s: score(x), i }))
    .sort((p, q) => q.s - p.s || p.i - q.i)
    .slice(0, 4)
    .map(({ x }) => ({ slug: x.slug, path: x.path, title: x.title, date: x.date }))
  const full = { article: a, related, latest }
  const html = render('article', full)
  // 本文 HTML はプリレンダリング済みなのでデータには入れない（クライアントは DOM から拾う）
  const { html: _omit, ...articleMeta } = a
  writePage(a.path, 'article', html, headTags(articlePage(a), articleLd(a)), { article: articleMeta, related, latest })
  sitemapEntries.push({ loc: a.path, changefreq: 'monthly', priority: '0.6', lastmod: a.date })
}

// プライバシーポリシー
{
  const data = { latest }
  const html = render('privacy', data)
  writePage(privacyPage.path, 'privacy', html, headTags(privacyPage, privacyLd()), data)
  written.push(`${privacyPage.path}（${Math.round(html.length / 1024)}KB）`)
  sitemapEntries.push({ loc: privacyPage.path, changefreq: 'yearly', priority: '0.3' })
}

// 3) sitemap.xml（主要ページには lastmod を付けない：ビルドのたびに差分が出ないようにする）
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...sitemapEntries.map((e) => [
    '  <url>',
    `    <loc>${ORIGIN}${e.loc}</loc>`,
    e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
    `    <changefreq>${e.changefreq}</changefreq>`,
    `    <priority>${e.priority}</priority>`,
    '  </url>',
  ].filter(Boolean).join('\n')),
  '</urlset>',
  '',
].join('\n')
writeFileSync(resolve(distDir, 'sitemap.xml'), sitemap)

rmSync(resolve(root, 'dist-ssr'), { recursive: true, force: true })

console.log(`prerender: ${written.join(' / ')} ＋ 記事${articles.length}件 を出力し、sitemap.xml を生成しました（${versions.join(', ')}）`)
