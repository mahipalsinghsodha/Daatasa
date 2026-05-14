import { FiFileText } from 'react-icons/fi'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <div className="bg-[#0f172a] pt-20 pb-32 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 max-w-xl mx-auto px-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/20 text-orange-400 text-[11px] font-bold tracking-wider uppercase rounded-full border border-orange-500/20 mb-5">
            <FiFileText size={12} /> Legal Compliance
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Terms of <span className="text-orange-500">Service</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto">
            Last Updated: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-gray-600 space-y-8 text-[15px] leading-relaxed">
          
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>1. Agreement to Terms</h2>
            <p>By accessing our website and purchasing our products, you agree to be bound by these Terms of Service and to comply with all applicable laws and regulations.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>2. Use License</h2>
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on DhaniFresh's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>3. Products and Pricing</h2>
            <p>All products are subject to availability. We reserve the right to discontinue any product at any time. Prices for our products are subject to change without notice. We shall not be liable to you or to any third-party for any modification, price change, suspension, or discontinuance of the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>4. Payment Terms</h2>
            <p>We use Razorpay as our payment gateway. By placing an order, you authorize us to charge the applicable payment method. You represent and warrant that you have the legal right to use any credit card(s) or other payment method(s) utilized in connection with any transaction.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>5. Limitation of Liability</h2>
            <p>In no event shall DhaniFresh or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on DhaniFresh's website.</p>
          </section>

        </div>
      </div>
    </div>
  )
}
