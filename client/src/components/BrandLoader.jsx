import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 🌟 Daatasa BrandLoader
 * A signature, luxury loader featuring the Daatasa circular emblem
 * enclosed within dual-orbit rotating golden radiance rings.
 *
 * @param {boolean} visible - Controls display
 * @param {string} text - Primary status message (e.g. "Updating Order Status...")
 * @param {string} subtext - Optional secondary reassurance message
 * @param {'overlay' | 'inline' | 'compact'} mode - Display mode
 * @param {'sm' | 'md' | 'lg'} size - Dimension scaling
 * @param {string} className - Optional container styling
 */
const BrandLoader = ({
  visible = true,
  text = 'Processing, please wait…',
  subtext = 'Keeping your data safe & synced',
  mode = 'overlay',
  size = 'md',
  className = ''
}) => {
  if (!visible) return null;

  // Sizing definitions
  const dimensions = {
    sm: { box: 64, logo: 36, stroke: 2, fontText: 'text-xs', fontSub: 'text-[10px]' },
    md: { box: 96, logo: 56, stroke: 2.5, fontText: 'text-sm sm:text-base', fontSub: 'text-xs' },
    lg: { box: 128, logo: 76, stroke: 3, fontText: 'text-base sm:text-lg', fontSub: 'text-xs sm:text-sm' }
  }[size] || { box: 96, logo: 56, stroke: 2.5, fontText: 'text-sm sm:text-base', fontSub: 'text-xs' };

  const loaderContent = (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* ── Loader Spinner & Logo Core ── */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: dimensions.box, height: dimensions.box }}
      >
        {/* Ambient Golden Glow Backdrop */}
        <div
          className="absolute inset-0 rounded-full blur-xl pointer-events-none opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.45) 0%, rgba(217, 119, 6, 0.2) 60%, transparent 80%)'
          }}
        />

        {/* Outer Radiant Orbit Ring (Rotates Clockwise) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0%, transparent 35%, rgba(245, 158, 11, 0.2) 55%, #f59e0b 80%, #fbbf24 95%, #ffffff 100%)',
            padding: `${dimensions.stroke}px`,
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #fff calc(100% - 2px))',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #fff calc(100% - 2px))'
          }}
        />

        {/* Counter-rotating Secondary Dashed Halo */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 3.2, ease: 'linear' }}
          className="absolute rounded-full border border-dashed pointer-events-none"
          style={{
            inset: `${dimensions.stroke * 2}px`,
            borderColor: 'rgba(217, 119, 6, 0.35)',
            borderWidth: '1.5px'
          }}
        />

        {/* Orbiting Golden Star Particle */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
          className="absolute inset-0 flex items-start justify-center pointer-events-none"
        >
          <div
            className="w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_#fbbf24] -mt-1"
          />
        </motion.div>

        {/* Center Logo Disk with Gentle Pulse */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              '0 0 15px rgba(245, 158, 11, 0.25)',
              '0 0 24px rgba(245, 158, 11, 0.45)',
              '0 0 15px rgba(245, 158, 11, 0.25)'
            ]
          }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="relative z-10 rounded-full overflow-hidden flex items-center justify-center bg-white border-2 border-amber-400/80 shadow-md"
          style={{ width: dimensions.logo, height: dimensions.logo }}
        >
          <img
            src="/logo_circle.png"
            alt="Daatasa"
            className="w-full h-full object-cover select-none pointer-events-none"
            onError={(e) => {
              // Fallback if image fails to load
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = `
                <div class="w-full h-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-black font-serif text-sm">
                  D
                </div>
              `;
            }}
          />
        </motion.div>
      </div>

      {/* ── Status Text & Typing Indicator ── */}
      {text && (
        <div className="mt-4 text-center px-4 max-w-xs">
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`font-extrabold tracking-wide text-slate-800 dark:text-slate-100 ${dimensions.fontText}`}
          >
            {text}
          </motion.div>

          {subtext && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.75 }}
              transition={{ delay: 0.15 }}
              className={`mt-1 font-medium text-slate-500 dark:text-slate-400 ${dimensions.fontSub} flex items-center justify-center gap-1.5`}
            >
              <span>{subtext}</span>
              <span className="inline-flex gap-0.5">
                <motion.span
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
                  className="inline-block w-1 h-1 rounded-full bg-amber-500"
                />
                <motion.span
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
                  className="inline-block w-1 h-1 rounded-full bg-amber-500"
                />
                <motion.span
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
                  className="inline-block w-1 h-1 rounded-full bg-amber-500"
                />
              </span>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );

  // Mode: Fullscreen / Overlay Loader with Glassmorphism
  if (mode === 'overlay') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
          role="status"
          aria-live="polite"
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative px-8 py-7 rounded-3xl bg-white/95 dark:bg-slate-900/95 shadow-2xl border border-amber-500/20 flex flex-col items-center"
            style={{
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 35px rgba(245, 158, 11, 0.2)'
            }}
          >
            {loaderContent}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Mode: Inline (Embedded in page / card)
  return loaderContent;
};

export default BrandLoader;
