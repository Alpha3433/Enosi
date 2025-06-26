/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Open Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'title': ['Lato', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f3f1ff',
          100: '#e9e5ff',
          200: '#d5cfff',
          300: '#b7a9ff',
          400: '#9478ff',
          500: '#7341ff',
          600: '#631bff',
          700: '#611bf8',
          800: '#4607d0',
          900: '#3c08aa',
          950: '#220174',
          DEFAULT: '#611bf8',
        },
      },
      borderRadius: {
        'none': '0px',
        'sm': '6px',
        'DEFAULT': '12px',
        'md': '18px',
        'lg': '24px',
        'xl': '36px',
        '2xl': '48px',
        '3xl': '72px',
        'full': '9999px',
      },
    },
  },
  plugins: [],
}