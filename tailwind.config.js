/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#8c2a2a',    // 暗紅
        secondary: '#2d5a4a',  // 墨綠
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
