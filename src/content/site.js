/**
 * サイト全体の設定と文言。料金・サービス内容などの「中身」はここに集約する。
 * （デザインを変えても文言・金額は変えない）
 */
export const site = {
  name: '相続税申告相談センター',
  company: 'タックス・プラン税理士法人',
  // Google 検索結果でドメインの上に出る「サイト名」（WebSite 構造化データ・og:site_name・ホームの title に揃えて使う）
  siteName: '相続税申告相談センター（タックス・プラン税理士法人 運営）',
  tel: '06-6354-8220',
  telHref: 'tel:0663548220',
  hours: '平日9:00〜18:00',
  address: '〒530-0044　大阪府大阪市北区東天満2丁目9番4号 5階',
  license: '税理士登録番号：5469',
}

// 3つのページ（ホームの3パネルに対応）。URL は /service/ などのパス、ページ内の位置は /service/#fee のように続ける
export const nav = [
  { href: '/service/', label: 'サービス・料金', en: 'Service', no: '01' },
  { href: '/simulation/', label: '相続税シミュレーション', en: 'Simulation', no: '02' },
  { href: '/contact/', label: 'お問い合わせ', en: 'Contact', no: '03' },
]

// サービスページ内のセクション
export const serviceNav = [
  { href: '/service/#pain', id: 'pain', label: 'お悩み', en: 'Problems' },
  { href: '/service/#reasons', id: 'reasons', label: '選ばれる理由', en: 'Why Us' },
  { href: '/service/#fee', id: 'fee', label: '料金', en: 'Fee' },
  { href: '/service/#flow', id: 'flow', label: 'ご相談の流れ', en: 'Process' },
  { href: '/service/#greeting', id: 'greeting', label: '代表挨拶', en: 'Message' },
  { href: '/service/#voice', id: 'voice', label: 'お客様の声', en: 'Voice' },
  { href: '/service/#area', id: 'area', label: '対応エリア', en: 'Area' },
  { href: '/service/#faq', id: 'faq', label: 'よくある質問', en: 'FAQ' },
]

export const keywords = [
  '相続税申告',
  '基本報酬 99,000円〜',
  '初回相談無料',
  '大阪府・兵庫県・京都府',
  '土地評価',
  '非上場株式評価',
  '書面添付制度',
  '税務調査対策',
  'オンライン相談',
  '出張相談',
  '累計200件超の申告実績',
  '追加料金は事前説明',
]

export const pains = [
  {
    title: '申告期限まで時間がない',
    body: '相続税は10ヶ月以内の申告・納税が必要です。相続発生から時間が経つほど、選べる対応策が狭まっていきます。',
  },
  {
    title: '不動産の評価が分からない',
    body: '土地の評価方法次第で税額が大きく変わります。路線価・補正・特例の知識が申告の精度を左右します。',
  },
  {
    title: '遺産分割で揉めている',
    body: '分割協議が進まないと申告にも影響します。税理士だけで解決できない場合は、提携の弁護士・司法書士と連携します。',
  },
  {
    title: '税務調査が心配',
    body: '相続税は税務調査の対象になりやすい税目です。根拠のある申告書と書面添付制度で、追徴のリスクを抑えます。',
  },
]

export const strengths = [
  {
    en: 'Track Record',
    title: '累計200件超の申告実績',
    body: '総相談件数2,000件以上。土地評価や非上場株式評価など専門性の高い案件にも、相続専門チームが対応します。',
  },
  {
    en: 'One-stop',
    title: '提携先と一気通貫、申告完了までワンストップ',
    body: '弁護士・司法書士・不動産鑑定士などの提携先と連携し、遺産分割や登記も含めて申告完了まで一気通貫で対応。窓口は当センターひとつです。',
  },
  {
    en: 'Transparent',
    title: '明朗会計・追加料金は事前説明',
    body: '基本報酬99,000円〜の明快な料金表。土地評価などの追加料金が必要な場合も、必ず事前にご説明し、ご了承いただいてから進めます。',
  },
  {
    en: 'Audit-proof',
    title: '書面添付制度で税務調査対策',
    body: '税理士法33条の2に基づく書面添付を標準的に活用し、税務調査に入られにくい申告書の作成を徹底します。',
  },
]

export const baseFees = [
  { range: '〜4,000万円', fee: '90,000円', tax: '（税込 99,000円）' },
  { range: '〜5,000万円', fee: '155,000円', tax: '（税込 170,500円）' },
  { range: '〜6,000万円', fee: '220,000円', tax: '（税込 242,000円）' },
  { range: '〜7,000万円', fee: '280,000円', tax: '（税込 308,000円）' },
  { range: '7,000万円超', fee: '別途お見積り', tax: '' },
]

