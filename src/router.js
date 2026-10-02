/**
 * ハッシュ式の簡易ルーター。
 *   #/            … ホーム（3つのパネル）
 *   #/service     … サービス・料金ページ（#/service/fee のように続けるとその位置へ）
 *   #/simulation  … 相続税シミュレーション
 *   #/contact     … お問い合わせ
 * それ以外のハッシュ（#fee など）はルートとして扱わない（ページ内リンク用）
 */
export const ROUTES = ['home', 'service', 'simulation', 'contact']

export function parseHash(hash) {
  const h = (hash || '').replace(/^#/, '')
  if (!h.startsWith('/')) return { route: 'home', anchor: '' }
  const [, route = '', anchor = ''] = h.split('/')
  if (!route) return { route: 'home', anchor: '' }
  return ROUTES.includes(route) ? { route, anchor } : { route: 'home', anchor: '' }
}

export function routeHref(route, anchor) {
  if (route === 'home') return '#/'
  return anchor ? `#/${route}/${anchor}` : `#/${route}`
}

/** 画面遷移（幕のアニメーション）を伴ってルートを変える。App が 'route:navigate' を購読している */
export function navigate(route, anchor = '') {
  window.location.hash = routeHref(route, anchor)
}
