// お名前.com レンタルサーバー用の公開ファイル一式を release/onamae/ に組み立てる
// 使い方: npm run package:onamae  （内部で npm run build を実行してから組み立てる）
// できあがった release/onamae/ の中身（index.html・assets・robots.txt・sitemap.xml）を、サーバーの公開ディレクトリ直下にアップロードする
import { cpSync, mkdirSync, rmSync, existsSync } from 'node:fs'
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
// CSS/JS は index.html に埋め込み済みのため、外部ファイルは公開物から外す（配置ミス防止）
rmSync(resolve(out, 'assets/css'), { recursive: true, force: true })
rmSync(resolve(out, 'assets/js'), { recursive: true, force: true })
// お問い合わせの送信先 /web/contact/ はサーバー側の既存バックエンド（.htaccess で backend/v1.php に振り分け）が処理する。
// このリポジトリからは .htaccess やサーバー側コードを一切出力しない（サーバーの設定を上書きしないため）

console.log(`package-onamae: ${out} に公開ファイル一式を出力しました`)
