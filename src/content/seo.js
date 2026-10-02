/**
 * ページごとの SEO 情報（title / description / canonical / OGP / 構造化データ）。
 * scripts/prerender.mjs がビルド時に各ページの <head> に書き込む。文言は site.js の内容と揃える
 */
import { baseFees, faqs, prefectures, site } from './site.js'

export const ORIGIN = 'https://kakuyasu-souzokuzei.com'
export const OG_IMAGE = `${ORIGIN}/assets/ogp-image.jpg`

export const ROUTE_PATHS = { home: '/', service: '/service/', simulation: '/simulation/', contact: '/contact/' }

export const pages = {
  home: {
    path: '/',
    title: `大阪・京都・兵庫の相続税申告なら最安水準 基本報酬99,000円〜｜${site.siteName}`,
    description: '大阪・京都・兵庫（京阪神）の相続税申告なら、基本報酬99,000円〜の最安水準。相続専門の税理士法人が初回無料相談から申告完了まで一気通貫で対応します。累計200件超の実績、追加料金は事前説明の明朗会計、書面添付制度で税務調査対策。相続税額のシミュレーションも無料でご利用いただけます。',
    ogDescription: '大阪・京都・兵庫（京阪神）の相続税申告なら、基本報酬99,000円〜の最安水準。相続専門の税理士法人が初回無料相談から申告完了まで一気通貫で対応。累計200件超の実績、追加料金は事前説明の明朗会計です。',
    breadcrumb: [],
  },
  service: {
    path: '/service/',
    title: '相続税申告の料金表・サービス内容｜基本報酬99,000円〜（大阪・京都・兵庫）',
    description: '相続税申告の料金表（遺産総額別の基本報酬・追加料金・一般的な相場との比較）と、選ばれる理由・ご相談の流れ・お客様の声・対応エリア・よくあるご質問。大阪・京都・兵庫一円、相続専門の税理士法人が最安水準の明快な料金で申告完了まで対応します。',
    ogDescription: '相続税申告の料金表（基本報酬99,000円〜・追加料金・相場比較）、選ばれる理由、ご相談の流れ、お客様の声、対応エリア、FAQ。',
    breadcrumb: [{ name: 'サービス・料金', path: '/service/' }],
  },
  simulation: {
    path: '/simulation/',
    title: '相続税シミュレーション（無料）｜遺産総額と相続人で相続税額をその場で試算',
    description: '遺産総額と配偶者・相続人の状況を入力するだけで、基礎控除・課税遺産総額・相続税額の目安をその場で試算できる無料の相続税シミュレーション。配偶者の税額軽減にも対応。あわせて当センターの基本報酬（99,000円〜）も表示します。大阪・京都・兵庫の相続専門税理士法人。',
    ogDescription: '遺産総額と相続人の状況を入れるだけで相続税額の目安をその場で試算。配偶者の税額軽減にも対応した無料シミュレーション。',
    breadcrumb: [{ name: '相続税シミュレーション', path: '/simulation/' }],
  },
  contact: {
    path: '/contact/',
    title: '無料相談のお申込み・お問い合わせ｜相続税申告相談センター（大阪・南森町）',
    description: '相続税申告の無料相談はフォーム（24時間受付・1営業日以内に返信）またはお電話（06-6354-8220、平日9:00〜18:00）で。ご契約まで費用はかかりません。オンライン相談・出張相談、土日面談（事前予約）にも対応。大阪市北区南森町の相続専門税理士法人。',
    ogDescription: '相続税申告の無料相談はフォームまたはお電話で。ご契約まで費用はかかりません。オンライン・出張相談にも対応。',
    breadcrumb: [{ name: 'お問い合わせ', path: '/contact/' }],
  },
}

const areaServed = [
  ...prefectures.map((p) => ({ '@type': 'State', name: p.name })),
  ...prefectures.flatMap((p) => p.focus.map((c) => ({ '@type': 'City', name: c }))),
  { '@type': 'City', name: '京都市' },
]

/** 事務所（全ページ共通） */
export const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'AccountingService',
  '@id': `${ORIGIN}/#organization`,
  name: site.name,
  alternateName: '格安相続税申告（大阪・京都・兵庫）',
  url: ORIGIN,
  image: OG_IMAGE,
  logo: `${ORIGIN}/assets/apple-touch-icon.png`,
  parentOrganization: { '@type': 'Organization', name: site.company },
  description: pages.home.ogDescription,
  telephone: '+81-6-6354-8220',
  priceRange: '¥99,000〜',
  currenciesAccepted: 'JPY',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '18:00',
  },
  address: {
    '@type': 'PostalAddress',
    postalCode: '530-0044',
    addressRegion: '大阪府',
    addressLocality: '大阪市北区',
    streetAddress: '東天満2丁目9番4号 5階',
    addressCountry: 'JP',
  },
  areaServed,
  knowsAbout: ['相続税申告', '相続税の計算', '土地の相続税評価（路線価）', '非上場株式の評価', '書面添付制度', '配偶者の税額軽減'],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: '相続税申告 基本報酬',
    itemListElement: baseFees
      .filter((f) => f.tax)
      .map((f) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: `相続税申告（遺産総額${f.range}）` },
        price: f.tax.replace(/[^0-9]/g, ''),
        priceCurrency: 'JPY',
        description: `基本報酬（税込）。土地評価などの追加料金は別途`,
      })),
  },
}

