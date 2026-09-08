// お名前.com レンタルサーバー用の公開ファイル一式を release/onamae/ に組み立てる
// 使い方: npm run package:onamae  （内部で npm run build を実行してから組み立てる）
// できあがった release/onamae/ の中身を、サーバーの公開ディレクトリ直下にそのままアップロードする
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
cpSync(resolve(root, 'server/onamae/.htaccess'), resolve(out, '.htaccess'))
mkdirSync(resolve(out, 'web/contact'), { recursive: true })
cpSync(resolve(root, 'server/onamae/web/contact/index.php'), resolve(out, 'web/contact/index.php'))
cpSync(resolve(root, 'server/onamae/web/contact/contact-config.example.php'), resolve(out, 'web/contact/contact-config.example.php'))

console.log(`package-onamae: ${out} に公開ファイル一式を出力しました`)
console.log('  サーバー上で web/contact/contact-config.example.php を web/contact/contact-config.php にコピーし、送信先を記入してください')
