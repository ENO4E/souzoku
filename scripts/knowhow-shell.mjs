// 社内ノウハウ（/knowhow/）の外枠のスタイルと動き。scripts/knowhow.mjs が index.html に埋め込む
// ここは公開される（暗号化しない）ので、原稿の中身（教材の文言）は書かない

export const CSS = `
:root{--bg:#070a12;--elev:#0d121e;--elev-2:#121929;--elev-3:#18213a;--line:rgba(190,200,230,.12);--line-2:rgba(190,200,230,.22);--text:#eef2fa;--sub:#aab4c6;--mute:#7c879b;--accent:#e6c47a;--accent-2:#8fb3ff;--accent-rgb:230,196,122;--blue-rgb:143,179,255;--ok:#7fd8a4;--ng:#ff8a80;--warn:#ffb86b;--grad:linear-gradient(100deg,#e6c47a 0%,#f0d9a3 45%,#8fb3ff 100%);--font:"Noto Sans JP","Hiragino Kaku Gothic ProN","Hiragino Sans","Yu Gothic Medium","Yu Gothic",Meiryo,sans-serif;--en:"Inter Tight","Helvetica Neue",Arial,sans-serif;--r:18px;--rs:12px}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-padding-top:84px}
body{margin:0;background:var(--bg);color:var(--text);font-family:var(--font);font-size:15px;line-height:1.8;font-feature-settings:"palt"}
body::before{content:"";position:fixed;inset:0;pointer-events:none;background:radial-gradient(60% 50% at 15% 0%,rgba(230,196,122,.09),transparent 70%),radial-gradient(50% 45% at 100% 20%,rgba(143,179,255,.07),transparent 70%);z-index:-1}
[hidden]{display:none!important}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
h1,h2,h3{margin:0;line-height:1.4}p{margin:.5em 0}
.k-wrap{width:min(1200px,100% - 40px);margin-inline:auto}
button{font:inherit}

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
.k-field input:focus,.k-search:focus{outline:2px solid rgba(var(--accent-rgb),.7);outline-offset:1px;border-color:transparent}
.k-check{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--sub);margin:4px 0 18px}
.k-btn{width:100%;font-weight:700;font-size:15px;color:#141a2a;background:var(--grad);border:0;border-radius:999px;padding:13px 18px;cursor:pointer}
.k-btn:disabled{opacity:.6;cursor:wait}
.k-err{color:var(--ng);font-weight:700;font-size:14px;min-height:1.6em;margin:0 0 6px}
.k-small{font-size:12px;color:var(--mute);margin-top:16px}
noscript p{color:var(--ng)}

/* ヘッダー */
.k-top{position:sticky;top:0;z-index:20;background:rgba(7,10,18,.84);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.k-topin{display:flex;align-items:center;gap:20px;height:64px}
.k-brand{display:flex;align-items:center;gap:10px;color:var(--text);font-weight:700;white-space:nowrap}.k-brand:hover{text-decoration:none}
.k-mark{display:inline-grid;place-items:center;width:32px;height:32px;border-radius:9px;background:var(--grad);color:#141a2a;font-family:var(--en);font-weight:700;font-size:12px}
.k-nav{display:flex;gap:2px;margin-left:auto;overflow-x:auto;scrollbar-width:none}.k-nav::-webkit-scrollbar{display:none}
.k-nav a,.k-out{color:var(--sub);font-size:13.5px;padding:7px 12px;border-radius:999px;white-space:nowrap;background:none;border:0;cursor:pointer}
.k-nav a:hover{color:var(--text);background:rgba(255,255,255,.06);text-decoration:none}
.k-nav a.is-on{color:#141a2a;background:var(--accent);font-weight:700}
.k-out{color:var(--mute)}.k-out:hover{color:var(--text)}
main.k-wrap{padding-bottom:48px;outline:none;min-height:60vh}
.k-foot{color:var(--mute);font-size:12px;padding:24px 0 48px;border-top:1px solid var(--line)}
.k-loading{padding:80px 0;color:var(--mute);text-align:center}

/* 共通部品 */
.k-hero{padding:64px 0 32px}.k-hero-sm{padding:48px 0 16px}
.k-eyebrow{font-family:var(--en);font-size:12px;font-weight:600;letter-spacing:.16em;color:var(--accent);margin:0 0 12px}
.k-hero h1{font-size:clamp(28px,4.2vw,46px);font-weight:800;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.k-hero-sm h1{font-size:clamp(26px,3.4vw,36px)}
.k-lead{color:var(--sub);max-width:52em;margin-top:14px}
.k-domains{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:28px}
.k-domain{display:flex;flex-direction:column;gap:6px;padding:16px 18px;background:var(--elev);border:1px solid var(--line);border-radius:var(--rs);color:var(--text)}
.k-domain:hover{border-color:rgba(var(--accent-rgb),.5);text-decoration:none}
.k-domain strong{font-size:15px}
.k-sub{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--mute);font-weight:400}
.k-code{display:inline-grid;place-items:center;width:28px;height:28px;flex:none;border-radius:8px;border:1px solid rgba(var(--accent-rgb),.5);color:var(--accent);font-family:var(--en);font-weight:700;font-size:13px}
.k-sec{background:var(--elev);border:1px solid var(--line);border-radius:var(--r);padding:32px;margin:24px 0}
.k-sechead{display:flex;align-items:baseline;flex-wrap:wrap;gap:14px;margin-bottom:6px}
.k-num{font-family:var(--en);font-weight:700;font-size:12px;color:var(--accent);margin:0;letter-spacing:.12em}
.k-sec h2,.k-h2{font-size:22px;font-weight:800}
.k-h2{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:4px}
.k-h3{font-size:17px;font-weight:800;margin:28px 0 4px}
.k-count{font-family:var(--en);color:var(--mute);font-size:13px}
.k-note{color:var(--sub);font-size:14px;margin-bottom:16px}
.k-mute{color:var(--mute);font-size:13px}
.k-tag{display:inline-block;font-size:11.5px;padding:1px 9px;border-radius:999px;border:1px solid var(--line-2);color:var(--sub);white-space:nowrap;line-height:1.7}
.k-tag.is-req{border-color:rgba(var(--accent-rgb),.55);color:var(--accent)}
.k-mono{font-family:var(--en);font-weight:600;color:var(--sub);letter-spacing:.02em}
.k-nowrap{white-space:nowrap}.k-center,.k-center td,.k-center th{text-align:center!important}.k-left{text-align:left!important}
.lv{display:inline-grid;place-items:center;min-width:36px;height:22px;padding:0 7px;border-radius:6px;font-family:var(--en);font-weight:700;font-size:12px;line-height:1}
.lv0{background:rgba(190,200,230,.08);color:var(--mute)}.lv1{background:rgba(143,179,255,.14);color:#b9cdff}.lv2{background:rgba(143,179,255,.32);color:#e3ebff}.lv3{background:rgba(230,196,122,.85);color:#1a1a12}.lv4{background:var(--grad);color:#141a2a}

.k-seg{display:flex;flex-wrap:wrap;gap:6px}
.k-seg a,.k-seg button{display:inline-flex;align-items:center;gap:8px;padding:7px 14px;border-radius:999px;border:1px solid var(--line-2);color:var(--sub);font-size:13.5px;background:none;cursor:pointer}
.k-seg a:hover,.k-seg button:hover{color:var(--text);border-color:rgba(var(--accent-rgb),.6);text-decoration:none}
.k-seg .is-on{background:var(--accent);border-color:var(--accent);color:#141a2a;font-weight:700}
.k-seg span{font-family:var(--en);font-size:11px;color:var(--mute)}.k-seg .is-on span{color:#4a3e20}
.k-seg-sticky{position:sticky;top:64px;z-index:5;padding:12px 0;background:var(--bg)}

/* 一覧 */
.k-filter{display:flex;flex-wrap:wrap;align-items:center;gap:12px;justify-content:space-between;margin:12px 0 20px}
.k-search{flex:1 1 280px;max-width:420px;font:inherit;font-size:14.5px;color:var(--text);background:#0a0f1a;border:1px solid var(--line-2);border-radius:999px;padding:10px 18px}
.k-lgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:12px}
.k-lcard{display:flex;flex-direction:column;gap:8px;padding:18px;background:var(--elev-2);border:1px solid var(--line);border-radius:var(--rs);color:var(--text);transition:border-color .2s,transform .2s}
.k-lcard:hover{border-color:rgba(var(--accent-rgb),.55);text-decoration:none;transform:translateY(-2px)}
.k-lcard-top{display:flex;gap:8px;align-items:center;font-size:12px;color:var(--mute)}
.k-lcard-skill{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.k-lcard strong{font-size:15.5px;line-height:1.5}
.k-lcard-sum{color:var(--sub);font-size:13px;line-height:1.7;flex:1}
.k-lcard-meta{display:flex;gap:10px;align-items:center;font-size:12px;color:var(--mute)}
.k-empty{color:var(--mute);text-align:center;padding:24px}

/* ロードマップ */
.k-road{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-top:20px}
.k-phase{background:var(--elev-2);border:1px solid var(--line);border-radius:var(--rs);padding:16px 16px 14px}
.k-phase.is-later{background:transparent;border-style:dashed}
.k-stage{font-family:var(--en);font-size:11px;letter-spacing:.12em;color:var(--mute);margin:0}
.k-phase h3{font-size:17px;font-weight:800;margin-top:2px}
.k-term{color:var(--sub);font-size:13px;margin:0 0 10px;padding-bottom:10px;border-bottom:1px solid var(--line)}
.k-phase ul{list-style:none;margin:0;padding:0}
.k-phase li{position:relative;padding:2px 0 2px 14px;font-size:13.5px}
.k-phase li::before{content:"";position:absolute;left:0;top:.85em;width:6px;height:2px;background:var(--accent)}
.k-gateline{position:relative;height:96px;margin-top:18px}
.k-gateline::before{content:"";position:absolute;left:0;right:10px;top:12px;height:1px;background:var(--line-2)}
.k-gateline::after{content:"";position:absolute;right:0;top:7px;border:5px solid transparent;border-left:9px solid var(--line-2)}
.k-gate{position:absolute;top:0;left:calc((100% + 12px) / 5 * (var(--after) + 1) - 6px);transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;white-space:nowrap;text-align:center}
.k-gate i{width:16px;height:16px;transform:rotate(45deg);background:var(--bg);border:1.5px solid var(--sub);margin:4px 0 12px}
.k-gate strong{font-size:14px}.k-gate span{font-size:12px;color:var(--mute)}
.k-G3 i{background:var(--accent);border-color:var(--accent);box-shadow:0 0 18px rgba(var(--accent-rgb),.55)}.k-G3 strong{color:var(--accent)}
.k-levels{display:grid;gap:10px}
.k-level{display:grid;grid-template-columns:56px 1fr;gap:14px;align-items:start;padding:14px 16px;background:var(--elev-2);border:1px solid var(--line);border-radius:var(--rs)}
.k-level .lv{margin-top:3px}.k-level strong{font-size:15px}.k-level p{margin:2px 0;font-size:14px}
.k-req{display:inline-flex;align-items:center;gap:6px;margin-right:14px;white-space:nowrap}
.k-tracks{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.k-track{background:var(--elev-2);border:1px solid var(--line);border-top:2px solid var(--accent);border-radius:var(--rs);padding:16px 18px}
.k-track h3{font-size:16px;font-weight:800}.k-track p{font-size:13.5px}

/* 表 */
.k-tblwrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
.k-tbl,.k-prose table{width:100%;border-collapse:collapse;font-size:14px}
.k-tbl th,.k-tbl td,.k-prose th,.k-prose td{padding:10px 12px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
.k-tbl thead th,.k-prose thead th{font-size:12px;font-weight:700;color:var(--mute);letter-spacing:.04em;white-space:nowrap;border-bottom:1px solid var(--line-2);vertical-align:bottom}
.k-tbl th small{display:block;font-weight:400;font-size:11px}
.k-tbl tr.is-adv td{color:var(--mute)}
.k-tbl tbody tr:hover td{background:rgba(255,255,255,.02)}
.k-skilltbl td{vertical-align:middle}
.k-lessons a{display:block;font-size:13px;line-height:1.5;padding:2px 0}
.k-domainblock{scroll-margin-top:130px}

/* 教材ページ */
.k-crumb{display:flex;flex-wrap:wrap;gap:8px;font-size:12.5px;color:var(--mute);padding:24px 0 0}
.k-crumb a{color:var(--sub)}
.k-lhead{padding:24px 0 8px;max-width:860px}
.k-lhead h1{font-size:clamp(24px,3.2vw,34px);font-weight:800}
.k-lmeta{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;font-size:12.5px;color:var(--mute);margin-top:14px}
.k-lbody{display:grid;grid-template-columns:220px minmax(0,1fr);gap:40px;margin-top:24px;align-items:start}
.k-toc{position:sticky;top:88px;font-size:13px;border-left:1px solid var(--line-2);padding-left:16px}
.k-toc ol{list-style:none;margin:8px 0 0;padding:0;counter-reset:t}
.k-toc li{counter-increment:t;margin:6px 0}
.k-toc a{color:var(--sub);display:block;line-height:1.5}
.k-toc a::before{content:counter(t,decimal-leading-zero) " ";font-family:var(--en);color:var(--mute)}
.k-toc a:hover{color:var(--accent);text-decoration:none}
.k-prose{min-width:0;overflow-wrap:break-word;max-width:820px;background:var(--elev);border:1px solid var(--line);border-radius:var(--r);padding:36px 40px}
.k-prose>*:first-child{margin-top:0}
.k-prose h2{font-size:21px;font-weight:800;margin:44px 0 14px;padding-top:6px;scroll-margin-top:88px;display:flex;gap:12px;align-items:baseline}
.k-prose h2::before{content:"";flex:none;width:4px;height:1em;border-radius:2px;background:var(--grad);transform:translateY(.12em)}
.k-prose h3{font-size:16.5px;font-weight:800;margin:28px 0 8px;color:var(--accent-3,#f3dcac)}
.k-prose p,.k-prose li{color:#dfe5f1}
.k-prose ul,.k-prose ol{padding-left:1.4em}
.k-prose li{margin:4px 0}
.k-prose strong{color:#fff;background:linear-gradient(transparent 62%,rgba(var(--accent-rgb),.28) 62%)}
.k-prose code{font-family:var(--en);background:rgba(255,255,255,.07);padding:1px 6px;border-radius:5px;font-size:.92em}
.k-prose hr{border:0;border-top:1px solid var(--line);margin:32px 0}
.k-prose blockquote{margin:16px 0;padding:4px 18px;border-left:3px solid var(--line-2);color:var(--sub)}
.kb-table{margin:16px 0;border:1px solid var(--line);border-radius:var(--rs)}
.kb-table table{margin:0}.kb-table tr:last-child td{border-bottom:0}
.kb-pre{background:#0a0f1a;border:1px solid var(--line);border-radius:10px;padding:14px 16px;overflow-x:auto;font-size:13px}
.k-sources{margin-top:36px;padding-top:18px;border-top:1px solid var(--line);font-size:13px}
.k-sources ul{margin:6px 0 0;padding-left:1.2em}.k-sources li{color:var(--sub)}
.k-disclaimer{margin-top:28px;font-size:12px;color:var(--mute)}
.k-related{margin-top:32px}
.k-prevnext{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:28px}
.k-pn{display:flex;flex-direction:column;gap:4px;padding:16px 18px;border:1px solid var(--line);border-radius:var(--rs);background:var(--elev);color:var(--text)}
.k-pn:last-child{text-align:right}
.k-pn span{font-size:12px;color:var(--mute)}.k-pn strong{font-size:14px}
.k-pn:hover{border-color:rgba(var(--accent-rgb),.55);text-decoration:none}
.k-pn.is-none{visibility:hidden}

/* 図解ブロック */
.kb-label{font-family:var(--en);font-size:11.5px;font-weight:700;letter-spacing:.12em;color:var(--accent);margin:0 0 6px;text-transform:uppercase}
.kb-point,.kb-warn,.kb-note{margin:20px 0;padding:16px 20px;border-radius:var(--rs);border:1px solid}
.kb-point{background:rgba(var(--accent-rgb),.07);border-color:rgba(var(--accent-rgb),.35)}
.kb-warn{background:rgba(255,138,128,.07);border-color:rgba(255,138,128,.35)}.kb-warn .kb-label{color:var(--ng)}
.kb-note{background:rgba(var(--blue-rgb),.06);border-color:rgba(var(--blue-rgb),.28)}
.kb-point>*:last-child,.kb-warn>*:last-child,.kb-note>*:last-child{margin-bottom:0}
.kb-point ul,.kb-warn ul{margin:4px 0}

.kb-flow{list-style:none;margin:22px 0;padding:0;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:26px;counter-reset:f}
.kb-flow li{position:relative;display:flex;flex-direction:column;gap:6px;padding:16px 14px 14px;background:var(--elev-2);border:1px solid var(--line-2);border-radius:var(--rs);margin:0}
.kb-flow li:not(:last-child)::after{content:"";position:absolute;right:-20px;top:50%;width:14px;height:14px;border-top:2px solid var(--accent);border-right:2px solid var(--accent);transform:translateY(-50%) rotate(45deg)}
.kb-flow-n{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--grad);color:#141a2a;font-family:var(--en);font-weight:700;font-size:12.5px}
.kb-flow strong{font-size:14.5px;background:none;line-height:1.5}
.kb-flow li>span:last-child:not(.kb-flow-n){font-size:12.5px;color:var(--sub);line-height:1.65}

.kb-flow.is-long{grid-auto-flow:row;grid-auto-columns:auto;gap:14px}
.kb-flow.is-long li{display:grid;grid-template-columns:26px minmax(0,11em) minmax(0,1fr);gap:4px 14px;align-items:center;padding:12px 16px}
.kb-flow.is-long li:not(:last-child)::after{right:auto;left:28px;top:auto;bottom:-13px;width:9px;height:9px;transform:rotate(135deg)}
.kb-decision{margin:22px 0;display:flex;flex-direction:column}
.kb-dz-row{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:14px;align-items:center}
.kb-dz-q{position:relative;padding:14px 16px 14px 56px;background:var(--elev-2);border:1px solid var(--line-2);border-radius:var(--rs);font-weight:700;font-size:14.5px;line-height:1.6}
.kb-dz-n{position:absolute;left:14px;top:50%;transform:translateY(-50%);font-family:var(--en);font-weight:700;font-size:12px;color:#141a2a;background:var(--accent);border-radius:6px;padding:2px 6px}
.kb-dz-outs{display:flex;flex-direction:column;gap:6px}
.kb-dz-out{position:relative;display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;background:rgba(var(--blue-rgb),.08);border:1px dashed rgba(var(--blue-rgb),.45);font-size:13.5px}
.kb-dz-out::before{content:"";position:absolute;left:-14px;top:50%;width:14px;border-top:1px dashed rgba(var(--blue-rgb),.55)}
.kb-dz-cond{flex:none;font-size:11.5px;font-weight:700;color:var(--accent-2);border:1px solid rgba(var(--blue-rgb),.5);border-radius:999px;padding:0 8px}
.kb-dz-res{font-weight:700}
.kb-dz-next{position:relative;height:40px;margin-left:36px;border-left:2px solid var(--accent)}
.kb-dz-next::after{content:"";position:absolute;left:-7px;bottom:0;border:6px solid transparent;border-top:8px solid var(--accent);border-bottom:0}
.kb-dz-next span{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:12px;font-weight:700;color:var(--accent)}

.kb-timeline{list-style:none;margin:22px 0;padding:0 0 0 4px;position:relative}
.kb-timeline::before{content:"";position:absolute;left:96px;top:8px;bottom:8px;width:2px;background:linear-gradient(var(--accent),rgba(var(--blue-rgb),.6))}
.kb-timeline li{display:grid;grid-template-columns:92px 1fr;gap:28px;position:relative;padding:8px 0;margin:0}
.kb-timeline li::before{content:"";position:absolute;left:87px;top:16px;width:12px;height:12px;border-radius:50%;background:var(--bg);border:2px solid var(--accent)}
.kb-tl-when{font-family:var(--en);font-weight:700;font-size:13px;color:var(--accent);text-align:right;line-height:1.5;padding-top:4px}
.kb-timeline strong{background:none;font-size:14.5px}
.kb-timeline p{margin:2px 0 0;font-size:13.5px;color:var(--sub)}

.kb-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(165px,1fr));gap:12px;margin:22px 0}
.kb-card{padding:16px;background:var(--elev-2);border:1px solid var(--line-2);border-top:3px solid var(--accent);border-radius:var(--rs)}
.kb-card:nth-child(4n+2){border-top-color:var(--accent-2)}.kb-card:nth-child(4n+3){border-top-color:#b99bff}.kb-card:nth-child(4n+4){border-top-color:var(--ok)}
.kb-card strong{font-size:15px;background:none}
.kb-card p{margin:6px 0 0;font-size:13px;color:var(--sub);line-height:1.7}
.kb-card .kb-card-ex{color:var(--mute);font-size:12.5px;border-top:1px dashed var(--line-2);padding-top:6px;margin-top:8px}

.kb-formula{overflow-x:auto;margin:20px 0;padding:16px 20px;border-radius:var(--rs);background:#0a0f1a;border:1px solid var(--line-2);font-size:14px}
.kb-formula p{margin:4px 0;color:var(--sub)}
.kb-formula .kb-f-res{color:var(--text);font-weight:700;border-top:1px solid var(--line-2);padding-top:8px;margin-top:8px}
.kb-formula .kb-f-res::before{content:"＝ ";color:var(--accent)}

.kb-qa{margin:20px 0;display:flex;flex-direction:column;gap:8px}
.kb-qa details{background:var(--elev-2);border:1px solid var(--line);border-radius:var(--rs)}
.kb-qa details[open]{border-color:rgba(var(--accent-rgb),.4)}
.kb-qa summary{list-style:none;cursor:pointer;display:flex;gap:12px;align-items:flex-start;padding:14px 44px 14px 16px;font-weight:700;font-size:14.5px;line-height:1.6;position:relative}
.kb-qa summary::-webkit-details-marker{display:none}
.kb-qa summary::after{content:"";position:absolute;right:18px;top:20px;width:8px;height:8px;border-right:2px solid var(--sub);border-bottom:2px solid var(--sub);transform:rotate(45deg);transition:transform .2s}
.kb-qa details[open] summary::after{transform:rotate(225deg);top:24px}
.kb-qa-q,.kb-qa-mark{flex:none;display:inline-grid;place-items:center;width:24px;height:24px;border-radius:6px;font-family:var(--en);font-weight:700;font-size:13px}
.kb-qa-q{background:var(--accent);color:#141a2a}
.kb-qa-a{display:flex;gap:12px;padding:0 16px 14px}
.kb-qa-mark{background:rgba(var(--blue-rgb),.2);color:var(--accent-2)}
.kb-qa-a>div{font-size:14px;color:var(--sub)}.kb-qa-a>div>*:first-child{margin-top:2px}.kb-qa-a>div>*:last-child{margin-bottom:0}

.kb-check{margin:32px 0 8px;padding:22px;border-radius:var(--r);background:linear-gradient(160deg,rgba(var(--accent-rgb),.08),rgba(var(--blue-rgb),.06));border:1px solid rgba(var(--accent-rgb),.3)}
.kb-cq+.kb-cq{margin-top:22px;padding-top:20px;border-top:1px solid var(--line)}
.kb-cq-q{font-weight:700;display:flex;gap:10px}
.kb-cq-q span{flex:none;font-family:var(--en);color:var(--accent)}
.kb-cq-opts{display:grid;gap:8px;margin-top:10px}
.kb-cq-opt{text-align:left;color:var(--text);background:var(--elev-2);border:1px solid var(--line-2);border-radius:10px;padding:10px 14px;cursor:pointer;font-size:14px;line-height:1.6}
.kb-cq-opt:hover{border-color:rgba(var(--accent-rgb),.6)}
.kb-cq-opt.is-ok{border-color:var(--ok);background:rgba(127,216,164,.12)}
.kb-cq-opt.is-ok::after{content:"  ○ 正解";color:var(--ok);font-weight:700;font-size:12.5px}
.kb-cq-opt.is-ng{border-color:var(--ng);background:rgba(255,138,128,.1)}
.kb-cq-opt.is-ng::after{content:"  × ";color:var(--ng);font-weight:700}
.kb-cq.is-done .kb-cq-opt{cursor:default}
.kb-cq-exp{margin-top:10px;padding:12px 14px;border-radius:10px;background:rgba(0,0,0,.25);font-size:13.5px;color:var(--sub)}
.kb-cq-exp>*:first-child{margin-top:0}.kb-cq-exp>*:last-child{margin-bottom:0}
.k-prose svg{max-width:100%;height:auto;display:block;margin:20px auto}

@media (max-width:1000px){.k-lbody{grid-template-columns:minmax(0,1fr)}.k-toc{position:static;border-left:0;padding:16px 18px;background:var(--elev);border:1px solid var(--line);border-radius:var(--rs)}}
@media (max-width:960px){.k-road{grid-template-columns:1fr 1fr}.k-gateline{display:none}.k-domains,.k-tracks{grid-template-columns:1fr 1fr}}
@media (max-width:760px){.kb-flow.is-long li{grid-template-columns:26px minmax(0,1fr)}.kb-flow.is-long li>span:last-child:not(.kb-flow-n){grid-column:2}.kb-flow{grid-auto-flow:row;gap:22px}.kb-flow li:not(:last-child)::after{right:auto;left:50%;top:auto;bottom:-18px;transform:translateX(-50%) rotate(135deg)}.kb-dz-row{grid-template-columns:1fr;gap:8px}.kb-dz-outs{padding-left:24px}.kb-dz-out::before{display:none}}
@media (max-width:640px){body{font-size:14.5px}.k-wrap{width:calc(100% - 32px)}.k-sec{padding:22px 18px}.k-prose{padding:24px 18px}.k-road,.k-domains,.k-tracks{grid-template-columns:1fr}.k-brand span:last-child{display:none}.k-hero{padding:40px 0 20px}.kb-timeline::before{left:66px}.kb-timeline li{grid-template-columns:62px 1fr;gap:24px}.kb-timeline li::before{left:57px}.kb-tl-when{font-size:12px}.k-prevnext{grid-template-columns:1fr}.k-pn:last-child{text-align:left}}
`

