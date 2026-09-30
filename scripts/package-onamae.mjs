// 本番サーバー（お名前.com）にアップロードする公開ファイル一式を release/onamae/ に組み立てる
// 使い方: npm run package:onamae  （内部で npm run build を実行してから組み立てる）
//
// 出力する内容（本番のディレクトリ構造に合わせる。CLAUDE.md「本番ディレクトリ構造」参照）
//   index.html
//   sitemap.xml
//   robots.txt
//   assets/css/index.css
//   assets/js/index.js
//   assets/*.png|jpg|webp（画像は assets 直下）
//   error/403.html・404.html・500.html（.htaccess の ErrorDocument が参照するエラーページ。public/error/ が元）
//   .htaccess（public/.htaccess が元。/web/* と /api/* を backend/v1.php に振り分ける設定を含む）
//
// 出力しないもの（サーバー側で管理。このリポジトリからは触らない）
//   backend/
import { cpSync, mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')
const out = resolve(root, 'release/onamae')

if (!existsSync(resolve(dist, 'index.html'))) {
  throw new Error('dist/index.html がありません。先に npm run build を実行してください')
}

rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })
cpSync(dist, out, { recursive: true })

for (const name of ['backend']) {
  rmSync(resolve(out, name), { recursive: true, force: true })
}

const list = (dir, prefix = '') => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? list(resolve(dir, e.name), `${prefix}${e.name}/`) : [`${prefix}${e.name}`])

console.log(`package-onamae: ${out} に公開ファイル一式を出力しました`)
for (const f of list(out).sort()) console.log(`  ${f}`)
