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
          red: '#FF5F5F',     // Warna "LATIHAN"
          dark: '#1F2937',    // Warna Text Utama
          blue: '#6DD5FA',    // Warna Button Generate (Gradient start)
          blueSolid: '#60A5FA' // Warna Button solid
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Pastikan import font ini di index.css jika mau persis
      }
    },
  },
  plugins: [],
}
