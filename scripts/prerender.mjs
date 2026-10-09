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
import { loadAreas } from './areas.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(root, 'dist')

const ssr = await import(resolve(root, 'dist-ssr/prerender.js'))
const { render, pages, jsonLdFor, webPageLd, articlesPage, articlePage, articlesLd, articleLd, privacyPage, privacyLd, areaPage, areaLd, areaHubPage, areaHubLd, areaRegions, ORIGIN, OG_IMAGE, SITE_NAME, site, baseFees, extraFees, LOWEST_NOTE, RECORD } = ssr

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
    `<link rel="alternate" type="application/rss+xml" title="${esc(SITE_NAME)} コラム" href="${ORIGIN}/feed.xml">`,
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
  const byTag = listMeta
    .filter((x) => x.slug !== a.slug)
    .map((x, i) => ({ x, s: score(x), i }))
    .sort((p, q) => q.s - p.s || p.i - q.i)
    .slice(0, 4)
    .map(({ x }) => x)
  // 最新2件も足す（古い記事から新しい記事へリンクが通り、新着が早く巡回される）
  const newest = listMeta.filter((x) => x.slug !== a.slug && !byTag.includes(x)).slice(0, 2)
  const related = [...byTag, ...newest].map((x) => ({ slug: x.slug, path: x.path, title: x.title, date: x.date }))
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

