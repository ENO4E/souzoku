// 社内ノウハウ（/knowhow/）の暗号化ページを作る・原稿を取り出す
//
// このリポジトリは公開なので、原稿（平文）と合言葉はコミットしない。コミットするのは暗号文だけ
// （public/knowhow/index.html）。ページを開いて合言葉を入れると、ブラウザの中で復号して表示する
// （PBKDF2-SHA256 で鍵を作り、AES-256-GCM で復号。合言葉が違えば復号できない）。
//
// 使い方（合言葉は環境変数で渡す。コマンド履歴に残したくなければ read -s などで入れる）
//   KNOWHOW_PASSWORD=... node scripts/knowhow.mjs encrypt <原稿.html>   … public/knowhow/index.html を作る
//   KNOWHOW_PASSWORD=... node scripts/knowhow.mjs decrypt [出力.html]   … 今のページから原稿を取り出す（編集用）
//
// 原稿を直すとき：decrypt で取り出す → 直す → encrypt で作り直す → 取り出した原稿は消す（コミットしない）
// 合言葉を変えるとき：decrypt（旧合言葉）→ encrypt（新合言葉）。ブラウザに記憶された旧合言葉の鍵は自動で無効になる
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { webcrypto as crypto } from 'node:crypto'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(root, 'public/knowhow/index.html')
const ITERATIONS = 600000 // 端末で約0.5〜1秒。総当たりを遅くするための回数
const enc = new TextEncoder()
const b64 = (buf) => Buffer.from(buf).toString('base64')
const unb64 = (s) => new Uint8Array(Buffer.from(s, 'base64'))

const [mode, file] = process.argv.slice(2)
const password = process.env.KNOWHOW_PASSWORD || ''
if (!['encrypt', 'decrypt'].includes(mode)) {
  console.error('使い方: KNOWHOW_PASSWORD=... node scripts/knowhow.mjs encrypt <原稿.html> | decrypt [出力.html]')
  process.exit(1)
}
if (!password) {
  console.error('環境変数 KNOWHOW_PASSWORD に合言葉を入れてください')
  process.exit(1)
}

async function deriveKey(salt, iterations) {
  const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

if (mode === 'decrypt') {
  const page = readFileSync(OUT, 'utf-8')
  const m = page.match(/<script type="application\/json" id="payload">([^<]+)<\/script>/)
  if (!m) throw new Error('public/knowhow/index.html に暗号文がありません')
  const p = JSON.parse(m[1])
  const key = await deriveKey(unb64(p.salt), p.iter)
  let plain
  try {
    plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(p.iv) }, key, unb64(p.ct))
  } catch {
    console.error('合言葉が違います')
    process.exit(1)
  }
  const text = new TextDecoder().decode(plain)
  if (file) writeFileSync(file, text)
  else process.stdout.write(text)
  process.exit(0)
}

if (!file) {
  console.error('原稿のファイルを指定してください')
  process.exit(1)
}
const content = readFileSync(file, 'utf-8')
const salt = crypto.getRandomValues(new Uint8Array(16))
const iv = crypto.getRandomValues(new Uint8Array(12))
const key = await deriveKey(salt, ITERATIONS)
const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(content))
const payload = JSON.stringify({ v: 1, iter: ITERATIONS, salt: b64(salt), iv: b64(iv), ct: b64(ct) })

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, shell(payload))
console.log(`public/knowhow/index.html を作りました（原稿 ${content.length} 文字 → 暗号文 ${payload.length} 文字）`)

