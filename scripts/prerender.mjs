// ビルド後に dist/index.html へアプリのHTMLを焼き込む（SEO用プリレンダリング）
// 使い方: vite build && vite build --ssr src/prerender.jsx --outDir dist-ssr && node scripts/prerender.mjs
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const { render } = await import(resolve(root, 'dist-ssr/prerender.js'))
const appHtml = render()

const indexPath = resolve(root, 'dist/index.html')
const template = readFileSync(indexPath, 'utf-8')
const marker = '<div id="root"></div>'
if (!template.includes(marker)) {
  throw new Error('dist/index.html に <div id="root"></div> が見つかりません')
}
writeFileSync(indexPath, template.replace(marker, `<div id="root">${appHtml}</div>`))

rmSync(resolve(root, 'dist-ssr'), { recursive: true, force: true })
console.log(`prerender: dist/index.html に ${Math.round(appHtml.length / 1024)}KB のHTMLを埋め込みました`)
