/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#800020',
        'on-primary': '#ffffff',
        background: '#F8F8F6',
        'on-background': '#111110',
        surface: '#ffffff',
        'on-surface': '#111110',
        'surface-variant': '#efeee8',
        'on-surface-variant': '#5d4038',
        outline: '#926f66',
        'outline-variant': '#e7bdb2',
        'primary-container': '#800020',
        'on-primary-container': '#ffffff',
        'secondary-container': '#e2dfdd',
        'on-secondary-container': '#636261',
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '9999px',
      },
      spacing: {
        gutter: '24px',
        xs: '4px',
        sm: '12px',
        md: '24px',
        lg: '48px',
        xl: '80px',
      },
      fontFamily: {
        sans: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        headline: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        body: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        swiss: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['64px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '400' }],
        'headline-lg': ['48px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '400' }],
        'headline-md': ['32px', { lineHeight: '1.3', fontWeight: '400' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-bold': ['14px', { lineHeight: '1.2', letterSpacing: '0.05em', fontWeight: '700' }],
        'label-sm': ['12px', { lineHeight: '1.2', fontWeight: '500' }],
      },
      maxWidth: {
        container: '1280px',
      },
    },
  },
  plugins: [],
}
