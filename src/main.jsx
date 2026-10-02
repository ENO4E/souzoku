import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
import { parsePath } from './router.js'
import './index.css'

const container = document.getElementById('root')
// プリレンダリング済みの HTML と同じページを初期表示にする（/service/ なら service、/articles/xxx/ なら article）
const initialRoute = parsePath(window.location.pathname)
// 記事ページのデータ（ビルド時に HTML へ埋め込まれる）
const pageData = window.__PAGE_DATA__ || null
// 記事本文の HTML はデータに二重に入れず（転送量を抑える）、プリレンダリング済みの本文をそのまま使う
if (pageData?.article && pageData.article.html == null) {
  pageData.article.html = document.querySelector('.prose')?.innerHTML || ''
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
