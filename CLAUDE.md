# リポジトリ共通ルール

## コンテンツ方針（絶対遵守）

- **`info@tax-plan.net` をページに表示しない。**
- **`tax-plan.net` を含むドメイン・URL（`*.tax-plan.net` 等）も同様に、ページに表示せず、リンク先にも使用しない。**
- これらは表示テキストだけでなく、href属性や配信されるJSバンドルにも含めないこと。お問い合わせの送信先メールアドレスや認証情報はコード・リポジトリに書かない。
  - フォームの送信先URLは **`/web/contact/`**（変更する場合は `src/components/ContactSection.jsx` の `CONTACT_ENDPOINT` と `vercel.json` の rewrite を揃える）。
  - **本番（お名前.com レンタルサーバー）**: `/web/*` は `.htaccess` の Rewrite で `backend/v1.php` に委任され、サーバー上のバックエンド（TaxPlan-org/php。`backend/` はこのリポジトリの管理外）が処理する。成功時は `201 {"message":"送信が完了しました","id":829}` の形式で返る。**このリポジトリから PHP などのサーバー側コードを作成しないこと**（`backend/` には触らない）。本番への反映は自動（「本番への反映」参照。ファイルのアップロードは不要）。
  - **Vercel（プレビュー）**: `api/contact.js` が環境変数 `CONTACT_TO` 等から読む（変数一覧は `.env.example`）。`/web/contact/` は `vercel.json` の rewrite で `api/contact.js` に振り向ける。
- 会社名「タックス・プラン税理士法人」のテキスト表記は問題ない（リンクは張らない）。

## ブランチ・マージ規約（絶対遵守）

このアカウントのスキル **`dev-conventions`（開発規約）** に従う。スキル本体の手順・スクリプト（`references/git-workflow.md`、`scripts/check_branches.sh`、`scripts/finish_task.sh`）が正で、以下はその要点。

### ブランチは2本だけ

```
main        リリース済みの正。直接コミット・push しない
dev-claude  作業用。ここで開発し、PR で main に入れる
```

**1つの依頼が終わった時点で、リポジトリに存在するブランチは `main` と `dev-claude` の2本だけ**にする。それ以外のブランチ（`claude/…`・`feature/…`・`fix/…`・旧 `claude-dev` など）は作らない。見つけたらマージ済みなら削除し、未マージなら所有者に確認して報告に残す。

### 1つの依頼の流れ

1. **準備**: `git fetch origin --prune` → `main` を最新にし、`dev-claude` を `main` に `--ff-only` で揃える（無ければ `main` から作る）。早送りできない＝前の依頼の PR が未マージなので、先にそれを片付ける。
2. **開発**: `dev-claude` で実装・テスト・コミット（`npm run build` して `dist/` も同じコミットに含める）。`git push -u origin dev-claude`。
3. **PR**: `dev-claude` → `main` の Pull Request を作る（タイトルは依頼の要約、本文に「何を・なぜ・どう確認したか」）。
4. **マージ**: CI を確認してマージコミット（`--merge`）で `main` に入れる。**依頼ごとに必ずここまで完了する**（「後でまとめて」はしない。PR を作っただけ・マージ待ちは完了ではない）。承認が必要でこちらで押せないときは、PR の URL を添えて「承認待ち」と報告し、依頼は未完了として扱う。
5. **片付け**: `dev-claude` を `main` に追従させて push し、一時ブランチを全て削除。`check_branches.sh` で `main` と `dev-claude` だけであることを確認してから完了報告する（スキルの `finish_task.sh` で一括実行可）。

### 並列作業するとき

複数の作業を同時に進める必要があるときだけ、`dev-claude` から `dev-claude-<name>`（英小文字・数字・ハイフン。例 `dev-claude-fee`）を切る。終わったら **`dev-claude` にマージ**して一時ブランチは即削除（ローカル・リモート両方）。一時ブランチから直接 `main` に PR を出さない。

### してはいけないこと

- `main` に直接 push する
- 規約外の名前でブランチを作る・作業が終わった一時ブランチを残す
- PR を作らずに `main` へマージする
- 他人のブランチの履歴を書き換える（rebase・force push）

### 完了報告に含めること

- PR の URL とマージ済みであること（マージできなかったなら理由）
- `check_branches.sh` の結果（`main` と `dev-claude` だけであること）

## 本番への反映（自動。ファイルのアップロードは不要）

**`main` にマージすれば、ファイルを別途アップロードしなくても本番（kakuyasu-souzokuzei.com）のページが更新される。** WinSCP などで `dist/` を手でアップロードしない（`npm run package:onamae` の ZIP も通常は不要）。

```
dev-claude → main にマージ（dist/ を含む）
  → GitHub Actions（build.yml）が main をビルドし、dist/ に差分があれば main に自動コミット
  → main への push ごとに GitHub の Webhook がサーバーの /web/deploy/souzoku/ を呼ぶ
  → サーバー（TaxPlan-org/php）が main を git で取り込み、dist/ の中身だけを公開フォルダに上書きで置く
```