export const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${ORIGIN}/#website`,
  url: `${ORIGIN}/`,
  // Google の「サイト名」：name を第一候補、alternateName を代替候補として評価する
  name: site.siteName,
  alternateName: [site.name, site.company],
  inLanguage: 'ja',
  publisher: { '@id': `${ORIGIN}/#organization` },
}

export const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: '相続税申告（相続税申告書の作成・提出）',
  serviceType: '相続税申告',
  provider: { '@id': `${ORIGIN}/#organization` },
  areaServed,
  url: `${ORIGIN}/service/`,
  offers: {
    '@type': 'Offer',
    price: '99000',
    priceCurrency: 'JPY',
    description: '遺産総額4,000万円までの基本報酬（税込99,000円）。初回相談無料、追加料金は事前説明',
    availability: 'https://schema.org/InStock',
  },
}

export const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export function breadcrumbLd(route) {
  const items = [{ name: 'ホーム', path: '/' }, ...pages[route].breadcrumb]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${ORIGIN}${it.path}` })),
  }
}

/** ページごとの構造化データ一覧 */
export function jsonLdFor(route) {
  const list = [organizationLd]
  if (route === 'home') list.push(websiteLd, serviceLd)
  if (route === 'service') list.push(serviceLd, faqLd)
  if (route !== 'home') list.push(breadcrumbLd(route))
  return list
}

export function webPageLd(route) {
  const p = pages[route]
  return {
    '@context': 'https://schema.org',
    '@type': route === 'contact' ? 'ContactPage' : 'WebPage',
    '@id': `${ORIGIN}${p.path}#webpage`,
    url: `${ORIGIN}${p.path}`,
    name: p.title,
    description: p.description,
    inLanguage: 'ja',
    isPartOf: { '@id': `${ORIGIN}/#website` },
    about: { '@id': `${ORIGIN}/#organization` },
  }
}

/* ---------- 記事（コラム） ---------- */
export const articlesPage = {
  path: '/articles/',
  title: '相続税の基礎知識コラム｜相続専門の税理士法人が解説（大阪・京都・兵庫）',
  description: '相続税申告でよくあるご質問や判断に迷いやすいポイントを、相続専門の税理士法人が分かりやすく解説するコラム。基礎控除・申告期限・財産評価・特例など、相続税の基礎知識をまとめています。',
  ogDescription: '相続税の基礎控除・申告期限・財産評価など、相続専門の税理士法人が分かりやすく解説するコラム。',
}

export function articlePage(a) {
  return {
    path: a.path,
    title: `${a.title}｜相続税申告相談センター`,
    description: a.description,
    ogDescription: a.description,
    ogType: 'article',
  }
}

export function articlesLd(list) {
  return [
    organizationLd,
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: `${ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'コラム', item: `${ORIGIN}/articles/` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${ORIGIN}/articles/#webpage`,
      url: `${ORIGIN}/articles/`,
      name: articlesPage.title,
      description: articlesPage.description,
      inLanguage: 'ja',
      isPartOf: { '@id': `${ORIGIN}/#website` },
      hasPart: list.map((a) => ({ '@type': 'BlogPosting', headline: a.title, url: `${ORIGIN}${a.path}`, datePublished: a.date })),
    },
  ]
}

export function articleLd(a) {
  return [
    organizationLd,
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: `${ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'コラム', item: `${ORIGIN}/articles/` },
        { '@type': 'ListItem', position: 3, name: a.title, item: `${ORIGIN}${a.path}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': `${ORIGIN}${a.path}#article`,
      mainEntityOfPage: `${ORIGIN}${a.path}`,
      headline: a.title,
      description: a.description,
      datePublished: a.date,
      dateModified: a.date,
      inLanguage: 'ja',
      keywords: a.tags.join(', '),
      image: OG_IMAGE,
      author: { '@type': 'Organization', name: site.company },
      publisher: { '@id': `${ORIGIN}/#organization` },
      isPartOf: { '@id': `${ORIGIN}/#website` },
    },
  ]
}
