// 税務署ごとのページ（/zeimusho/<slug>/）のデータ。
// 「〇〇税務署 相続税申告」の検索に当てる。管轄区域は運営者から受け取った一覧にもとづく（所在地・電話は変わることがあるので、
// ページには「最新は国税庁サイトで確認」の注記を出す）。
// areas … 管轄区域のうち、このサイトに市区町村ページがある市区町村名（site.js の areaRegions の表記と一致させる。ビルドでリンクに変換）
// extra … 市区町村ページが無い管轄区域（文字だけ出す）
// note  … 管轄の補足（区の一部だけ、など）

export const taxOffices = [
  // ---- 大阪市 ----
  { slug: 'kita', name: '北税務署', pref: '大阪府', postal: '530-8585', address: '大阪市北区南扇町7番13号', tel: '06-6313-3371', areas: ['大阪市北区'], extra: [], note: '北区全域' },
  { slug: 'higashi', name: '東税務署', pref: '大阪府', postal: '540-8557', address: '大阪市中央区大手前1丁目5番63号 大阪合同庁舎第3号館', tel: '06-6942-1101', areas: ['大阪市中央区'], extra: [], note: '中央区のうち東部（旧東区の区域）。南部は南税務署' },
  { slug: 'minami', name: '南税務署', pref: '大阪府', postal: '542-8586', address: '大阪市中央区谷町7丁目5番23号', tel: '06-6768-4881', areas: ['大阪市中央区'], extra: [], note: '中央区のうち南部（旧南区の区域）。東部は東税務署' },
  { slug: 'osaka-fukushima', name: '大阪福島税務署', pref: '大阪府', postal: '553-8567', address: '大阪市福島区玉川2丁目12番28号', tel: '06-6448-1281', areas: ['大阪市福島区', '大阪市此花区'], extra: [], note: '' },
  { slug: 'nishi', name: '西税務署', pref: '大阪府', postal: '550-0021', address: '大阪市西区川口2丁目7番9号', tel: '06-6583-4624', areas: ['大阪市西区'], extra: [], note: '' },
  { slug: 'minato', name: '港税務署', pref: '大阪府', postal: '552-0003', address: '大阪市港区磯路3丁目20番11号', tel: '06-6572-3901', areas: ['大阪市港区', '大阪市大正区'], extra: [], note: '' },
  { slug: 'tennoji', name: '天王寺税務署', pref: '大阪府', postal: '543-0033', address: '大阪市天王寺区堂ヶ芝2丁目11番25号', tel: '06-6772-1281', areas: ['大阪市天王寺区'], extra: [], note: '' },
  { slug: 'naniwa', name: '浪速税務署', pref: '大阪府', postal: '556-0011', address: '大阪市浪速区難波中3丁目13番9号', tel: '06-6632-1131', areas: ['大阪市浪速区'], extra: [], note: '' },
  { slug: 'nishiyodogawa', name: '西淀川税務署', pref: '大阪府', postal: '555-0024', address: '大阪市西淀川区野里3丁目3番3号', tel: '06-6472-1021', areas: ['大阪市西淀川区'], extra: [], note: '' },
  { slug: 'higashiyodogawa', name: '東淀川税務署', pref: '大阪府', postal: '532-8558', address: '大阪市淀川区木川東2丁目3番1号', tel: '06-6303-1141', areas: ['大阪市東淀川区', '大阪市淀川区'], extra: [], note: '' },
  { slug: 'higashinari', name: '東成税務署', pref: '大阪府', postal: '537-0024', address: '大阪市東成区東小橋2丁目1番7号', tel: '06-6972-1331', areas: ['大阪市東成区'], extra: [], note: '' },
  { slug: 'ikuno', name: '生野税務署', pref: '大阪府', postal: '544-8555', address: '大阪市生野区勝山北5丁目22番14号', tel: '06-6717-1231', areas: ['大阪市生野区'], extra: [], note: '' },
  { slug: 'asahi', name: '旭税務署', pref: '大阪府', postal: '535-8555', address: '大阪市旭区大宮1丁目1番25号', tel: '06-6952-3201', areas: ['大阪市都島区', '大阪市旭区'], extra: [], note: '' },
  { slug: 'joto', name: '城東税務署', pref: '大阪府', postal: '536-8527', address: '大阪市城東区中央2丁目14番29号', tel: '06-6932-1271', areas: ['大阪市城東区', '大阪市鶴見区'], extra: [], note: '' },
  { slug: 'abeno', name: '阿倍野税務署', pref: '大阪府', postal: '545-0005', address: '大阪市阿倍野区三明町2丁目10番29号', tel: '06-6628-0221', areas: ['大阪市阿倍野区'], extra: [], note: '' },
  { slug: 'sumiyoshi', name: '住吉税務署', pref: '大阪府', postal: '558-8555', address: '大阪市住吉区住吉2丁目17番37号', tel: '06-6672-1321', areas: ['大阪市住吉区', '大阪市住之江区'], extra: [], note: '' },
  { slug: 'higashisumiyoshi', name: '東住吉税務署', pref: '大阪府', postal: '547-8501', address: '大阪市平野区平野西2丁目2番2号', tel: '06-6702-0001', areas: ['大阪市東住吉区', '大阪市平野区'], extra: [], note: '' },
  { slug: 'nishinari', name: '西成税務署', pref: '大阪府', postal: '557-0054', address: '大阪市西成区千本中1丁目3番4号', tel: '06-6659-5131', areas: ['大阪市西成区'], extra: [], note: '' },
  // ---- 大阪府（大阪市以外） ----
  { slug: 'sakai', name: '堺税務署', pref: '大阪府', postal: '590-8550', address: '堺市堺区南瓦町2番20号', tel: '072-238-5551', areas: ['堺市', '堺市堺区', '堺市中区', '堺市東区', '堺市西区', '堺市南区', '堺市北区'], extra: [], note: '堺市のうち美原区を除く区域。美原区は富田林税務署' },
  { slug: 'toyono', name: '豊能税務署', pref: '大阪府', postal: '563-8688', address: '池田市城南2丁目1番8号', tel: '072-751-2441', areas: ['豊中市', '池田市', '箕面市', '豊能町', '能勢町'], extra: [], note: '' },
  { slug: 'suita', name: '吹田税務署', pref: '大阪府', postal: '564-8515', address: '吹田市片山町3丁目16番22号', tel: '06-6330-3911', areas: ['吹田市', '摂津市'], extra: [], note: '' },
  { slug: 'ibaraki', name: '茨木税務署', pref: '大阪府', postal: '567-8565', address: '茨木市上中条1丁目9番21号', tel: '072-623-1131', areas: ['高槻市', '茨木市', '島本町'], extra: [], note: '高槻市にも税務署はなく、茨木税務署が管轄' },
  { slug: 'hirakata', name: '枚方税務署', pref: '大阪府', postal: '573-8654', address: '枚方市大垣内町2丁目9番9号', tel: '072-844-9521', areas: ['枚方市', '寝屋川市', '交野市'], extra: [], note: '' },
  { slug: 'kadoma', name: '門真税務署', pref: '大阪府', postal: '571-8545', address: '門真市殿島町8番12号', tel: '06-6909-0181', areas: ['守口市', '大東市', '門真市', '四條畷市'], extra: [], note: '' },
  { slug: 'higashiosaka', name: '東大阪税務署', pref: '大阪府', postal: '577-8666', address: '東大阪市永和2丁目3番8号', tel: '06-6724-0001', areas: ['東大阪市'], extra: [], note: '' },
  { slug: 'yao', name: '八尾税務署', pref: '大阪府', postal: '581-8555', address: '八尾市高美町3丁目2番29号', tel: '072-992-1251', areas: ['八尾市', '松原市', '柏原市'], extra: [], note: '' },
  { slug: 'tondabayashi', name: '富田林税務署', pref: '大阪府', postal: '584-8501', address: '富田林市若松町西2丁目1697番地1', tel: '0721-24-3281', areas: ['堺市美原区', '富田林市', '河内長野市', '羽曳野市', '藤井寺市', '大阪狭山市'], extra: ['太子町', '河南町', '千早赤阪村'], note: '' },
  { slug: 'izumiotsu', name: '泉大津税務署', pref: '大阪府', postal: '595-8585', address: '泉大津市二田町1丁目15番27号', tel: '0725-33-5601', areas: ['泉大津市', '和泉市', '高石市'], extra: ['忠岡町'], note: '' },
  { slug: 'kishiwada', name: '岸和田税務署', pref: '大阪府', postal: '596-0825', address: '岸和田市土生町2丁目28番1号', tel: '072-438-1341', areas: ['岸和田市', '貝塚市'], extra: [], note: '' },
  { slug: 'izumisano', name: '泉佐野税務署', pref: '大阪府', postal: '598-8503', address: '泉佐野市日根野3683-1', tel: '072-462-3471', areas: ['泉佐野市'], extra: ['泉南市', '阪南市', '熊取町', '田尻町', '岬町'], note: '' },
  // ---- 兵庫県 ----
  { slug: 'kobe', name: '神戸税務署', pref: '兵庫県', postal: '650-8511', address: '神戸市中央区中山手通2丁目2番20号', tel: '078-391-7161', areas: ['神戸市中央区'], extra: [], note: '' },
  { slug: 'nada', name: '灘税務署', pref: '兵庫県', postal: '657-0834', address: '神戸市灘区泉通2丁目1番2号', tel: '078-861-5054', areas: ['神戸市灘区'], extra: [], note: '東灘区は芦屋税務署' },
  { slug: 'hyogo', name: '兵庫税務署', pref: '兵庫県', postal: '652-0802', address: '神戸市兵庫区水木通2丁目1番4号', tel: '078-576-5131', areas: ['神戸市兵庫区', '神戸市北区', '三田市'], extra: [], note: '' },
  { slug: 'nagata', name: '長田税務署', pref: '兵庫県', postal: '653-0832', address: '神戸市長田区御船通1丁目4', tel: '078-691-5151', areas: ['神戸市長田区'], extra: [], note: '' },
  { slug: 'suma', name: '須磨税務署', pref: '兵庫県', postal: '654-8511', address: '神戸市須磨区衣掛町5丁目2番18号', tel: '078-731-4333', areas: ['神戸市須磨区', '神戸市垂水区'], extra: [], note: '' },
  { slug: 'akashi', name: '明石税務署', pref: '兵庫県', postal: '673-8555', address: '明石市田町1丁目12番1号', tel: '078-921-2261', areas: ['神戸市西区'], extra: ['明石市'], note: '' },
  { slug: 'ashiya', name: '芦屋税務署', pref: '兵庫県', postal: '659-8503', address: '芦屋市公光町6番2号', tel: '0797-31-2131', areas: ['神戸市東灘区', '芦屋市'], extra: [], note: '' },
  { slug: 'nishinomiya', name: '西宮税務署', pref: '兵庫県', postal: '662-8585', address: '西宮市江上町3番35号', tel: '0798-34-3930', areas: ['西宮市', '宝塚市'], extra: [], note: '' },
  { slug: 'amagasaki', name: '尼崎税務署', pref: '兵庫県', postal: '660-8544', address: '尼崎市西難波町1丁目8番1号', tel: '06-6416-1381', areas: ['尼崎市'], extra: [], note: '' },
  { slug: 'itami', name: '伊丹税務署', pref: '兵庫県', postal: '664-8505', address: '伊丹市千僧1丁目47番地3', tel: '072-779-6121', areas: ['伊丹市', '川西市'], extra: ['猪名川町'], note: '' },
  // ---- 京都府 ----
  { slug: 'kamigyo', name: '上京税務署', pref: '京都府', postal: '602-8555', address: '京都市上京区一条通西洞院東入元真如堂町358', tel: '075-441-9171', areas: ['京都市北区', '京都市上京区'], extra: [], note: '' },
  { slug: 'sakyo', name: '左京税務署', pref: '京都府', postal: '606-8555', address: '京都市左京区聖護院円頓美町18', tel: '075-761-5371', areas: ['京都市左京区'], extra: [], note: '' },
  { slug: 'nakagyo', name: '中京税務署', pref: '京都府', postal: '604-8501', address: '京都市中京区柳馬場通二条下ル等持寺町15', tel: '075-241-2181', areas: ['京都市中京区'], extra: [], note: '' },
  { slug: 'higashiyama', name: '東山税務署', pref: '京都府', postal: '605-0914', address: '京都市東山区渋谷通大和大路東入下新シ町339-5', tel: '075-561-1131', areas: ['京都市東山区', '京都市山科区'], extra: [], note: '' },
  { slug: 'shimogyo', name: '下京税務署', pref: '京都府', postal: '600-8181', address: '京都市下京区間之町五条下ル大津町8', tel: '075-351-9161', areas: ['京都市下京区', '京都市南区'], extra: [], note: '' },
  { slug: 'ukyo', name: '右京税務署', pref: '京都府', postal: '615-0007', address: '京都市右京区西院上花田町10の1', tel: '075-311-6366', areas: ['京都市右京区', '京都市西京区', '向日市', '長岡京市'], extra: ['乙訓郡（大山崎町）'], note: '' },
  { slug: 'fushimi', name: '伏見税務署', pref: '京都府', postal: '612-0084', address: '京都市伏見区鑓屋町', tel: '075-641-5111', areas: ['京都市伏見区'], extra: [], note: '' },
  { slug: 'uji', name: '宇治税務署', pref: '京都府', postal: '611-0033', address: '宇治市大久保町井の尻60-3', tel: '0774-44-4141', areas: ['宇治市', '城陽市', '八幡市', '京田辺市', '木津川市'], extra: ['久世郡（久御山町）', '綴喜郡（井手町・宇治田原町）', '相楽郡（笠置町・和束町・精華町・南山城村）'], note: '' },
  { slug: 'sonobe', name: '園部税務署', pref: '京都府', postal: '622-8501', address: '南丹市園部町小山東町平成台1号11', tel: '0771-62-0340', areas: ['亀岡市'], extra: ['南丹市', '船井郡（京丹波町）'], note: '' },
]

export const TAX_OFFICE_NOTE = '所在地・電話番号・受付時間は変わることがあります。来署の前に国税庁サイトの「税務署の所在地・案内」で最新の情報をご確認ください。'

/** 市区町村名（areaRegions の表記）→ その市区町村を管轄する税務署（複数なら最初のもの。中央区のように2署に分かれる場合は null） */
export function taxOfficeForCity(city) {
  const hits = taxOffices.filter((o) => o.areas.includes(city))
  return hits.length === 1 ? hits[0] : null
}
