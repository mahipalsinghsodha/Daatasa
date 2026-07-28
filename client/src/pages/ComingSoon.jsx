import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiMail, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../api/axios';

const ComingSoon = ({ launchDate }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!launchDate) return;
    
    const target = new Date(launchDate).getTime();
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = target - now;
      
      if (difference <= 0) {
        window.location.reload();
        return null;
      }
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [launchDate]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setErrorMsg('');
    try {
      await api.post('/api/subscribers/subscribe', { email });
      setSubscribed(true);
      toast.success("You're on the list! We'll notify you on launch.");
      setEmail('');
    } catch (err) {
      const message = err.response?.data?.message || "Failed to subscribe. Please try again.";
      if (message.includes('already')) {
        setSubscribed(true);
        toast.info(message);
      } else {
        setErrorMsg(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const TimeUnit = ({ value, label }) => (
    <div className="flex flex-col items-center mx-2 sm:mx-4">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center border border-brand-primary/10 shadow-[0_12px_40px_rgba(27,47,110,0.06)] relative overflow-hidden transition-all hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-primary/[0.02]" />
        <span className="text-2xl sm:text-3xl font-display font-bold text-brand-primary relative z-10">
          {value !== undefined ? String(value).padStart(2, '0') : '00'}
        </span>
      </div>
      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-text/50 mt-3">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col relative bg-[var(--ivory)] font-sans overflow-hidden items-center justify-center">
      <Helmet>
        <title>Coming Soon — Daatasa</title>
      </Helmet>

      {/* ── Decorative Light Background ── */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-secondary/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, var(--brand-primary) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      <div className="relative z-10 w-full max-w-4xl px-6 py-12 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full flex flex-col items-center"
        >
          <div className="mb-10">
            <img src="/logo_rectangle.png" alt="Daatasa" className="h-14 sm:h-16 w-auto drop-shadow-sm" />
          </div>

          <span className="inline-block px-4 py-1.5 mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary border border-brand-secondary/40 rounded-full shadow-sm bg-brand-secondary/5">
            Something amazing is brewing
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold font-display text-brand-primary mb-6 leading-[1.1] tracking-tight">
            We are launching <br className="hidden sm:block" />
            <span className="text-brand-secondary italic font-serif font-normal">very soon.</span>
          </h1>

          <p className="text-base sm:text-lg text-brand-text/70 mb-12 max-w-xl leading-relaxed">
            Get ready to experience the finest, traditionally crafted pure Vedic Bilona ghee. Join our exclusive list to be the first to know when we open our doors!
          </p>

          {/* Countdown */}
          {launchDate && (
            <div className="flex justify-center -mx-2 sm:-mx-4 mb-16">
              <TimeUnit value={timeLeft?.days} label="Days" />
              <div className="text-2xl font-bold text-brand-primary/20 pt-4">:</div>
              <TimeUnit value={timeLeft?.hours} label="Hours" />
              <div className="text-2xl font-bold text-brand-primary/20 pt-4">:</div>
              <TimeUnit value={timeLeft?.minutes} label="Mins" />
              <div className="text-2xl font-bold text-brand-primary/20 pt-4 hidden sm:block">:</div>
              <div className="hidden sm:block"><TimeUnit value={timeLeft?.seconds} label="Secs" /></div>
            </div>
          )}

          {/* Subscription Form */}
          <div className="max-w-md w-full mx-auto">
            {subscribed ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-6 flex items-center justify-center gap-4 text-brand-primary font-medium"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 text-brand-secondary shadow-sm">
                  <FiCheck size={20} />
                </div>
                You're on the exclusive list!
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative flex items-center w-full group">
                <div className="absolute left-5 text-brand-text/40 pointer-events-none group-focus-within:text-brand-secondary transition-colors">
                  <FiMail size={18} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address" 
                  required
                  disabled={loading}
                  className="w-full h-16 pl-14 pr-36 rounded-full border border-brand-primary/10 bg-white text-sm font-medium outline-none focus:border-brand-secondary focus:ring-4 focus:ring-brand-secondary/10 transition-all placeholder:text-brand-text/40 shadow-[0_8px_32px_rgba(27,47,110,0.06)]"
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-6 rounded-full flex items-center justify-center gap-2 text-sm font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                  style={{ background: 'linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%)', color: 'white' }}
                >
                  {loading ? <div className="w-4 h-4 border-2 border-brand-secondary/30 border-t-white rounded-full animate-spin" /> : 'Notify Me'}
                </button>
              </form>
            )}
            
            {/* Inline Error Message */}
            {errorMsg && !subscribed && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="mt-3 text-red-500 text-[13px] font-medium"
              >
                {errorMsg}
              </motion.div>
            )}

            <p className="text-[11px] font-medium text-brand-text/40 mt-4 tracking-wide uppercase">
              We respect your privacy. No spam, ever.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoon;
