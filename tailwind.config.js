/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        bengali: ['"Hind Siliguri"', 'system-ui', 'sans-serif'],
        num: ['"Anek Bangla"', '"Hind Siliguri"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
