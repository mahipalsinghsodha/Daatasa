import { FiRefreshCcw } from 'react-icons/fi'

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <div className="bg-[#0f172a] pt-20 pb-32 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 max-w-xl mx-auto px-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 text-[11px] font-bold tracking-wider uppercase rounded-full border border-red-500/20 mb-5">
            <FiRefreshCcw size={12} /> Legal Compliance
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Refund & <span className="text-red-500">Cancellation</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto">
            Last Updated: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-gray-600 space-y-8 text-[15px] leading-relaxed">
          
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>1. Cancellation Policy</h2>
            <p>Orders can be cancelled before they are dispatched. Once an order is shipped, it cannot be cancelled. To request a cancellation, please email support@dhanifresh.com with your Order ID.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>2. Returns and Refunds</h2>
            <p>Due to the consumable nature of our products, we only accept returns if:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-500">
              <li>The product was damaged in transit</li>
              <li>The wrong product was delivered</li>
              <li>The product is expired at the time of delivery</li>
            </ul>
            <p className="mt-4">Return requests must be raised within 7 days of delivery. Approved refunds will be credited to the original method of payment within 5-7 business days.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>3. How to Request a Return</h2>
            <p>Please contact our support team with your order number and photographs of the product in question. Our team will verify the claim and initiate a return pickup if applicable.</p>
          </section>

        </div>
      </div>
    </div>
  )
}
