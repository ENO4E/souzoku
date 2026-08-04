// ビルド時プリレンダリング用エントリー（scripts/prerender.mjs から呼び出す）
import { renderToString } from 'react-dom/server'
import App from './App.jsx'

export function render() {
  return renderToString(<App />)
}
