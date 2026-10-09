// content/areas/<slug>.md を読み込んで、市ごとの相続税申告のページ（/area/<slug>/）のデータにする
//
// ファイルの書き方
//   ---
//   city: 東大阪市
//   pref: 大阪府
//   region: 北摂                                                … 地域（site.js の areaRegions の name と一致させる）
//   topic: 町工場の自社株・工場用地・役員借入金と事業承継の対策   … 見出しの下に出す、その市の相続の特徴
//   description: 東大阪市の相続税申告を基本報酬99,000円（税込）からお受けします。…（100〜125字）
//   columns: [hijojo-kabushiki-hyoka, jigyo-shokei-zeisei, …]   … その市の財産の特徴に関係するコラムの slug（5件ほど。手で選ぶ）
//   ---
//   導入の段落
//   ## 〇〇市の相続でよくある財産と評価のポイント … 本文（h2 は2〜4個）
//   ## よくある質問                                … **Q. 〜** / A. 〜 の形。構造化データ（FAQPage）にもなる
//   最後の段落（来所・オンライン・訪問の案内）     … 「アクセス」欄に出す
import { readdirSync, readFileSync } from 'node:fs'
import { basename, extname, resolve } from 'node:path'
import { parseFrontmatter, renderMarkdown } from './articles.mjs'

const stripMd = (s) => s.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim()

export function loadAreas(dir) {
  const files = readdirSync(dir).filter((f) => extname(f) === '.md' && !f.startsWith('_'))
  const areas = files.map((file) => {
    const slug = basename(file, '.md')
    if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`ファイル名は英小文字・数字・ハイフンのみ: ${file}`)
    const { meta, body } = parseFrontmatter(readFileSync(resolve(dir, file), 'utf-8'))
    if (!meta.city || !meta.description || !meta.region) throw new Error(`${file} に city / region / description がありません`)
    // 「よくある質問」以降を切り出す：Q&A は faqs に、その後の段落はアクセスの案内に
    const [main, rest = ''] = body.split(/^## よくある質問\s*$/m)
    const faqs = []
    const re = /^\*\*Q\.\s*([\s\S]+?)\*\*\s*\nA\.\s*([^\n]+)/gm
    let m
    let lastEnd = 0
    while ((m = re.exec(rest))) {
      faqs.push({ q: stripMd(m[1]), a: stripMd(m[2]) })
      lastEnd = re.lastIndex
    }
    const access = rest.slice(lastEnd).trim()
    return {
      slug,
      path: `/area/${slug}/`,
      oldPath: `/articles/area-${slug}-souzokuzei/`, // 以前のコラムの URL（新しいページへ転送する）
      city: meta.city,
      pref: meta.pref || '大阪府',
      region: meta.region,
      topic: meta.topic || '',
      description: meta.description,
      title: meta.title || '', // title / description を独自に指定したい市だけ md に書く（空なら seo.js の既定の形）
      html: renderMarkdown(main.trim()),
      accessHtml: access ? renderMarkdown(access) : '',
      faqs,
      columns: Array.isArray(meta.columns) ? meta.columns : [],
    }
  })
  // 並び順：大阪府 → 兵庫県、それぞれファイル名順
  return areas.sort((a, b) => (a.pref === b.pref ? (a.slug < b.slug ? -1 : 1) : a.pref === '大阪府' ? -1 : 1))
}
