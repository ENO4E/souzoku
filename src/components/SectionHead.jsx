/** セクション見出し（番号・英語ラベル・日本語タイトル・リード文） */
export default function SectionHead({ no, en, title, lead }) {
  return (
    <div className="section-head">
      <div className="section-head__main">
        <p className="eyebrow" data-reveal>
          <span className="eyebrow__no">{no}</span>
          <span className="eyebrow__line" />
          <span data-scramble>{en}</span>
        </p>
        <h2 className="section-title" data-reveal>{title}</h2>
      </div>
      {lead && (
        <div className="section-head__side">
          <p className="section-lead" data-reveal>{lead}</p>
        </div>
      )}
    </div>
  )
}

export function Arrow() {
  return (
    <svg className="btn__arrow" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
