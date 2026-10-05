// IndexNow：変更したページの URL を Bing などの検索エンジンにすぐ知らせる（https://www.indexnow.org/）
//
// 使い方
//   node scripts/indexnow.mjs all                 … sitemap.xml の全 URL を送る
//   node scripts/indexnow.mjs <before> <after>    … 2つのコミットの間で変わった dist/ のページだけを送る
//   --dry-run を付けると送らずに一覧だけ表示
//
// 鍵は public/<32桁の16進>.txt（中身は鍵そのもの）。ビルドでサイト直下に出力され、検索エンジンが所有の確認に使う
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const HOST = 'kakuyasu-souzokuzei.com'
const ORIGIN = `https://${HOST}`
const args = process.argv.slice(2).filter((a) => a !== '--dry-run')
const dryRun = process.argv.includes('--dry-run')

const keyFile = readdirSync(resolve(root, 'public')).find((f) => /^[0-9a-f]{32}\.txt$/.test(f))
if (!keyFile) throw new Error('public/ に IndexNow の鍵ファイル（32桁の16進.txt）がありません')
const key = readFileSync(resolve(root, 'public', keyFile), 'utf-8').trim()

/** dist/ のファイルパス → 公開 URL（HTML のページだけ） */
function toUrl(file) {
  const m = file.match(/^dist\/(.*?)(?:index\.html)$/)
  if (!m) return null
  return `${ORIGIN}/${m[1]}`
}

function allUrls() {
  const xml = readFileSync(resolve(root, 'dist/sitemap.xml'), 'utf-8')
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
}

function changedUrls(before, after) {
  if (!before || /^0+$/.test(before)) return allUrls()
  const out = execFileSync('git', ['diff', '--name-only', before, after, '--', 'dist'], { cwd: root, encoding: 'utf-8' })
  const files = out.split('\n').filter(Boolean)
  // CSS/JS や sitemap だけが変わった場合は送らない。ページの HTML が変わったものだけ
  return [...new Set(files.map(toUrl).filter(Boolean))]
}

const urls = args[0] === 'all' || args.length === 0 ? allUrls() : changedUrls(args[0], args[1])
if (!urls.length) {
  console.log('送る URL はありません')
  process.exit(0)
}
console.log(`${urls.length} 件の URL を送ります`)
urls.slice(0, 20).forEach((u) => console.log('  ' + u))
if (urls.length > 20) console.log(`  …ほか ${urls.length - 20} 件`)
if (dryRun) process.exit(0)

// 1回の送信は1万件まで
for (let i = 0; i < urls.length; i += 10000) {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key, keyLocation: `${ORIGIN}/${keyFile}`, urlList: urls.slice(i, i + 10000) }),
  })
  console.log(`IndexNow の応答：HTTP ${res.status}（200・202 なら受付済み）`)
  if (res.status >= 400) process.exitCode = 1
}
