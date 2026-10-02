/**
 * パス式のルーター（各ページを本物の URL にして検索エンジンに個別に評価させる）。
 *   /                 … ホーム（3つのパネル）
 *   /service/         … サービス・料金（/service/#fee のようにページ内の位置を続けられる）
 *   /simulation/      … 相続税シミュレーション
 *   /contact/         … お問い合わせ
 *   /articles/        … 記事一覧（通常のページ遷移。SPA の幕アニメーションは使わない）
 *   /articles/<slug>/ … 記事
 * 旧URL（#/service など）は読み込み時に新URLへ置き換える
 */
export const MAIN_ROUTES = ['home', 'service', 'simulation', 'contact']
export const ROUTES = [...MAIN_ROUTES, 'articles', 'article']
export const PATHS = { home: '/', service: '/service/', simulation: '/simulation/', contact: '/contact/', articles: '/articles/' }

export function parsePath(pathname) {
  const segs = (pathname || '/').replace(/index\.html$/, '').split('/').filter(Boolean)
  const seg = segs[0] || ''
  if (seg === 'articles') return segs[1] ? 'article' : 'articles'
  return seg && MAIN_ROUTES.includes(seg) ? seg : 'home'
}

export function routePath(route, anchor = '') {
  return `${PATHS[route] || '/'}${anchor ? `#${anchor}` : ''}`
}

/** 旧ハッシュ形式（#/service/fee）を解釈する。該当しなければ null */
export function parseLegacyHash(hash) {
  const h = (hash || '').replace(/^#/, '')
  if (!h.startsWith('/')) return null
  const [, route = '', anchor = ''] = h.split('/')
  if (!route) return { route: 'home', anchor: '' }
  return MAIN_ROUTES.includes(route) ? { route, anchor } : null
}

/** クリックされたリンクが SPA で切り替える3ページ＋ホームへのリンクなら {route, anchor} を返す。それ以外は null（通常の遷移） */
export function matchInternalLink(a) {
  if (!a || a.target === '_blank' || a.hasAttribute('download')) return null
  const href = a.getAttribute('href') || ''
  if (!href.startsWith('/') || href.startsWith('//')) return null
  const url = new URL(href, window.location.origin)
  if (url.origin !== window.location.origin) return null
  const seg = url.pathname.split('/').filter(Boolean)[0] || ''
  if (seg && !MAIN_ROUTES.includes(seg)) return null
  return { route: seg || 'home', anchor: url.hash.replace(/^#/, '') }
}