// 相場は「税理士報酬の目安は遺産総額の0.5〜1.0%」という一般的な基準で算出した参考値
export const comparison = [
  { estate: '4,000万円', market: '20万〜40万円', ours: '99,000円' },
  { estate: '5,000万円', market: '25万〜50万円', ours: '170,500円' },
  { estate: '6,000万円', market: '30万〜60万円', ours: '242,000円' },
  { estate: '7,000万円', market: '35万〜70万円', ours: '308,000円' },
]

export const extraFees = [
  { item: '土地評価', fee: '80,000円', tax: '（税込 88,000円）／1利用区分' },
  { item: '非上場株式評価', fee: '100,000円', tax: '（税込 110,000円）／1社' },
  { item: '相続人加算', fee: '基本報酬の10%', tax: '（2人目以降1名につき）' },
  { item: '書面添付（税理士法33条の2）', fee: '50,000円', tax: '（税込 55,000円）' },
]

export const included = ['相続税申告書作成', '財産評価', '税額計算', '税務署提出', '必要書類のご案内', '初回相談（無料）']

export const steps = [
  { no: '01', title: '無料相談予約', body: '電話・フォームから日程を調整します。オンライン相談も可能です。', output: '日程の確定' },
  { no: '02', title: 'お見積り・ご契約', body: '財産状況をヒアリングし、報酬額と対応範囲をご提示します。', output: 'お見積書・ご契約' },
  { no: '03', title: '財産調査・評価', body: '不動産・有価証券等を調査し、適正な評価額を算定します。', output: '財産評価額の確定' },
  { no: '04', title: '申告書作成・提出', body: '内容をご確認いただいたうえで税務署へ申告書を提出します。', output: '申告書の控え' },
]

export const reportPoints = [
  '土地・建物・預貯金・生命保険などの財産一覧表',
  '基礎控除を差し引いた課税遺産総額',
  '法定相続分にもとづく相続人ごとの取得金額と税額',
  '配偶者の税額軽減を反映した相続税額の合計',
]

// 代表挨拶：氏名・肩書きが決まったら name を入れる（空の間は肩書きだけを表示）
export const representative = {
  name: '榎嶋 隆司',
  title: '代表税理士',
  // 写真は public/assets/ceo1.jpg（ビルドで assets/ceo1.jpg に出力。サーバーの assets/ 直下に同名で置いても可）
  photo: '/assets/ceo1.jpg',
}

// お客様の声：Googleクチコミに実際に投稿された内容（2026年8月1日時点・評価★5.0）。掲載名はイニシャル
export const testimonials = [
  { name: 'A.M 様', initial: 'A', source: 'Google クチコミ', text: '両親が亡くなった時に大変お世話になりました。相続の事で悩んでた先輩にも教えたら、とても喜んでもらえてこちらも鼻が高かったです。その後も色々と相談に乗っていただき助かっています。' },
  { name: 'H.F 様', initial: 'H', source: 'Google クチコミ', text: '事前の相談から手続きまで、終始丁寧に対応していただきました。説明も分かりやすく、こちらからの質問にも専門用語を使わずに噛み砕いて教えてくれたので、安心してお任せすることができました。また何かあれば相談させていただきたいと思います。ありがとうございました。' },
  { name: 'T.H 様', initial: 'T', source: 'Google クチコミ', text: 'とてもわかりやすい説明で、不安が取り除かれました。ありがとうございました♪' },
  { name: 'N.A 様', initial: 'N', source: 'Google クチコミ', text: '以前、初めて贈与税に関する事で相談をさせて頂いたんですが、全く知識のない私にも、分かりやすく丁寧に説明して下さり、問題が解決しました。有難うございました。又、分からない事がありましたら、お願いしたいと考えております。その時は、宜しくお願いします。' },
  { name: 'M.H 様', initial: 'M', source: 'Google クチコミ', text: '初めての依頼でしたが、とても丁寧に説明していただき、安心してお任せできました。今後もお願いしたいと思います。' },
  { name: 'S.T 様', initial: 'S', source: 'Google クチコミ', text: '豊富な知識と経験で疑問等を解消してもらい、いつも助かってます。' },
  { name: '相続でご相談のお客様', initial: '相', source: 'ご利用者アンケート', text: '前の税理士事務所ではレスポンスが悪かったのですが、今はすぐに返信をくれるので安心できます。すぐに答えられないときでも、期限を切ってきちんと連絡いただけますし、大変助かっています。ありがとうございます。' },
  {
    name: '英語でご相談のお客様',
    initial: 'E',
    source: 'ご利用者アンケート',
    text: 'We were very satisfied with the excellent customer service and clear communication. Your kindness and professionalism made us feel confident and comfortable from start to finish.',
    translation: '（日本語訳）素晴らしいカスタマーサービスと分かりやすいコミュニケーションに大変満足しています。親切でプロフェッショナルな対応のおかげで、最初から最後まで安心してお任せできました。',
  },
]

