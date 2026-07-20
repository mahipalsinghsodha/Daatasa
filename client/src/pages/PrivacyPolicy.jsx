import PolicyPage, { PolicySection, PolicyBullet, PolicyCallout } from '../components/PolicyPage'
import { useTranslation } from 'react-i18next'

export default function PrivacyPolicy() {
  const { t } = useTranslation()
  const date = new Date().toLocaleDateString('en-IN', { month:'long', year:'numeric' })
  const TOC = [t('privacy.toc1'), t('privacy.toc2'), t('privacy.toc3'), t('privacy.toc4'), t('privacy.toc5'), t('privacy.toc6')]

  return (
    <PolicyPage icon="🔒" accentClass="from-blue-400 to-indigo-400" tag={t('privacy.tag')}
      title={t('privacy.title')}
      subtitle={t('privacy.subtitle')}
      lastUpdated={date} toc={TOC}>

      <PolicySection id="section-1" title={t('privacy.s1Title')}>
        <p>{t('privacy.s1Intro')}</p>
        <ul className="mt-3 space-y-2 list-none">
          <PolicyBullet>{t('privacy.s1b1')}</PolicyBullet>
          <PolicyBullet>{t('privacy.s1b2')}</PolicyBullet>
          <PolicyBullet>{t('privacy.s1b3')}</PolicyBullet>
          <PolicyBullet>{t('privacy.s1b4')}</PolicyBullet>
        </ul>
      </PolicySection>

      <PolicySection id="section-2" title={t('privacy.s2Title')}>
        <p>{t('privacy.s2Intro')}</p>
        <ul className="mt-3 space-y-2 list-none">
          <PolicyBullet>{t('privacy.s2b1')}</PolicyBullet>
          <PolicyBullet>{t('privacy.s2b2')}</PolicyBullet>
          <PolicyBullet>{t('privacy.s2b3')}</PolicyBullet>
          <PolicyBullet>{t('privacy.s2b4')}</PolicyBullet>
        </ul>
      </PolicySection>

      <PolicySection id="section-3" title={t('privacy.s3Title')}>
        <p>{t('privacy.s3p')}</p>
        <PolicyCallout type="success">{t('privacy.s3callout')}</PolicyCallout>
      </PolicySection>

      <PolicySection id="section-4" title={t('privacy.s4Title')}>
        <p>{t('privacy.s4Intro')}</p>
        <ul className="mt-3 space-y-2 list-none">
          <PolicyBullet>{t('privacy.s4b1')}</PolicyBullet>
          <PolicyBullet>{t('privacy.s4b2')}</PolicyBullet>
          <PolicyBullet>{t('privacy.s4b3')}</PolicyBullet>
        </ul>
      </PolicySection>

      <PolicySection id="section-5" title={t('privacy.s5Title')}>
        <p>{t('privacy.s5p')}</p>
        <PolicyCallout type="info">{t('privacy.s5callout')}</PolicyCallout>
      </PolicySection>

      <PolicySection id="section-6" title={t('privacy.s6Title')}>
        <p>{t('privacy.s6p')}</p>
        <div className="mt-3 inline-block p-4 rounded-2xl" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border-color)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>📧 privacy@daatasa.com</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t('privacy.s6response')}</p>
        </div>
      </PolicySection>
    </PolicyPage>
  )
}