- 置かれるのは `dist/` の中身だけ。`assets/` のサーバーにだけある画像は消されない。`.htaccess`・`backend/` は dist にあっても置かれず、php 側の共通ファイルが置かれる
- 反映の確認：数分後に本番のページを開く（ブラウザのキャッシュに注意）。失敗したときは GitHub の Webhook の Recent Deliveries で応答を見る（仕組み・手順は TaxPlan-org/php の `docs/deploy.md`）
- `dist/` を更新せずにマージしても Actions がビルドして反映されるが、PR では `npm run build` した `dist/` を含める（上の「プロジェクト構成」）

## アクセス解析（beacon）

- Google アナリティクス（`index.html` の gtag）に加え、自サイトの `/web/beacon/` へ閲覧・離脱・操作の記録を送る（受け口は TaxPlan-org/php。仕様は php リポジトリの `docs/beacon.md`。集計はイントラの `/api/beacon/stats/?host=k`）
- `src/beacon.js`（送信処理。php の docs/beacon.md 6-2 と同じもの）。`src/main.jsx` で最初に `start()`・`pageview()`、SPA の切り替え（App.jsx の `route:change`）で `leave()`・`pageview()`
- 自動で送るもの：参照元・utm・広告のクリックID の種類（値は送らない）、滞在時間・画面を見ていた時間・スクロールの深さ、表示速度、電話のリンク（`tel_click`）、外部リンク、ダウンロード、フォームの入力開始（`<form data-beacon-form="contact">`）
- 操作の計測：要素に `data-beacon="cta_click" data-beacon-label="場所"` を付けるだけ。フォームの送信成功は `ContactSection.jsx` で `event('form_submit', { form: 'contact', id })`（受付番号 `id` を付け、イントラの `/api/beacon/journeys/?inquiry=<id>` でこのお問い合わせに至った閲覧の流れを見られる。プライバシーポリシーの「3. 利用目的」「7.」に記載しているから行える）
- 氏名・電話番号・メールアドレス・フォームの入力値は送らない。Cookie は使わない（訪問者ID は localStorage）。社員の端末は一度 `?tp_optout=1` を付けて開くと以後送らない
- 計測する内容を変えたら、プライバシーポリシー（`src/content/privacy.js` の「7.」。`REVISED` も更新）とフッターの「アクセス解析について」（`Footer.jsx`）も合わせて直す

## プライバシーポリシー（/privacy/）

- 文言は `src/content/privacy.js`、表示は `src/views/PrivacyView.jsx`。記事ページと同じく通常のページ（SPA の切り替えはしない）で、ビルド時に `dist/privacy/index.html` としてプリレンダリングし、sitemap にも載せる
- 運営法人（タックス・プラン税理士法人）が公表している個人情報保護方針をこのサイト向けにしたもの。個人情報保護管理者・窓口の所在地・電話などの事実は法人の公表内容と同じにし、推測で書き換えない。メールアドレス・tax-plan.net のドメインは載せない（コンテンツ方針。窓口は電話とお問い合わせフォーム）
- 内容を変えたら `REVISED`（最終改定日）を更新する。フッター・フォームの注記（`ContactSection.jsx` の `form__privacy`）からリンクしている

## 技術選定

`dev-conventions` の規約では HP・LP は Next.js が既定だが、このプロジェクトは既存の **Vite + React（ビルド時プリレンダリングで SEO 対応）** で構築済みのため、規約の「既存プロジェクトの構成は変えない」に従いこの構成を維持する。Next.js への置き換えは、必要なら別の依頼として提案・実施する。バックエンドはサーバー上の既存 PHP（TaxPlan-org/php）で、このリポジトリでは扱わない。

## 本番ディレクトリ構造（基本指針・絶対遵守）

本番（お名前.com レンタルサーバー）の公開ディレクトリは次の構造。ビルド出力 `dist/` はこの構造そのもので **git 管理する**（`git pull` した `dist/` の中身＝サーバーにアップロードする内容＝納品ZIPの中身）。

```
.htaccess        … 全ドメイン共通で、正本は TaxPlan-org/php の backend/sites/.htaccess（配置のたびに php 側が上書きで置く。このリポジトリの public/.htaccess は本番では使われない）
sitemap.xml
robots.txt
index.html
service/ simulation/ contact/ … 各ページの index.html（ビルドで生成。実体は同じアプリで、ページごとに SEO タグとプリレンダリング内容が異なる）
articles/        … コラム一覧（articles/index.html）と記事（articles/<slug>/index.html）。ビルドで生成
error/           … エラーページ（403.html・404.html・500.html）。このリポジトリの public/error/ で作成・管理する（.htaccess の ErrorDocument が参照）
backend/         … サーバー側で管理（backend/v1.php、TaxPlan-org/php）。唯一このリポジトリが触らないディレクトリ
assets/
  css/           … CSS（assets/css/index.css）
  js/            … JavaScript（assets/js/index.js）
  *.png|jpg|webp … 画像は assets 直下に置く（css・js と同じ階層）
```

