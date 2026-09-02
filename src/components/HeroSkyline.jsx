// ファーストビュー背景の大阪スカイライン（左から：梅田スカイビル・大阪城・通天閣・あべのハルカス）
// 装飾目的のため aria-hidden。塗りは1色にして重なりをシルエットとして溶け込ませる
export default function HeroSkyline() {
  return (
    <svg className="hero-skyline" viewBox="0 0 1440 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <g fill="#E4D3B4">
        {/* 左側のビル群 */}
        <rect x="0" y="140" width="60" height="60" />
        <rect x="70" y="118" width="50" height="82" />
        <rect x="128" y="150" width="44" height="50" />

        {/* 梅田スカイビル：2本のタワーと空中庭園（円形の抜き） */}
        <rect x="190" y="60" width="38" height="140" />
        <rect x="262" y="60" width="38" height="140" />
        <path fillRule="evenodd" d="M190 48h110v24H190z M245 51a9 9 0 1 0 0.01 0z" />

        {/* 中央左のビル群 */}
        <rect x="320" y="130" width="40" height="70" />
        <rect x="370" y="108" width="50" height="92" />
        <rect x="430" y="145" width="40" height="55" />
        <rect x="480" y="95" width="60" height="105" />
        <rect x="509" y="78" width="2" height="17" />
        <rect x="550" y="135" width="40" height="65" />
        <rect x="600" y="120" width="42" height="80" />

        {/* 大阪城：石垣＋三層の天守 */}
        <polygon points="650,200 810,200 795,160 665,160" />
        <rect x="680" y="135" width="100" height="26" />
        <polygon points="660,137 676,120 784,120 800,137" />
        <rect x="690" y="100" width="80" height="21" />
        <polygon points="673,102 690,86 770,86 787,102" />
        <rect x="700" y="68" width="60" height="19" />
        <polygon points="684,70 700,56 760,56 776,70" />
        <polygon points="703,57 730,36 757,57" />
        <rect x="705" y="49" width="5" height="8" />
        <rect x="750" y="49" width="5" height="8" />

        {/* 中央右のビル群 */}
        <rect x="830" y="125" width="40" height="75" />
        <rect x="880" y="105" width="50" height="95" />
        <rect x="940" y="140" width="40" height="60" />
        <rect x="990" y="115" width="50" height="85" />

        {/* 通天閣：末広がりの脚部・展望台・尖塔 */}
        <polygon points="1060,200 1150,200 1120,140 1090,140" />
        <rect x="1074" y="150" width="62" height="10" />
        <polygon points="1090,140 1120,140 1112,60 1098,60" />
        <rect x="1080" y="60" width="50" height="18" />
        <rect x="1086" y="78" width="38" height="6" />
        <rect x="1099" y="40" width="12" height="20" />
        <rect x="1104" y="14" width="2" height="26" />

        {/* あべのハルカス：段状の超高層 */}
        <rect x="1180" y="25" width="40" height="175" />
        <rect x="1220" y="55" width="30" height="145" />
        <rect x="1250" y="85" width="25" height="115" />

        {/* 右側のビル群 */}
        <rect x="1290" y="130" width="40" height="70" />
        <rect x="1340" y="110" width="60" height="90" />
        <rect x="1410" y="145" width="30" height="55" />

        {/* 地平線 */}
        <rect x="0" y="198" width="1440" height="2" />
      </g>
    </svg>
  )
}
