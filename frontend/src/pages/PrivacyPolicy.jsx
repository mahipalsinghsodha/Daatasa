import { motion } from 'framer-motion'
import { FiShield } from 'react-icons/fi'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <div className="bg-[#0f172a] pt-20 pb-32 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        <div className="relative z-10 max-w-xl mx-auto px-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 text-[11px] font-bold tracking-wider uppercase rounded-full border border-blue-500/20 mb-5">
            <FiShield size={12} /> Legal Compliance
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Privacy <span className="text-blue-500">Policy</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto">
            Last Updated: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-gray-600 space-y-8 text-[15px] leading-relaxed">
          
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>1. Information We Collect</h2>
            <p>At DhaniFresh, we collect information that you provide directly to us when creating an account, placing an order, or contacting support. This includes:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-500">
              <li>Name, email address, and phone number</li>
              <li>Shipping and billing addresses</li>
              <li>Payment transaction references (We do NOT store full credit card numbers; payments are processed securely via Razorpay)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>2. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-500">
              <li>To process and fulfill your orders, including sending emails to confirm your order status and shipment</li>
              <li>To communicate with you about products, services, offers, and promotions</li>
              <li>To detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>3. Information Sharing</h2>
            <p>We do not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information with our business partners and trusted affiliates. We utilize third-party service providers (like Shiprocket for delivery and Razorpay for payments) who have limited access to your information purely to perform their duties.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>4. Data Security</h2>
            <p>We adopt appropriate data collection, storage, and processing practices and security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information, username, password, transaction information, and data stored on our site. All data exchange over the site happens over an SSL secured communication channel.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>5. Contacting Us</h2>
            <p>If you have any questions about this Privacy Policy, the practices of this site, or your dealings with this site, please contact us at:</p>
            <p className="mt-2 font-medium text-gray-900">Email: privacy@dhanifresh.com</p>
          </section>

        </div>
      </div>
    </div>
  )
}
