import PolicyPage, { PolicySection, PolicyBullet, PolicyCallout } from '../components/PolicyPage'

const date = new Date().toLocaleDateString('en-IN', { month:'long', year:'numeric' })
const TOC = ['Agreement to Terms','Products & Pricing','Your Account','Intellectual Property','Governing Law','Contact Us']

const Terms = () => (
  <PolicyPage icon="📋" accentClass="from-orange-400 to-amber-400" tag="Legal"
    title="Terms & Conditions"
    subtitle="Please read these terms carefully before using Daatasa."
    lastUpdated={date} toc={TOC}>

    <PolicySection id="section-1" title="Agreement to Terms">
      <p>By accessing our website and purchasing our products, you agree to be bound by these Terms and Conditions. If you disagree with any part, you may not access the service.</p>
      <PolicyCallout type="info">These terms apply to all users — visitors, registered accounts, and customers alike.</PolicyCallout>
    </PolicySection>

    <PolicySection id="section-2" title="Products & Pricing">
      <p>We strive to ensure all details, descriptions, and prices are accurate. However, we reserve the right to:</p>
      <ul className="mt-3 space-y-2 list-none">
        <PolicyBullet>Refuse any order placed with us without specifying a reason</PolicyBullet>
        <PolicyBullet>Limit or cancel quantities purchased per person, per household, or per order</PolicyBullet>
        <PolicyBullet>Change prices for products at any time without prior notice</PolicyBullet>
        <PolicyBullet>Correct typographical errors in pricing and product descriptions</PolicyBullet>
      </ul>
    </PolicySection>

    <PolicySection id="section-3" title="Your Account">
      <p>When you create an account, you must provide accurate and complete information. You are responsible for:</p>
      <ul className="mt-3 space-y-2 list-none">
        <PolicyBullet>Maintaining the confidentiality of your account password</PolicyBullet>
        <PolicyBullet>All activities that occur under your account</PolicyBullet>
        <PolicyBullet>Notifying us immediately of any unauthorized use</PolicyBullet>
      </ul>
      <PolicyCallout type="warning">Never share your login credentials. Daatasa will never ask for your password via email or phone.</PolicyCallout>
    </PolicySection>

    <PolicySection id="section-4" title="Intellectual Property">
      <p>All content on this website — including text, graphics, logos, images, and software — is the property of Daatasa and protected by applicable Indian intellectual property laws. Unauthorized use is prohibited.</p>
    </PolicySection>

    <PolicySection id="section-5" title="Governing Law">
      <p>These Terms shall be governed and construed in accordance with the laws of <strong style={{ color: 'var(--text-primary)' }}>India</strong>. Any disputes shall be subject to the exclusive jurisdiction of courts in Jodhpur, Rajasthan.</p>
    </PolicySection>

    <PolicySection id="section-6" title="Contact Us">
      <p>Questions about these Terms?</p>
      <div className="mt-3 inline-block p-4 rounded-2xl" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border-color)' }}>
        <a href="mailto:support@daatasa.com" className="text-sm font-bold hover:underline" style={{ color: 'var(--brand-secondary)' }}>📧 support@daatasa.com</a>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>We respond within 48 hours</p>
      </div>
    </PolicySection>
  </PolicyPage>
)

export default Terms
