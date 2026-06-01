// components/layout/ThemeToggle.jsx
import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '../../store/theme'
import { motion, AnimatePresence } from 'framer-motion'

export default function ThemeToggle({ size = 'md' }) {
  const { isDark, toggleTheme } = useThemeStore()
  const isSmall = size === 'sm'

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative flex items-center justify-center rounded-[10px]
        border border-[var(--border-color)] bg-[var(--bg-card)]
        text-[var(--text-secondary)] hover:text-[var(--text-primary)]
        hover:bg-[var(--bg-card-hover)] hover:border-[rgba(245,197,24,0.4)]
        transition-all duration-200 active:scale-95
        ${isSmall ? 'w-8 h-8' : 'w-9 h-9'}
      `}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      id="theme-toggle"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
          >
            <Moon size={isSmall ? 14 : 16} strokeWidth={2} />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ rotate: 30, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -30, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
          >
            <Sun size={isSmall ? 14 : 16} strokeWidth={2} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
