import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiTool, FiClock, FiMail } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Maintenance = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--ivory)] font-sans p-6">
      <Helmet>
        <title>We'll Be Right Back — Daatasa</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-secondary/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, var(--brand-primary) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-2xl bg-white rounded-[2rem] p-10 sm:p-16 text-center border border-brand-primary/10 shadow-[0_24px_80px_rgba(27,47,110,0.06)]"
      >
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-brand-primary/5 flex items-center justify-center border border-brand-primary/10 text-brand-secondary">
            <FiTool size={36} />
          </div>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-brand-primary mb-4 leading-tight">
          We are upgrading our experience.
        </h1>
        <p className="text-[15px] text-brand-text/70 mb-10 max-w-md mx-auto leading-relaxed">
          Daatasa is currently undergoing scheduled maintenance to bring you an even better shopping experience. We'll be back online shortly. Thank you for your patience!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="bg-brand-primary/5 p-4 rounded-xl flex items-center gap-4 text-left border border-brand-primary/10">
            <FiClock size={24} className="text-brand-secondary shrink-0" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand-text/50">Status</p>
              <p className="text-sm font-semibold text-brand-primary">In Progress</p>
            </div>
          </div>
          <div className="bg-brand-primary/5 p-4 rounded-xl flex items-center gap-4 text-left border border-brand-primary/10">
            <FiMail size={24} className="text-brand-secondary shrink-0" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand-text/50">Support</p>
              <a href="mailto:support@daatasa.com" className="text-sm font-semibold text-brand-primary hover:text-brand-secondary transition-colors">Contact Us</a>
            </div>
          </div>
        </div>
        
      </motion.div>
    </div>
  );
};

export default Maintenance;
