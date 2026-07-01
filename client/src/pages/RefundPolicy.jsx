import PolicyPage, { PolicySection, PolicyBullet, PolicyCallout } from '../components/PolicyPage'

const date = new Date().toLocaleDateString('en-IN', { month:'long', year:'numeric' })
const TOC = ['Cancellation Policy','Returns & Refunds','Refund Processing','How to Request a Return']

export default function RefundPolicy() {
  return (
    <PolicyPage icon="↩️" accentClass="from-red-400 to-rose-400" tag="Legal"
      title="Refund & Cancellation Policy"
      subtitle="We want every purchase to be perfect. Here's what happens if it isn't."
      lastUpdated={date} toc={TOC}>

      <PolicySection id="section-1" title="Cancellation Policy">
        <p>Orders can be cancelled before they are dispatched. Once an order is shipped, it cannot be cancelled.</p>
        <PolicyCallout type="info">To request cancellation, email <strong>support@daatasa.com</strong> with your Order ID as soon as possible.</PolicyCallout>
      </PolicySection>

      <PolicySection id="section-2" title="Returns & Refunds">
        <p>Due to the consumable nature of our products, we accept returns only if:</p>
        <ul className="mt-3 space-y-2 list-none">
          <PolicyBullet color="text-red-500">The product was damaged or tampered during transit</PolicyBullet>
          <PolicyBullet color="text-red-500">The wrong product was delivered</PolicyBullet>
          <PolicyBullet color="text-red-500">The product is expired at the time of delivery</PolicyBullet>
        </ul>
        <PolicyCallout type="warning">Return requests must be raised within <strong>7 days</strong> of delivery with photographic evidence.</PolicyCallout>
      </PolicySection>

      <PolicySection id="section-3" title="Refund Processing">
        <p>Once your return request is approved:</p>
        <ul className="mt-3 space-y-2 list-none">
          <PolicyBullet>Refunds are processed to the original payment method</PolicyBullet>
          <PolicyBullet>Online payments: credited within 5–7 business days</PolicyBullet>
          <PolicyBullet>COD orders: credited to your bank account within 7–10 business days</PolicyBullet>
        </ul>
        <PolicyCallout type="success">For Razorpay payments, refunds appear in your account within 3–5 working days.</PolicyCallout>
      </PolicySection>

      <PolicySection id="section-4" title="How to Request a Return">
        <p>Contact our support team with:</p>
        <ul className="mt-3 space-y-2 list-none">
          <PolicyBullet>Your order number (found in your confirmation email)</PolicyBullet>
          <PolicyBullet>Clear photographs of the damaged / incorrect product</PolicyBullet>
          <PolicyBullet>A brief description of the issue</PolicyBullet>
        </ul>
        <div className="mt-4 inline-block p-4 rounded-2xl" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border-color)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>📧 support@daatasa.com</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>We respond within 24 hours, Mon–Sat</p>
        </div>
      </PolicySection>
    </PolicyPage>
  )
}
