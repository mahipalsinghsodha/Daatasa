import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiPackage, FiPhone } from 'react-icons/fi'
import api from '../api/axios'
import OrderTimeline from '../components/OrderTimeline'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const { t } = useTranslation()

  const handleTrack = async (e) => {
    e.preventDefault()
    if (!orderId || !phone) {
      toast.error(t('trackOrder.errorFields', 'Please enter both Order ID and Phone Number'))
      return
    }

    setLoading(true)
    setHasSearched(true)
    try {
      const res = await api.get(`/api/orders/track?orderId=${orderId}&phone=${phone}`)
      setOrder(res.data)
    } catch (err) {
      setOrder(null)
      toast.error(err.response?.data?.message || t('trackOrder.notFound', 'Could not find order. Please check your details.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-16 bg-[var(--ivory)] font-sans text-brand-text">
      {/* ── Page header ── */}
      <div className="bg-white border-b border-brand-primary/10 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-bold font-display text-brand-primary">{t('trackOrder.title', 'Track Your Order')}</h1>
          <p className="text-base mt-3 text-brand-text/60 font-medium max-w-2xl mx-auto">
            {t('trackOrder.subtitle', 'Enter your details below to check your order status')}
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          
          <div className="rounded-[2rem] p-8 lg:p-10 shadow-sm bg-white border border-brand-primary/10">
            <form onSubmit={handleTrack} className="space-y-6">
              <div className="space-y-5">
                <div className="relative">
                  <label className="block text-sm font-semibold mb-2 text-brand-text/70">
                    {t('trackOrder.orderIdLabel', 'Order ID / Invoice Number')}
                  </label>
                  <div className="relative">
                    <FiPackage className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text/40" size={18} />
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="e.g. INV-2026-..."
                      className="w-full h-[52px] pl-11 pr-4 rounded-[1rem] bg-[var(--ivory)] border border-brand-primary/10 focus:border-brand-secondary focus:bg-white focus:ring-1 focus:ring-brand-secondary outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-semibold mb-2 text-brand-text/70">
                    {t('trackOrder.phoneLabel', 'Phone Number')}
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text/40" size={18} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t('trackOrder.phonePlaceholder', 'Billing phone number')}
                      className="w-full h-[52px] pl-11 pr-4 rounded-[1rem] bg-[var(--ivory)] border border-brand-primary/10 focus:border-brand-secondary focus:bg-white focus:ring-1 focus:ring-brand-secondary outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary h-14 rounded-full flex items-center justify-center gap-2 text-base font-bold"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <FiSearch size={18} /> {t('trackOrder.submitBtn', 'Track Order')}
                  </>
                )}
              </motion.button>
            </form>
          </div>

          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2rem] p-8 lg:p-10 shadow-sm bg-white border border-brand-primary/10"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-brand-primary/5 pb-6">
                <div>
                  <h2 className="text-xl font-bold font-display text-brand-primary">{t('trackOrder.orderStatus', 'Order Status')}</h2>
                  <p className="text-sm text-brand-text/60 font-medium mt-1">ID: {order.invoiceNumber || order._id}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase ${
                    order.paymentStatus === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                    order.paymentStatus === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                    'bg-brand-primary/10 text-brand-primary'
                  }`}>
                    {order.paymentStatus}
                  </span>
                  <p className="text-xs text-brand-text/50 mt-2">
                    {t('trackOrder.placedOn', 'Placed on')} {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Items Summary */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-brand-text/70 mb-4 uppercase tracking-wider">{t('trackOrder.itemsInOrder', 'Items in Order')}</h3>
                <div className="space-y-3">
                  {order.orderItems?.map((item) => (
                    <div key={item._id} className="flex items-center gap-4 bg-[var(--ivory)] p-3 rounded-[1rem] border border-brand-primary/5">
                      <img src={item.product?.image || item.image || '/placeholder.png'} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-white" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-brand-primary">{item.name}</p>
                        <p className="text-xs font-medium text-brand-text/50">{t('trackOrder.qty', 'Qty')}: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-sm font-bold text-brand-text/70 mb-4 uppercase tracking-wider">{t('trackOrder.trackingHistory', 'Tracking History')}</h3>
                <div className="pl-2">
                  <OrderTimeline order={order} />
                </div>
              </div>
            </motion.div>
          )}

          {!order && !loading && hasSearched && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10"
            >
              <div className="w-16 h-16 rounded-full bg-brand-primary/5 text-brand-primary/40 flex items-center justify-center mx-auto mb-4">
                <FiPackage size={24} />
              </div>
              <p className="text-brand-text/60 font-medium">No order found with these details.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TrackOrder
