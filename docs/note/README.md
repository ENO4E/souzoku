# note のヘッダー画像の雛形

note（運営者が手で投稿）のヘッダー画像 1280×670 を作るための HTML。`header-template.html` の見出し・副題を書き換えて、ヘッドレス Chromium で撮る。

```
# 1. header-template.html を作業用にコピーして、.title / .sub の文言を書き換える（見出しは <br> で改行。1行10〜13字）
# 2. 撮る（Claude Code on the web の環境なら /opt/pw-browsers にある headless_shell）
/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell --no-sandbox --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1280,670 --virtual-time-budget=2000 \
  --screenshot=header.png file:///path/to/header.html
```

デザインの決まり（運営者が使っている既存のヘッダーに合わせたもの）:

- 紺地（#0b1222〜#0d1730）。左上に金の短い線＋「相続税申告相談センター｜大阪・南森町」
- 見出しは白の太字 2 行（60px 前後）。副題は金（#e9cf8c）2 行
- 左下に金枠の「基本報酬 99,000円〜（税込）」、その下に `kakuyasu-souzokuzei.com`
- 右側に金の線画（家・¥の書類・家系図）と、粒子を線でつないだ網（JS で生成。乱数の種を固定しているので同じ絵になる）
- 顔写真・キャラクターの絵は使わない。法人名は入れない

note 本文の決まりは `docs/claude-handoff.md` の「note」の節。
