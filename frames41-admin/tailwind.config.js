/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#800020',
        'primary-hover': '#6a001a',
        background: '#F0F2F5',
        surface: '#ffffff',
      },
    },
  },
  plugins: [],
}
