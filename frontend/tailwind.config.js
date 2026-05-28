/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Controlled via html.dark class (Zustand)
  theme: {
    extend: {
      colors: {
        brand: {
          primary:   '#F5C518',
          secondary: '#E6A800',
          text:      '#1A1400',
          50:  '#FFFDF0',
          100: '#FFFAE8',
          200: '#FFF3C0',
          300: '#FFE880',
          400: '#F5C518',
          500: '#E6A800',
          600: '#CC9400',
          700: '#A37200',
          800: '#7A5500',
          900: '#523800',
        },
        surface: {
          light: '#FFFFFF',
          dark:  '#181400',
          card:  '#FFFAE8',
          'card-dark': '#1F1A00',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #F5C518, #E6A800)',
        'brand-radial':   'radial-gradient(circle at 30% 40%, rgba(245,197,24,0.15) 0%, transparent 60%)',
      },
      borderRadius: {
        card:  '16px',
        input: '12px',
        btn:   '10px',
        '4xl': '2rem',
      },
      boxShadow: {
        brand:    '0 8px 24px rgba(245,197,24,0.30)',
        'brand-lg': '0 16px 40px rgba(245,197,24,0.35)',
        card:     '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
        'card-dark': '0 1px 3px rgba(0,0,0,0.20), 0 4px 16px rgba(0,0,0,0.25)',
        modal:    '0 20px 60px rgba(0,0,0,0.25)',
      },
      animation: {
        'skeleton':     'skeletonShimmer 1.5s infinite',
        'bounce-dot':   'bounceTyping 1s ease infinite',
        'page-enter':   'pageEnter 0.2s ease both',
        'slide-up':     'slideUp 0.3s ease both',
        'fade-in':      'fadeIn 0.2s ease both',
        'pulse-brand':  'pulseBrand 2s ease-in-out infinite',
        'spin-slow':    'spin 3s linear infinite',
      },
      keyframes: {
        skeletonShimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        bounceTyping: {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-5px)' },
        },
        pageEnter: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        pulseBrand: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245,197,24,0.4)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(245,197,24,0)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [],
}
