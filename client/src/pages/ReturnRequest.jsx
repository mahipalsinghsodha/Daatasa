import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCcw, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import api from '../api/axios';

const ReturnRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/api/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please provide a reason for the return');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/api/orders/${id}/return-request`, { reason });
      toast.success(res.data.message || 'Return request submitted');
      navigate(`/orders/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Return request failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-10 flex items-center justify-center bg-[var(--bg-base)]">
        <div className="w-8 h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-[var(--bg-base)]">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <Link to={`/orders/${id}`} className="inline-flex items-center gap-2 hover:underline font-medium text-brand-text/60">
          <FiArrowLeft /> Back to Order
        </Link>

        <div className="bg-white rounded-[2rem] p-8 lg:p-10 shadow-sm border border-brand-primary/10">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-brand-primary/5">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center">
              <FiRefreshCcw size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display text-brand-primary">Request a Return</h1>
              <p className="text-sm text-brand-text/60 mt-1">Order #{order.invoiceNumber || order._id.slice(-8).toUpperCase()}</p>
            </div>
          </div>

          <form onSubmit={handleReturn} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-brand-text/70">
                Why are you returning this order? <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please describe the issue with your items (e.g. damaged, wrong item, etc.)"
                className="w-full p-4 rounded-[1rem] bg-[var(--ivory)] border border-brand-primary/10 focus:border-brand-secondary focus:bg-white focus:ring-1 focus:ring-brand-secondary outline-none transition-all resize-y min-h-[120px]"
                required
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800">
              <FiAlertCircle className="shrink-0 mt-0.5" size={18} />
              <p className="text-sm leading-relaxed">
                Return requests must be made within 7 days of delivery. Once approved, our team will contact you regarding pickup and refund details.
              </p>
            </div>

            <div className="flex gap-4 pt-4 border-t border-brand-primary/5">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => navigate(`/orders/${id}`)}
                className="flex-1 py-3 h-14 font-bold rounded-full border border-brand-primary/20 text-brand-text hover:bg-brand-primary/5 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting || !reason.trim()}
                className="flex-1 py-3 h-14 font-bold rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center justify-center"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReturnRequest;
