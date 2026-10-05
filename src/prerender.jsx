// ビルド時プリレンダリング用エントリー（scripts/prerender.mjs から呼び出す）
import { renderToString } from 'react-dom/server'
import App from './App.jsx'

export { pages, jsonLdFor, webPageLd, articlesPage, articlePage, articlesLd, articleLd, privacyPage, privacyLd, areaPage, areaLd, ORIGIN, OG_IMAGE } from './content/seo.js'
import { site, baseFees, extraFees } from './content/site.js'
export { site, baseFees, extraFees }
export { LOWEST_NOTE, RECORD } from './content/areaCommon.js'
export const SITE_NAME = site.siteName

/** 指定ページを表示した状態の HTML を返す（他のページは出力しない）。記事ページは data を渡す */
export function render(route = 'home', data = null) {
  return renderToString(<App initialRoute={route} pageData={data} />)
}
