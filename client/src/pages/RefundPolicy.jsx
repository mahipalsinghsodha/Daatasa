import PolicyPage, { PolicySection, PolicyBullet, PolicyCallout } from '../components/PolicyPage'
import { useTranslation } from 'react-i18next'

export default function RefundPolicy() {
  const { t } = useTranslation()
  const date = new Date().toLocaleDateString('en-IN', { month:'long', year:'numeric' })
  const TOC = [t('refund.toc1'), t('refund.toc2'), t('refund.toc3'), t('refund.toc4')]

  return (
    <PolicyPage icon="↩️" accentClass="from-red-400 to-rose-400" tag={t('refund.tag')}
      title={t('refund.title')}
      subtitle={t('refund.subtitle')}
      lastUpdated={date} toc={TOC}>

      <PolicySection id="section-1" title={t('refund.s1Title')}>
        <p>{t('refund.s1p')}</p>
        <PolicyCallout type="info">{t('refund.s1callout')}</PolicyCallout>
      </PolicySection>

      <PolicySection id="section-2" title={t('refund.s2Title')}>
        <p>{t('refund.s2Intro')}</p>
        <ul className="mt-3 space-y-2 list-none">
          <PolicyBullet color="text-red-500">{t('refund.s2b1')}</PolicyBullet>
          <PolicyBullet color="text-red-500">{t('refund.s2b2')}</PolicyBullet>
          <PolicyBullet color="text-red-500">{t('refund.s2b3')}</PolicyBullet>
        </ul>
        <PolicyCallout type="warning">{t('refund.s2callout')}</PolicyCallout>
      </PolicySection>

      <PolicySection id="section-3" title={t('refund.s3Title')}>
        <p>{t('refund.s3Intro')}</p>
        <ul className="mt-3 space-y-2 list-none">
          <PolicyBullet>{t('refund.s3b1')}</PolicyBullet>
          <PolicyBullet>{t('refund.s3b2')}</PolicyBullet>
          <PolicyBullet>{t('refund.s3b3')}</PolicyBullet>
        </ul>
        <PolicyCallout type="success">{t('refund.s3callout')}</PolicyCallout>
      </PolicySection>

      <PolicySection id="section-4" title={t('refund.s4Title')}>
        <p>{t('refund.s4Intro')}</p>
        <ul className="mt-3 space-y-2 list-none">
          <PolicyBullet>{t('refund.s4b1')}</PolicyBullet>
          <PolicyBullet>{t('refund.s4b2')}</PolicyBullet>
          <PolicyBullet>{t('refund.s4b3')}</PolicyBullet>
        </ul>
        <div className="mt-4 inline-block p-4 rounded-2xl" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border-color)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>📧 support@daatasa.com</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t('refund.s4response')}</p>
        </div>
      </PolicySection>
    </PolicyPage>
  )
}
