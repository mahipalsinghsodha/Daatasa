import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'

const CustomDropdown = ({ options, value, onChange, placeholder = "Select an option", disabled = false }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Handle outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const selectedOption = options.find(o => o.value === value)

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', fontFamily: 'var(--font)' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          height: 48,
          background: disabled ? 'var(--bg-alt)' : 'var(--bg-surface)',
          border: `1.5px solid ${open ? 'var(--brand-secondary)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-input)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)',
          fontSize: 14,
          fontWeight: selectedOption ? 600 : 400,
          transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
          outline: 'none',
          boxShadow: open ? '0 0 0 3px rgba(245,166,35,0.16), 0 2px 8px rgba(245,166,35,0.10)' : 'none',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0, right: 0,
              background: 'var(--bg-surface)',
              border: '1.5px solid var(--border-color)',
              borderRadius: 'var(--radius-card)',
              boxShadow: 'var(--shadow)',
              zIndex: 200,
              overflow: 'hidden',
              maxHeight: 240,
              overflowY: 'auto',
            }}
          >
            {options.length === 0 ? (
              <div style={{
                padding: '14px 16px',
                fontSize: 13,
                color: 'var(--text-muted)',
                textAlign: 'center',
                fontStyle: 'italic',
              }}>
                No options available
              </div>
            ) : (
              <div style={{ padding: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {options.map((opt) => {
                  const isSelected = value === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value)
                        setOpen(false)
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'var(--bg-alt)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isSelected ? 'rgba(245,166,35,0.10)' : 'transparent'
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '10px 12px',
                        background: isSelected ? 'rgba(245,166,35,0.10)' : 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: 14,
                        color: isSelected ? 'var(--brand-secondary)' : 'var(--text-primary)',
                        fontWeight: isSelected ? 700 : 500,
                        transition: 'background 0.12s ease',
                        fontFamily: 'var(--font)',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {opt.icon && <span style={{ fontSize: 16, lineHeight: 1 }}>{opt.icon}</span>}
                        {opt.label}
                      </span>
                      {isSelected && (
                        <Check size={15} style={{ color: 'var(--brand-secondary)', flexShrink: 0 }} />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CustomDropdown
