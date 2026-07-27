/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
      },
      colors: {
        brand: {
          primary:   '#132B69', // Deep Royal Blue
          secondary: '#D9A520', // Royal Gold
          bg: '#FFFDF8', // Warm Ivory
          accent: '#FDF9F1', // Soft Beige
          text:      '#1A202C',
          50:  '#E8EBF3',
          100: '#D1D7E7',
          200: '#A4B0CF',
          300: '#768AB7',
          400: '#48639F',
          500: '#132B69', // base
          600: '#0F2254',
          700: '#0B1A3F',
          800: '#08112A',
          900: '#040915',
        },
        gold: {
          50:  '#FBF6E9',
          100: '#F7EDD3',
          200: '#EFDAA7',
          300: '#E7C87B',
          400: '#DFB64F',
          500: '#D9A520', // base
          600: '#AE841A',
          700: '#826313',
          800: '#57420D',
          900: '#2B2106',
        },
        surface: {
          light: '#FFFFFF',
          dark:  '#0B1A3F',
          card:  '#FFFFFF',
          'card-dark': '#0F2254',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #132B69, #0F2254)',
        'gold-gradient': 'linear-gradient(135deg, #D9A520, #C2931D)',
        'brand-radial':   'radial-gradient(circle at 30% 40%, rgba(19,43,105,0.15) 0%, transparent 60%)',
      },
      borderRadius: {
        card:  '16px',
        input: '12px',
        btn:   '10px',
        '4xl': '2rem',
      },
      boxShadow: {
        brand:    '0 8px 24px rgba(19,43,105,0.20)',
        'brand-lg': '0 16px 40px rgba(19,43,105,0.25)',
        gold:     '0 8px 24px rgba(217,165,32,0.30)',
        card:     '0 4px 20px rgba(0,0,0,0.06)',
        'card-dark': '0 4px 20px rgba(0,0,0,0.30)',
        modal:    '0 20px 60px rgba(0,0,0,0.25)',
      },
      animation: {
        'skeleton':     'skeletonShimmer 1.5s infinite',
        'bounce-dot':   'bounceTyping 1s ease infinite',
        'page-enter':   'pageEnter 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-up':     'slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in':      'fadeIn 0.4s ease both',
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
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        pulseBrand: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(19,43,105,0.4)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(19,43,105,0)' },
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
