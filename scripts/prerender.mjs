// ビルド後に dist/index.html を「1ファイルで表示が完結する」形に仕上げる
//   1) アプリのHTMLをプリレンダリングして埋め込む（SEO・JS不要で本文表示）
//   2) CSS と JS を index.html 内に埋め込む（外部ファイルの配置ミスやキャッシュずれで表示が壊れないように）
// 使い方: vite build && vite build --ssr src/prerender.jsx --outDir dist-ssr && node scripts/prerender.mjs
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs'
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

// CSS を埋め込み
html = html.replace(/<link rel="stylesheet"[^>]*href="\/(assets\/css\/[^"]+\.css)"[^>]*>/, (tag, path) => {
  const file = resolve(distDir, path)
  if (!existsSync(file)) return tag
  return `<style>\n${readFileSync(file, 'utf-8')}\n</style>`
})

// JS を埋め込み（バンドルは単一ファイル・動的 import なしが前提）
html = html.replace(/<script type="module"[^>]*src="\/(assets\/js\/[^"]+\.js)"><\/script>/, (tag, path) => {
  const file = resolve(distDir, path)
  if (!existsSync(file)) return tag
  const js = readFileSync(file, 'utf-8').replace(/<\/script/gi, '<\\/script')
  return `<script type="module">\n${js}\n</script>`
})
html = html.replace(/<link rel="modulepreload"[^>]*>\n?/g, '')

writeFileSync(indexPath, html)
rmSync(resolve(root, 'dist-ssr'), { recursive: true, force: true })

const inlinedCss = html.includes('<style>')
const inlinedJs = /<script type="module">\n/.test(html)
console.log(`prerender: dist/index.html に ${Math.round(appHtml.length / 1024)}KB のHTMLを埋め込み、CSS${inlinedCss ? '○' : '×'} / JS${inlinedJs ? '○' : '×'} をインライン化しました（${Math.round(html.length / 1024)}KB）`)
