import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { MapPin, Shield, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const CheckoutSubscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const planId = location.state?.planId;

  const [plan, setPlan] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddrId, setSelectedAddrId] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!planId) {
      navigate('/');
      return;
    }
    
    const fetchData = async () => {
      try {
        const [planRes, userRes] = await Promise.all([
          api.get('/api/subscriptions/plans'),
          api.get('/api/auth/me')
        ]);
        
        const foundPlan = planRes.data.data.find(p => p._id === planId);
        if (!foundPlan) {
          toast.error('Plan not found');
          navigate('/');
          return;
        }
        
        setPlan(foundPlan);
        const addrs = userRes.data.data?.addresses || [];
        setAddresses(addrs);
        const defaultAddr = addrs.find(a => a.isDefault);
        if (defaultAddr) setSelectedAddrId(defaultAddr._id);
        else if (addrs.length > 0) setSelectedAddrId(addrs[0]._id);
        
      } catch (err) {
        toast.error('Failed to load checkout details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [planId, navigate]);

  const loadRazorpay = () => new Promise(resolve => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleSubscribe = async () => {
    if (!selectedAddrId) {
      toast.error('Please select a shipping address');
      return;
    }

    setProcessing(true);
    try {
      const selectedAddr = addresses.find(a => a._id === selectedAddrId);
      
      // 1. Create Subscription on Backend
      const { data } = await api.post('/api/subscriptions/create', {
        planId,
        shippingAddress: selectedAddr
      });

      const subscriptionId = data.subscription_id;

      // 2. Load Razorpay
      const res = await loadRazorpay();
      if (!res) throw new Error('Razorpay SDK failed to load');
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        toast.error('Razorpay Key is missing in frontend environment variables.');
        return;
      }
      
      const options = {
        key: razorpayKey,
        subscription_id: subscriptionId,
        name: 'Daatasa',
        description: plan.name,
        image: 'https://daatasa.in/logo.png', // Optional
        handler: function (response) {
          // Razorpay returns razorpay_payment_id, razorpay_subscription_id, razorpay_signature
          toast.success('Subscription activated successfully!');
          navigate('/profile');
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: selectedAddr.phone
        },
        theme: {
          color: '#1B2F6E' // navy
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Subscription failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <h1 className="text-2xl font-extrabold text-navy" style={{ fontFamily: 'var(--font-display)' }}>
          Checkout Subscription
        </h1>

        {/* Plan Details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center gap-6">
          <img src={plan.product?.image || plan.product?.images?.[0]} alt={plan.name} className="w-24 h-24 object-contain" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
            <p className="text-sm text-gray-500 mb-2">{plan.product?.name}</p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800">
              <CheckCircle size={12} /> Auto-renews every {plan.interval} {plan.period}
            </div>
            <p className="text-2xl font-extrabold text-navy mt-3">₹{plan.price.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Address Selection */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-amber-500" /> Shipping Address
          </h3>
          
          {addresses.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-3">No addresses found</p>
              <button onClick={() => navigate('/profile')} className="text-sm font-bold text-amber-600 underline">Add Address in Profile</button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map(addr => (
                <label key={addr._id} className={`block relative p-4 rounded-xl border cursor-pointer transition-all ${selectedAddrId === addr._id ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-amber-200'}`}>
                  <input type="radio" name="address" value={addr._id} checked={selectedAddrId === addr._id} onChange={(e) => setSelectedAddrId(e.target.value)} className="absolute opacity-0" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{addr.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{addr.street}, {addr.city}</p>
                      <p className="text-xs text-gray-600">{addr.state} - {addr.zipCode}</p>
                      <p className="text-xs text-gray-600 mt-1">Phone: {addr.phone}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAddrId === addr._id ? 'border-amber-500' : 'border-gray-300'}`}>
                      {selectedAddrId === addr._id && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Action */}
        <button
          onClick={handleSubscribe}
          disabled={processing || !selectedAddrId}
          className="w-full py-4 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
          style={{ background: 'var(--brand-gradient)', boxShadow: 'var(--shadow-brand)' }}
        >
          {processing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Shield size={20} />
          )}
          {processing ? 'Processing...' : `Subscribe for ₹${plan.price.toLocaleString('en-IN')}/${plan.period}`}
        </button>
        <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1">
          <Shield size={12} className="text-green-500" /> Secure payment powered by Razorpay. You can cancel anytime.
        </p>
      </div>
    </div>
  );
};

export default CheckoutSubscription;
