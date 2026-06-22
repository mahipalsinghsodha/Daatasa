import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { FiRefreshCw, FiPlus, FiUsers, FiBox, FiClock, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSubscriptions = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' or 'subscribers'
  
  const [plans, setPlans] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    description: '',
    period: 'monthly',
    interval: 1,
    price: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, subsRes, prodsRes] = await Promise.all([
        api.get('/api/subscriptions/plans'),
        api.get('/api/subscriptions/all'),
        api.get('/api/products')
      ]);
      setPlans(plansRes.data.data || []);
      setSubscribers(subsRes.data.data || []);
      setProducts(prodsRes.data.products || []);
    } catch (err) {
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/subscriptions/plans', formData);
      toast.success('Plan created successfully');
      setShowForm(false);
      setFormData({ productId: '', name: '', description: '', period: 'monthly', interval: 1, price: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create plan');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6" style={{ color: 'var(--navy)' }}>
        <FiRefreshCw style={{ color: 'var(--gold)' }} /> Subscription Management
      </h1>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-6 py-3 font-semibold text-sm ${activeTab === 'plans' ? 'border-b-2' : 'text-gray-500 hover:text-gray-700'}`}
          style={activeTab === 'plans' ? { borderColor: 'var(--gold)', color: 'var(--gold)' } : {}}
        >
          Subscription Plans
        </button>
        <button
          onClick={() => setActiveTab('subscribers')}
          className={`px-6 py-3 font-semibold text-sm ${activeTab === 'subscribers' ? 'border-b-2' : 'text-gray-500 hover:text-gray-700'}`}
          style={activeTab === 'subscribers' ? { borderColor: 'var(--gold)', color: 'var(--gold)' } : {}}
        >
          Active Subscribers
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'plans' && (
          <motion.div key="plans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">Available Plans</h2>
              <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2" style={{ backgroundColor: '#1B2F6E', color: '#FFFFFF', border: 'none', cursor: 'pointer', opacity: 1, visibility: 'visible', display: 'flex' }}>
                <FiPlus size={16} /> {showForm ? 'Close' : 'Add New'}
              </button>
            </div>

            {showForm && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <form onSubmit={handleCreatePlan} className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Select Product</label>
                    <select required value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none">
                      <option value="">-- Select Product --</option>
                      {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Plan Name (e.g. Monthly Tharparkar Ghee)</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Billing Period</label>
                    <select required value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Price per period (₹)</label>
                    <input required type="number" min="1" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <button type="submit" className="font-bold px-6 py-3 rounded-xl hover:bg-opacity-90 w-full sm:w-auto" style={{ background: 'var(--gold)', color: 'var(--navy)' }}>
                      Create Plan via Razorpay
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              {plans.map(plan => (
                <div key={plan._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">ACTIVE</div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{plan.name}</h3>
                  <p className="text-xs text-gray-500 mb-4">{plan.product?.name}</p>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-2xl font-extrabold" style={{ color: 'var(--navy)' }}>₹{plan.price}</p>
                      <p className="text-xs text-gray-400 capitalize">per {plan.period}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400">Plan ID</p>
                      <p className="text-xs font-mono text-gray-600 truncate w-24" title={plan.razorpayPlanId}>{plan.razorpayPlanId}</p>
                    </div>
                  </div>
                </div>
              ))}
              {plans.length === 0 && !showForm && (
                <div className="md:col-span-3 text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <p className="text-gray-500 font-medium">No subscription plans created yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'subscribers' && (
          <motion.div key="subs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Plan</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Cycles Paid</th>
                      <th className="px-6 py-4">Next Billing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {subscribers.map(sub => (
                      <tr key={sub._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{sub.user?.name}</p>
                          <p className="text-xs text-gray-500">{sub.user?.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800">{sub.plan?.name}</p>
                          <p className="text-xs text-gray-500 font-mono truncate w-24" title={sub.razorpaySubscriptionId}>{sub.razorpaySubscriptionId}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            sub.status === 'active' || sub.status === 'authenticated' ? 'bg-green-100 text-green-700' :
                            sub.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {sub.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-gray-600">
                          {sub.paidCount} / {sub.totalCount}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-600">
                          {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                    {subscribers.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                          No active subscriptions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSubscriptions;
