/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5F5DC',
        'cream-light': '#FAFAF0',
        'cream-dark': '#EDE8D0',
        charcoal: '#333333',
        'charcoal-light': '#555555',
        'sage-green': '#87A96B',
        'sage-dark': '#6B8A50',
        'sage-light': '#A3C287',
        'slate-blue': '#6B8FA8',
        'warm-gray': '#F7F5F0',
        'warm-border': '#E8E4DC',
      },
      fontFamily: {
        serif: ['Tenor Sans', 'serif'],
        sans: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
