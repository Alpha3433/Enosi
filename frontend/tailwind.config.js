/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Prompt', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'title': ['Prompt', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'body': ['Prompt', 'ui-sans-serif', 'system-ui', 'sans-serif'],
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
        // New earthy wedding color palette
        'cement': '#897560',
        'linen': '#fbf3e7',
        'millbrook': '#5a4730',
        'coral-reef': '#cabcaa',
        'napa': '#b4a797',
        'kabul': '#644c3c',
        'donkey-brown': '#ac9a83',
        'rodeo-dust': '#ccb4a5',
        'tallow': '#a49c84',
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