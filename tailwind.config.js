/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lacquer: {
          deep: '#1A0503',
          dark: '#2C0A08',
          card: '#220807',
          border: '#45100E',
        },
        temple: {
          red: '#6E1B1B',
          darkRed: '#4A1212',
          cinnabar: '#8B1E1E',
          seal: '#C53030',
        },
        gold: {
          ancient: '#C9A24A',
          bright: '#E7C978',
          pale: '#F4E3B2',
          muted: '#8B7032',
          glow: 'rgba(231, 201, 120, 0.25)',
        },
        paper: {
          light: '#F3E8CE',
          dark: '#D9C79E',
          border: '#C2AE83',
          shadow: '#A89264',
        },
        ink: {
          DEFAULT: '#2B2318',
          light: '#4A3E2D',
          muted: '#6E5E47',
          faint: '#948369',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif"', 'serif'],
        sans: ['"Be Vietnam Pro"', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(201, 162, 74, 0.2)',
        'gold-inner': 'inset 0 0 15px rgba(201, 162, 74, 0.15)',
        'scroll-deep': '0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(201, 162, 74, 0.3)',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'rotate(0deg) translateY(0)' },
          '15%': { transform: 'rotate(-7deg) translateY(-8px)' },
          '30%': { transform: 'rotate(6deg) translateY(-4px)' },
          '45%': { transform: 'rotate(-5deg) translateY(-10px)' },
          '60%': { transform: 'rotate(5deg) translateY(-3px)' },
          '75%': { transform: 'rotate(-4deg) translateY(-8px)' },
          '90%': { transform: 'rotate(2deg) translateY(-2px)' },
        },
        stickJump: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-22px)' },
        },
        unroll: {
          '0%': { 
            maxHeight: '0px', 
            opacity: '0', 
            transform: 'scaleY(0.85)',
          },
          '100%': { 
            maxHeight: '1200px', 
            opacity: '1', 
            transform: 'scaleY(1)',
          },
        },
        incenseFume: {
          '0%': { opacity: '0.2', transform: 'translateY(0) scaleX(1)' },
          '50%': { opacity: '0.6', transform: 'translateY(-25px) scaleX(1.3) translateX(4px)' },
          '100%': { opacity: '0', transform: 'translateY(-55px) scaleX(1.8) translateX(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        }
      },
      animation: {
        shake: 'shake 0.7s ease-in-out infinite',
        stickJump: 'stickJump 0.5s ease-in-out infinite',
        unroll: 'unroll 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        smoke: 'incenseFume 4s ease-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
