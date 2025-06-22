/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Libre Baskerville', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'warm-beige': '#F2EDE3',
        'warm-taupe': '#8D7F6F',
        'warm-ivory': '#FFF8F0',
        'olive-green': '#7A8354',
        'terracotta': '#B1724C',
        'charcoal': '#333333',
      },
      lineHeight: {
        'relaxed': '1.6',
      }
    },
  },
  plugins: [],
};