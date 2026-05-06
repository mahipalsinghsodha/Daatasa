import { motion } from 'framer-motion'

const s = (num, title, children) => (
  <section>
    <h2 className="text-base font-bold text-gray-900 mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{num}. {title}</h2>
    <div className="text-sm text-gray-600 leading-relaxed">{children}</div>
  </section>
)

const PrivacyPolicy = () => (
  <div className="min-h-screen" style={{ background: '#f8f9fa' }}>
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200 mb-4">Legal</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.025em' }}>Privacy Policy</h1>
          <p className="text-sm text-gray-400">Last updated: May 2026</p>
        </motion.div>
      </div>
    </div>

    <div className="max-w-[860px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-10 space-y-8">
        {s('1', 'Information We Collect', <p>When you use our services, we may collect personal information such as your name, email address, phone number, shipping address, and payment details. This information is securely processed to fulfill your orders.</p>)}
        {s('2', 'How We Use Your Information', <>
          <p className="mb-2">We use your information to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Process and deliver your orders</li>
            <li>Provide customer support and resolve disputes</li>
            <li>Send order confirmations and updates</li>
            <li>Improve our platform and services</li>
          </ul>
        </>)}
        {s('3', 'Data Security', <p>We implement industry-standard security measures, including encryption and secure servers, to protect your personal information. Payment processing is handled by secure third-party providers (like Razorpay) and we do not store your raw credit card data.</p>)}
        {s('4', 'Sharing Your Information', <p>We do not sell or rent your personal information to third parties. We may share your data with trusted logistics partners strictly for the purpose of order delivery.</p>)}
        {s('5', 'Contact Us', <p>If you have any questions regarding this privacy policy, please contact us at <a href="mailto:support@dhanifresh.com" className="text-orange-500 hover:underline">support@dhanifresh.com</a>.</p>)}
      </motion.div>
    </div>
  </div>
)

export default PrivacyPolicy
