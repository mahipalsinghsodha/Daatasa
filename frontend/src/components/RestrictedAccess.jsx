import React from 'react';
import { motion } from 'framer-motion';
import { FiSlash, FiShield, FiChevronLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const RestrictedAccess = ({ title = "Access Restricted", message = "You do not have the required permissions to view this section. Please contact the system administrator if you believe this is an error." }) => {
  const navigate = useNavigate();

  const T = {
    bg: '#0f0f13',
    surface: '#17171f',
    accent: '#e8621a',
    text: '#f1f1f5',
    textMid: '#9191a8',
    border: 'rgba(255,255,255,0.07)',
    font: '"DM Sans", sans-serif',
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: T.bg,
      fontFamily: T.font,
      color: T.text
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          maxWidth: 440,
          width: '100%',
          textAlign: 'center',
          background: T.surface,
          padding: '48px 32px',
          borderRadius: 24,
          border: `1px solid ${T.border}`,
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{
          position: 'relative',
          width: 80,
          height: 80,
          margin: '0 auto 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: `${T.accent}15`,
              borderRadius: '50%',
              border: `2px solid ${T.accent}30`
            }}
          />
          <FiSlash size={32} color={T.accent} />
          <FiShield size={14} color={T.accent} style={{ position: 'absolute', bottom: 10, right: 10, background: T.surface, borderRadius: '50%' }} />
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 12px' }}>{title}</h2>
        <p style={{ fontSize: 14, color: T.textMid, lineHeight: 1.6, margin: '0 0 32px' }}>
          {message}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => navigate('/admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '14px',
              background: T.accent,
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            <FiChevronLeft size={16} /> Back to Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RestrictedAccess;
