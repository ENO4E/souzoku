// ビルド時プリレンダリング用エントリー（scripts/prerender.mjs から呼び出す）
import { renderToString } from 'react-dom/server'
import App from './App.jsx'

export { pages, jsonLdFor, webPageLd, articlesPage, articlePage, articlesLd, articleLd, privacyPage, privacyLd, ORIGIN, OG_IMAGE } from './content/seo.js'
import { site } from './content/site.js'
export const SITE_NAME = site.siteName

/** 指定ページを表示した状態の HTML を返す（他のページは出力しない）。記事ページは data を渡す */
export function render(route = 'home', data = null) {
  return renderToString(<App initialRoute={route} pageData={data} />)
}
