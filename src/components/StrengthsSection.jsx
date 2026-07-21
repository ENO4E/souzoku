export default function StrengthsSection() {
  return (
    <section className="bg-navy">
      <div className="wrap">
        <div className="section-head fade-in">
          <div className="eyebrow">選ばれる理由</div>
          <h2 className="serif">相続税申告相談センターが選ばれる理由</h2>
          <p style={{ color: 'rgba(255,255,255,0.68)' }}>法人税や決算業務と兼任せず、相続税申告に専門特化したチームで対応します。</p>
        </div>
        <div className="strength-grid fade-in">
          <div className="strength-card">
            <div className="icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="12" width="4" height="7" rx="0.5" stroke="var(--gold)" strokeWidth="1.6" />
                <rect x="9" y="7" width="4" height="12" rx="0.5" stroke="var(--gold)" strokeWidth="1.6" />
                <rect x="15" y="3" width="4" height="16" rx="0.5" stroke="var(--gold)" strokeWidth="1.6" />
              </svg>
            </div>
            <h4>累計200件超の申告実績</h4>
            <p>総相談件数2,000件以上。堺・大阪の2拠点で、土地評価や非上場株式評価など専門性の高い案件にも対応します。</p>
          </div>
          <div className="strength-card">
            <div className="icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 11a7 7 0 0 1 11.5-5.3M18 11a7 7 0 0 1-11.5 5.3" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M13 3.5 15.5 5.7 13 7.5M9 18.5 6.5 16.3 9 14.5" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h4>生前対策から申告までワンストップ</h4>
            <p>相続発生後の申告だけでなく、生前対策・遺言書作成サポート・資産承継アドバイスまで一貫して対応します。</p>
          </div>
          <div className="strength-card">
            <div className="icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="6" cy="6" r="2.6" stroke="var(--gold)" strokeWidth="1.6" />
                <circle cx="16" cy="6" r="2.6" stroke="var(--gold)" strokeWidth="1.6" />
                <circle cx="11" cy="16" r="2.6" stroke="var(--gold)" strokeWidth="1.6" />
                <path d="M8 7.5 9.5 13.5M14 7.5 12.5 13.5M8.5 6h5" stroke="var(--gold)" strokeWidth="1.4" />
              </svg>
            </div>
            <h4>各士業との連携体制</h4>
            <p>弁護士・司法書士・不動産鑑定士と連携し、遺産分割や登記まで含めてワンストップでサポートします。</p>
          </div>
          <div className="strength-card">
            <div className="icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 2.5h7l4 4V19a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1Z" stroke="var(--gold)" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M13 2.5V6a1 1 0 0 0 1 1h3" stroke="var(--gold)" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M7.5 12.5 9.5 14.5 14 10" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h4>書面添付制度を標準運用</h4>
            <p>税理士法33条の2に基づく書面添付を標準的に活用し、税務調査に入られにくい申告書の作成を徹底します。</p>
          </div>
        </div>
      </div>
    </section>
  )
}
