# リポジトリ共通ルール

## コンテンツ方針（絶対遵守）

- **`info@tax-plan.net` をページに表示しない。**
- **`tax-plan.net` を含むドメイン・URL（`*.tax-plan.net` 等）も同様に、ページに表示せず、リンク先にも使用しない。**
- これらは表示テキストだけでなく、href属性や配信されるJSバンドルにも含めないこと。お問い合わせの送信先メールアドレスや認証情報はコード・リポジトリに書かない。
  - フォームの送信先URLは **`/web/contact/`**（変更する場合は `src/components/ContactSection.jsx` の `CONTACT_ENDPOINT` と `vercel.json` の rewrite を揃える）。
  - **本番（お名前.com レンタルサーバー）**: `/web/*` は `.htaccess` の Rewrite で `backend/v1.php` に委任され、サーバー上のバックエンド（TaxPlan-org/php。`backend/` はこのリポジトリの管理外）が処理する。成功時は `201 {"message":"送信が完了しました","id":829}` の形式で返る。**このリポジトリから PHP などのサーバー側コードを作成しないこと**（`backend/` には触らない）。公開ファイル一式は `npm run package:onamae` で `release/onamae/` に組み立てる（構成は「本番ディレクトリ構造」参照）。
  - **Vercel（プレビュー）**: `api/contact.js` が環境変数 `CONTACT_TO` 等から読む（変数一覧は `.env.example`）。`/web/contact/` は `vercel.json` の rewrite で `api/contact.js` に振り向ける。
- 会社名「タックス・プラン税理士法人」のテキスト表記は問題ない（リンクは張らない）。

## ブランチ・マージ規約（絶対遵守）

- 作業ブランチは **`claude-dev` のみ**。それ以外のブランチを不必要に作成しない。
- 依頼された作業が完了したら、必ず **PRを作成し `main` へのマージまで完了**させる。

## 本番ディレクトリ構造（基本指針・絶対遵守）

本番（お名前.com レンタルサーバー）の公開ディレクトリは次の構造。ビルド出力 `dist/` はこの構造そのもので **git 管理する**（`git pull` した `dist/` の中身＝サーバーにアップロードする内容＝納品ZIPの中身）。

```
.htaccess        … このリポジトリ（public/.htaccess）の責務。/web/* と /api/* を backend/v1.php に委任する Rewrite と ErrorDocument を含む。php リポジトリ側にも同一ファイルが置かれるが、正本はこちら。委任先ファイルは固定のため編集・修正の予定はない
sitemap.xml
robots.txt
index.html
error/           … エラーページ（403.html・404.html・500.html）。このリポジトリの public/error/ で作成・管理する（.htaccess の ErrorDocument が参照）
backend/         … サーバー側で管理（backend/v1.php、TaxPlan-org/php）。唯一このリポジトリが触らないディレクトリ
assets/
  css/           … CSS（assets/css/index.css）
  js/            … JavaScript（assets/js/index.js）
  *.png|jpg|webp … 画像は assets 直下に置く（css・js と同じ階層）
```

- `backend/` 以外（HTML・CSS・JS・エラーページ・`.htaccess`・`robots.txt`・`sitemap.xml`）はすべてこのリポジトリの責務。`backend/` だけは TaxPlan-org/php の責務で、こちらからは触らない。
- CSS / JS は外部ファイルのまま出力する（`index.html` へのインライン化はしない）。ファイル名は固定で、更新時のキャッシュ対策として `scripts/prerender.mjs` が `index.html` 内の URL に `?v=ビルド時刻` を付ける。
- 画像は `public/assets/` に置く（ビルドで `assets/` 直下に並ぶ）。サーバー側にだけ置いている画像（`topfront.jpg`・`ceo1.jpg` など）もあるため、アップロード時に `assets/` 内の既存ファイルを消さない。

## プロジェクト構成

- Vite + React のSPA。`npm run build` でビルド（出力は `dist/`）。ビルド時に `scripts/prerender.mjs` がプリレンダリングを行い、`dist/index.html` に全コンテンツのHTMLを焼き込む（SEO対策。クライアントは hydrate）。
- **`dist/` は git 管理**（`.gitignore` に入れない）。ビルドは決定的（CSS/JS の `?v=` は内容ハッシュ）なので、同じソースからは同じ `dist/` ができる。
  - ソースを変更した PR では `npm run build` を実行し、`dist/` の変更も同じ PR に含める。
  - 保険として GitHub Actions（`.github/workflows/build.yml`）が `main` への push 時にリモートでビルドし、`dist/` に差分があれば `main` に自動コミットする。手動実行（workflow_dispatch）も可。
  - `npm run package:onamae` は `dist/` を `release/onamae/` にコピーするだけ（ZIP 作成用。`release/` は git 管理外）。
- 本文の表示はJSに依存させないこと（スクロール演出は JS が動いた場合に画面外の要素だけを一時的に隠す方式）。
- Vercelにデプロイ。ビルド設定は `vercel.json` で明示（framework: vite）。
- デザイン・文言の元データは静的HTML時代のLPを忠実に移植したもの。変更時はデザインを崩さないこと。
- OGP・構造化データ（JSON-LD）は `index.html` の `<head>` で管理。
