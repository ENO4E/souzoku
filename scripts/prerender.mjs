// ビルド後に dist/index.html を仕上げる
//   1) アプリのHTMLをプリレンダリングして埋め込む（SEO・JS不要で本文表示。クライアントは hydrate）
//   2) CSS / JS は外部ファイルのまま（assets/css/index.css・assets/js/index.js）。
//      ファイル名は固定なので、更新時にブラウザの古いキャッシュが使われないよう ?v=ビルド時刻 を付ける
// 使い方: vite build && vite build --ssr src/prerender.jsx --outDir dist-ssr && node scripts/prerender.mjs
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(root, 'dist')

const { render } = await import(resolve(distDir, '../dist-ssr/prerender.js'))
const appHtml = render()

const indexPath = resolve(distDir, 'index.html')
let html = readFileSync(indexPath, 'utf-8')

const marker = '<div id="root"></div>'
if (!html.includes(marker)) throw new Error('dist/index.html に <div id="root"></div> が見つかりません')
html = html.replace(marker, `<div id="root">${appHtml}</div>`)

// キャッシュ対策：CSS / JS の URL にビルド時刻を付ける（例 /assets/css/index.css?v=20260930T120000）
const version = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, '')
let cssCount = 0
let jsCount = 0
html = html.replace(/(href="\/assets\/css\/[^"?]+\.css)"/g, (_, m) => { cssCount++; return `${m}?v=${version}"` })
html = html.replace(/(src="\/assets\/js\/[^"?]+\.js)"/g, (_, m) => { jsCount++; return `${m}?v=${version}"` })
html = html.replace(/<link rel="modulepreload"[^>]*>\n?/g, '')

writeFileSync(indexPath, html)
rmSync(resolve(root, 'dist-ssr'), { recursive: true, force: true })

console.log(`prerender: dist/index.html に ${Math.round(appHtml.length / 1024)}KB のHTMLを埋め込みました（CSS ${cssCount}件 / JS ${jsCount}件に ?v=${version} を付与）`)
