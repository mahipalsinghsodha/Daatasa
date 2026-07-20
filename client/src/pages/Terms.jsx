import PolicyPage, { PolicySection, PolicyBullet, PolicyCallout } from '../components/PolicyPage'
import { useTranslation } from 'react-i18next'

const Terms = () => {
  const { t } = useTranslation()
  const date = new Date().toLocaleDateString('en-IN', { month:'long', year:'numeric' })
  const TOC = [t('terms.toc1'), t('terms.toc2'), t('terms.toc3'), t('terms.toc4'), t('terms.toc5'), t('terms.toc6')]

  return (
    <PolicyPage icon="📋" accentClass="from-orange-400 to-amber-400" tag={t('terms.tag')}
      title={t('terms.title')}
      subtitle={t('terms.subtitle')}
      lastUpdated={date} toc={TOC}>

      <PolicySection id="section-1" title={t('terms.s1Title')}>
        <p>{t('terms.s1p')}</p>
        <PolicyCallout type="info">{t('terms.s1callout')}</PolicyCallout>
      </PolicySection>

      <PolicySection id="section-2" title={t('terms.s2Title')}>
        <p>{t('terms.s2Intro')}</p>
        <ul className="mt-3 space-y-2 list-none">
          <PolicyBullet>{t('terms.s2b1')}</PolicyBullet>
          <PolicyBullet>{t('terms.s2b2')}</PolicyBullet>
          <PolicyBullet>{t('terms.s2b3')}</PolicyBullet>
          <PolicyBullet>{t('terms.s2b4')}</PolicyBullet>
        </ul>
      </PolicySection>

      <PolicySection id="section-3" title={t('terms.s3Title')}>
        <p>{t('terms.s3Intro')}</p>
        <ul className="mt-3 space-y-2 list-none">
          <PolicyBullet>{t('terms.s3b1')}</PolicyBullet>
          <PolicyBullet>{t('terms.s3b2')}</PolicyBullet>
          <PolicyBullet>{t('terms.s3b3')}</PolicyBullet>
        </ul>
        <PolicyCallout type="warning">{t('terms.s3callout')}</PolicyCallout>
      </PolicySection>

      <PolicySection id="section-4" title={t('terms.s4Title')}>
        <p>{t('terms.s4p')}</p>
      </PolicySection>

      <PolicySection id="section-5" title={t('terms.s5Title')}>
        <p>{t('terms.s5p')}</p>
      </PolicySection>

      <PolicySection id="section-6" title={t('terms.s6Title')}>
        <p>{t('terms.s6p')}</p>
        <div className="mt-3 inline-block p-4 rounded-2xl" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border-color)' }}>
          <a href="mailto:support@daatasa.com" className="text-sm font-bold hover:underline" style={{ color: 'var(--brand-secondary)' }}>📧 support@daatasa.com</a>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t('terms.s6response')}</p>
        </div>
      </PolicySection>
    </PolicyPage>
  )
}

export default Terms
