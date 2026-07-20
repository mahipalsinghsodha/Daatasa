import PolicyPage, { PolicySection, PolicyBullet, PolicyCallout } from '../components/PolicyPage'
import { useTranslation } from 'react-i18next'

export default function ShippingPolicy() {
  const { t } = useTranslation()
  const date = new Date().toLocaleDateString('en-IN', { month:'long', year:'numeric' })
  const TOC = [t('shipping.toc1'), t('shipping.toc2'), t('shipping.toc3'), t('shipping.toc4'), t('shipping.toc5')]

  return (
    <PolicyPage icon="🚚" accentClass="from-emerald-400 to-teal-400" tag={t('shipping.tag')}
      title={t('shipping.title')}
      subtitle={t('shipping.subtitle')}
      lastUpdated={date} toc={TOC}>

      <PolicySection id="section-1" title={t('shipping.s1Title')}>
        <p>{t('shipping.s1p')}</p>
        <PolicyCallout type="tip">{t('shipping.s1callout')}</PolicyCallout>
      </PolicySection>

      <PolicySection id="section-2" title={t('shipping.s2Title')}>
        <div className="grid sm:grid-cols-2 gap-4 mt-2">
          {[
            {
              label: t('shipping.s2l1'),
              val: t('shipping.s2v1'),
              bg: 'rgba(56,161,105,0.08)', border: 'rgba(56,161,105,0.20)', color: 'var(--success)'
            },
            {
              label: t('shipping.s2l2'),
              val: t('shipping.s2v2'),
              bg: 'var(--bg-alt)', border: 'var(--border-color)', color: 'var(--text-primary)'
            },
          ].map(item => (
            <div key={item.label} className="p-5 rounded-2xl border" style={{ background: item.bg, borderColor: item.border }}>
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
              <p className="text-xl font-extrabold" style={{ color: item.color }}>{item.val}</p>
            </div>
          ))}
        </div>
      </PolicySection>

      <PolicySection id="section-3" title={t('shipping.s3Title')}>
        <ul className="space-y-2 list-none">
          <PolicyBullet color="text-emerald-500">{t('shipping.s3b1')}</PolicyBullet>
          <PolicyBullet color="text-emerald-500">{t('shipping.s3b2')}</PolicyBullet>
          <PolicyBullet color="text-emerald-500">{t('shipping.s3b3')}</PolicyBullet>
        </ul>
        <PolicyCallout type="warning">{t('shipping.s3callout')}</PolicyCallout>
      </PolicySection>

      <PolicySection id="section-4" title={t('shipping.s4Title')}>
        <p>{t('shipping.s4p')}</p>
        <PolicyCallout type="info">{t('shipping.s4callout')}</PolicyCallout>
      </PolicySection>

      <PolicySection id="section-5" title={t('shipping.s5Title')}>
        <p>{t('shipping.s5Intro')}</p>
        <ul className="mt-3 space-y-2 list-none">
          <PolicyBullet>{t('shipping.s5b1')}</PolicyBullet>
          <PolicyBullet>{t('shipping.s5b2')}</PolicyBullet>
          <PolicyBullet>{t('shipping.s5b3')}</PolicyBullet>
        </ul>
      </PolicySection>
    </PolicyPage>
  )
}
