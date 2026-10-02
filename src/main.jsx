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

if (container.hasChildNodes()) {
  hydrateRoot(container, <App initialRoute={initialRoute} pageData={pageData} />)
} else {
  createRoot(container).render(
    <React.StrictMode>
      <App initialRoute={initialRoute} pageData={pageData} />
    </React.StrictMode>,
  )
}
