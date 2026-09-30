// ビルド後に dist/index.html を仕上げる
//   1) アプリのHTMLをプリレンダリングして埋め込む（SEO・JS不要で本文表示。クライアントは hydrate）
//   2) CSS / JS は外部ファイルのまま（assets/css/index.css・assets/js/index.js）。
//      ファイル名は固定なので、更新時にブラウザの古いキャッシュが使われないよう ?v=内容のハッシュ を付ける
//      （内容が同じなら同じ値になる＝ビルド結果が決定的で、dist/ を git 管理しても差分が出ない）
// 使い方: vite build && vite build --ssr src/prerender.jsx --outDir dist-ssr && node scripts/prerender.mjs
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
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

// キャッシュ対策：CSS / JS の URL に内容のハッシュを付ける（例 /assets/css/index.css?v=3f2a9c1d）
const versionOf = (path) => {
  const file = resolve(distDir, path)
  if (!existsSync(file)) return null
  return createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 8)
}
const versions = []
html = html.replace(/(href="|src=")\/(assets\/(?:css|js)\/[^"?]+\.(?:css|js))"/g, (tag, attr, path) => {
  const v = versionOf(path)
  if (!v) return tag
  versions.push(`${path}?v=${v}`)
  return `${attr}/${path}?v=${v}"`
})
html = html.replace(/<link rel="modulepreload"[^>]*>\n?/g, '')

writeFileSync(indexPath, html)
rmSync(resolve(root, 'dist-ssr'), { recursive: true, force: true })

console.log(`prerender: dist/index.html に ${Math.round(appHtml.length / 1024)}KB のHTMLを埋め込みました（${versions.join(', ')}）`)
