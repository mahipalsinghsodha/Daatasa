// store/theme.js — Zustand theme store with localStorage persistence
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const applyTheme = (isDark) => {
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark: false,

      toggleTheme: () => {
        const next = !get().isDark
        set({ isDark: next })
        applyTheme(next)
      },

      setTheme: (isDark) => {
        set({ isDark })
        applyTheme(isDark)
      },

      // Call this on app init to sync class with stored state
      initTheme: () => {
        applyTheme(get().isDark)
      },
    }),
    {
      name: 'dhani-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.isDark)
      },
    }
  )
)
