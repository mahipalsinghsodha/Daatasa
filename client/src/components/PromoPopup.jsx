import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, CheckCircle, Gift } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../api/axios'

const PromoPopup = () => {
  const [show, setShow] = useState(false)
  const [coupon, setCoupon] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const checkPromo = async () => {
      if (sessionStorage.getItem('promo_seen')) return

      try {
        const res = await api.get('/api/coupons/active')
        if (res.data && res.data.length > 0) {
          // Find the best coupon or just pick the first one
          setCoupon(res.data[0])
          
          // Show popup after a small delay for better UX
          setTimeout(() => {
            setShow(true)
          }, 2000)
        }
      } catch (error) {
        console.error('Failed to fetch coupons', error)
      }
    }

    checkPromo()
  }, [])

  const handleClose = () => {
    setShow(false)
    sessionStorage.setItem('promo_seen', 'true')
  }

  const handleCopy = () => {
    if (coupon) {
      navigator.clipboard.writeText(coupon.code)
      setCopied(true)
      toast.success('Coupon code copied!')
      setTimeout(() => setCopied(false), 3000)
    }
  }

  if (!show || !coupon) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md md:max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row z-10"
        >
          {/* Image Section */}
          <div className="md:w-1/2 bg-brand-primary relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary to-brand-navy opacity-90" />
            <img 
              src="https://images.unsplash.com/photo-1607083206968-13611e3d76ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Special Offer" 
              className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
              <Gift size={64} className="mb-6 text-[var(--gold)] drop-shadow-lg" />
              <h2 className="text-4xl font-black font-display mb-2 text-white drop-shadow-md">Special<br/>Offer!</h2>
              <p className="text-white font-medium">Exclusive deal just for you</p>
            </div>
          </div>

          {/* Content Section */}
          <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center relative bg-white">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] font-bold text-xs uppercase tracking-widest w-fit mb-6">
              <Gift size={14} /> Limited Time Only
            </div>

            <h3 className="text-3xl font-black font-display text-brand-primary mb-2">
              {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
            </h3>
            
            <p className="text-sm font-semibold text-gray-600 mb-6">
              {coupon.description || `Get a special discount on orders above ₹${coupon.minOrderValue}.`}
            </p>

            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-6 shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 text-center">Your Coupon Code</p>
              <div className="flex items-center justify-between bg-white border-2 border-dashed border-[var(--gold)] rounded-xl p-3 px-4 shadow-sm">
                <span className="font-mono font-black text-2xl text-brand-primary tracking-widest select-all">{coupon.code}</span>
                <button
                  onClick={handleCopy}
                  className="w-12 h-12 flex items-center justify-center bg-[var(--gold)]/10 text-[var(--gold)] hover:bg-[var(--gold)] hover:text-white rounded-xl transition-colors shrink-0"
                  title="Copy code"
                >
                  {copied ? <CheckCircle size={24} /> : <Copy size={24} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              style={{ background: 'var(--gold)', color: 'var(--navy)' }}
            >
              Start Shopping Now
            </button>
            <button onClick={handleClose} className="mt-5 text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors text-center w-full">
              No thanks, I'll pay full price
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default PromoPopup
