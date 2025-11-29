/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#FF5F5F',
          dark: '#111827',
          blue: '#6DD5FA',
          surface: '#F3F4F6'
        }
      },
      fontFamily: {
        space: ['"Space Grotesk"', 'sans-serif'],
      },
      animation: {
        'blob': 'blob 10s infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'text-shimmer': 'text-shimmer 3s ease-out infinite alternate',
        'grid-flow': 'grid-flow 20s linear infinite', // NEW ANIMATION
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'text-shimmer': {
          'from': { backgroundPosition: '0% 50%' },
          'to': { backgroundPosition: '100% 50%' },
        },
        'grid-flow': { // Grid bergerak diagonal
          '0%': { backgroundPosition: '0px 0px' },
          '100%': { backgroundPosition: '50px 50px' },
        }
      }
    },
  },
  plugins: [],
}