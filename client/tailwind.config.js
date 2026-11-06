/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#f2f3ff',
          100: '#e7e8ff',
          200: '#d3d5ff',
          300: '#b7baff',
          400: '#9494ff',
          500: '#7168f3',
          600: '#554be1',
          700: '#483bc7',
          800: '#3d34a2',
          900: '#342f80',
        },
        zenith: {
          50: '#f0fdf9',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Primary Teal-Emerald
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        slate: {
          850: '#151e2e',
          950: '#0b0f19',
        }
      },
      fontFamily: {
        sans: ['Roboto', 'Arial', 'sans-serif'],
        display: ['Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
