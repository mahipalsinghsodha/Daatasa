import PolicyPage, { PolicySection, PolicyBullet, PolicyCallout } from '../components/PolicyPage'

const date = new Date().toLocaleDateString('en-IN', { month:'long', year:'numeric' })
const TOC = ['Processing Time','Shipping Rates','Delivery Estimates','Order Tracking','Damaged Shipments']

export default function ShippingPolicy() {
  return (
    <PolicyPage icon="🚚" accentClass="from-emerald-400 to-teal-400" tag="Legal"
      title="Shipping Policy"
      subtitle="Fast, reliable delivery across all of India."
      lastUpdated={date} toc={TOC}>

      <PolicySection id="section-1" title="Processing Time">
        <p>All orders are processed within <strong className="text-slate-900">1–2 business days</strong>. Orders placed on Sundays or public holidays are processed on the next working day.</p>
        <PolicyCallout type="tip">Place your order before 12 PM IST for same-day dispatch (business days only).</PolicyCallout>
      </PolicySection>

      <PolicySection id="section-2" title="Shipping Rates">
        <div className="grid sm:grid-cols-2 gap-4 mt-2">
          {[
            {
              label: 'Orders above ₹500',
              val: 'FREE Standard Shipping',
              bg: 'rgba(56,161,105,0.08)', border: 'rgba(56,161,105,0.20)', color: 'var(--success)'
            },
            {
              label: 'Orders below ₹500',
              val: '₹50 Flat Rate',
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

      <PolicySection id="section-3" title="Delivery Estimates">
        <ul className="space-y-2 list-none">
          <PolicyBullet color="text-emerald-500">Metro cities (Mumbai, Delhi, Bangalore, Hyderabad): 2–4 business days</PolicyBullet>
          <PolicyBullet color="text-emerald-500">Tier-2 cities: 4–6 business days</PolicyBullet>
          <PolicyBullet color="text-emerald-500">Remote / rural areas: 5–8 business days</PolicyBullet>
        </ul>
        <PolicyCallout type="warning">Delivery times may be extended during festive seasons and extreme weather conditions.</PolicyCallout>
      </PolicySection>

      <PolicySection id="section-4" title="Order Tracking">
        <p>You will receive a Shipment Confirmation email with a tracking number once your order ships. The tracking link becomes active within 24 hours of dispatch.</p>
        <PolicyCallout type="info">Track your order anytime at <strong>My Orders</strong> in your Daatasa account.</PolicyCallout>
      </PolicySection>

      <PolicySection id="section-5" title="Damaged Shipments">
        <p>If your order arrives damaged, please:</p>
        <ul className="mt-3 space-y-2 list-none">
          <PolicyBullet>Take clear photographs of the damaged packaging and product</PolicyBullet>
          <PolicyBullet>Email us within 48 hours of delivery at support@daatasa.com</PolicyBullet>
          <PolicyBullet>We will arrange a replacement or full refund within 5 business days</PolicyBullet>
        </ul>
      </PolicySection>
    </PolicyPage>
  )
}
