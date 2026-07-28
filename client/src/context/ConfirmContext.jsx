import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle, FiX } from 'react-icons/fi';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [promiseInfo, setPromiseInfo] = useState(null);
  const [message, setMessage] = useState('');
  const [isChecked, setIsChecked] = useState(false);

  const confirm = useCallback((msg) => {
    setMessage(msg);
    setIsChecked(false);
    return new Promise((resolve) => {
      setPromiseInfo({ resolve });
    });
  }, []);

  const handleConfirm = () => {
    promiseInfo?.resolve(true);
    setPromiseInfo(null);
  };

  const handleCancel = () => {
    promiseInfo?.resolve(false);
    setPromiseInfo(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {promiseInfo && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)'
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              style={{
                background: 'var(--bg-surface)', borderRadius: '16px', width: '100%', maxWidth: 400,
                padding: '28px 24px 24px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)', position: 'relative'
              }}
            >
              <button 
                onClick={handleCancel} 
                style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 8, borderRadius: '50%', transition: 'background 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--bg-alt)'}
                onMouseOut={e => e.currentTarget.style.background = 'none'}
              >
                <FiX size={18} />
              </button>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 28 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(245,166,35,0.15)', color: 'var(--brand-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <FiAlertCircle size={28} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: '0 0 10px' }}>
                  Please Confirm
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0, padding: '0 10px', marginBottom: 16 }}>
                  {message}
                </p>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-primary)', userSelect: 'none' }}>
                  <input 
                    type="checkbox" 
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--brand-secondary)' }}
                  />
                  I agree to confirm this action
                </label>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    flex: 1, padding: '12px', fontSize: 14, fontWeight: 600, background: 'var(--bg-alt)', 
                    color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 10, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!isChecked}
                  style={{
                    flex: 1, padding: '12px', fontSize: 14, fontWeight: 600, background: isChecked ? 'var(--brand-secondary)' : 'var(--bg-alt)', 
                    color: isChecked ? 'var(--bg-base)' : 'var(--text-muted)', border: 'none', borderRadius: 10, cursor: isChecked ? 'pointer' : 'not-allowed', boxShadow: isChecked ? '0 4px 12px rgba(245,166,35,0.3)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};
