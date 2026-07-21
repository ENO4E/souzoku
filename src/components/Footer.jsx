export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div className="fcol">
            <h5>相続税申告相談センター</h5>
            <p>堺市・大阪市を拠点に、累計200件超の相続税申告実績。初回無料相談から申告完了まで、相続専門の税理士が丁寧にサポートします。</p>
          </div>
          <div className="fcol">
            <h5>メニュー</h5>
            <ul>
              <li><a href="#pain">お悩み</a></li>
              <li><a href="#fee">料金</a></li>
              <li><a href="#contact">お問い合わせ</a></li>
            </ul>
          </div>
          <div className="fcol">
            <h5>お問い合わせ</h5>
            <ul>
              <li>06-6354-8220</li>
              <li>受付（平日9:00〜18:00）</li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">© 2026 相続税申告相談センター　All Rights Reserved.<br /><span style={{ opacity: 0.65, fontSize: 11 }}>運営：<a href="https://tax-plan.net/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>タックス・プラン税理士法人</a>（税理士登録番号：5469）<br />関連リンク：<a href="https://www.nta.go.jp/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>国税庁</a>　<a href="https://www.kinzei.or.jp/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>近畿税理士会</a></span></div>
      </div>
    </footer>
  )
}
