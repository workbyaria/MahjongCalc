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
        primary: 'var(--color-primary, #8c2a2a)',
        secondary: 'var(--color-secondary, #2d5a4a)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
