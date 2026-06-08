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
        brand: {
          purple: '#7C3AED',
          pink: '#EC4899',
          orange: '#F97316',
          yellow: '#FBBF24',
          green: '#10B981',
          dark: '#0F172A',
          darker: '#020617',
        },
        surface: {
          DEFAULT: '#1E293B',
          light: '#334155',
          lighter: '#475569',
        },
        accent: {
          primary: '#7C3AED',
          secondary: '#EC4899',
          glow: '#A78BFA',
        }
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
        'gradient-card': 'linear-gradient(145deg, #1E293B 0%, #334155 100%)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(124, 58, 237, 0.3)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.3)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
}
