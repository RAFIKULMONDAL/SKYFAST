/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        body:    ['Outfit', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#080808', 900: '#0e0e0e', 800: '#161616',
          700: '#1e1e1e', 600: '#2a2a2a', 500: '#3a3a3a',
          400: '#555555', 300: '#888888', 200: '#bbbbbb', 100: '#e5e5e5',
        },
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.6)',
        glow: '0 0 20px rgba(245,158,11,0.2)',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        fade:  'fadeIn 0.4s ease',
        slide: 'slideUp 0.4s ease',
      },
    },
  },
  plugins: [],
}
