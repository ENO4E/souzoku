// IndexNow：変更したページの URL を Bing などの検索エンジンにすぐ知らせる（https://www.indexnow.org/）
//
// 使い方
//   node scripts/indexnow.mjs all                 … sitemap.xml の全 URL を送る
//   node scripts/indexnow.mjs <before> <after>    … 2つのコミットの間で変わった dist/ のページだけを送る
//   --dry-run を付けると送らずに一覧だけ表示
//   --wait=<分> を付けると、本番に反映されたのを確かめてから送る（5分ごとに確認し、指定の分数まで待つ）。
//     本番への反映は手動アップロードのこともあるため。確認するのは「鍵ファイルが読めること」と
//     「変わったページのうち1つが、本番でも dist/ と同じ中身になっていること」
//   送信の仕組み（このファイル・ワークフロー）が変わったコミットでは、全ページを送る
//
// 鍵は public/<32桁の16進>.txt（中身は鍵そのもの）。ビルドでサイト直下に出力され、検索エンジンが所有の確認に使う
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const HOST = 'kakuyasu-souzokuzei.com'
const ORIGIN = `https://${HOST}`
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const dryRun = process.argv.includes('--dry-run')
const waitArg = process.argv.find((a) => a.startsWith('--wait='))
const waitMinutes = waitArg ? Number(waitArg.slice(7)) || 0 : 0

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

function changedFiles(before, after) {
  const out = execFileSync('git', ['diff', '--name-only', before, after], { cwd: root, encoding: 'utf-8' })
  return out.split('\n').filter(Boolean)
}

/** 本番に反映されたかの確認に使うページ（このコミットで HTML が変わったページ。無ければ鍵ファイルだけで確かめる） */
let probe = null

function changedUrls(before, after) {
  if (!before || /^0+$/.test(before)) return allUrls()
  const files = changedFiles(before, after)
  // CSS/JS や sitemap だけが変わった場合は送らない。ページの HTML が変わったものだけ
  const pages = [...new Set(files.filter((f) => f.startsWith('dist/')).map(toUrl).filter(Boolean))]
  probe = pages.find((u) => !u.includes('/articles/area-')) || null // 転送用のページ以外で確かめる
  // 送信の仕組みが変わったときは全ページを送り直す
  if (files.some((f) => f === 'scripts/indexnow.mjs' || f === '.github/workflows/indexnow.yml')) return allUrls()
  return pages
}

/** 本番に反映されたか：鍵ファイルが読め、確認用のページが dist/ と同じ中身になっているか */
async function isLive(probeUrl) {
  try {
    const k = await fetch(`${ORIGIN}/${keyFile}`, { cache: 'no-store' })
    if (!k.ok || (await k.text()).trim() !== key) return false
    if (!probeUrl) return true
    const file = resolve(root, 'dist', probeUrl.replace(ORIGIN + '/', ''), 'index.html')
    const res = await fetch(probeUrl, { cache: 'no-store' })
    return res.ok && (await res.text()) === readFileSync(file, 'utf-8')
  } catch {
    return false
  }
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

if (waitMinutes > 0) {
  const deadline = Date.now() + waitMinutes * 60_000
  while (!(await isLive(probe))) {
    if (Date.now() > deadline) {
      console.log(`${waitMinutes}分待っても本番に反映されませんでした。送らずに終了します（手動実行の mode=all で後から送れます）`)
      process.exit(0)
    }
    console.log('本番への反映を待っています（5分後にもう一度確認）')
    await new Promise((r) => setTimeout(r, 5 * 60_000))
  }
  console.log('本番への反映を確認しました')
}

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
