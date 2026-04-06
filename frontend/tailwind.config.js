/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          50: '#f0f5ff',
          100: '#e0eafe',
          200: '#c7dafd',
          300: '#a0befa',
          400: '#7298f5',
          500: '#4a72ef',
          600: '#3b5bdb',
          700: '#2a45b9',
          800: '#1a2d7a',
          900: '#0f1b4a',
        },
        'secondary': {
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        'dark': {
          DEFAULT: '#0f172a',
          100: '#1e293b',
          200: '#334155',
        }
      },
    },
  },
  plugins: [],
}