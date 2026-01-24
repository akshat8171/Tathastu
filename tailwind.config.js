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
        charcoal: '#333333',
        'sage-green': '#87A96B',
        'slate-blue': '#6B8FA8',
      },
      fontFamily: {
        serif: ['var(--g-font-1)', 'Tenor Sans', 'sans-serif'],
        sans: ['var(--g-font-2)', 'Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