export const prefectures = [
  { name: '大阪府', en: 'Osaka', note: '府内全域に対応', focus: ['大阪市', '吹田市', '茨木市', '高槻市', '箕面市', '摂津市', '守口市', '門真市', '四條畷市', '枚方市', '寝屋川市', '東大阪市', '松原市'] },
  { name: '兵庫県', en: 'Hyogo', note: '県内全域に対応', focus: ['尼崎市', '西宮市', '宝塚市', '芦屋市', '神戸市'] },
  { name: '京都府', en: 'Kyoto', note: '府内全域に対応', focus: [] },
]

// 市ごとの相続税コラム（/articles/<slug>/）。対応エリアの市名からリンクする
export const areaArticles = {
  '尼崎市': 'area-amagasaki-souzokuzei',
  '芦屋市': 'area-ashiya-souzokuzei',
  '東大阪市': 'area-higashiosaka-souzokuzei',
  '枚方市': 'area-hirakata-souzokuzei',
  '茨木市': 'area-ibaraki-souzokuzei',
  '門真市': 'area-kadoma-souzokuzei',
  '神戸市': 'area-kobe-souzokuzei',
  '箕面市': 'area-minoh-souzokuzei',
  '守口市': 'area-moriguchi-souzokuzei',
  '寝屋川市': 'area-neyagawa-souzokuzei',
  '西宮市': 'area-nishinomiya-souzokuzei',
  '摂津市': 'area-settsu-souzokuzei',
  '四條畷市': 'area-shijonawate-souzokuzei',
  '吹田市': 'area-suita-souzokuzei',
  '宝塚市': 'area-takarazuka-souzokuzei',
  '高槻市': 'area-takatsuki-souzokuzei',
}

export const faqs = [
  {
    q: '99,000円で本当に申告できますか？',
    a: '遺産総額4,000万円までの標準的な申告であれば、税込99,000円で対応可能です。土地評価や非上場株式評価など内容によって追加料金が発生する場合は、必ず事前にご説明します。',
  },
  {
    q: '格安価格ですが、品質は大丈夫ですか？',
    a: 'ご安心ください。業務の標準化と相続税申告への特化により、無駄なコストを抑えて格安価格を実現していますが、申告書の作成・税理士による対応内容は変わりません。税理士法33条の2に基づく書面添付も標準的に活用し、税務調査に入られにくい申告書の作成を徹底しています。',
  },
  { q: '相談だけでも料金はかかりますか？', a: '初回のご相談は無料です。ご契約いただくまで費用は発生しません。' },
  { q: '申告期限が近いのですが対応できますか？', a: 'まずは現在の状況をお聞かせください。期限までの期間が短い案件についても、対応可否を含めてご案内します。' },
  {
    q: '大阪市以外でも依頼できますか？',
    a: '大阪府・兵庫県・京都府の全域に対応しています。松原市・吹田市・茨木市・高槻市・摂津市・東大阪市、西宮市・芦屋市・神戸市は重点対応エリアとして、出張相談も承っています。オンライン相談も可能です。〈対応可否は案件により異なるため無料相談時にご確認ください〉',
  },
]

export const officeRows = [
  ['名称', '相続税申告相談センター'],
  ['運営', 'タックス・プラン税理士法人（税理士登録番号：5469）'],
  ['所在地', '〒530-0044　大阪府大阪市北区東天満2丁目9番4号 5階'],
  ['電話番号', '06-6354-8220（受付：平日9:00〜18:00）'],
  ['面談日', '平日9:00〜18:00／土日の面談は事前予約で対応可'],
  ['最寄駅', 'Osaka Metro 谷町線・堺筋線「南森町」駅／JR東西線「大阪天満宮」駅'],
  ['対応地域', '大阪府・兵庫県・京都府（オンライン相談も可）'],
  ['相談方法', '来所相談・オンライン相談・出張相談'],
]

export const amountOptions = ['〜5,000万円', '5,000万円〜1億円', '1億円〜2億円', '2億円〜3億円', '3億円以上', 'まだわからない']
