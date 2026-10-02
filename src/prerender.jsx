// ビルド時プリレンダリング用エントリー（scripts/prerender.mjs から呼び出す）
import { renderToString } from 'react-dom/server'
import App from './App.jsx'

export { pages, jsonLdFor, webPageLd, ORIGIN, OG_IMAGE } from './content/seo.js'

/** 指定ページを表示した状態の HTML を返す（他のページは出力しない） */
export function render(route = 'home') {
  return renderToString(<App initialRoute={route} />)
}
