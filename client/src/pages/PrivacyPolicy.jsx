import PolicyPage, { PolicySection, PolicyBullet, PolicyCallout } from '../components/PolicyPage'

const date = new Date().toLocaleDateString('en-IN', { month:'long', year:'numeric' })
const TOC = ['Information We Collect','How We Use Your Information','Information Sharing','Data Security','Your Rights','Contacting Us']

export default function PrivacyPolicy() {
  return (
    <PolicyPage icon="🔒" accentClass="from-blue-400 to-indigo-400" tag="Legal"
      title="Privacy Policy"
      subtitle="We take your privacy seriously. Here's how we handle your data."
      lastUpdated={date} toc={TOC}>

      <PolicySection id="section-1" title="Information We Collect">
        <p>At DhaniFresh, we collect information you provide when creating an account, placing an order, or contacting support:</p>
        <ul className="mt-3 space-y-2 list-none">
          <PolicyBullet>Name, email address, and phone number</PolicyBullet>
          <PolicyBullet>Shipping and billing addresses</PolicyBullet>
          <PolicyBullet>Payment transaction references (we do NOT store full card numbers — processed securely via Razorpay)</PolicyBullet>
          <PolicyBullet>Device information, browser type, and IP address (for security purposes)</PolicyBullet>
        </ul>
      </PolicySection>

      <PolicySection id="section-2" title="How We Use Your Information">
        <p>We use collected data to:</p>
        <ul className="mt-3 space-y-2 list-none">
          <PolicyBullet>Process and fulfill your orders, including sending order confirmation and shipment emails</PolicyBullet>
          <PolicyBullet>Communicate about products, services, offers, and promotions</PolicyBullet>
          <PolicyBullet>Detect, investigate, and prevent fraudulent transactions and illegal activities</PolicyBullet>
          <PolicyBullet>Improve our website, products, and customer experience</PolicyBullet>
        </ul>
      </PolicySection>

      <PolicySection id="section-3" title="Information Sharing">
        <p>We do not sell, trade, or rent your personal information to others. We use third-party service providers including Shiprocket (delivery) and Razorpay (payments) who have limited access to perform their duties only.</p>
        <PolicyCallout type="success">Your data is never sold to advertisers or third-party marketing companies.</PolicyCallout>
      </PolicySection>

      <PolicySection id="section-4" title="Data Security">
        <p>We adopt appropriate data collection, storage, and processing practices. Security measures include:</p>
        <ul className="mt-3 space-y-2 list-none">
          <PolicyBullet>SSL-encrypted data transmission on all pages</PolicyBullet>
          <PolicyBullet>Bcrypt-hashed passwords — never stored in plain text</PolicyBullet>
          <PolicyBullet>Regular security audits and dependency updates</PolicyBullet>
        </ul>
      </PolicySection>

      <PolicySection id="section-5" title="Your Rights">
        <p>You have the right to access, correct, or delete your personal data at any time. You may also opt out of marketing communications by clicking "Unsubscribe" in any email we send.</p>
        <PolicyCallout type="info">To request account deletion or data export, email us at privacy@dhanifresh.com.</PolicyCallout>
      </PolicySection>

      <PolicySection id="section-6" title="Contacting Us">
        <p>Questions about this Privacy Policy? Contact us:</p>
        <div className="mt-3 inline-block p-4 rounded-2xl" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border-color)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>📧 privacy@dhanifresh.com</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Response within 48 hours</p>
        </div>
      </PolicySection>
    </PolicyPage>
  )
}