- `backend/` と `.htaccess` 以外（HTML・CSS・JS・エラーページ・`robots.txt`・`sitemap.xml`）はすべてこのリポジトリの責務。`backend/` と `.htaccess` は TaxPlan-org/php の責務（`backend/sites/`）で、こちらからは触らない（`.htaccess` の変更が必要なら php リポジトリに依頼する）。
- CSS / JS は外部ファイルのまま出力する（`index.html` へのインライン化はしない）。ファイル名は固定で、更新時のキャッシュ対策として `scripts/prerender.mjs` が各 HTML 内の URL に `?v=内容ハッシュ` を付ける。
- 画像は `public/assets/` に置く（ビルドで `assets/` 直下に並ぶ）。サーバー側にだけ置いている画像（`topfront.jpg`・`ceo1.jpg` など）もあるため、アップロード時に `assets/` 内の既存ファイルを消さない。

## プロジェクト構成

- 画面構成（waaark.com を参考にした3パネル構成）：ホーム（`#/`）は Service / Simulation / Contact の3つの全画面パネル。クリックすると幕のアニメーション（`PageTransition.jsx`）で各ページに遷移する。
  - ルーティングはパス式（`src/router.js`）。`/service/`・`/simulation/`・`/contact/` は本物の URL で、ビルド時に `dist/service/index.html` などとして**ページごとにプリレンダリング**される（そのページだけを含む HTML＋ページ固有の title / description / canonical / OGP / 構造化データ。内容は `src/content/seo.js`）。ページ内の位置は `/service/#fee` のように続ける。クライアント側はリンクのクリックを横取りして幕のアニメーション付きで切り替え（History API）、他のページはマウント後に非表示で用意する。旧URL（`#/service`）は新URLに置き換える。
  - SEO の要点：ページごとの URL・title・description・canonical、BreadcrumbList / FAQPage / Service / AccountingService（Offer 付き）/ WebSite / WebPage の構造化データ、`sitemap.xml` の自動生成、ホームの h1、Google Fonts の非ブロック読み込み、`.htaccess` の圧縮とキャッシュ。文言は `src/content/seo.js` で管理する。
  - 01 Service＝従来のLP本文（お悩み・選ばれる理由・料金・流れ・代表挨拶・お客様の声・対応エリア・FAQ）、02 Simulation＝相続税シミュレーション（`src/lib/inheritanceTax.js`）＋報告書紹介、03 Contact＝フォーム＋事務所概要。
- **コラム（記事）**：`content/articles/<slug>.md` を置いて `npm run build` すると `/articles/` と `/articles/<slug>/` が生成される（`scripts/articles.mjs` が Markdown を HTML に変換、`src/views/ArticleViews.jsx` が表示）。
  - ファイル名（slug）は英小文字・数字・ハイフン。先頭に `title / description / date / tags` の見出し情報（`---` で囲む）を書く。`_` 始まりのファイルは無視（下書き用）
  - 記事ページは SPA の幕アニメーションを使わない通常のページ。構造化データ（BlogPosting・BreadcrumbList）と sitemap（lastmod＝date）は自動生成
  - `main` に Markdown を追加して push すれば GitHub Actions がビルドして `dist/` を更新する
- Vite + React のSPA。`npm run build` でビルド（出力は `dist/`）。ビルド時に `scripts/prerender.mjs` がプリレンダリングを行い、`dist/index.html` に全コンテンツのHTMLを焼き込む（SEO対策。クライアントは hydrate）。
- **`dist/` は git 管理**（`.gitignore` に入れない）。ビルドは決定的（CSS/JS の `?v=` は内容ハッシュ）なので、同じソースからは同じ `dist/` ができる。
  - ソースを変更した PR では `npm run build` を実行し、`dist/` の変更も同じ PR に含める。
  - 保険として GitHub Actions（`.github/workflows/build.yml`）が `main` への push 時にリモートでビルドし、`dist/` に差分があれば `main` に自動コミットする。手動実行（workflow_dispatch）も可。
  - `npm run package:onamae` は `dist/` を `release/onamae/` にコピーするだけ（ZIP 作成用。`release/` は git 管理外）。
- 本文の表示はJSに依存させないこと（スクロール演出は JS が動いた場合に画面外の要素だけを一時的に隠す方式）。
- Vercelにデプロイ。ビルド設定は `vercel.json` で明示（framework: vite）。
- デザインは TaxPlan-org/HP-DX（DX化支援サイト）のデザインシステムを移植したもの（ダーク基調、金×紺のグラデーション、three.js の粒子背景、ローダー、カーソル演出、スクロール連動のリビール）。変更時はこの世界観を崩さないこと。
  - 文言・料金・サービス内容は `src/content/site.js` に集約。デザイン変更で中身（金額・文言）を変えない。
  - three.js（`src/three/`）は `SceneCanvas.jsx` が表示後に遅延読み込みする（`assets/js/ParticleField-<hash>.js`）。WebGL が使えない端末ではグラデーション背景にフォールバックする。
  - 演出は JS が動くときだけ（`.js` クラス）。JS 無効でも本文は全て表示される。
- OGP・構造化データ（JSON-LD）は `index.html` の `<head>` で管理。