export const JS = `
(function () {
  var STORE = 'tp_knowhow_key', DAYS = 30;
  var $ = function (id) { return document.getElementById(id); };
  var view = $('view');
  var preview = window.__KNOWHOW_PREVIEW__ || null;
  var P = preview ? null : JSON.parse($('payload').textContent);
  var subtle = window.crypto && window.crypto.subtle;
  var key = null, index = null, cache = {};
  var unb64 = function (s) { var b = atob(s), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; };
  var b64 = function (buf) { var a = new Uint8Array(buf), s = ''; for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s); };

  function save(raw) { try { localStorage.setItem(STORE, JSON.stringify({ k: b64(raw), salt: P.salt, exp: Date.now() + DAYS * 864e5 })); } catch (e) {} }
  function forget() { try { localStorage.removeItem(STORE); } catch (e) {} }
  function stored() {
    try { var s = JSON.parse(localStorage.getItem(STORE) || 'null'); if (s && s.salt === P.salt && s.exp > Date.now()) return unb64(s.k); } catch (e) {}
    forget(); return null;
  }
  function decrypt(box) {
    return subtle.decrypt({ name: 'AES-GCM', iv: unb64(box.iv) }, key, unb64(box.ct)).then(function (buf) { return new TextDecoder().decode(buf); });
  }
  function importKey(raw) { return subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['decrypt']); }
  function fromPassword(pw) {
    return subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']).then(function (base) {
      return subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unb64(P.salt), iterations: P.iter }, base, 512);
    }).then(function (bits) { return bits.slice(0, 32); });
  }
  function unlock(raw) {
    return importKey(raw).then(function (k) { key = k; return decrypt(P); }).then(function (json) { index = JSON.parse(json); start(); });
  }

  // ---- 画面の切り替え（#/ ・ #/skills ・ #/roadmap ・ #/l/<ID>） ----
  function lesson(id) {
    if (cache[id]) return Promise.resolve(cache[id]);
    if (preview) return Promise.resolve(preview.lessons[id]);
    return fetch('l/' + encodeURIComponent(id) + '.json', { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('not found'); return r.json();
    }).then(decrypt).then(function (html) { cache[id] = html; return html; });
  }
  function setNav(name) {
    document.querySelectorAll('[data-nav]').forEach(function (a) { a.classList.toggle('is-on', a.getAttribute('data-nav') === name); });
  }
  var lastRoute = '';
  function route() {
    var h = location.hash.replace(/^#\\/?/, '');
    var parts = h.split('/');
    var name = parts[0] || 'home';
    var routeKey = name === 'l' ? 'l/' + parts[1] : name;
    if (routeKey === lastRoute && name !== 'skills') return;
    lastRoute = routeKey;
    if (name === 'l' && parts[1]) {
      setNav('');
      view.innerHTML = '<p class="k-loading">読み込み中…</p>';
      lesson(decodeURIComponent(parts[1])).then(function (html) { show(html); }).catch(function () {
        show('<section class="k-hero k-hero-sm"><h1>コンテンツが見つかりません</h1><p class="k-lead"><a href="#/">一覧へ戻る</a></p></section>');
      });
      return;
    }
    var page = index.pages[name] || index.pages.home;
    setNav(index.pages[name] ? name : 'home');
    show(page, name === 'skills' && parts[1] ? 'd-' + parts[1] : null);
  }
  function show(html, jump) {
    view.innerHTML = html;
    if (jump) { var t = $(jump); if (t) { t.scrollIntoView(); return; } }
    window.scrollTo(0, 0);
  }

  // ---- 画面内の動き（確認問題・絞り込み・目次） ----
  document.addEventListener('click', function (e) {
    var opt = e.target.closest('.kb-cq-opt');
    if (opt) {
      var q = opt.closest('[data-quiz]');
      if (q.classList.contains('is-done')) return;
      q.classList.add('is-done');
      opt.classList.add(opt.hasAttribute('data-ok') ? 'is-ok' : 'is-ng');
      q.querySelectorAll('.kb-cq-opt[data-ok]').forEach(function (b) { b.classList.add('is-ok'); });
      q.querySelector('.kb-cq-exp').hidden = false;
      return;
    }
    var jump = e.target.closest('[data-jump]');
    if (jump) {
      var t = $(jump.getAttribute('data-jump'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
      return;
    }
    var f = e.target.closest('[data-filter]');
    if (f) {
      document.querySelectorAll('[data-filter]').forEach(function (b) { b.classList.toggle('is-on', b === f); });
      filter();
    }
  });
  document.addEventListener('input', function (e) { if (e.target.classList.contains('k-search')) filter(); });
  function filter() {
    var on = document.querySelector('[data-filter].is-on');
    var d = on ? on.getAttribute('data-filter') : '';
    var input = document.querySelector('.k-search');
    var words = (input ? input.value : '').toLowerCase().split(/\\s+/).filter(Boolean);
    var shown = 0;
    document.querySelectorAll('#catalog .k-lcard').forEach(function (c) {
      var hay = c.getAttribute('data-search');
      var ok = (!d || c.getAttribute('data-domain') === d) && words.every(function (w) { return hay.indexOf(w) >= 0; });
      c.hidden = !ok; if (ok) shown++;
    });
    var empty = document.querySelector('#catalog .k-empty');
    if (empty) empty.hidden = shown > 0;
  }

  function start() {
    $('login').hidden = true;
    $('app').hidden = false;
    window.addEventListener('hashchange', route);
    route();
  }
  $('logout').addEventListener('click', function () { forget(); location.hash = ''; location.reload(); });

  if (preview) { index = preview.index; start(); return; }
  if (!subtle) { $('err').textContent = 'このブラウザでは表示できません（https で開いてください）。'; return; }

  var raw = stored();
  if (raw) unlock(raw).catch(forget);

  $('loginform').addEventListener('submit', function (e) {
    e.preventDefault();
    var pw = $('pw').value, remember = $('remember').checked;
    if (!pw) return;
    $('go').disabled = true; $('err').textContent = '';
    var keyRaw;
    fromPassword(pw).then(function (r) { keyRaw = r; return unlock(r); }).then(function () {
      if (remember) save(keyRaw); else forget();
    }).catch(function () {
      $('err').textContent = '合言葉が違います。';
      $('go').disabled = false; $('pw').select();
    });
  });
})();
`