// ---------------------------------------------------------------------------------------------
//  ページの外枠（ログイン画面・復号処理・表示のスタイル）。原稿の中身はここに書かない
// ---------------------------------------------------------------------------------------------
function shell(payload) {
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
<meta name="referrer" content="no-referrer">
<meta name="color-scheme" content="dark">
<title>社内ノウハウ</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;800&family=Inter+Tight:wght@500;600;700&display=swap">
<style>
:root{--bg:#070a12;--elev:#0d121e;--elev-2:#121929;--line:rgba(190,200,230,.12);--line-2:rgba(190,200,230,.22);--text:#eef2fa;--sub:#aab4c6;--mute:#6e7a8f;--accent:#e6c47a;--accent-2:#8fb3ff;--accent-rgb:230,196,122;--grad:linear-gradient(100deg,#e6c47a 0%,#f0d9a3 45%,#8fb3ff 100%);--danger:#ff8a80;--font:"Noto Sans JP","Hiragino Kaku Gothic ProN","Hiragino Sans","Yu Gothic Medium","Yu Gothic",Meiryo,sans-serif;--en:"Inter Tight","Helvetica Neue",Arial,sans-serif;--r:18px;--rs:12px}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth;scroll-padding-top:84px}
body{margin:0;background:var(--bg);color:var(--text);font-family:var(--font);font-size:15px;line-height:1.75;font-feature-settings:"palt"}
body::before{content:"";position:fixed;inset:0;pointer-events:none;background:radial-gradient(60% 50% at 15% 0%,rgba(230,196,122,.10),transparent 70%),radial-gradient(50% 45% at 100% 20%,rgba(143,179,255,.08),transparent 70%);z-index:-1}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
h1,h2,h3{margin:0;line-height:1.35}p{margin:.4em 0}
.k-wrap{width:min(1200px,100% - 40px);margin-inline:auto}

/* ログイン */
.k-gate-screen{min-height:100vh;display:grid;place-items:center;padding:32px 20px}
.k-login{width:min(420px,100%);background:var(--elev);border:1px solid var(--line);border-radius:var(--r);padding:40px 34px 30px;box-shadow:0 30px 80px rgba(0,0,0,.45)}
.k-login .k-mark{width:46px;height:46px;font-size:14px}
.k-login h1{font-size:22px;font-weight:800;margin:18px 0 6px}
.k-login p{color:var(--sub);font-size:14px}
.k-login form{margin-top:22px}
.k-field{display:flex;flex-direction:column;gap:8px;margin-bottom:14px}
.k-field span{font-size:12.5px;font-weight:700;color:var(--sub);letter-spacing:.04em}
.k-field input{font:inherit;font-size:16px;color:var(--text);background:#0a0f1a;border:1px solid var(--line-2);border-radius:10px;padding:12px 14px;min-height:48px}
.k-field input:focus{outline:2px solid rgba(var(--accent-rgb),.7);outline-offset:1px;border-color:transparent}
.k-check{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--sub);margin:4px 0 18px}
.k-btn{width:100%;font:inherit;font-weight:700;font-size:15px;color:#141a2a;background:var(--grad);border:0;border-radius:999px;padding:13px 18px;cursor:pointer}
.k-btn:disabled{opacity:.6;cursor:wait}
.k-err{color:var(--danger);font-weight:700;font-size:14px;min-height:1.6em;margin:0 0 6px}
.k-small{font-size:12px;color:var(--mute);margin-top:16px}
noscript p{color:var(--danger)}

/* ヘッダー */
.k-top{position:sticky;top:0;z-index:20;background:rgba(7,10,18,.82);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.k-topin{display:flex;align-items:center;gap:20px;height:64px}
.k-brand{display:flex;align-items:center;gap:10px;color:var(--text);font-weight:700;white-space:nowrap}.k-brand:hover{text-decoration:none}
.k-mark{display:inline-grid;place-items:center;width:32px;height:32px;border-radius:9px;background:var(--grad);color:#141a2a;font-family:var(--en);font-weight:700;font-size:12px}
.k-nav{display:flex;gap:2px;margin-left:auto;overflow-x:auto;scrollbar-width:none}.k-nav::-webkit-scrollbar{display:none}
.k-nav a,.k-out{color:var(--sub);font:inherit;font-size:13.5px;padding:7px 12px;border-radius:999px;white-space:nowrap;background:none;border:0;cursor:pointer}
.k-nav a:hover{color:var(--text);background:rgba(255,255,255,.06);text-decoration:none}
.k-out{color:var(--mute)}.k-out:hover{color:var(--text)}

/* 本文 */
main.k-wrap{padding-bottom:40px}
.k-hero{padding:72px 0 40px}
.k-eyebrow{font-family:var(--en);font-size:12px;font-weight:600;letter-spacing:.18em;color:var(--accent);margin:0 0 14px}
.k-hero h1{font-size:clamp(28px,4.2vw,46px);font-weight:800;letter-spacing:-.005em;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.k-lead{color:var(--sub);max-width:48em;margin-top:18px}
.k-domains{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:32px}
.k-domain{display:flex;flex-direction:column;gap:6px;padding:16px 18px;background:var(--elev);border:1px solid var(--line);border-radius:var(--rs);color:var(--text)}
.k-domain:hover{border-color:rgba(var(--accent-rgb),.5);text-decoration:none}
.k-domain strong{font-size:15px}
.k-sub{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--mute);font-weight:400}
.k-code{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:8px;border:1px solid rgba(var(--accent-rgb),.5);color:var(--accent);font-family:var(--en);font-weight:700;font-size:13px}

.k-sec{background:var(--elev);border:1px solid var(--line);border-radius:var(--r);padding:32px;margin:24px 0}
.k-sechead{display:flex;align-items:baseline;gap:14px;margin-bottom:6px}
.k-num{font-family:var(--en);font-weight:700;font-size:13px;color:var(--accent);margin:0;letter-spacing:.08em}
.k-sec h2{font-size:22px;font-weight:800}
.k-h3{display:flex;align-items:center;flex-wrap:wrap;gap:10px;font-size:17px;font-weight:800;margin:28px 0 4px}
.k-note{color:var(--sub);font-size:14px;margin-bottom:16px}
.k-mute{color:var(--mute);font-size:13px}

.k-road{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-top:20px}
.k-phase{background:var(--elev-2);border:1px solid var(--line);border-radius:var(--rs);padding:16px 16px 14px}
.k-phase.is-later{background:transparent;border-style:dashed}
.k-stage{font-family:var(--en);font-size:11px;letter-spacing:.12em;color:var(--mute);margin:0}
.k-phase h3{font-size:17px;font-weight:800;margin-top:2px}
.k-term{color:var(--sub);font-size:13px;margin:0 0 10px;padding-bottom:10px;border-bottom:1px solid var(--line)}
.k-phase ul{list-style:none;margin:0;padding:0}
.k-phase li{position:relative;padding:2px 0 2px 14px;font-size:13.5px}
.k-phase li::before{content:"";position:absolute;left:0;top:.8em;width:6px;height:2px;background:var(--accent)}
.k-gateline{position:relative;height:96px;margin-top:18px}
.k-gateline::before{content:"";position:absolute;left:0;right:10px;top:12px;height:1px;background:var(--line-2)}
.k-gateline::after{content:"";position:absolute;right:0;top:7px;border:5px solid transparent;border-left:9px solid var(--line-2)}
.k-gate{position:absolute;top:0;left:calc((100% + 12px) / 5 * (var(--after) + 1) - 6px);transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;white-space:nowrap;text-align:center}
.k-gate i{width:16px;height:16px;transform:rotate(45deg);background:var(--bg);border:1.5px solid var(--sub);margin:4px 0 12px}
.k-gate strong{font-size:14px}.k-gate span{font-size:12px;color:var(--mute)}
.k-G3 i{background:var(--accent);border-color:var(--accent);box-shadow:0 0 18px rgba(var(--accent-rgb),.55)}
.k-G3 strong{color:var(--accent)}

.k-levels{display:grid;gap:10px}
.k-level{display:grid;grid-template-columns:56px 1fr;gap:14px;align-items:start;padding:14px 16px;background:var(--elev-2);border:1px solid var(--line);border-radius:var(--rs)}
.k-level .lv{margin-top:3px}
.k-level strong{font-size:15px}.k-level p{margin:2px 0;font-size:14px}

.k-tblwrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
.k-tbl{width:100%;border-collapse:collapse;font-size:14px}
.k-tbl th,.k-tbl td{padding:11px 12px;border-bottom:1px solid var(--line);text-align:left;vertical-align:middle}
.k-tbl thead th{font-size:12px;font-weight:700;color:var(--mute);letter-spacing:.04em;white-space:nowrap;border-bottom:1px solid var(--line-2)}
.k-tbl th small{display:block;font-weight:400;font-size:11px}
.k-tbl tr.is-adv td{color:var(--mute)}
.k-tbl tbody tr:hover td{background:rgba(255,255,255,.02)}
.k-center,.k-center td,.k-center th{text-align:center!important}
.k-left{text-align:left!important}
.k-nowrap{white-space:nowrap}
.k-mono{font-family:var(--en);font-weight:600;color:var(--sub);letter-spacing:.02em}
.k-req{display:inline-flex;align-items:center;gap:6px;margin-right:14px;white-space:nowrap}

.lv{display:inline-grid;place-items:center;min-width:36px;height:22px;padding:0 7px;border-radius:6px;font-family:var(--en);font-weight:700;font-size:12px;line-height:1}
.lv0{background:rgba(190,200,230,.08);color:var(--mute)}
.lv1{background:rgba(143,179,255,.14);color:#b9cdff}
.lv2{background:rgba(143,179,255,.32);color:#e3ebff}
.lv3{background:rgba(230,196,122,.85);color:#1a1a12}
.lv4{background:var(--grad);color:#141a2a}

.k-tag{display:inline-block;font-size:11.5px;padding:1px 9px;border-radius:999px;border:1px solid var(--line-2);color:var(--mute)}
.k-tag.is-req{border-color:rgba(var(--accent-rgb),.55);color:var(--accent)}

.k-seg{display:flex;flex-wrap:wrap;gap:6px;position:sticky;top:64px;z-index:5;padding:10px 0;background:var(--elev)}
.k-seg a{display:inline-flex;align-items:center;gap:8px;padding:7px 14px;border-radius:999px;border:1px solid var(--line-2);color:var(--sub);font-size:13.5px}
.k-seg a:hover{color:var(--text);border-color:rgba(var(--accent-rgb),.6);text-decoration:none}
.k-seg span{font-family:var(--en);font-size:11px;color:var(--mute)}
.k-domainblock{scroll-margin-top:130px}

.k-tracks{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.k-track{background:var(--elev-2);border:1px solid var(--line);border-top:2px solid var(--accent);border-radius:var(--rs);padding:16px 18px}
.k-track h3{font-size:16px;font-weight:800}.k-track p{font-size:13.5px}
.k-foot{color:var(--mute);font-size:12px;padding:24px 0 48px;border-top:1px solid var(--line)}

@media (max-width:960px){.k-road{grid-template-columns:1fr 1fr}.k-gateline{display:none}.k-domains,.k-tracks{grid-template-columns:1fr 1fr}}
@media (max-width:640px){body{font-size:14.5px}.k-wrap{width:calc(100% - 32px)}.k-sec{padding:22px 18px}.k-road,.k-domains,.k-tracks{grid-template-columns:1fr}.k-brand span:last-child{display:none}.k-hero{padding:44px 0 24px}}
</style>
</head>
<body>
<div id="app">
  <section class="k-gate-screen">
    <div class="k-login">
      <span class="k-mark">TP</span>
      <h1>社内ノウハウ</h1>
      <p>社員専用のページです。共通の合言葉を入力してください。</p>
      <form id="login" autocomplete="off">
        <label class="k-field"><span>合言葉</span><input type="password" id="pw" required autocomplete="current-password" autofocus></label>
        <label class="k-check"><input type="checkbox" id="remember" checked> このブラウザで30日間記憶する</label>
        <p class="k-err" id="err" role="alert"></p>
        <button class="k-btn" id="go" type="submit">表示する</button>
      </form>
      <p class="k-small">共有のパソコンでは「記憶する」を外してください。</p>
      <noscript><p>JavaScript を有効にしてください。</p></noscript>
    </div>
  </section>
</div>
<script type="application/json" id="payload">${payload}</script>
<script>
(function () {
  var P = JSON.parse(document.getElementById('payload').textContent);
  var STORE = 'tp_knowhow_key';
  var DAYS = 30;
  var subtle = window.crypto && window.crypto.subtle;
  var $ = function (id) { return document.getElementById(id); };
  var unb64 = function (s) { var b = atob(s), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; };
  var b64 = function (buf) { var a = new Uint8Array(buf), s = ''; for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s); };

  function save(raw) {
    try { localStorage.setItem(STORE, JSON.stringify({ k: b64(raw), salt: P.salt, exp: Date.now() + DAYS * 864e5 })); } catch (e) {}
  }
  function forget() { try { localStorage.removeItem(STORE); } catch (e) {} }
  function stored() {
    try {
      var s = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (s && s.salt === P.salt && s.exp > Date.now()) return unb64(s.k);
    } catch (e) {}
    forget();
    return null;
  }

  function open(key) {
    return subtle.decrypt({ name: 'AES-GCM', iv: unb64(P.iv) }, key, unb64(P.ct)).then(function (buf) {
      $('app').innerHTML = new TextDecoder().decode(buf);
      var out = document.querySelector('[data-logout]');
      if (out) out.addEventListener('click', function () { forget(); location.reload(); });
      if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
    });
  }
  function fromRaw(raw) { return subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['decrypt']); }
  function fromPassword(pw) {
    return subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']).then(function (base) {
      return subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unb64(P.salt), iterations: P.iter }, base, 256);
    });
  }

  if (!subtle) { $('err').textContent = 'このブラウザでは表示できません（https で開いてください）。'; return; }

  var raw = stored();
  if (raw) fromRaw(raw).then(open).catch(forget);

  $('login').addEventListener('submit', function (e) {
    e.preventDefault();
    var pw = $('pw').value;
    var remember = $('remember').checked; // 復号すると画面が入れ替わるので先に読む
    if (!pw) return;
    $('go').disabled = true; $('err').textContent = '';
    var keyRaw;
    fromPassword(pw).then(function (bits) {
      keyRaw = bits;
      return fromRaw(bits);
    }).then(open).then(function () {
      if (remember) save(keyRaw); else forget();
    }).catch(function () {
      $('err').textContent = '合言葉が違います。';
      $('go').disabled = false;
      $('pw').select();
    });
  });
})();
</script>
</body>
</html>
`
}
