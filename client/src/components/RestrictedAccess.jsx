import React from 'react';
import { motion } from 'framer-motion';
import { FiSlash, FiShield, FiChevronLeft, FiLock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const RestrictedAccess = ({
  title = "Access Restricted",
  message = "You do not have the required permissions to view this section. Please contact the system administrator if you believe this is an error."
}) => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg-base)',
      fontFamily: 'var(--font)',
    }}>
      {/* Background decorative blobs */}
      <div style={{
        position: 'absolute', top: '10%', left: '10%',
        width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(229,62,62,0.06) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '10%',
        width: 260, height: 260, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(27,47,110,0.07) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          maxWidth: 460,
          width: '100%',
          textAlign: 'center',
          background: 'var(--bg-card)',
          padding: '48px 36px',
          borderRadius: 24,
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Animated icon */}
        <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(229,62,62,0.08)',
              borderRadius: '50%',
              border: '2px solid rgba(229,62,62,0.18)',
            }}
          />
          <div style={{
            width: 64, height: 64,
            background: 'rgba(229,62,62,0.08)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FiLock size={28} style={{ color: 'var(--danger)' }} />
          </div>
          <FiShield
            size={16}
            style={{
              position: 'absolute', bottom: 8, right: 8,
              color: 'var(--danger)',
              background: 'var(--bg-card)',
              borderRadius: '50%', padding: 2,
            }}
          />
        </div>

        {/* Badge */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 14px', borderRadius: 999,
          background: 'rgba(229,62,62,0.08)',
          border: '1px solid rgba(229,62,62,0.16)',
          color: 'var(--danger)',
          fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.06em',
          marginBottom: 16,
        }}>
          <FiSlash size={10} /> Access Denied
        </span>

        <h2 style={{
          fontSize: 22, fontWeight: 800,
          margin: '0 0 12px',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.02em',
        }}>
          {title}
        </h2>
        <p style={{
          fontSize: 14,
          color: 'var(--text-muted)',
          lineHeight: 1.65,
          margin: '0 0 32px',
        }}>
          {message}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={() => navigate('/admin')}
            className="btn btn-primary"
            style={{ justifyContent: 'center' }}
            id="restricted-back-btn"
          >
            <FiChevronLeft size={16} /> Back to Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
            style={{ justifyContent: 'center' }}
            id="restricted-go-back-btn"
          >
            Go Back
          </button>
        </div>

        {/* Decorative corner accent */}
        <div style={{
          position: 'absolute', top: -1, right: -1,
          width: 60, height: 60,
          borderTop: '3px solid var(--danger)',
          borderRight: '3px solid var(--danger)',
          borderTopRightRadius: 24,
          opacity: 0.25,
          pointerEvents: 'none',
        }} />
      </motion.div>
    </div>
  );
};

export default RestrictedAccess;
