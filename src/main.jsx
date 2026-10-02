import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
import { parsePath } from './router.js'
import './index.css'

const container = document.getElementById('root')
// プリレンダリング済みの HTML と同じページを初期表示にする（/service/ なら service）
const initialRoute = parsePath(window.location.pathname)

if (container.hasChildNodes()) {
  hydrateRoot(container, <App initialRoute={initialRoute} />)
} else {
  createRoot(container).render(
    <React.StrictMode>
      <App initialRoute={initialRoute} />
    </React.StrictMode>,
  )
}
