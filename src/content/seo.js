/**
 * ページごとの SEO 情報（title / description / canonical / OGP / 構造化データ）。
 * scripts/prerender.mjs がビルド時に各ページの <head> に書き込む。文言は site.js の内容と揃える
 */
import { baseFees, faqs, prefectures, site } from './site.js'
import { areaFaqs, areaLead } from './areaCommon.js'
import { SIM_FAQS } from './simulationGuide.js'

export const ORIGIN = 'https://kakuyasu-souzokuzei.com'
export const OG_IMAGE = `${ORIGIN}/assets/ogp-image.jpg`

export const ROUTE_PATHS = { home: '/', service: '/service/', simulation: '/simulation/', contact: '/contact/' }

export const pages = {
  home: {
    path: '/',
    title: `大阪・京都・兵庫の相続税申告と相続の無料相談｜最安水準 基本報酬99,000円〜｜${site.name}`,
    description: '大阪・京都・兵庫の相続税申告は業界最安クラスの料金で対応。初回面談0円・基本報酬99,000円（税込）から、書面添付制度で税務署に指摘されにくい申告。大阪市北区（南森町）の相続専門の税理士法人が、無料相談から申告完了まで。累計200件超の実績、追加料金は事前説明の明朗会計。相続税シミュレーションも無料。',
    ogDescription: '大阪・京都・兵庫（京阪神）の相続税申告なら、基本報酬99,000円〜の最安水準。相続専門の税理士法人が初回無料相談から申告完了まで一気通貫で対応。累計200件超の実績、追加料金は事前説明の明朗会計です。',
    breadcrumb: [],
  },
  service: {
    path: '/service/',
    title: '相続税申告の料金表・サービス内容｜基本報酬99,000円〜（大阪・京都・兵庫）',
    description: '業界最安クラスの料金で対応、初回面談0円・基本報酬99,000円（税込）。相続税申告の料金表（遺産総額別の基本報酬・追加料金・相場との比較）と、選ばれる理由・ご相談の流れ・お客様の声・対応エリア・よくあるご質問。書面添付制度で税務署に指摘されにくい申告を、大阪・京都・兵庫一円で相続専門の税理士法人が行います。',
    ogDescription: '相続税申告の料金表（基本報酬99,000円〜・追加料金・相場比較）、選ばれる理由、ご相談の流れ、お客様の声、対応エリア、FAQ。',
    breadcrumb: [{ name: 'サービス・料金', path: '/service/' }],
  },
  simulation: {
    path: '/simulation/',
    title: '相続税シミュレーション（無料・登録不要）｜遺産総額と相続人を入れるだけで税額を即試算。早見表・計算方法つき',
    description: '遺産総額と配偶者・相続人の状況を入力するだけで、相続税額の目安をその場で試算できる無料の相続税シミュレーション（登録不要）。申告は業界最安クラスの料金で対応、初回面談0円・基本報酬99,000円（税込）。配偶者の税額軽減・2割加算に対応し、計算の5ステップ・速算表・相続人別の早見表・よくある質問・税理士費用の目安も1ページに。',
    ogDescription: '遺産総額と相続人の状況を入れるだけで相続税額の目安をその場で試算。無料・登録不要。早見表・計算方法・税理士費用の目安つき。',
    breadcrumb: [{ name: '相続税シミュレーション', path: '/simulation/' }],
  },
  contact: {
    path: '/contact/',
    title: '無料相談のお申込み・お問い合わせ｜相続税申告相談センター（大阪・南森町）',
    description: '相続税申告の無料相談はフォーム（24時間受付・1営業日以内に返信）またはお電話（06-6354-8220、平日9:00〜18:00）で。業界最安クラスの料金で対応、初回面談0円・基本報酬99,000円（税込）、書面添付制度で税務署に指摘されにくい申告。ご契約まで費用はかかりません。オンライン相談・出張相談、土日面談（事前予約）にも対応。大阪市北区南森町の相続専門の税理士法人。',
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

/** 相続税シミュレーション：計算機（WebApplication）とよくある質問（FAQPage） */
export const simulationAppLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  '@id': `${ORIGIN}/simulation/#app`,
  name: '相続税シミュレーション',
  url: `${ORIGIN}/simulation/`,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  browserRequirements: 'JavaScript',
  inLanguage: 'ja',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
  description: '遺産総額と相続人の状況から、基礎控除・課税遺産総額・相続税額の目安（配偶者の税額軽減・2割加算を反映）をその場で計算する無料ツール。',
  provider: { '@id': `${ORIGIN}/#organization` },
}

export const simulationFaqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: SIM_FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

/** ページごとの構造化データ一覧 */
export function jsonLdFor(route) {
  const list = [organizationLd]
  if (route === 'home') list.push(websiteLd, serviceLd)
  if (route === 'service') list.push(serviceLd, faqLd)
  if (route === 'simulation') list.push(simulationAppLd, simulationFaqLd)
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

/* ---------- プライバシーポリシー ---------- */
export const privacyPage = {
  path: '/privacy/',
  title: 'プライバシーポリシー｜相続税申告相談センター',
  description: '相続税申告相談センター（運営：タックス・プラン税理士法人）の個人情報の取扱い。取得する情報と利用目的、第三者提供、マイナンバーの取扱い、Cookie・アクセス解析、安全管理措置、開示等のご請求と窓口について定めています。',
}

export function privacyLd() {
  return [
    organizationLd,
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: `${ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'プライバシーポリシー', item: `${ORIGIN}/privacy/` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${ORIGIN}/privacy/#webpage`,
      url: `${ORIGIN}/privacy/`,
      name: privacyPage.title,
      description: privacyPage.description,
      inLanguage: 'ja',
      isPartOf: { '@id': `${ORIGIN}/#website` },
      about: { '@id': `${ORIGIN}/#organization` },
    },
  ]
}

/* ---------- 記事（コラム） ---------- */
export const articlesPage = {
  path: '/articles/',
  title: '相続税の基礎知識コラム｜相続専門の税理士法人が解説（大阪・京都・兵庫）',
  description: '相続税申告でよくあるご質問や判断に迷いやすいポイントを、相続専門の税理士法人が分かりやすく解説するコラム。基礎控除・申告期限・財産評価・特例など、相続税の基礎知識をまとめています。申告は業界最安クラスの料金で対応、初回面談0円・基本報酬99,000円（税込）。',
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

/* ---------- 地域から探す（/area/） ---------- */
export const areaHubPage = {
  path: '/area/',
  title: `地域から探す相続税申告｜基本報酬99,000円〜｜大阪市・堺市・北摂・北河内・南河内・泉州・阪神・神戸・京都の市区町村別｜${site.name}`,
  description: '大阪・兵庫・京都の市区町村ごとの相続税申告ページの一覧。業界最安クラスの料金で対応、初回面談0円・基本報酬99,000円（税込・遺産総額4,000万円まで）。大阪市24区・堺市7区・北摂・豊能・北河内・中河内・南河内・泉州・阪神・神戸・京都市11区・京都南部それぞれの料金・財産の特徴・管轄税務署・よくある質問をまとめています。書面添付制度で税務署に指摘されにくい申告。来所・オンライン・ご自宅への訪問に対応。',
}

/* ---------- 税務署ごとのページ（/zeimusho/<slug>/） ---------- */
export const taxOfficeHubPage = {
  path: '/zeimusho/',
  title: `税務署から探す相続税申告｜大阪・兵庫・京都の税務署の管轄区域と申告書の出し方｜${site.name}`,
  description: '相続税の申告書は、亡くなった方の最後の住所地を管轄する税務署に提出します。大阪市・大阪府・兵庫県・京都府の税務署ごとに、管轄区域・所在地・電話・申告書の出し方と、管内の市区町村の相続の特徴をまとめました。電子申告で提出するため来署は不要です。',
}

export function taxOfficePage(office) {
  const areas = [...office.areas, ...office.extra]
  return {
    path: `/zeimusho/${office.slug}/`,
    title: `${office.name}で相続税申告｜管轄区域（${areas.slice(0, 4).join('・')}${areas.length > 4 ? ' ほか' : ''}）・所在地・申告書の出し方｜${site.name}`,
    description: `${office.name}（${office.address}）は${areas.slice(0, 4).join('・')}${areas.length > 4 ? ' ほか' : ''}にお住まいだった方の相続税申告書の提出先です。当センターは業界最安クラスの料金で対応、初回面談0円・基本報酬99,000円（税込）、書面添付制度で税務署に指摘されにくい申告。管轄の決まり方、窓口・郵送・電子申告での出し方、添付書類、納税の方法と、管内の市区町村の相続の特徴をまとめました。電子申告で提出するため来署は不要。`,
  }
}

/** faqs … TaxOfficeViews.jsx の taxOfficeFaqs(office) */
export function taxOfficeLd(office, faqs) {
  const meta = taxOfficePage(office)
  const url = `${ORIGIN}${meta.path}`
  return [
    organizationLd,
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: `${ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: '税務署から探す', item: `${ORIGIN}/zeimusho/` },
        { '@type': 'ListItem', position: 3, name: office.name, item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'GovernmentOffice',
      '@id': `${url}#office`,
      name: office.name,
      telephone: office.tel,
      address: { '@type': 'PostalAddress', postalCode: office.postal, addressRegion: office.pref, streetAddress: office.address, addressCountry: 'JP' },
      areaServed: [...office.areas, ...office.extra].map((n) => ({ '@type': 'AdministrativeArea', name: n })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: meta.title,
      description: meta.description,
      inLanguage: 'ja',
      isPartOf: { '@id': `${ORIGIN}/#website` },
      about: { '@id': `${url}#office` },
    },
  ]
}

export function taxOfficeHubLd(offices) {
  const url = `${ORIGIN}${taxOfficeHubPage.path}`
  return [
    organizationLd,
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: `${ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: '税務署から探す', item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: taxOfficeHubPage.title,
      itemListElement: offices.map((o, i) => ({ '@type': 'ListItem', position: i + 1, name: o.name, url: `${ORIGIN}${o.path}` })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: taxOfficeHubPage.title,
      description: taxOfficeHubPage.description,
      inLanguage: 'ja',
      isPartOf: { '@id': `${ORIGIN}/#website` },
    },
  ]
}

/** regions … [{ name, slug, pref, cities: [{ city, path, topic }] }] */
export function areaHubLd(regions) {
  const url = `${ORIGIN}${areaHubPage.path}`
  const items = regions.flatMap((r) => r.cities)
  return [
    organizationLd,
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: `${ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: '地域から探す', item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${url}#webpage`,
      url,
      name: areaHubPage.title,
      description: areaHubPage.description,
      inLanguage: 'ja',
      isPartOf: { '@id': `${ORIGIN}/#website` },
      about: { '@id': `${ORIGIN}/#organization` },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: items.length,
        itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: `${c.city}の相続税申告`, url: `${ORIGIN}${c.path}` })),
      },
    },
  ]
}