// 市区町村ごとの相続税申告ページ（/area/<slug>/）と、以前のコラムの URL からの転送
// 地域の並びは site.js の areaRegions。md（content/areas）と突き合わせ、片方にしかないものや市名・地域名のずれはエラーにする
const LEGACY_AREA_ARTICLES = new Set(['amagasaki', 'ashiya', 'higashiosaka', 'hirakata', 'ibaraki', 'kadoma', 'kobe', 'minoh', 'moriguchi', 'neyagawa', 'nishinomiya', 'settsu', 'shijonawate', 'suita', 'takarazuka', 'takatsuki'])
const areaFiles = loadAreas(resolve(root, 'content/areas'))
const regions = areaRegions.map((r) => ({
  name: r.name,
  slug: r.slug,
  pref: r.pref,
  cities: r.cities.map(([city, slug]) => {
    const a = areaFiles.find((x) => x.slug === slug)
    if (!a) throw new Error(`site.js の areaRegions にある ${city}（${slug}）の content/areas/${slug}.md がありません`)
    if (a.city !== city || a.region !== r.name) throw new Error(`content/areas/${slug}.md の city / region（${a.city} / ${a.region}）が site.js の areaRegions（${city} / ${r.name}）と違います`)
    return { city, path: a.path, topic: a.topic }
  }),
}))
for (const a of areaFiles) {
  if (!regions.some((r) => r.cities.some((c) => c.path === a.path))) throw new Error(`content/areas/${a.slug}.md が site.js の areaRegions にありません`)
}
const areas = regions.flatMap((r) => r.cities.map((c) => ({ ...areaFiles.find((x) => x.path === c.path), regionSlug: r.slug })))
{
  const data = { regions, latest }
  const html = render('areahub', data)
  writePage(areaHubPage.path, 'areahub', html, headTags(areaHubPage, areaHubLd(regions)), data)
  written.push(`${areaHubPage.path}（${Math.round(html.length / 1024)}KB）`)
  sitemapEntries.push({ loc: areaHubPage.path, changefreq: 'weekly', priority: '0.8' })
}
for (const a of areas) {
  const region = regions.find((r) => r.slug === a.regionSlug)
  const areaList = region.cities.map(({ city, path }) => ({ city, path }))
  // その市の財産の特徴に関係するコラム（content/areas/<slug>.md の columns）
  const columns = a.columns.map((slug) => {
    const x = listMeta.find((m) => m.slug === slug)
    if (!x) throw new Error(`content/areas/${a.slug}.md の columns に存在しない記事があります: ${slug}`)
    return { path: x.path, title: x.title }
  })
  const regionMeta = { name: region.name, slug: region.slug }
  const html = render('area', { area: a, region: regionMeta, areas: areaList, columns, latest })
  const { html: _h, accessHtml: _a, columns: _c, regionSlug: _r, ...areaMeta } = a // 本文はプリレンダリング済みなのでデータに入れない（main.jsx が DOM から拾う）
  writePage(a.path, 'area', html, headTags(areaPage(a), areaLd(a)), { area: areaMeta, region: regionMeta, areas: areaList, columns, latest })
  sitemapEntries.push({ loc: a.path, changefreq: 'monthly', priority: '0.8', lastmod: a.updated || undefined })
  // 以前のコラム（/articles/area-<slug>-souzokuzei/）があった最初の16市だけ、新しいページへ即時転送するページを出す（.htaccess を使わずに済む方法。canonical も新しいページ）
  if (!LEGACY_AREA_ARTICLES.has(a.slug)) continue
  const to = `${ORIGIN}${a.path}`
  const stub = `<!doctype html>\n<html lang="ja"><head><meta charset="utf-8"><title>${esc(a.city)}の相続税申告｜${esc(SITE_NAME)}</title><link rel="canonical" href="${to}"><meta http-equiv="refresh" content="0; url=${a.path}"></head><body><p><a href="${a.path}">${esc(a.city)}の相続税申告のページへ移動しました</a></p></body></html>\n`
  const dir = resolve(distDir, a.oldPath.replace(/^\//, ''))
  mkdirSync(dir, { recursive: true })
  writeFileSync(resolve(dir, 'index.html'), stub)
}
written.push(`/area/<slug>/（${areas.length}市区町村）`)

// llms.txt（AI 向けの案内。https://llmstxt.org/ の形式。サイトのデータから毎回作るので、料金や市のページを変えれば自動で揃う）
{
  const feeLines = baseFees.map((f) => `- 遺産総額${f.range}：${f.tax ? f.tax.replace(/[（）]/g, '').replace('税込 ', '') + '（税込）' : f.fee}`)
  const extraLines = extraFees.map((f) => `- ${f.item}：${f.fee}${f.tax ? ` ${f.tax}` : ''}`)
  const llms = [
    `# ${site.name}（運営：${site.company}）`,
    '',
    `> 大阪・京都・兵庫（京阪神）の相続税申告を専門に扱う税理士法人のサイトです。相続税申告の基本報酬は99,000円（税込・遺産総額4,000万円まで）からで、京阪神の相続税申告の料金として最安水準です。${RECORD}の申告実績があり、初回相談は無料、事務所での面談・オンライン面談・ご自宅への訪問に対応しています。`,
    '',
    `- 運営：${site.company}（${site.license}）`,
    `- 所在地：${site.address}`,
    `- 電話：${site.tel}（受付：${site.hours}。土日の面談は事前予約制）`,
    `- 対応地域：大阪府・兵庫県・京都府の全域`,
    `- ${LOWEST_NOTE.replace(/^※/, '')}`,
    '',
    '## 相続税申告の基本報酬（税込）',
    '',
    ...feeLines,
    '',
    '追加料金（税抜。内容に応じて事前にお見積り）',
    '',
    ...extraLines,
    '',
    '## 市区町村ごとの相続税申告',
    '',
    `一覧：[地域から探す](${ORIGIN}${areaHubPage.path})`,
    ...regions.flatMap((r) => ['', `### ${r.name}（${r.pref}）`, '', ...r.cities.map((c) => {
      const a = areas.find((x) => x.path === c.path)
      return `- [${c.city}の相続税申告](${ORIGIN}${c.path})：${a.description}`
    })]),
    '',
    '## 主なページ',
    '',
    `- [サービス・料金](${ORIGIN}/service/)：料金表、相場との比較、選ばれる理由、ご相談の流れ、お客様の声、よくある質問`,
    `- [相続税シミュレーション](${ORIGIN}/simulation/)：遺産総額と相続人から相続税額の目安と基本報酬をその場で試算`,
    `- [無料相談・お問い合わせ](${ORIGIN}/contact/)：フォームは24時間受付・1営業日以内に連絡`,
    `- [相続税の基礎知識コラム](${ORIGIN}/articles/)：相続税・贈与税・財産評価・特例・遺産分割などの解説（${articles.length}記事）`,
    '',
    '## Optional',
    '',
    `- [プライバシーポリシー](${ORIGIN}/privacy/)`,
    `- [サイトマップ](${ORIGIN}/sitemap.xml)`,
    '',
  ].join('\n')
  writeFileSync(resolve(distDir, 'llms.txt'), llms)
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

// 4) feed.xml（RSS 2.0・最新50記事）。Google / Bing の新着の発見を早めるため。Search Console の「サイトマップ」にも登録できる
const rfc822 = (d) => new Date(`${d}T09:00:00+09:00`).toUTCString()
const feed = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
  '<channel>',
  `<title>${esc(SITE_NAME)} コラム</title>`,
  `<link>${ORIGIN}/articles/</link>`,
  `<description>${esc(articlesPage.description)}</description>`,
  '<language>ja</language>',
  `<lastBuildDate>${rfc822(articles[0]?.date || '2026-01-01')}</lastBuildDate>`,
  `<atom:link href="${ORIGIN}/feed.xml" rel="self" type="application/rss+xml"/>`,
  ...articles.slice(0, 50).map((a) => [
    '<item>',
    `<title>${esc(a.title)}</title>`,
    `<link>${ORIGIN}${a.path}</link>`,
    `<guid isPermaLink="true">${ORIGIN}${a.path}</guid>`,
    `<pubDate>${rfc822(a.date)}</pubDate>`,
    `<description>${esc(a.description)}</description>`,
    '</item>',
  ].join('')),
  '</channel>',
  '</rss>',
  '',
].join('\n')
writeFileSync(resolve(distDir, 'feed.xml'), feed)

rmSync(resolve(root, 'dist-ssr'), { recursive: true, force: true })

console.log(`prerender: ${written.join(' / ')} ＋ 記事${articles.length}件 を出力し、sitemap.xml と feed.xml を生成しました（${versions.join(', ')}）`)
