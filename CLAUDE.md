# リポジトリ共通ルール

## コンテンツ方針（絶対遵守）

- **`info@tax-plan.net` をページに表示しない。**
- **`tax-plan.net` を含むドメイン・URL（`*.tax-plan.net` 等）も同様に、ページに表示せず、リンク先にも使用しない。**
- これらは表示テキストだけでなく、href属性や配信されるJSバンドルにも含めないこと。お問い合わせの送信先メールアドレスはサーバー側の設定でのみ持つ（コード・リポジトリには書かない）。
  - フォームの送信先URLは **`/web/contact/`**（変更する場合は `src/components/ContactSection.jsx` の `CONTACT_ENDPOINT`、`vercel.json` の rewrite、`scripts/package-onamae.mjs` の配置先を揃える）。
  - **お名前.com レンタルサーバー（本番）**: `server/onamae/web/contact/index.php` が同じフォルダの `contact-config.php`（サーバー上でのみ作成・gitignore済み）から読む。公開ファイル一式は `npm run package:onamae` で `release/onamae/` に組み立てる。
  - **Vercel（プレビュー）**: `api/contact.js` が環境変数 `CONTACT_TO` 等から読む（変数一覧は `.env.example`）。`/web/contact/` は `vercel.json` の rewrite で `api/contact.js` に振り向ける。
- 会社名「タックス・プラン税理士法人」のテキスト表記は問題ない（リンクは張らない）。

## ブランチ・マージ規約（絶対遵守）

- 作業ブランチは **`claude-dev` のみ**。それ以外のブランチを不必要に作成しない。
- 依頼された作業が完了したら、必ず **PRを作成し `main` へのマージまで完了**させる。

## プロジェクト構成

- Vite + React のSPA。`npm run build` でビルド（出力は `dist/`）。ビルド時に `scripts/prerender.mjs` がプリレンダリングを行い、`dist/index.html` に全コンテンツのHTMLを焼き込む（SEO対策。クライアントは hydrate）。
- Vercelにデプロイ。ビルド設定は `vercel.json` で明示（framework: vite）。
- デザイン・文言の元データは静的HTML時代のLPを忠実に移植したもの。変更時はデザインを崩さないこと。
- OGP・構造化データ（JSON-LD）は `index.html` の `<head>` で管理。
