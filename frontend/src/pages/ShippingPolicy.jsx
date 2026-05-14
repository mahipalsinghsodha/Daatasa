import { FiTruck } from 'react-icons/fi'

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <div className="bg-[#0f172a] pt-20 pb-32 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 max-w-xl mx-auto px-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 text-[11px] font-bold tracking-wider uppercase rounded-full border border-green-500/20 mb-5">
            <FiTruck size={12} /> Logistics
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Shipping <span className="text-green-500">Policy</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto">
            Last Updated: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-gray-600 space-y-8 text-[15px] leading-relaxed">
          
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>1. Processing Time</h2>
            <p>All orders are processed within 1-2 business days. Orders are not shipped or delivered on Sundays or public holidays.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>2. Shipping Rates & Delivery Estimates</h2>
            <p>Shipping charges for your order will be calculated and displayed at checkout.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-500">
              <li>Orders above Rs. 500: Free Standard Shipping (3-5 business days)</li>
              <li>Orders below Rs. 500: Rs. 50 Flat Rate (3-5 business days)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>3. Shipment Confirmation & Order Tracking</h2>
            <p>You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.</p>
          </section>

        </div>
      </div>
    </div>
  )
}
