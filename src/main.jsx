import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
import { parsePath } from './router.js'
import { leave, pageview, start } from './beacon.js'
import IryubunTool from './tools/IryubunTool.jsx'
import './index.css'

// アクセス解析（src/beacon.js）。最初の表示と、SPA の切り替え（App.jsx の route:change）のたびに送る
start()
pageview()
window.addEventListener('route:change', () => {
  leave()
  pageview()
})

const container = document.getElementById('root')
// プリレンダリング済みの HTML と同じページを初期表示にする（/service/ なら service、/articles/xxx/ なら article）
const initialRoute = parsePath(window.location.pathname)
// 記事ページのデータ（ビルド時に HTML へ埋め込まれる）
const pageData = window.__PAGE_DATA__ || null
// 記事本文の HTML はデータに二重に入れず（転送量を抑える）、プリレンダリング済みの本文をそのまま使う
if (pageData?.article && pageData.article.html == null) {
  pageData.article.html = document.querySelector('.prose')?.innerHTML || ''
}
// 市のページも同様に、本文とアクセスの案内はプリレンダリング済みの HTML を使う
if (pageData?.area && pageData.area.html == null) {
  pageData.area.html = document.querySelector('.area-prose')?.innerHTML || ''
  pageData.area.accessHtml = document.querySelector('.area-access')?.innerHTML || ''
}
// 記事一覧も同様に、描画済みの一覧行（data-s / data-g）とタグのボタンから復元する
if (initialRoute === 'articles' && pageData && !pageData.list) {
  const tagNames = [...document.querySelectorAll('.article-filter [data-tag]')].map((b) => b.dataset.tag)
  pageData.list = [...document.querySelectorAll('.article-index > li[data-s]')].map((li) => ({
    slug: li.dataset.s,
    title: li.querySelector('span')?.textContent || '',
    date: li.querySelector('time')?.getAttribute('datetime') || '',
    tags: li.dataset.g ? li.dataset.g.split(/[ ,]/).map((i) => tagNames[Number(i)]).filter(Boolean) : [],
  }))
}

if (container.hasChildNodes()) {
  hydrateRoot(container, <App initialRoute={initialRoute} pageData={pageData} />)
} else {
  createRoot(container).render(
    <React.StrictMode>
      <App initialRoute={initialRoute} pageData={pageData} />
    </React.StrictMode>,
  )
}

// 記事に埋め込む計算ツール：本文（Markdown の生 HTML）の <div data-tool="〜"> に部品を描画する。
// 本文は JS なしでも読めるようにしてあり、ツールだけ JS が動いたときに置き換わる。
// 遅延読み込み（import()）にはしない：チャンクが index.js を "./index.js" として読み込み直し（ページは ?v= 付きで読んでいる）、
// React と main.jsx が二重に実行されて壊れるため。ツールは小さいので index.js に同梱する
const TOOLS = { iryubun: IryubunTool }
const mountTools = () => {
  for (const el of document.querySelectorAll('.prose [data-tool]')) {
    const Tool = TOOLS[el.dataset.tool]
    if (!Tool || el.dataset.mounted) continue
    el.dataset.mounted = '1'
    el.innerHTML = ''
    createRoot(el).render(<Tool />)
  }
}
if (document.querySelector('.prose [data-tool]')) {
  // hydrate が終わってから差し替える（本文の DOM は dangerouslySetInnerHTML でそのまま残るので、その後に別ルートとして描く）
  ;(window.requestIdleCallback || ((f) => setTimeout(f, 50)))(mountTools)
}
