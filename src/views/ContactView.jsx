import { PageHead, NextNav } from './PageParts.jsx'
import ContactSection from '../components/ContactSection.jsx'
import OfficeSection from '../components/OfficeSection.jsx'

/** 03 Contact：お問い合わせ・事務所概要 */
export default function ContactView() {
  return (
    <>
      <PageHead
        no="03"
        en="Contact"
        scene={4}
        title={<>まずは、<br /><em className="gradient-text">無料相談</em>から。</>}
        lead="初回相談は無料。ご契約いただくまで費用は一切かかりません。申告期限が迫っている方も、まずは現在の状況をお聞かせください。"
      />
      <ContactSection />
      <OfficeSection />
      <NextNav
        items={[
          { href: '#/service', no: '01', en: 'Service', title: 'サービスと料金を見る' },
          { href: '#/simulation', no: '02', en: 'Simulation', title: '相続税額をその場で試算する' },
        ]}
      />
    </>
  )
}
