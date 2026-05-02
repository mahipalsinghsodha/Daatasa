import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'

// Using the identical theme tokens
const C = {
  orange:      "#e8621a",
  orangeLight: "#fef0e8",
  bg:          "#f3f4f6",
  white:       "#ffffff",
  text:        "#111827",
  textMid:     "#4b5563",
  textLight:   "#9ca3af",
  border:      "#e5e7eb",
  shadow:      "0 4px 20px rgba(0,0,0,0.04)",
  shadowMd:    "0 10px 30px rgba(0,0,0,0.06)",
  font:        "'Inter', system-ui, sans-serif",
}

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
    <div ref={ref} style={{ position: 'relative', width: '100%', fontFamily: C.font }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', background: disabled ? C.bg : C.white, border: `1.5px solid ${open ? C.orange : C.border}`,
          borderRadius: 12, cursor: disabled ? 'not-allowed' : 'pointer',
          color: selectedOption ? C.text : C.textLight, fontSize: 14, fontWeight: selectedOption ? 600 : 400,
          transition: 'all 0.2s', outline: 'none'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} color={C.textMid} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
           <motion.div
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             transition={{ duration: 0.15 }}
             style={{
               position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
               background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 12,
               boxShadow: C.shadowMd, zIndex: 100, overflow: 'hidden', maxHeight: 240, overflowY: 'auto'
             }}
           >
             {options.length === 0 ? (
                <div style={{ padding: '12px 16px', fontSize: 13, color: C.textLight, textAlign: 'center' }}>
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
                       onMouseEnter={(e) => e.currentTarget.style.background = C.bg}
                       onMouseLeave={(e) => e.currentTarget.style.background = isSelected ? C.orangeLight : 'transparent'}
                       style={{
                         display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                         width: '100%', padding: '10px 12px', background: isSelected ? C.orangeLight : 'transparent',
                         border: 'none', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                         fontSize: 14, color: isSelected ? C.orange : C.text, fontWeight: isSelected ? 700 : 500,
                         transition: 'background 0.1s'
                       }}
                     >
                       <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {opt.icon && <span style={{ fontSize: 16 }}>{opt.icon}</span>}
                          {opt.label}
                       </span>
                       {isSelected && <Check size={16} color={C.orange} />}
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
