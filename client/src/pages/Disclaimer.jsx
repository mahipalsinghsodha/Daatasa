import PolicyPage, { PolicySection, PolicyBullet, PolicyCallout } from '../components/PolicyPage'
import { useTranslation } from 'react-i18next'

export default function Disclaimer() {
  const { t } = useTranslation()
  const date = new Date().toLocaleDateString('en-IN', { month:'long', year:'numeric' })
  const TOC = [t('disclaimer.toc1'), t('disclaimer.toc2'), t('disclaimer.toc3'), t('disclaimer.toc4')]

  return (
    <PolicyPage icon="⚠️" accentClass="from-amber-400 to-orange-400" tag={t('disclaimer.heroTag', 'Legal Disclaimer')}
      title={t('disclaimer.heroTitle', 'Disclaimer')}
      subtitle={t('disclaimer.heroDesc', 'Important information regarding our products and website.')}
      lastUpdated={date} toc={TOC}>

      <PolicySection id="section-1" title={t('disclaimer.s1Title', 'General Disclaimer')}>
        <p>{t('disclaimer.s1p1')}</p>
        <PolicyCallout type="warning">{t('disclaimer.s1callout')}</PolicyCallout>
      </PolicySection>

      <PolicySection id="section-2" title={t('disclaimer.s2Title', 'Medical Disclaimer')}>
        <p>{t('disclaimer.s2p1')}</p>
        <ul className="mt-3 space-y-2 list-none">
          <PolicyBullet color="text-brand-primary">{t('disclaimer.s2b1')}</PolicyBullet>
          <PolicyBullet color="text-brand-primary">{t('disclaimer.s2b2')}</PolicyBullet>
        </ul>
      </PolicySection>

      <PolicySection id="section-3" title={t('disclaimer.s3Title', 'Product Variation')}>
        <p>{t('disclaimer.s3p1')}</p>
        <ul className="mt-3 space-y-2 list-none">
          <PolicyBullet color="text-brand-primary">{t('disclaimer.s3b1')}</PolicyBullet>
          <PolicyBullet color="text-brand-primary">{t('disclaimer.s3b2')}</PolicyBullet>
        </ul>
      </PolicySection>

      <PolicySection id="section-4" title={t('disclaimer.s4Title', 'External Links')}>
        <p>{t('disclaimer.s4p1')}</p>
        <p className="mt-2">{t('disclaimer.s4p2')}</p>
      </PolicySection>

    </PolicyPage>
  )
}
