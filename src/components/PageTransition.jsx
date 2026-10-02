/**
 * ページ遷移の幕。App が phase を 'in'（幕が下から上がって画面を覆う）→ 'out'（幕が上へ抜ける）と切り替える。
 * 金の幕と紺の幕を少しずらして動かし、waaark のようなカーテン風の切り替えにする
 */
export default function PageTransition({ phase }) {
  return (
    <div className={`wipe${phase ? ` wipe--${phase}` : ''}`} aria-hidden="true">
      <div className="wipe__a" />
      <div className="wipe__b" />
    </div>
  )
}
