import { motion } from 'framer-motion'

const section = (num, title, children) => (
  <section>
    <h2 className="text-base font-bold text-gray-900 mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{num}. {title}</h2>
    <div className="text-sm text-gray-600 leading-relaxed space-y-2">{children}</div>
  </section>
)

const Terms = () => (
  <div className="min-h-screen" style={{ background: '#f8f9fa' }}>
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200 mb-4">Legal</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.025em' }}>Terms & Conditions</h1>
          <p className="text-sm text-gray-400">Last updated: May 2026</p>
        </motion.div>
      </div>
    </div>

    <div className="max-w-[860px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-10 space-y-8">

        {section('1', 'Agreement to Terms',
          <p>By accessing our website and purchasing our products, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, then you may not access the service.</p>
        )}

        {section('2', 'Products and Pricing',
          <>
            <p>We strive to ensure all details, descriptions, and prices are accurate. However, errors may occur. We reserve the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Refuse any order you place with us</li>
              <li>Limit or cancel quantities purchased per person</li>
              <li>Change prices for products at any time without notice</li>
            </ul>
          </>
        )}

        {section('3', 'Your Account',
          <p>When you create an account with us, you must provide information that is accurate and complete. You are responsible for safeguarding the password that you use to access the service and for any activities under your password.</p>
        )}

        {section('4', 'Governing Law',
          <p>These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>
        )}

        {section('5', 'Contact Us',
          <p>If you have any questions about these Terms, please contact us at <a href="mailto:support@dhanifresh.com" className="text-orange-500 hover:underline">support@dhanifresh.com</a>.</p>
        )}
      </motion.div>
    </div>
  </div>
)

export default Terms