/* ---------- 市区町村ごとの相続税申告ページ（/area/<slug>/） ---------- */
export function areaPage(area) {
  return {
    path: area.path,
    title: area.title
      ? `${area.title}｜${site.name}`
      : area.focus
        ? `${area.city}の相続税申告・税理士費用｜基本報酬99,000円〜（税込）｜${area.focus}｜${site.name}`
        : `${area.city}の相続税申告・相続の相談｜税理士費用は基本報酬99,000円〜（税込）｜相続専門の税理士法人 ${site.name}`,
    description: area.description,
    ogDescription: area.description,
  }
}

export function areaLd(area) {
  const url = `${ORIGIN}${area.path}`
  const meta = areaPage(area)
  return [
    organizationLd,
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: `${ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: '地域から探す', item: `${ORIGIN}/area/` },
        { '@type': 'ListItem', position: 3, name: `${area.city}の相続税申告`, item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${url}#service`,
      name: `${area.city}の相続税申告（税理士費用は基本報酬99,000円〜）`,
      serviceType: '相続税申告',
      description: areaLead(area),
      url,
      provider: { '@id': `${ORIGIN}/#organization` },
      areaServed: { '@type': 'City', name: area.city, containedInPlace: { '@type': 'State', name: area.pref } },
      offers: organizationLd.hasOfferCatalog.itemListElement,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: areaFaqs(area).map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: meta.title,
      description: meta.description,
      inLanguage: 'ja',
      isPartOf: { '@id': `${ORIGIN}/#website` },
      about: { '@id': `${url}#service` },
    },
  ]
}
