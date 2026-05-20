/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#E6C996',
          DEFAULT: '#C5A065', // Soft Gold
          dark: '#A6844D',
        },
        secondary: {
          light: '#A8A39D',
          DEFAULT: '#8C867D', // Taupe
          dark: '#6E6961',
        },
        background: {
          DEFAULT: '#FAF9F6', // Off-white/Beige
          alt: '#F4F1EA', // Slightly darker beige
        },
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#FDFCFB',
        },
        text: {
          DEFAULT: '#2D2A26', // Charcoal
          muted: '#5C5852',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // We'll add Inter later or rely on system
        serif: ['Playfair Display', 'serif'], // Good for headers
      }
    },
  },
  plugins: [],
}
