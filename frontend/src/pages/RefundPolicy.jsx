import { motion } from 'framer-motion'

const s = (num, title, children) => (
  <section>
    <h2 className="text-base font-bold text-gray-900 mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{num}. {title}</h2>
    <div className="text-sm text-gray-600 leading-relaxed">{children}</div>
  </section>
)

const RefundPolicy = () => (
  <div className="min-h-screen" style={{ background: '#f8f9fa' }}>
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200 mb-4">Policy</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.025em' }}>Refund & Return Policy</h1>
          <p className="text-sm text-gray-400">Clear, hassle-free resolutions for our customers.</p>
        </motion.div>
      </div>
    </div>

    <div className="max-w-[860px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-10 space-y-8">
        {s('1', 'Return Eligibility', <>
          <p className="mb-2">Due to the perishable nature of our products, we generally do not accept returns. However, we will offer a replacement or refund under the following circumstances:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>The product was damaged during transit</li>
            <li>You received the wrong item</li>
            <li>The jar seal was broken upon arrival</li>
          </ul>
        </>)}
        {s('2', 'How to Request a Refund', <p>If your order falls into any of the categories above, please contact our support team within <strong>48 hours</strong> of delivery. You will need to provide your order ID and photographic evidence of the issue.</p>)}
        {s('3', 'Refund Timeline', <p>Once your claim is verified and approved, we will initiate a refund to your original method of payment. You will receive the credit within <strong>5–7 business days</strong>, depending on your card issuer's policies.</p>)}
        {s('4', 'Order Cancellations', <p>Orders can be cancelled free of charge if they have not yet been dispatched. Once an order is shipped, it cannot be cancelled.</p>)}
      </motion.div>
    </div>
  </div>
)

export default RefundPolicy
